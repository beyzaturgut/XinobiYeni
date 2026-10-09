using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Notifications;

namespace Xinobi.Api.Reviews;

public static class ReviewEndpoints
{
    public const int PageSize = 20;

    public static void MapPublicReviews(this IEndpointRouteBuilder app)
    {
        var catalog = app.MapGroup("/api/v1/catalog").WithTags("Catalog").AllowAnonymous().WithProblems();

        catalog.MapGet("/products/{id}/reviews", async Task<Results<Ok<ReviewPage>, ProblemHttpResult>> (string id, int? page, ReviewStore reviews) =>
                page is < 1 ? ApiProblems.Problem(StatusCodes.Status400BadRequest, "invalid_query", "page en az 1 olmalı.")
                    : TypedResults.Ok(await reviews.ForProduct(id, page ?? 1, PageSize)))
            .WithName("ListProductReviews")
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        // ids=a,b,c — rating badges on cards and in product comparison.
        catalog.MapGet("/review-summaries", async Task<Results<Ok<ReviewSummaryList>, ProblemHttpResult>> (string ids, ReviewStore reviews) =>
            {
                var list = ids.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                return list.Length is 0 or > 50 ? ApiProblems.Problem(StatusCodes.Status400BadRequest, "invalid_query", "1–50 ürün kimliği gönder.") : TypedResults.Ok(await reviews.Summaries(list));
            })
            .WithName("ListReviewSummaries")
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    public static void MapCustomerReviews(RouteGroupBuilder me)
    {
        me.MapGet("/reviews", async (ClaimsPrincipal user, ReviewStore reviews) => TypedResults.Ok(await reviews.Mine(Id(user))))
            .WithName("ListMyReviews");

        me.MapPost("/reviews", async Task<Results<Ok<MyReview>, ProblemHttpResult>> (SubmitReview request, ClaimsPrincipal user, IAccountStore accounts, ReviewStore reviews) =>
            {
                var account = await accounts.FindById(Id(user)) ?? throw new AccountException("invalid_token", "Oturumun sona erdi. Tekrar giriş yap.", StatusCodes.Status401Unauthorized);
                return TypedResults.Ok(await reviews.Submit(account, request, await accounts.Orders(account.Id)));
            })
            .WithName("SubmitMyReview")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status403Forbidden);
    }

    public static void MapPanelReviews(RouteGroupBuilder panel)
    {
        panel.MapGet("/reviews", async (string? status, ReviewStore reviews) => TypedResults.Ok(await reviews.ForPanel(status)));
        panel.MapPost("/reviews/{id}/moderation", async (string id, ModerateReview request, ReviewStore reviews, IAccountStore accounts, NotificationCenter notifications) =>
        {
            var review = await reviews.Moderate(id, request);
            if (await accounts.FindById(review.AccountId) is { } account)
                await notifications.Notify(account, "review_" + review.Status,
                    review.Status == ReviewStatuses.Approved ? "Değerlendirmen yayında" : "Değerlendirmen yayınlanmadı",
                    review.Status == ReviewStatuses.Approved ? "Ürün değerlendirmen onaylandı ve ürün sayfasında yayınlandı. Teşekkürler!"
                        : $"Ürün değerlendirmen yayın kurallarına uymadığı için yayınlanmadı.{(review.ModerationNote is { } note ? " Not: " + note : "")}",
                    $"/urunler/detay?id={Uri.EscapeDataString(review.ProductId)}#degerlendirmeler");
            return TypedResults.Ok(review);
        });
    }

    private static string Id(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier)!;
}
