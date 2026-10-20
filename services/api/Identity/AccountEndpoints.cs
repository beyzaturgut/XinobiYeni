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
public record StartPasswordReset(string Email);
public record ConfirmPasswordReset(string Email, string VerificationId, string VerificationCode, string NewPassword);
public record AccountProfile(string Id, string Name, string Email, DateTimeOffset CreatedAt, string? Phone = null);

/// <summary>What the panel may show; every action is still checked on the server.</summary>
public record AdminSession(AccountProfile Account, IReadOnlyCollection<string> Roles, IReadOnlyCollection<string> Permissions);
public record PermissionCatalogResponse(IReadOnlyList<string> Resources, IReadOnlyCollection<string> Permissions);
public record AssignAdminRole(string Email, string Role);
public record CreateAdminInvitation(string Email);
public record AcceptAdminInvitation(string Token, string Name, string Password);
public record AdminInvitationResponse(string Id, string Email, DateTimeOffset ExpiresAt, string? PreviewUrl = null);
public record AuthSession(string AccessToken, DateTimeOffset AccessTokenExpiresAt, string RefreshToken, DateTimeOffset RefreshTokenExpiresAt, AccountProfile Account);

/// <summary>Bearer scheme for mobile (ADR-004 T-03): opaque access tokens looked up in <see cref="IAccountStore"/>.</summary>
public sealed class AccountTokenHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, IAccountStore store, IServiceProvider services)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "XinobiToken";

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        string? token = header.StartsWith("Bearer ", StringComparison.Ordinal) ? header["Bearer ".Length..].Trim() : null;
        if (token is null && Request.Cookies.TryGetValue(WebSessionCookies.AccessFor(Request.HttpContext), out var cookie))
        {
            // Cookie sessions (web) must prove same-origin intent on state-changing requests (ADR-004 CSRF).
            if (!HttpMethods.IsGet(Request.Method) && !HttpMethods.IsHead(Request.Method) && !WebSessionCookies.HasCsrfHeader(Request)) return AuthenticateResult.NoResult();
            token = cookie;
        }
        if (token is null) return AuthenticateResult.NoResult();
        var account = await store.FindByAccessToken(token);
        if (account is null) return AuthenticateResult.Fail("invalid_token");
        if (account.Kind == AccountKinds.Staff && !await services.GetRequiredService<AdminMfa>().Allowed(token, account.Id, AccountRules.Hash(account.PasswordHash)))
            return AuthenticateResult.Fail("mfa_required");
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, account.Id), new Claim(ClaimTypes.Email, account.Email),
            new Claim(ClaimTypes.Name, account.Name), new Claim(PermissionAuthorization.AccountKindClaim, account.Kind),
            .. PermissionAuthorization.ClaimsFor(account.RoleCodes)], SchemeName);
        return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName));
    }
}

/// <summary>
/// Web session cookies (ADR-004 T-03): HttpOnly, SameSite=Lax, Secure on HTTPS. Tokens never reach JavaScript; every cookie
/// write and cookie-authenticated change requires the <c>X-Xinobi-Csrf</c> header, which other sites cannot send without CORS.
/// </summary>
public static class WebSessionCookies
{
    public const string Access = "xinobi_customer_at";
    public const string AdminAccess = "xinobi_admin_at";
    public const string Refresh = "xinobi_customer_rt";
    public const string AdminRefresh = "xinobi_admin_rt";

    public static string AccessFor(HttpContext http) => http.GetEndpoint()?.Metadata.GetOrderedMetadata<Microsoft.AspNetCore.Authorization.IAuthorizeData>()
        .Any(data => data.Policy == PermissionAuthorization.StaffPolicy || data.Policy?.StartsWith("permission:", StringComparison.Ordinal) == true) == true
        || http.Request.Path.StartsWithSegments("/api/v1/auth/admin") ? AdminAccess : Access;
    public const string CsrfHeader = "X-Xinobi-Csrf";

    public static bool HasCsrfHeader(HttpRequest request) => request.Headers[CsrfHeader] == "1";

    public static void Write(HttpContext http, IssuedTokens tokens, bool admin = false)
    {
        ClearLegacy(http);
        http.Response.Cookies.Append(admin ? AdminAccess : Access, tokens.AccessToken, Options(http, "/api/v1", tokens.AccessTokenExpiresAt));
        http.Response.Cookies.Append(admin ? AdminRefresh : Refresh, tokens.RefreshToken, Options(http, "/api/v1/auth", tokens.RefreshTokenExpiresAt));
    }

