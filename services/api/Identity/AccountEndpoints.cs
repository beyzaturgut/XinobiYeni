using System.Net;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Identity;

public record StartAccountEmailVerification(string Email);
/// <summary><c>PreviewCode</c> is only filled when Development runs without e-mail delivery.</summary>
public record AccountEmailVerification(string VerificationId, string Email, DateTimeOffset ExpiresAt, string? PreviewCode);
public record RegisterAccount(string Name, string Email, string Password, string VerificationId, string VerificationCode);
public record LoginAccount(string Email, string Password);
public record RefreshSession(string RefreshToken);
public record LogoutSession(string RefreshToken);
public record AccountProfile(string Id, string Name, string Email, DateTimeOffset CreatedAt);
public record AuthSession(string AccessToken, DateTimeOffset AccessTokenExpiresAt, string RefreshToken, DateTimeOffset RefreshTokenExpiresAt, AccountProfile Account);

/// <summary>Bearer scheme for mobile (ADR-004 T-03): opaque access tokens looked up in <see cref="IAccountStore"/>.</summary>
public sealed class AccountTokenHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, IAccountStore store)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "XinobiToken";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        if (!header.StartsWith("Bearer ", StringComparison.Ordinal)) return AuthenticateResult.NoResult();
        var account = await store.FindByAccessToken(header["Bearer ".Length..].Trim());
        if (account is null) return AuthenticateResult.Fail("invalid_token");
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, account.Id), new Claim(ClaimTypes.Email, account.Email), new Claim(ClaimTypes.Name, account.Name)], SchemeName);
        return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName));
    }
}

public static class AccountEndpoints
{
    /// <summary>
    /// Shared customer account contract for web and mobile. Development stores accounts in the local file store (ADR-003);
    /// other environments answer 503 until the SQL Server identity store lands.
    /// </summary>
    public static void MapAccounts(this WebApplication app)
    {
        var auth = app.MapGroup("/api/v1/auth").WithTags("Account");
        var me = app.MapGroup("/api/v1/me").WithTags("Account").RequireAuthorization();
        if (app.Environment.IsDevelopment()) auth.RequireRateLimiting("Account");
        foreach (var group in new[] { auth, me })
        {
            group.AddEndpointFilter(async (context, next) =>
            {
                var http = context.HttpContext;
                http.Response.Headers.CacheControl = "no-store";
                if (app.Environment.IsDevelopment())
                {
                    if (http.Connection.RemoteIpAddress is { } address && !IPAddress.IsLoopback(address)) return Results.StatusCode(StatusCodes.Status403Forbidden);
                    var origin = http.Request.Headers.Origin.ToString();
                    if (origin.Length > 0 && !LocalCommerceEndpoints.AllowedOrigin(origin)) return Results.StatusCode(StatusCodes.Status403Forbidden);
                }
                try { return await next(context); }
                catch (AccountUnavailableException) { return Problem(StatusCodes.Status503ServiceUnavailable, "account_unavailable", "Hesap işlemleri şu anda kullanılamıyor."); }
                catch (AccountException error) { return Problem(error.Status, error.Code, error.Message); }
                catch (EmailVerificationException error) { return Problem(error.Status, error.Status == 429 ? "verification_rate_limited" : error.Status == 503 ? "email_unavailable" : "verification_failed", error.Message); }
            }).ProducesProblem(StatusCodes.Status503ServiceUnavailable);
        }

        auth.MapPost("/email-verification", async Task<Results<Ok<AccountEmailVerification>, ProblemHttpResult>> (StartAccountEmailVerification request, HttpContext http, CancellationToken token) =>
            {
                var store = http.RequestServices.GetService<EmailVerificationStore>() ?? throw new AccountUnavailableException();
                var challenge = await store.Start(AccountRules.NormalizeEmail(request.Email), token);
                return TypedResults.Ok(new AccountEmailVerification(challenge.Id, challenge.Email, challenge.ExpiresAt, challenge.PreviewCode));
            })
            .WithName("StartAccountEmailVerification")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        auth.MapPost("/register", async Task<Results<Created<AuthSession>, ProblemHttpResult>> (RegisterAccount request, HttpContext http, IAccountStore accounts) =>
            {
                var name = AccountRules.ValidName(request.Name);
                var email = AccountRules.NormalizeEmail(request.Email);
                AccountRules.ValidatePassword(request.Password);
                var verification = http.RequestServices.GetService<EmailVerificationStore>() ?? throw new AccountUnavailableException();
                // Proving ownership first means "already registered" is only ever shown to the address owner.
                await verification.Confirm(new ConfirmEmailVerification(request.VerificationId, email, request.VerificationCode));
                var account = await accounts.Register(name, email, request.Password);
                return TypedResults.Created("/api/v1/me", Session(account, await accounts.IssueTokens(account.Id)));
            })
            .WithName("RegisterAccount")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        auth.MapPost("/login", async Task<Results<Ok<AuthSession>, ProblemHttpResult>> (LoginAccount request, IAccountStore accounts) =>
            {
                string email;
                try { email = AccountRules.NormalizeEmail(request.Email); }
                catch (AccountException) { return InvalidCredentials(); }
                var account = request.Password is { Length: > 0 and <= AccountRules.MaxPasswordLength } ? await accounts.Login(email, request.Password) : null;
                return account is null ? InvalidCredentials() : TypedResults.Ok(Session(account, await accounts.IssueTokens(account.Id)));
            })
            .WithName("LoginAccount")
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        auth.MapPost("/refresh", async Task<Results<Ok<AuthSession>, ProblemHttpResult>> (RefreshSession request, IAccountStore accounts) =>
            {
                var (account, tokens) = await accounts.Refresh(request.RefreshToken);
                return TypedResults.Ok(Session(account, tokens));
            })
            .WithName("RefreshSession")
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        auth.MapPost("/logout", async Task<NoContent> (LogoutSession request, IAccountStore accounts) =>
            {
                await accounts.Revoke(request.RefreshToken);
                return TypedResults.NoContent();
            })
            .WithName("LogoutSession");

        me.MapGet("", async Task<Results<Ok<AccountProfile>, ProblemHttpResult>> (ClaimsPrincipal user, IAccountStore accounts) =>
                await accounts.FindById(user.FindFirstValue(ClaimTypes.NameIdentifier)!) is { } account
                    ? TypedResults.Ok(Profile(account))
                    : Problem(StatusCodes.Status401Unauthorized, "invalid_token", "Oturumun sona erdi. Tekrar giriş yap."))
            .WithName("GetMyAccount")
            .ProducesProblem(StatusCodes.Status401Unauthorized);
    }

    private static AuthSession Session(AccountRecord account, IssuedTokens tokens) => new(
        tokens.AccessToken, tokens.AccessTokenExpiresAt, tokens.RefreshToken, tokens.RefreshTokenExpiresAt, Profile(account));

    public static AccountProfile Profile(AccountRecord account) => new(account.Id, account.Name, account.Email, account.CreatedAt);

    private static ProblemHttpResult InvalidCredentials() => Problem(StatusCodes.Status401Unauthorized, "invalid_credentials", "E-posta veya parola hatalı.");

    private static ProblemHttpResult Problem(int status, string code, string title) =>
        TypedResults.Problem(statusCode: status, title: title, extensions: new Dictionary<string, object?> { ["code"] = code });
}
