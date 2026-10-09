using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Http.HttpResults;
using Xinobi.Api.Catalog;
using Xinobi.Api.EmailVerification;
using Xinobi.Api.Notifications;
using Xinobi.Api.Orders;

namespace Xinobi.Api.Identity;

/// <summary>
/// The signed-in customer's own data under /api/v1/me: e-mail change, account deletion, addresses and demo orders.
/// Shares the filters of the /me group (no-store, Development loopback, problem codes). Legal texts (KVKK, distance sales) come later.
/// </summary>
public static class CustomerEndpoints
{
    public static void Map(RouteGroupBuilder me, bool rateLimited)
    {
        var emailStart = me.MapPost("/email-verification", async Task<Results<Ok<AccountEmailVerification>, ProblemHttpResult>> (StartEmailChange request, ClaimsPrincipal user, HttpContext http, IAccountStore accounts, CancellationToken token) =>
            {
                var email = AccountRules.NormalizeEmail(request.NewEmail);
                var account = await accounts.FindById(Id(user)) ?? throw SessionEnded();
                if (account.Email == email) throw new AccountException("same_email", "Bu zaten hesabının e-posta adresi.");
                if (await accounts.EmailInUse(email)) throw new AccountException("email_taken", "Bu e-posta başka bir hesapta kullanılıyor.", StatusCodes.Status409Conflict);
                var store = http.RequestServices.GetService<EmailVerificationStore>() ?? throw new AccountUnavailableException();
                var challenge = await store.Start(email, token);
                return TypedResults.Ok(new AccountEmailVerification(challenge.Id, challenge.Email, challenge.ExpiresAt, challenge.PreviewCode));
            })
            .WithName("StartMyEmailChange")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        var emailConfirm = me.MapPut("/email", async Task<Results<Ok<AccountProfile>, ProblemHttpResult>> (ConfirmEmailChange request, ClaimsPrincipal user, HttpContext http, IAccountStore accounts) =>
            {
                var email = AccountRules.NormalizeEmail(request.NewEmail);
                // The password is checked first, so a wrong one does not use up the code.
                if (request.CurrentPassword is not { Length: > 0 and <= AccountRules.MaxPasswordLength } || !await accounts.CheckPassword(Id(user), request.CurrentPassword))
                    throw new AccountException("wrong_password", "Mevcut parolan hatalı.");
                var store = http.RequestServices.GetService<EmailVerificationStore>() ?? throw new AccountUnavailableException();
                await store.Confirm(new ConfirmEmailVerification(request.VerificationId, email, request.VerificationCode));
                return TypedResults.Ok(AccountEndpoints.Profile(await accounts.ChangeEmail(Id(user), request.CurrentPassword, email)));
            })
            .WithName("ConfirmMyEmailChange")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        // POST rather than DELETE so the password can travel in a body every client supports.
        var deletion = me.MapPost("/deletion", async Task<Results<NoContent, ProblemHttpResult>> (DeleteMyAccount request, ClaimsPrincipal user, HttpContext http, IAccountStore accounts, NotificationCenter notifications, Reviews.ReviewStore reviews, Designs.SavedDesignStore designs) =>
            {
                if (request.CurrentPassword is not { Length: > 0 and <= AccountRules.MaxPasswordLength } || !await accounts.Delete(Id(user), request.CurrentPassword))
                    return AccountEndpoints.Failure(StatusCodes.Status400BadRequest, "wrong_password", "Mevcut parolan hatalı.");
                await notifications.ForgetAccount(Id(user));
                await reviews.ForgetAccount(Id(user));
                await designs.ForgetAccount(Id(user));
                WebSessionCookies.Clear(http);
                return TypedResults.NoContent();
            })
            .WithName("DeleteMyAccount")
            .ProducesProblem(StatusCodes.Status400BadRequest);
        if (rateLimited) foreach (var endpoint in new[] { emailStart, emailConfirm, deletion }) endpoint.RequireRateLimiting("Account");

        me.MapGet("/addresses", async Task<Ok<CustomerAddress[]>> (ClaimsPrincipal user, IAccountStore accounts) => TypedResults.Ok(await accounts.Addresses(Id(user))))
            .WithName("ListMyAddresses");

        me.MapPost("/addresses", async Task<Results<Created<CustomerAddress>, ProblemHttpResult>> (SaveCustomerAddress request, ClaimsPrincipal user, IAccountStore accounts) =>
                TypedResults.Created("/api/v1/me/addresses", await accounts.SaveAddress(Id(user), null, CustomerRules.ValidAddress(request))))
            .WithName("AddMyAddress")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        me.MapPut("/addresses/{id}", async Task<Results<Ok<CustomerAddress>, ProblemHttpResult>> (string id, SaveCustomerAddress request, ClaimsPrincipal user, IAccountStore accounts) =>
                TypedResults.Ok(await accounts.SaveAddress(Id(user), id, CustomerRules.ValidAddress(request))))
            .WithName("UpdateMyAddress")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        me.MapDelete("/addresses/{id}", async Task<Results<NoContent, ProblemHttpResult>> (string id, ClaimsPrincipal user, IAccountStore accounts) =>
                await accounts.DeleteAddress(Id(user), id) ? TypedResults.NoContent() : AccountEndpoints.Failure(StatusCodes.Status404NotFound, "address_not_found", "Adres bulunamadı."))
            .WithName("DeleteMyAddress")
            .ProducesProblem(StatusCodes.Status404NotFound);

        // Orders keep the catalogue's relative image path; it is resolved per request, so the web and the app each get a URL they can load.
        me.MapGet("/orders", async Task<Ok<CustomerOrder[]>> (ClaimsPrincipal user, HttpContext http, IAccountStore accounts, IConfiguration configuration, IWebHostEnvironment environment) =>
                TypedResults.Ok((await accounts.Orders(Id(user))).Select(order => OrderEndpoints.WithImages(order, http, configuration, environment)).ToArray()))
            .WithName("ListMyOrders");

        me.MapPost("/orders", async Task<Results<Created<CustomerOrder>, ProblemHttpResult>> (PlaceOrder request, ClaimsPrincipal user, HttpContext http, IAccountStore accounts,
                ICatalogSource source, NotificationCenter notifications, IConfiguration configuration, IWebHostEnvironment environment) =>
            {
                var id = Id(user);
                if (request.ClientRequestId is not { Length: >= 8 and <= 80 }) throw new AccountException("invalid_request", "Sipariş isteği tanımlanamadı. Tekrar dene.");
                var address = (await accounts.Addresses(id)).FirstOrDefault(item => item.Id == request.AddressId)
                    ?? throw new AccountException("address_not_found", "Teslimat adresi bulunamadı. Bir adres seç.", StatusCodes.Status404NotFound);
                var items = Merge(request.Items);
                CatalogProjection catalog;
                try { catalog = new CatalogProjection(await source.ReadAsync(), path => path); }
                catch (CatalogUnavailableException) { throw new AccountException("catalog_unavailable", "Katalog şu anda kullanılamıyor. Biraz sonra tekrar dene.", StatusCodes.Status503ServiceUnavailable); }
                var lines = items.Select(item =>
                {
                    var product = catalog.Detail(item.ProductId);
                    var variant = product?.Variants.FirstOrDefault(candidate => candidate.Id == item.VariantId);
                    if (product is null || variant is null || !variant.Purchasable || variant.Price is null || item.Quantity > variant.MaxQuantity)
                        throw new AccountException("cart_changed", $"{product?.Name ?? "Bir ürün"}{(variant is null ? "" : " · " + variant.Color)} bu adette satın alınamıyor. Sepetini kontrol et.", StatusCodes.Status409Conflict);
                    return new CustomerOrderLine(product.Id, variant.Id, product.Name, variant.Color, variant.ImageUrl ?? product.ImageUrl, variant.Price,
                        item.Quantity, variant.Price with { AmountMinor = variant.Price.AmountMinor * item.Quantity });
                }).ToArray();
                var now = DateTimeOffset.UtcNow;
                var created = false;
                var order = await accounts.PlaceOrder(id, request.ClientRequestId, () =>
                {
                    created = true;
                    return new CustomerOrder(Guid.NewGuid().ToString("N"), $"XN-{now:yyMMdd}-{RandomNumberGenerator.GetInt32(1000, 10000)}", now, OrderStatuses.Received, address, lines,
                        new Money(lines.Sum(line => line.LineTotal.AmountMinor), lines[0].UnitPrice.Currency), History: [new OrderEvent(OrderStatuses.Received, now, "customer", null)]);
                });
                // A retried request returns the stored order and must not notify twice.
                if (created && await accounts.FindById(id) is { } account) await OrderNotifications.Send(notifications, account, order, "order_placed");
                return TypedResults.Created($"/api/v1/me/orders/{order.Id}", OrderEndpoints.WithImages(order, http, configuration, environment));
            })
            .WithName("PlaceMyOrder")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    private static PlaceOrderItem[] Merge(PlaceOrderItem[]? items)
    {
        if (items is not { Length: > 0 and <= CustomerRules.MaxOrderItems }) throw new AccountException("invalid_items", "Sepetin boş veya çok fazla ürün içeriyor.");
        if (items.Any(item => string.IsNullOrWhiteSpace(item.ProductId) || string.IsNullOrWhiteSpace(item.VariantId) || item.Quantity is < 1 or > 99))
            throw new AccountException("invalid_items", "Sepetteki adetleri kontrol et.");
        return items.GroupBy(item => (item.ProductId, item.VariantId))
            .Select(group => new PlaceOrderItem(group.Key.ProductId, group.Key.VariantId, group.Sum(item => item.Quantity))).ToArray();
    }

    private static string Id(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier)!;

    private static AccountException SessionEnded() => new("invalid_token", "Oturumun sona erdi. Tekrar giriş yap.", StatusCodes.Status401Unauthorized);
}