    public static void Clear(HttpContext http, bool admin = false)
    {
        ClearLegacy(http);
        http.Response.Cookies.Delete(admin ? AdminAccess : Access, Options(http, "/api/v1", null));
        http.Response.Cookies.Delete(admin ? AdminRefresh : Refresh, Options(http, "/api/v1/auth", null));
    }

    private static void ClearLegacy(HttpContext http)
    {
        // Ambiguous legacy sessions are never adopted; require a fresh kind-specific login.
        http.Response.Cookies.Delete("xinobi_at", Options(http, "/api/v1", null));
        http.Response.Cookies.Delete("xinobi_rt", Options(http, "/api/v1/auth", null));
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
    /// Shared customer account contract for web and mobile. Development uses the local file store until the SQL import switches it
    /// (ADR-003); other environments serve accounts only with Accounts:StorageProvider=SqlServer, otherwise 503.
    /// </summary>
    public static void MapAccounts(this WebApplication app)
    {
        var auth = app.MapGroup("/api/v1/auth").WithTags("Account").AllowAnonymous();
        var me = app.MapGroup("/api/v1/me").WithTags("Account").RequireAuthorization(PermissionAuthorization.CustomerPolicy);
        var admin = app.MapGroup("/api/v1/admin").WithTags("Admin").RequireAuthorization(PermissionAuthorization.StaffPolicy);
        AdminCustomerEndpoints.Map(admin);
        Designs.AdminDesignEndpoints.Map(admin);
        Orders.AdminDesignOrderEndpoints.Map(admin);
        Orders.AdminOrderDetailEndpoints.Map(admin);
        if (AccountStorage.RateLimited(app.Environment, app.Configuration)) auth.RequireRateLimiting("Account");
        foreach (var group in new[] { auth, me, admin })
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
                catch (Infrastructure.ProblemException error) { return Problem(error.Status, error.Code, error.Message); }
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
                return account is null || account.Kind != AccountKinds.Customer
                    ? InvalidCredentials()
                    : TypedResults.Ok(Session(account, await accounts.IssueTokens(account.Id)));
            })
            .WithName("LoginAccount")
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        auth.MapPost("/refresh", async Task<Results<Ok<AuthSession>, ProblemHttpResult>> (RefreshSession request, IAccountStore accounts) =>
            {
                var (account, tokens) = await RefreshForKind(accounts, request.RefreshToken, AccountKinds.Customer);
                return TypedResults.Ok(Session(account, tokens));
            })
            .WithName("RefreshSession")
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        auth.MapPost("/admin-invitations/accept", async Task<Results<Ok<AdminMfaChallenge>, ProblemHttpResult>> (AcceptAdminInvitation request, HttpContext http, IAccountStore accounts, AdminMfa mfa) =>
            {
                var name = AccountRules.ValidName(request.Name);
                AccountRules.ValidatePassword(request.Password);
                var account = await accounts.AcceptAdminInvitation(AccountRules.ValidInvitationToken(request.Token), name, request.Password);
                WebSessionCookies.Clear(http, admin: true);
                return TypedResults.Ok(await mfa.Start(account, http.RequestAborted));
            })
            .WithName("AcceptAdminInvitation")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

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
                if (account is null || account.Kind != AccountKinds.Customer) return InvalidCredentials();
                WebSessionCookies.Write(http, await accounts.IssueTokens(account.Id));
                return TypedResults.Ok(Profile(account));
            })
            .WithName("LoginWebAccount");

        web.MapPost("/refresh", async Task<Results<Ok<AccountProfile>, ProblemHttpResult>> (HttpContext http, IAccountStore accounts) =>
            {
                try
                {
                    var (account, tokens) = await RefreshForKind(accounts, http.Request.Cookies[WebSessionCookies.Refresh] ?? "", AccountKinds.Customer);
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

        // Password reset (Faz03 03.03): the answer is the same whether or not the address has an account, and a code is only
        // e-mailed to an existing one. A successful reset signs out every device; the person then signs in with the new password.
        auth.MapPost("/password-reset", async Task<Results<Ok<AccountEmailVerification>, ProblemHttpResult>> (StartPasswordReset request, HttpContext http, IAccountStore accounts, CancellationToken token) =>
            {
                var email = AccountRules.NormalizeEmail(request.Email);
                var store = http.RequestServices.GetService<EmailVerificationStore>() ?? throw new AccountUnavailableException();
                var challenge = await store.Start(email, token, VerificationPurpose.PasswordReset, deliver: await accounts.EmailInUse(email));
                return TypedResults.Ok(new AccountEmailVerification(challenge.Id, challenge.Email, challenge.ExpiresAt, challenge.PreviewCode));
            })
            .WithName("StartPasswordReset")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        auth.MapPost("/password-reset/confirm", async Task<Results<NoContent, ProblemHttpResult>> (ConfirmPasswordReset request, HttpContext http, IAccountStore accounts) =>
            {
                var email = AccountRules.NormalizeEmail(request.Email);
                AccountRules.ValidatePassword(request.NewPassword);
                var verification = http.RequestServices.GetService<EmailVerificationStore>() ?? throw new AccountUnavailableException();
                await verification.Confirm(new ConfirmEmailVerification(request.VerificationId, email, request.VerificationCode));
                return await accounts.ResetPassword(email, request.NewPassword)
                    ? TypedResults.NoContent()
                    : Problem(StatusCodes.Status400BadRequest, "verification_failed", "Doğrulama isteği bulunamadı. Yeni kod iste.");
            })
            .WithName("ConfirmPasswordReset")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        var adminWeb = auth.MapGroup("/admin");
        adminWeb.MapPost("/password-reset", async (StartAdminPasswordReset request, AdminPasswordRecovery recovery) =>
            TypedResults.Ok(await recovery.Start(request.Email))).WithName("StartAdminPasswordReset").ProducesProblem(429).ProducesProblem(503);
        adminWeb.MapPost("/password-reset/complete", async (CompleteAdminPasswordReset request, AdminPasswordRecovery recovery, HttpContext http) =>
        {
            await recovery.Complete(request.Token, request.NewPassword);
            WebSessionCookies.Clear(http, admin: true);
            return TypedResults.NoContent();
        }).WithName("CompleteAdminPasswordReset").ProducesProblem(400);
        adminWeb.AddEndpointFilter(async (context, next) => WebSessionCookies.HasCsrfHeader(context.HttpContext.Request)
            ? await next(context)
            : Problem(StatusCodes.Status403Forbidden, "csrf_required", "İstek doğrulanamadı. Sayfayı yenileyip tekrar dene."));

        adminWeb.MapPost("/login", async Task<Results<Ok<AdminMfaChallenge>, ProblemHttpResult>> (LoginAccount request, HttpContext http, IAccountStore accounts, AdminMfa mfa) =>
            {
                string email;
                try { email = AccountRules.NormalizeEmail(request.Email); }
                catch (AccountException) { return InvalidCredentials(); }
                var account = request.Password is { Length: > 0 and <= AccountRules.MaxPasswordLength } ? await accounts.Login(email, request.Password) : null;
                if (account is null || account.Kind != AccountKinds.Staff || account.RoleCodes.Count == 0) return InvalidCredentials();
                WebSessionCookies.Clear(http, admin: true);
                return TypedResults.Ok(await mfa.Start(account, http.RequestAborted));
            })
            .WithName("LoginAdminWebAccount")
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        adminWeb.MapPost("/mfa/verify", async (VerifyAdminMfa request, HttpContext http, IAccountStore accounts, AdminMfa mfa) =>
            {
                var proof = await mfa.Consume(request.ChallengeId, request.Code);
                var account = await accounts.FindById(proof.AccountId);
                if (account is null || AccountRules.Hash(account.PasswordHash) != proof.CredentialStamp || account.Kind != AccountKinds.Staff || account.RoleCodes.Count == 0) throw InvalidRefresh();
                var tokens = await accounts.IssueTokens(account.Id, proof.CredentialStamp);
                await mfa.Grant(account.Id, tokens, proof.CredentialStamp);
                WebSessionCookies.Write(http, tokens, admin: true);
                return TypedResults.Ok(new AdminSession(Profile(account), account.RoleCodes, Roles.PermissionsFor(account.RoleCodes)));
            }).WithName("VerifyAdminMfa").ProducesProblem(401);

        adminWeb.MapPost("/refresh", async Task<Results<Ok<AccountProfile>, ProblemHttpResult>> (HttpContext http, IAccountStore accounts, AdminMfa mfa) =>
            {
                try
                {
                    if (!await mfa.Allowed(http.Request.Cookies[WebSessionCookies.AdminRefresh] ?? "")) throw InvalidRefresh();
                    var (account, tokens) = await RefreshForKind(accounts, http.Request.Cookies[WebSessionCookies.AdminRefresh] ?? "", AccountKinds.Staff);
                    if (account.RoleCodes.Count == 0)
                    {
                        await accounts.Revoke(tokens.RefreshToken);
                        throw InvalidRefresh();
                    }
                    if (!await mfa.Allowed(http.Request.Cookies[WebSessionCookies.AdminRefresh] ?? "", account.Id, AccountRules.Hash(account.PasswordHash)))
                    { await accounts.Revoke(tokens.RefreshToken); throw InvalidRefresh(); }
                    await mfa.Grant(account.Id, tokens, AccountRules.Hash(account.PasswordHash));
                    WebSessionCookies.Write(http, tokens, admin: true);
                    return TypedResults.Ok(Profile(account));
                }
                catch (AccountException)
                {
                    WebSessionCookies.Clear(http, admin: true);
                    throw;
                }
            })
            .WithName("RefreshAdminWebSession")
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        adminWeb.MapPost("/logout", async Task<NoContent> (HttpContext http, IAccountStore accounts) =>
            {
                if (http.Request.Cookies[WebSessionCookies.AdminRefresh] is { Length: > 0 } refresh) await accounts.Revoke(refresh);
                WebSessionCookies.Clear(http, admin: true);
                return TypedResults.NoContent();
            })
            .WithName("LogoutAdminWebSession");

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

        me.MapPatch("", async Task<Results<Ok<AccountProfile>, ProblemHttpResult>> (UpdateMyAccount request, ClaimsPrincipal user, IAccountStore accounts) =>
                await accounts.UpdateProfile(user.FindFirstValue(ClaimTypes.NameIdentifier)!, AccountRules.ValidName(request.Name),
                        request.Phone is null ? null : request.Phone.Trim().Length == 0 ? "" : CustomerRules.ValidPhone(request.Phone)) is { } account
                    ? TypedResults.Ok(Profile(account))
                    : Problem(StatusCodes.Status401Unauthorized, "invalid_token", "Oturumun sona erdi. Tekrar giriş yap."))
            .WithName("UpdateMyAccount")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        // Mobile (bearer) gets its new session in the body; the web (cookie) gets new cookies and no tokens in JavaScript.
        var password = me.MapPut("/password", async Task<Results<Ok<AuthSession>, NoContent, ProblemHttpResult>> (ChangeMyPassword request, ClaimsPrincipal user, HttpContext http, IAccountStore accounts) =>
            {
                AccountRules.ValidatePassword(request.NewPassword);
                var id = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
                if (request.CurrentPassword is not { Length: > 0 and <= AccountRules.MaxPasswordLength } || !await accounts.ChangePassword(id, request.CurrentPassword, request.NewPassword))
                    return Problem(StatusCodes.Status400BadRequest, "wrong_password", "Mevcut parolan hatalı.");
                var tokens = await accounts.IssueTokens(id);
                if (!http.Request.Headers.Authorization.ToString().StartsWith("Bearer ", StringComparison.Ordinal))
                {
                    WebSessionCookies.Write(http, tokens);
                    return TypedResults.NoContent();
                }
                var account = (await accounts.FindById(id))!;
                return TypedResults.Ok(new AuthSession(tokens.AccessToken, tokens.AccessTokenExpiresAt, tokens.RefreshToken, tokens.RefreshTokenExpiresAt, Profile(account)));
            })
            .WithName("ChangeMyPassword")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);
        if (AccountStorage.RateLimited(app.Environment, app.Configuration)) password.RequireRateLimiting("Account");

        CustomerEndpoints.Map(me, AccountStorage.RateLimited(app.Environment, app.Configuration));
        Orders.OrderEndpoints.MapCustomerOrders(me);
        Notifications.NotificationEndpoints.MapCustomerNotifications(me);
        Reviews.ReviewEndpoints.MapCustomerReviews(me);
        Designs.SavedDesignEndpoints.MapCustomerDesigns(me);
        Quotes.QuoteEndpoints.MapCustomerQuotes(me);
        if (LocalCommerceEndpoints.PanelGroup(app) is { } panel)
        {
            Reviews.ReviewEndpoints.MapPanelReviews(panel);
            Quotes.QuoteEndpoints.MapPanelQuotes(panel);
            Assistant.AssistantEndpoints.MapPanelAssistant(panel);
            Orders.OrderEndpoints.MapPanelOrders(panel);
            Notifications.NotificationEndpoints.MapPanelNotifications(panel);
        }

        admin.MapGet("/session", async Task<Results<Ok<AdminSession>, ProblemHttpResult>> (ClaimsPrincipal user, IAccountStore accounts) =>
                await accounts.FindById(user.FindFirstValue(ClaimTypes.NameIdentifier)!) is { } account
                    ? TypedResults.Ok(new AdminSession(Profile(account), account.RoleCodes, Roles.PermissionsFor(account.RoleCodes)))
                    : Problem(StatusCodes.Status401Unauthorized, "invalid_token", "Oturumun sona erdi. Tekrar giriş yap."))
            .WithName("GetAdminSession")
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        admin.MapGet("/permissions", () => TypedResults.Ok(new PermissionCatalogResponse(PermissionCatalog.Resources, PermissionCatalog.All.Order(StringComparer.Ordinal).ToArray())))
            .RequirePermission("settings.read")
            .WithName("GetPermissionCatalog")
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        admin.MapPost("/roles", async Task<Results<Ok<AdminSession>, ProblemHttpResult>> (AssignAdminRole request, IAccountStore accounts) =>
            {
                if (!string.Equals(request.Role, Roles.Admin, StringComparison.Ordinal))
                    return Problem(StatusCodes.Status400BadRequest, "role_not_assignable", "Bu uç yalnız admin rolünü atayabilir.");
                var account = await accounts.AssignRole(AccountRules.NormalizeEmail(request.Email), Roles.Admin, existingStaffOnly: true);
                return account is null
                    ? Problem(StatusCodes.Status404NotFound, "account_not_found", "Bu e-posta ile kayıtlı hesap bulunamadı.")
                    : TypedResults.Ok(new AdminSession(Profile(account), account.RoleCodes, Roles.PermissionsFor(account.RoleCodes)));
            })
            .RequireAuthorization(policy => policy.RequireRole(Roles.SuperAdmin))
            .WithName("AssignAdminRole")
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);

        admin.MapPost("/invitations", async Task<Results<Created<AdminInvitationResponse>, ProblemHttpResult>> (
                CreateAdminInvitation request, ClaimsPrincipal user, IAccountStore accounts, IAdminInvitationEmailSender sender,
                IConfiguration configuration, CancellationToken cancellationToken) =>
            {
                if (!sender.IsConfigured) throw new EmailVerificationException("Davet e-postası gönderimi yapılandırılmadı.", 503);
                var email = AccountRules.NormalizeEmail(request.Email);
                var token = AccountRules.NewToken();
                var inviterId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var invitation = await accounts.CreateAdminInvitation(email, inviterId, token);
                var baseUrl = configuration["Admin:InvitationBaseUrl"] ?? "http://127.0.0.1:5173/";
                var separator = baseUrl.Contains('?') ? '&' : '?';
                var acceptanceUrl = $"{baseUrl}{separator}invitation={Uri.EscapeDataString(token)}";
                try { await sender.Send(email, acceptanceUrl, cancellationToken); }
                catch
                {
                    await accounts.CancelAdminInvitation(invitation.Id, inviterId);
                    throw;
                }
                return TypedResults.Created($"/api/v1/admin/invitations/{invitation.Id}",
                    new AdminInvitationResponse(invitation.Id, invitation.Email, invitation.ExpiresAt, sender.IsPreview ? acceptanceUrl : null));
            })
            .RequireAuthorization(policy => policy.RequireRole(Roles.SuperAdmin))
            .WithName("CreateAdminInvitation")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static AuthSession Session(AccountRecord account, IssuedTokens tokens) => new(
        tokens.AccessToken, tokens.AccessTokenExpiresAt, tokens.RefreshToken, tokens.RefreshTokenExpiresAt, Profile(account));

    internal static ProblemHttpResult Failure(int status, string code, string title) => Problem(status, code, title);

    public static AccountProfile Profile(AccountRecord account) => new(account.Id, account.Name, account.Email, account.CreatedAt, account.Phone);

    private static async Task<(AccountRecord Account, IssuedTokens Tokens)> RefreshForKind(IAccountStore accounts, string refreshToken, string requiredKind)
    {
        var refreshed = await accounts.Refresh(refreshToken);
        if (refreshed.Account.Kind == requiredKind) return refreshed;
        await accounts.Revoke(refreshed.Tokens.RefreshToken);
        throw InvalidRefresh();
    }

    private static ProblemHttpResult InvalidCredentials() => Problem(StatusCodes.Status401Unauthorized, "invalid_credentials", "E-posta veya parola hatalı.");

    private static AccountException InvalidRefresh() =>
        new("invalid_refresh_token", "Oturumun sona erdi. Tekrar giriş yap.", StatusCodes.Status401Unauthorized);

    private static ProblemHttpResult Problem(int status, string code, string title) =>
        TypedResults.Problem(statusCode: status, title: title, extensions: new Dictionary<string, object?> { ["code"] = code });
}
