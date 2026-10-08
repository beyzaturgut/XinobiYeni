using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SkiaSharp;
using Xinobi.Api.Features.ProductSurfaces.Development;

namespace Xinobi.Architecture.Tests;

public sealed class DevelopmentAcceptedSurfaceTests
{
    private static string Repo()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "XinobiYeni.slnx"))) dir = dir.Parent;
        return dir!.FullName;
    }
    private static string Url(string variant = "blue") => DevelopmentAcceptedSurface.Route
        .Replace("{productReference}", "cay-makinesi-101").Replace("{variantReference}", variant);
    private static WebApplicationFactory<Program> Factory(bool enabled = true, string environment = "Development", bool review = false) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment(environment);
            builder.ConfigureLogging(logging => logging.ClearProviders());
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ProductSurfaces:DevelopmentStorefrontPreview:Enabled"] = enabled.ToString(),
                ["ProductSurfaces:DevelopmentStorefrontPreview:RepositoryRoot"] = Repo(),
                ["ProductSurfaces:DevelopmentReview:Enabled"] = review.ToString(),
                ["ProductSurfaces:DevelopmentReview:RepositoryRoot"] = Repo(),
                ["ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled"] = "false",
                ["ProductSurfaces:Segmentation:Provider"] = "reference",
                ["ProductSurfaces:Segmentation:ExternalInferenceEnabled"] = "false",
                ["ProductSurfaces:Segmentation:SingleAutomaticSmokeEnabled"] = "false",
                ["ProductSurfaces:Segmentation:SingleInteractiveSmokeEnabled"] = "false"
            }));
        });

    [Theory]
    [InlineData(false, "Development")]
    [InlineData(true, "Production")]
    public async Task GateIsRequired(bool enabled, string environment)
    {
        using var factory = Factory(enabled, environment);
        using var client = factory.CreateClient(new() { AllowAutoRedirect = false });
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(Url())).StatusCode);
    }
    [Fact]
    public async Task ReadReturnsExactAcceptedReferenceWithoutOnboardingOrProviderDependencies()
    {
        using var factory = Factory(); using var client = factory.CreateClient();
        var first = await client.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url());
        Assert.Equal(first, await client.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url()));
        Assert.True(first!.PreviewAvailable);
        Assert.Equal("development-preview", first.Scope);
        var input = first.Inputs!;
        Assert.Equal((1066, 1600), (input.Width, input.Height));
        Assert.Equal(DevelopmentAcceptedSurface.SourceSha, input.Source.Sha256);
        Assert.Equal(DevelopmentAcceptedSurface.MaskSha, input.Mask.Sha256);
        Assert.True(input.BrandingRequired); Assert.Equal(DevelopmentAcceptedSurface.BrandingSha, input.Branding!.Sha256);
        Assert.Equal("dev:tea-maker-101:blue:source:v1", input.SourceMediaVersion);
        Assert.EndsWith("?v=" + input.Mask.Sha256, input.Mask.Url);
        var text = await client.GetStringAsync(Url());
        foreach (var forbidden in new[] { "candidate", "revision", "reviewer", "roboflow", "prompt", "score", "stroke", "apiKey" })
            Assert.DoesNotContain(forbidden, text, StringComparison.OrdinalIgnoreCase);
        // Admin review is disabled; this read initializes no analysis/provider/approval.
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync(DevelopmentSurfaceReview.Route + "/review")).StatusCode);
    }
    [Theory]
    [InlineData("silver")][InlineData("red")][InlineData("rose")][InlineData("unknown")]
    public async Task UnsupportedVariantNeverFallsBack(string variant)
    {
        using var factory = Factory(); using var client = factory.CreateClient();
        var bundle = await client.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url(variant));
        Assert.False(bundle!.PreviewAvailable); Assert.Null(bundle.Inputs);
    }
    [Fact]
    public void WrongProductFailsClosed() => Assert.False(new DevelopmentAcceptedSurface(Repo()).Resolve("other", "blue").PreviewAvailable);

    [Fact]
    public async Task PendingAndRejectedReviewStateNeverChangesAcceptedReferenceOrCreatesAnotherRevision()
    {
        using var factory = Factory(review: true); using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("Origin", "http://localhost:5173");
        var before = await client.GetFromJsonAsync<ReviewSnapshot>(DevelopmentSurfaceReview.Route + "/review");
        Assert.Equal("pending", before!.Candidate!.Status);
        var accepted = await client.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url());
        var afterRead = await client.GetFromJsonAsync<ReviewSnapshot>(DevelopmentSurfaceReview.Route + "/review");
        Assert.Equal(System.Text.Json.JsonSerializer.Serialize(before), System.Text.Json.JsonSerializer.Serialize(afterRead));
        // Compare values including deserialized point lists, not their collection reference identity.
        var decision = await client.PostAsJsonAsync(DevelopmentSurfaceReview.Route +
            $"/revisions/{before.Candidate.RevisionId}/candidates/{before.Candidate.CandidateId}/review",
            new DecisionRequest(before.SessionId, before.StateVersion, "reject"));
        decision.EnsureSuccessStatusCode();
        Assert.Equal(accepted, await client.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url()));
        Assert.False((await client.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url("red")))!.PreviewAvailable);
    }

    [Theory]
    [InlineData("source-checksum")][InlineData("source-size")][InlineData("mask-missing")]
    [InlineData("mask-size")][InlineData("mask-invalid")][InlineData("mask-checksum")]
    [InlineData("branding-missing")][InlineData("branding-size")][InlineData("branding-invalid")]
    public void ChangedOrMissingMediaFailsClosed(string defect)
    {
        var temp = Path.Combine(Path.GetTempPath(), "xinobi-step5b-test-" + Guid.NewGuid());
        var source = "apps/web/public/assets/products/tea-maker-101-blue.webp";
        var mask = "apps/web/public/assets/personalization/tea-maker-101-blue-designable.png";
        var branding = "apps/web/public/assets/personalization/tea-maker-101-blue-branding-overlay.png";
        try
        {
            foreach (var path in new[] { source, mask, branding })
            {
                var output = Path.Combine(temp, path); Directory.CreateDirectory(Path.GetDirectoryName(output)!);
                File.Copy(Path.Combine(Repo(), path), output);
            }
            var target = Path.Combine(temp, defect.StartsWith("source") ? source : defect.StartsWith("mask") ? mask : branding);
            if (defect.EndsWith("missing")) File.Delete(target);
            else if (defect.EndsWith("invalid")) File.WriteAllBytes(target, [1, 2, 3]);
            else if (defect.EndsWith("size"))
            {
                using var bitmap = new SKBitmap(3, 4); bitmap.Erase(SKColors.Blue);
                using var image = SKImage.FromBitmap(bitmap); using var data = image.Encode(SKEncodedImageFormat.Png, 100);
                File.WriteAllBytes(target, data.ToArray());
            }
            else
            {
                // Valid unchanged dimensions, different immutable encoded identity.
                using var stream = File.Open(target, FileMode.Append); stream.WriteByte(0);
            }
            Assert.False(new DevelopmentAcceptedSurface(temp).Resolve("cay-makinesi-101", "blue").PreviewAvailable);
        }
        finally { if (Directory.Exists(temp)) Directory.Delete(temp, true); }
    }
}
