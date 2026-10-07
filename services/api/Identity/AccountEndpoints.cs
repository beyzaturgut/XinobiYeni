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
        string? token = header.StartsWith("Bearer ", StringComparison.Ordinal) ? header["Bearer ".Length..].Trim() : null;
        if (token is null && Request.Cookies.TryGetValue(WebSessionCookies.Access, out var cookie))
        {
            // Cookie sessions (web) must prove same-origin intent on state-changing requests (ADR-004 CSRF).
            if (!HttpMethods.IsGet(Request.Method) && !HttpMethods.IsHead(Request.Method) && !WebSessionCookies.HasCsrfHeader(Request)) return AuthenticateResult.NoResult();
            token = cookie;
        }
        if (token is null) return AuthenticateResult.NoResult();
        var account = await store.FindByAccessToken(token);
        if (account is null) return AuthenticateResult.Fail("invalid_token");
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, account.Id), new Claim(ClaimTypes.Email, account.Email), new Claim(ClaimTypes.Name, account.Name)], SchemeName);
        return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName));
    }
}

/// <summary>
/// Web session cookies (ADR-004 T-03): HttpOnly, SameSite=Lax, Secure on HTTPS. Tokens never reach JavaScript; every cookie
/// write and cookie-authenticated change requires the <c>X-Xinobi-Csrf</c> header, which other sites cannot send without CORS.
/// </summary>
public static class WebSessionCookies
{
    public const string Access = "xinobi_at";
    public const string Refresh = "xinobi_rt";
    public const string CsrfHeader = "X-Xinobi-Csrf";

    public static bool HasCsrfHeader(HttpRequest request) => request.Headers[CsrfHeader] == "1";

    public static void Write(HttpContext http, IssuedTokens tokens)
    {
        http.Response.Cookies.Append(Access, tokens.AccessToken, Options(http, "/api/v1", tokens.AccessTokenExpiresAt));
        http.Response.Cookies.Append(Refresh, tokens.RefreshToken, Options(http, "/api/v1/auth/web", tokens.RefreshTokenExpiresAt));
    }

    public static void Clear(HttpContext http)
    {
        http.Response.Cookies.Delete(Access, Options(http, "/api/v1", null));
        http.Response.Cookies.Delete(Refresh, Options(http, "/api/v1/auth/web", null));
    }

    private static CookieOptions Options(HttpContext http, string path, DateTimeOffset? expires) => new()
    {
        HttpOnly = true,
        Secure = http.Request.IsHttps,
        SameSite = SameSiteMode.Lax,
        Path = path,
        Expires = expires,
        IsEssential = true,
    };
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

        var web = auth.MapGroup("/web");
        web.AddEndpointFilter(async (context, next) => WebSessionCookies.HasCsrfHeader(context.HttpContext.Request)
            ? await next(context)
            : Problem(StatusCodes.Status403Forbidden, "csrf_required", "İstek doğrulanamadı. Sayfayı yenileyip tekrar dene."));

        web.MapPost("/register", async Task<Results<Ok<AccountProfile>, ProblemHttpResult>> (RegisterAccount request, HttpContext http, IAccountStore accounts) =>
            {
                var name = AccountRules.ValidName(request.Name);
                var email = AccountRules.NormalizeEmail(request.Email);
                AccountRules.ValidatePassword(request.Password);
                var verification = http.RequestServices.GetService<EmailVerificationStore>() ?? throw new AccountUnavailableException();
                await verification.Confirm(new ConfirmEmailVerification(request.VerificationId, email, request.VerificationCode));
                var account = await accounts.Register(name, email, request.Password);
                WebSessionCookies.Write(http, await accounts.IssueTokens(account.Id));
                return TypedResults.Ok(Profile(account));
            })
            .WithName("RegisterWebAccount");

        web.MapPost("/login", async Task<Results<Ok<AccountProfile>, ProblemHttpResult>> (LoginAccount request, HttpContext http, IAccountStore accounts) =>
            {
                string email;
                try { email = AccountRules.NormalizeEmail(request.Email); }
                catch (AccountException) { return InvalidCredentials(); }
                var account = request.Password is { Length: > 0 and <= AccountRules.MaxPasswordLength } ? await accounts.Login(email, request.Password) : null;
                if (account is null) return InvalidCredentials();
                WebSessionCookies.Write(http, await accounts.IssueTokens(account.Id));
                return TypedResults.Ok(Profile(account));
            })
            .WithName("LoginWebAccount");

        web.MapPost("/refresh", async Task<Results<Ok<AccountProfile>, ProblemHttpResult>> (HttpContext http, IAccountStore accounts) =>
            {
                try
                {
                    var (account, tokens) = await accounts.Refresh(http.Request.Cookies[WebSessionCookies.Refresh] ?? "");
                    WebSessionCookies.Write(http, tokens);
                    return TypedResults.Ok(Profile(account));
                }
                catch (AccountException)
                {
                    WebSessionCookies.Clear(http);
                    throw;
                }
            })
            .WithName("RefreshWebSession");

        web.MapPost("/logout", async Task<NoContent> (HttpContext http, IAccountStore accounts) =>
            {
                if (http.Request.Cookies[WebSessionCookies.Refresh] is { Length: > 0 } refresh) await accounts.Revoke(refresh);
                WebSessionCookies.Clear(http);
                return TypedResults.NoContent();
            })
            .WithName("LogoutWebSession");

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
