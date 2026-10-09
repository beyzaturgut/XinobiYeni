using System.Security.Cryptography;
using Xinobi.Api.Catalog;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Quotes;

public static class QuoteStatuses
{
    public const string Received = "received";
    public const string Reviewing = "reviewing";
    public const string Offered = "offered";
    public const string Accepted = "accepted";
    public const string Rejected = "rejected";
    /// <summary>Closed by the panel without an agreement (or after conversion is handled outside the system).</summary>
    public const string Closed = "closed";
}

public record QuoteItemRequest(string ProductId, int Quantity);
public record CreateQuote(string Company, string ContactName, string Email, string? Phone, string? TaxNumber, QuoteItemRequest[] Items, bool Personalization,
    string? PersonalizationNote, DateOnly? DesiredDate, string? Purpose, string? Note);
public record QuoteItem(string ProductId, string ProductName, int Quantity, Money? UnitPrice = null, Money? LineTotal = null);
/// <summary><paramref name="From"/> is <c>customer</c> or <c>store</c>.</summary>
public record QuoteMessage(string From, string Text, DateTimeOffset At);
public record QuoteOffer(Money Total, DateOnly ValidUntil, string? Note, DateTimeOffset At);
public record QuoteEvent(string Status, DateTimeOffset At, string Actor, string? Note);
public record Quote(string Id, string Code, string? AccountId, string Company, string ContactName, string Email, string? Phone, string? TaxNumber, QuoteItem[] Items,
    bool Personalization, string? PersonalizationNote, DateOnly? DesiredDate, string? Purpose, string? Note, string Status, DateTimeOffset CreatedAt,
    QuoteOffer? Offer, QuoteMessage[] Messages, QuoteEvent[] History);

public record TrackQuoteMessage(string Email, string Text);
public record QuoteDecision(string Email, string Decision, string? Note);
public record QuoteOfferLine(string ProductId, long UnitPriceMinor);
public record MakeQuoteOffer(QuoteOfferLine[] Lines, DateOnly ValidUntil, string? Note);
public record SetQuoteStatus(string Status, string? Note);
public record StoreQuoteMessage(string Text);
public record QuoteOptions(string[] Purposes, int MinQuantity, int MaxQuantity, int MaxItems);

/// <summary>
/// Corporate quote requests (Faz07): anyone may ask, tracking needs the code and the e-mail it was sent with (or the account
/// that sent it). The panel reviews, writes an offer with unit prices and a validity date, and exchanges messages; the customer
/// accepts or declines. A request is never a payment order; turning an accepted offer into a bulk order waits for D07.
/// Development file store (ADR-003); 503 elsewhere until SQL Server.
/// </summary>
public sealed class QuoteStore(IWebHostEnvironment environment, IConfiguration configuration, TimeProvider clock)
{
    public const int MinQuantity = 10;
    public const int MaxQuantity = 100_000;
    public const int MaxItems = 10;
    public static readonly string[] Purposes = ["Kurumsal hediye", "Ofis kullanımı", "Kampanya / promosyon", "Bayi / yeniden satış", "Diğer"];
    private sealed record State(List<Quote> Quotes);
    private readonly DevJsonStore<State> store = new(DevJsonStore<State>.DataDirectory(environment, configuration), Path.Combine("quotes", "quotes.json"), () => new([]), "Kurumsal teklifler");

    private static string Text(string? value, string field, int min, int max, string message, bool multiline = false)
    {
        var text = value?.Trim() ?? "";
        if (text.Length < min || text.Length > max || text.Any(c => char.IsControl(c) && !(multiline && c is '\n' or '\r'))) throw new ProblemException("invalid_" + field, message);
        return text;
    }

    private static string? Optional(string? value, string field, int max, string message, bool multiline = false) =>
        string.IsNullOrWhiteSpace(value) ? null : Text(value, field, 1, max, message, multiline);

