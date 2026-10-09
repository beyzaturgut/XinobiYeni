using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Xinobi.Api.Catalog;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Notifications;

namespace Xinobi.Api.Quotes;

public static class QuoteEndpoints
{
    public static void MapPublicQuotes(this WebApplication app)
    {
        var quotes = app.MapGroup("/api/v1/quotes").WithTags("Quotes").AllowAnonymous().WithProblems();
        if (Identity.AccountStorage.RateLimited(app.Environment, app.Configuration)) quotes.RequireRateLimiting("Account");

        quotes.MapGet("/options", () => TypedResults.Ok(new QuoteOptions(QuoteStore.Purposes, QuoteStore.MinQuantity, QuoteStore.MaxQuantity, QuoteStore.MaxItems)))
            .WithName("GetQuoteOptions");

        // Signed-in customers (bearer or cookie) get the request on their account too; the endpoint is public, so the token is read but not required.
        quotes.MapPost("", async Task<Results<Created<Quote>, ProblemHttpResult>> (CreateQuote request, HttpContext http, QuoteStore store, ICatalogSource catalog, NotificationCenter notifications) =>
            {
                var auth = await http.AuthenticateAsync(AccountTokenHandler.SchemeName);
                var accountId = auth.Succeeded ? auth.Principal.FindFirstValue(ClaimTypes.NameIdentifier) : null;
                var quote = await store.Create(request, accountId, async () => (await catalog.ReadAsync()).Products.Where(product => product.Active).ToArray());
                await notifications.NotifyGuest(quote.Email, "quote_received", "Teklif talebin alındı",
                    $"{quote.Code} kodlu talebini aldık. İnceleyip en kısa sürede dönüş yapacağız. Takip için kodu ve bu e-posta adresini kullanabilirsin.", $"/kurumsal/teklif/takip?kod={quote.Code}");
                return TypedResults.Created($"/api/v1/quotes/{quote.Code}", quote);
            })
            .WithName("CreateQuote")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        quotes.MapGet("/{code}", async (string code, string email, QuoteStore store) => TypedResults.Ok(await store.Track(code, email)))
            .WithName("TrackQuote")
            .ProducesProblem(StatusCodes.Status404NotFound);

        quotes.MapPost("/{code}/messages", async (string code, TrackQuoteMessage request, QuoteStore store) => TypedResults.Ok(await store.CustomerMessage(code, request)))
            .WithName("SendQuoteMessage")
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        quotes.MapPost("/{code}/decision", async (string code, QuoteDecision request, QuoteStore store) => TypedResults.Ok(await store.Decide(code, request)))
            .WithName("DecideQuote")
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);
    }

    public static void MapCustomerQuotes(RouteGroupBuilder me)
    {
        me.MapGet("/quotes", async (ClaimsPrincipal user, QuoteStore store) =>
                TypedResults.Ok(await store.ForAccount(user.FindFirstValue(ClaimTypes.NameIdentifier)!, user.FindFirstValue(ClaimTypes.Email)!)))
            .WithName("ListMyQuotes");
    }

    public static void MapPanelQuotes(RouteGroupBuilder panel)
    {
        panel.MapGet("/quotes", async (string? status, QuoteStore store) => TypedResults.Ok(await store.ForPanel(status)));
        panel.MapPost("/quotes/{id}/status", async (string id, SetQuoteStatus request, QuoteStore store) => TypedResults.Ok(await store.SetStatus(id, request)));
        panel.MapPost("/quotes/{id}/offer", async (string id, MakeQuoteOffer request, QuoteStore store, NotificationCenter notifications) =>
        {
            var quote = await store.MakeOffer(id, request);
            await notifications.NotifyGuest(quote.Email, "quote_offered", "Teklifin hazır",
                $"{quote.Code} için teklifimiz hazır: toplam {quote.Offer!.Total.AmountMinor / 100m:N2} TL, {quote.Offer.ValidUntil:dd.MM.yyyy} tarihine kadar geçerli.", $"/kurumsal/teklif/takip?kod={quote.Code}");
            return TypedResults.Ok(quote);
        });
        panel.MapPost("/quotes/{id}/messages", async (string id, StoreQuoteMessage request, QuoteStore store, NotificationCenter notifications) =>
        {
            var quote = await store.StoreMessage(id, request);
            await notifications.NotifyGuest(quote.Email, "quote_message", "Teklif talebine yanıt", $"{quote.Code} için yeni bir mesajın var: {request.Text.Trim()}", $"/kurumsal/teklif/takip?kod={quote.Code}");
            return TypedResults.Ok(quote);
        });
    }
}
