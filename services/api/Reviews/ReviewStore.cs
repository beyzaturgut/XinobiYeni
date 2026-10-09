using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Reviews;

public static class ReviewStatuses
{
    public const string Pending = "pending";
    public const string Approved = "approved";
    public const string Rejected = "rejected";
}

/// <summary>A customer's review of a product they received. Only approved ones are public; the author is shown as "Ayşe Y.".</summary>
public record ProductReview(string Id, string ProductId, string AccountId, string AuthorName, int Rating, string? Title, string Body, string OrderId, string? Color,
    DateTimeOffset CreatedAt, string Status, DateTimeOffset? ModeratedAt = null, string? ModerationNote = null, string? StoreReply = null);

public record SubmitReview(string ProductId, int Rating, string? Title, string Body);
/// <summary>What anyone may see of an approved review.</summary>
public record PublicReview(string Id, string AuthorName, int Rating, string? Title, string Body, string? Color, DateTimeOffset CreatedAt, string? StoreReply);
/// <summary><paramref name="Distribution"/> counts 1–5 star reviews at index 0–4.</summary>
public record ReviewSummary(string ProductId, double Average, int Count, int[] Distribution);
public record ReviewPage(ReviewSummary Summary, PublicReview[] Items, int Page, int PageSize);
public record ReviewSummaryList(ReviewSummary[] Items);
/// <summary>The customer's own review with its moderation status.</summary>
public record MyReview(string Id, string ProductId, int Rating, string? Title, string Body, string Status, DateTimeOffset CreatedAt, string? ModerationNote);
public record ModerateReview(string Status, string? Note, string? Reply);

/// <summary>
/// Product reviews (Faz05 değerlendirme). Only customers with a delivered order containing the product may review it, once per
/// product (a new submission replaces theirs and goes back to moderation). Reviews are moderated before they are public.
/// Development file store (ADR-003); 503 elsewhere until SQL Server.
/// </summary>
public sealed class ReviewStore(IWebHostEnvironment environment, IConfiguration configuration, TimeProvider clock)
{
    public const int MaxTitle = 80;
    public const int MinBody = 10;
    public const int MaxBody = 2000;
    private sealed record State(List<ProductReview> Reviews);
    private readonly DevJsonStore<State> store = new(DevJsonStore<State>.DataDirectory(environment, configuration), Path.Combine("reviews", "reviews.json"), () => new([]), "Değerlendirmeler");

    public static string DisplayName(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length switch
        {
            0 => "Xinobi müşterisi",
            1 => parts[0],
            _ => $"{parts[0]} {char.ToUpper(parts[^1][0], new System.Globalization.CultureInfo("tr-TR"))}.",
        };
    }

    private static ReviewSummary Summarise(string productId, IEnumerable<ProductReview> reviews)
    {
        var approved = reviews.Where(review => review.ProductId == productId && review.Status == ReviewStatuses.Approved).ToArray();
        var distribution = Enumerable.Range(1, 5).Select(stars => approved.Count(review => review.Rating == stars)).ToArray();
        return new ReviewSummary(productId, approved.Length == 0 ? 0 : Math.Round(approved.Average(review => review.Rating), 1), approved.Length, distribution);
    }

    public async Task<ReviewSummaryList> Summaries(IEnumerable<string> productIds)
    {
        var reviews = (await store.Read()).Reviews;
        return new ReviewSummaryList([.. productIds.Distinct().Select(id => Summarise(id, reviews))]);
    }

    public async Task<ReviewPage> ForProduct(string productId, int page, int pageSize)
    {
        var reviews = (await store.Read()).Reviews;
        var items = reviews.Where(review => review.ProductId == productId && review.Status == ReviewStatuses.Approved).OrderByDescending(review => review.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(review => new PublicReview(review.Id, review.AuthorName, review.Rating, review.Title, review.Body, review.Color, review.CreatedAt, review.StoreReply)).ToArray();
        return new ReviewPage(Summarise(productId, reviews), items, page, pageSize);
    }

    public async Task<MyReview[]> Mine(string accountId) => (await store.Read()).Reviews.Where(review => review.AccountId == accountId)
        .OrderByDescending(review => review.CreatedAt).Select(review => new MyReview(review.Id, review.ProductId, review.Rating, review.Title, review.Body, review.Status, review.CreatedAt, review.ModerationNote)).ToArray();

    /// <summary>Saves the review of <paramref name="account"/>; <paramref name="orders"/> proves the purchase.</summary>
    public Task<MyReview> Submit(AccountRecord account, SubmitReview request, IEnumerable<CustomerOrder> orders)
    {
        if (request.Rating is < 1 or > 5) throw new ProblemException("invalid_rating", "1 ile 5 arasında puan ver.");
        var title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title.Trim();
        var body = request.Body?.Trim() ?? "";
        if (title is { Length: > MaxTitle } || title?.Any(char.IsControl) == true) throw new ProblemException("invalid_title", $"Başlık en fazla {MaxTitle} karakter olabilir.");
        if (body.Length is < MinBody or > MaxBody || body.Any(c => char.IsControl(c) && c is not '\n' and not '\r'))
            throw new ProblemException("invalid_body", $"Yorumun {MinBody}–{MaxBody} karakter olmalı.");
        var order = orders.Where(item => item.Status == OrderStatuses.Delivered && item.Lines.Any(line => line.ProductId == request.ProductId))
            .OrderByDescending(item => item.CreatedAt).FirstOrDefault()
            ?? throw new ProblemException("not_purchased", "Yalnız teslim aldığın ürünleri değerlendirebilirsin.", StatusCodes.Status403Forbidden);
        var color = order.Lines.First(line => line.ProductId == request.ProductId).Color;
        return store.Update(state =>
        {
            var now = clock.GetUtcNow();
            var index = state.Reviews.FindIndex(review => review.AccountId == account.Id && review.ProductId == request.ProductId);
            var review = new ProductReview(index >= 0 ? state.Reviews[index].Id : Guid.NewGuid().ToString("N"), request.ProductId, account.Id, DisplayName(account.Name),
                request.Rating, title, body, order.Id, color, now, ReviewStatuses.Pending);
            if (index >= 0) state.Reviews[index] = review; else state.Reviews.Add(review);
            return new MyReview(review.Id, review.ProductId, review.Rating, review.Title, review.Body, review.Status, review.CreatedAt, null);
        });
    }

    public async Task<ProductReview[]> ForPanel(string? status) =>
        (await store.Read()).Reviews.Where(review => status is null || review.Status == status).OrderByDescending(review => review.CreatedAt).Take(500).ToArray();

    public Task<ProductReview> Moderate(string id, ModerateReview request) => store.Update(state =>
    {
        var index = state.Reviews.FindIndex(review => review.Id == id);
        if (index < 0) throw ProblemException.NotFound("review_not_found", "Değerlendirme bulunamadı.");
        if (request.Status is not (ReviewStatuses.Approved or ReviewStatuses.Rejected)) throw new ProblemException("invalid_status", "Onayla veya reddet.");
        string? Clean(string? text, int max) => string.IsNullOrWhiteSpace(text) ? null
            : text.Trim().Length <= max ? text.Trim() : throw new ProblemException("invalid_note", $"Not ve yanıt en fazla {max} karakter olabilir.");
        return state.Reviews[index] = state.Reviews[index] with
        {
            Status = request.Status, ModeratedAt = clock.GetUtcNow(), ModerationNote = Clean(request.Note, 300), StoreReply = Clean(request.Reply, 1000),
        };
    });

    public Task ForgetAccount(string accountId) => store.Update(state => state.Reviews.RemoveAll(review => review.AccountId == accountId));
}