    public async Task<Quote> Create(CreateQuote request, string? accountId, CommerceStateReader catalog)
    {
        var company = Text(request.Company, "company", 2, 120, "Firma adını gir.");
        var contact = Text(request.ContactName, "contact", 2, 80, "Yetkili kişinin adını gir.");
        string email;
        try { email = AccountRules.NormalizeEmail(request.Email); }
        catch (AccountException) { throw new ProblemException("invalid_email", "Geçerli bir kurumsal e-posta adresi gir."); }
        string? phone = null;
        if (!string.IsNullOrWhiteSpace(request.Phone))
            try { phone = CustomerRules.ValidPhone(request.Phone); }
            catch (AccountException error) { throw new ProblemException(error.Code, error.Message); }
        var tax = Optional(request.TaxNumber, "tax_number", 11, "Vergi numarası en fazla 11 karakter olabilir.");
        if (tax is not null && !tax.All(char.IsDigit)) throw new ProblemException("invalid_tax_number", "Vergi numarası yalnız rakamlardan oluşmalı.");
        if (request.Items is not { Length: > 0 and <= MaxItems }) throw new ProblemException("invalid_items", $"1–{MaxItems} ürün seç.");
        var products = await catalog();
        var items = request.Items.GroupBy(item => item.ProductId).Select(group =>
        {
            var product = products.FirstOrDefault(item => item.Id == group.Key) ?? throw new ProblemException("invalid_items", "Seçilen ürünlerden biri artık yayında değil.");
            var quantity = group.Sum(item => item.Quantity);
            if (quantity is < MinQuantity or > MaxQuantity) throw new ProblemException("invalid_quantity", $"Her ürün için {MinQuantity}–{MaxQuantity:N0} adet gir.");
            return new QuoteItem(product.Id, product.Name, quantity);
        }).ToArray();
        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        if (request.DesiredDate is { } date && (date < today || date > today.AddYears(2))) throw new ProblemException("invalid_date", "Teslim tarihi bugünden sonra ve en fazla iki yıl içinde olmalı.");
        var purpose = request.Purpose is null ? null : Purposes.Contains(request.Purpose) ? request.Purpose : throw new ProblemException("invalid_purpose", "Kullanım amacını listeden seç.");
        var now = clock.GetUtcNow();
        var quote = new Quote(Guid.NewGuid().ToString("N"), $"Q-{now:yyMMdd}-{RandomNumberGenerator.GetInt32(1000, 10000)}", accountId, company, contact, email, phone, tax, items,
            request.Personalization, Optional(request.PersonalizationNote, "personalization", 500, "Kişiselleştirme notu en fazla 500 karakter olabilir.", true),
            request.DesiredDate, purpose, Optional(request.Note, "note", 2000, "Not en fazla 2000 karakter olabilir.", true),
            QuoteStatuses.Received, now, null, [], [new QuoteEvent(QuoteStatuses.Received, now, "customer", null)]);
        return await store.Update(state =>
        {
            if (state.Quotes.Count(item => item.Email == email && item.CreatedAt > now.AddDays(-1)) >= 10)
                throw new ProblemException("quote_limit", "Bu e-posta ile bugün çok fazla talep gönderildi. Yarın tekrar dene.", StatusCodes.Status429TooManyRequests);
            state.Quotes.Add(quote);
            return quote;
        });
    }

    /// <summary>The quote for tracking: <paramref name="email"/> must be the one it was sent with. A wrong pair looks like a missing code.</summary>
    public async Task<Quote> Track(string code, string? email)
    {
        var normalized = email?.Trim().ToLowerInvariant();
        return (await store.Read()).Quotes.FirstOrDefault(item => item.Code == code?.Trim().ToUpperInvariant() && item.Email == normalized)
            ?? throw ProblemException.NotFound("quote_not_found", "Bu kod ve e-posta ile eşleşen teklif bulunamadı.");
    }

    public async Task<Quote[]> ForAccount(string accountId, string email) => (await store.Read()).Quotes
        .Where(item => item.AccountId == accountId || item.Email == email).OrderByDescending(item => item.CreatedAt).ToArray();

    public async Task<Quote[]> ForPanel(string? status) =>
        (await store.Read()).Quotes.Where(item => status is null || item.Status == status).OrderByDescending(item => item.CreatedAt).ToArray();

    private Task<Quote> Change(Func<Quote, bool> match, Func<Quote, DateTimeOffset, Quote> change) => store.Update(state =>
    {
        var index = state.Quotes.FindIndex(item => match(item));
        if (index < 0) throw ProblemException.NotFound("quote_not_found", "Teklif bulunamadı.");
        return state.Quotes[index] = change(state.Quotes[index], clock.GetUtcNow());
    });

    private static Quote Move(Quote quote, string status, string actor, string? note, DateTimeOffset now) =>
        quote with { Status = status, History = [.. quote.History, new QuoteEvent(status, now, actor, note)] };

    private static bool Open(Quote quote) => quote.Status is QuoteStatuses.Received or QuoteStatuses.Reviewing or QuoteStatuses.Offered;

    public Task<Quote> CustomerMessage(string code, TrackQuoteMessage request)
    {
        var text = Text(request.Text, "message", 2, 2000, "Mesajın 2–2000 karakter olmalı.", true);
        return Change(item => item.Code == code?.Trim().ToUpperInvariant() && item.Email == request.Email?.Trim().ToLowerInvariant(), (quote, now) =>
            Open(quote) ? quote with { Messages = [.. quote.Messages, new QuoteMessage("customer", text, now)] }
                : throw new ProblemException("quote_closed", "Bu teklif kapandı; yeni bir talep oluşturabilirsin.", StatusCodes.Status409Conflict));
    }

    public Task<Quote> Decide(string code, QuoteDecision request)
    {
        if (request.Decision is not ("accept" or "reject")) throw new ProblemException("invalid_decision", "Teklifi kabul et veya reddet.");
        var note = Optional(request.Note, "note", 1000, "Not en fazla 1000 karakter olabilir.", true);
        return Change(item => item.Code == code?.Trim().ToUpperInvariant() && item.Email == request.Email?.Trim().ToLowerInvariant(), (quote, now) =>
        {
            if (quote.Status != QuoteStatuses.Offered || quote.Offer is null) throw new ProblemException("no_offer", "Yanıtlanacak bir teklif yok.", StatusCodes.Status409Conflict);
            if (DateOnly.FromDateTime(now.UtcDateTime) > quote.Offer.ValidUntil) throw new ProblemException("offer_expired", "Teklifin geçerlilik süresi doldu. Yeni teklif iste.", StatusCodes.Status409Conflict);
            var moved = Move(quote, request.Decision == "accept" ? QuoteStatuses.Accepted : QuoteStatuses.Rejected, "customer", note, now);
            return note is null ? moved : moved with { Messages = [.. moved.Messages, new QuoteMessage("customer", note, now)] };
        });
    }

    public Task<Quote> SetStatus(string id, SetQuoteStatus request)
    {
        var note = Optional(request.Note, "note", 1000, "Not en fazla 1000 karakter olabilir.", true);
        return Change(item => item.Id == id, (quote, now) => (quote.Status, request.Status) switch
        {
            (QuoteStatuses.Received, QuoteStatuses.Reviewing) or (QuoteStatuses.Received or QuoteStatuses.Reviewing or QuoteStatuses.Offered or QuoteStatuses.Accepted or QuoteStatuses.Rejected, QuoteStatuses.Closed)
                => Move(quote, request.Status, "panel", note, now),
            _ => throw new ProblemException("invalid_transition", "Teklif bu duruma geçemez.", StatusCodes.Status409Conflict),
        });
    }

    public Task<Quote> MakeOffer(string id, MakeQuoteOffer request)
    {
        var note = Optional(request.Note, "note", 2000, "Not en fazla 2000 karakter olabilir.", true);
        return Change(item => item.Id == id, (quote, now) =>
        {
            if (quote.Status is not (QuoteStatuses.Received or QuoteStatuses.Reviewing or QuoteStatuses.Offered))
                throw new ProblemException("invalid_transition", "Kapanmış talebe teklif verilemez.", StatusCodes.Status409Conflict);
            if (request.ValidUntil < DateOnly.FromDateTime(now.UtcDateTime)) throw new ProblemException("invalid_date", "Geçerlilik tarihi bugün veya sonrası olmalı.");
            var items = quote.Items.Select(item =>
            {
                var line = request.Lines?.FirstOrDefault(entry => entry.ProductId == item.ProductId) ?? throw new ProblemException("invalid_offer", $"{item.ProductName} için birim fiyat gir.");
                if (line.UnitPriceMinor is <= 0 or > 999_999_999) throw new ProblemException("invalid_offer", "Birim fiyatlar pozitif olmalı.");
                return item with { UnitPrice = new Money(line.UnitPriceMinor, CatalogProjection.Currency), LineTotal = new Money(line.UnitPriceMinor * item.Quantity, CatalogProjection.Currency) };
            }).ToArray();
            var offer = new QuoteOffer(new Money(items.Sum(item => item.LineTotal!.AmountMinor), CatalogProjection.Currency), request.ValidUntil, note, now);
            return Move(quote with { Items = items, Offer = offer }, QuoteStatuses.Offered, "panel", $"Toplam {offer.Total.AmountMinor / 100m:N2} TL", now);
        });
    }

    public Task<Quote> StoreMessage(string id, StoreQuoteMessage request)
    {
        var text = Text(request.Text, "message", 2, 2000, "Mesaj 2–2000 karakter olmalı.", true);
        return Change(item => item.Id == id, (quote, now) => quote with { Messages = [.. quote.Messages, new QuoteMessage("store", text, now)] });
    }
}

/// <summary>Reads the active catalogue products; kept as a delegate so the store does not depend on how the catalogue is sourced.</summary>
public delegate Task<LocalCommerce.CommerceProduct[]> CommerceStateReader();
