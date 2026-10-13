using Xinobi.Api.Catalog;

namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;

public static class Cm101CandidateCommand
{
    public const string Mode = "--cm101-candidate-once";
    public const string Workspace = @"D:\XinobiYeni-integration";
    public static async Task<int> RunAsync(string[] args)
    {
        try
        {
            // No WebApplication builder: no API listener, hosted workers, appsettings.Local or normal startup side effects.
            if (args.Length != 4 || args[0] != Mode || args[1] != "--attempt-id" ||
                !Guid.TryParseExact(args[2], "D", out var attemptId) || attemptId == Guid.Empty ||
                args[3] != "--acknowledge-third-party-credit-usage")
                throw new SegmentationProviderException("cm101_explicit_attempt_consent_required", 403);
            var gates = new Cm101CandidateGates(
                Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development",
                Enabled("ProductSurfaces__DevelopmentReview__Enabled"),
                Enabled("ProductSurfaces__Cm101Candidate__Enabled"),
                Enabled("ProductSurfaces__Segmentation__ExternalInferenceEnabled"),
                Environment.GetEnvironmentVariable("ProductSurfaces__Segmentation__Provider") ?? "reference");
            if (!gates.Allows) throw new SegmentationProviderException("cm101_automatic_disabled", 503);
            if (!string.Equals(Path.GetFullPath(Directory.GetCurrentDirectory()).TrimEnd(Path.DirectorySeparatorChar), Workspace, StringComparison.OrdinalIgnoreCase))
                throw new SegmentationProviderException("cm101_workspace_not_authorized", 403);
            var catalogDirectory = Path.Combine(Workspace, "services", "api", "App_Data", "real-catalog-qa");
            var source = new Cm101CatalogSourceResolver(new SnapshotCatalogSource(Path.Combine(catalogDirectory, "state.json")),
                Path.Combine(catalogDirectory, "media"));
            var reviewDirectory = Path.Combine(Workspace, "services", "api", "App_Data", "cm101-sam3-review");
            var output = await new Cm101PendingCandidateRunner(source, reviewDirectory).ExecuteAsync(attemptId, gates,
                LoadCredentialAfterClaim, Cm101RestrictedRequestHandler.CreateTransport);
            Console.WriteLine("CM101 pending REAL ROBOFLOW candidate saved: " + output);
            Console.WriteLine("Not approved. Review mask boundaries and original-logo protection before any integration.");
            return 0;
        }
        catch (SegmentationProviderException error)
        {
            Console.Error.WriteLine(error.Message); // Only fixed safe codes, never exception detail/provider body/payload/key.
            Console.Error.WriteLine("No retry or replacement attempt is authorized by this command.");
            return 2;
        }
        catch
        {
            Console.Error.WriteLine("cm101_attempt_failed_or_uncertain; preserve the attempt record and do not retry.");
            return 2;
        }
    }
    private static bool Enabled(string name) => Environment.GetEnvironmentVariable(name) == "true";
    private static string? LoadCredentialAfterClaim()
    {
        // Same server-side configuration key as the existing adapter. Never accept a key as a command-line argument.
        var key = Environment.GetEnvironmentVariable("ProductSurfaces__Segmentation__Roboflow__ApiKey");
        if (!string.IsNullOrWhiteSpace(key)) return key;
        // Deferred until all gates, exact source validation and persistent attempt claim have succeeded.
        return new ConfigurationBuilder().AddUserSecrets(typeof(Cm101CandidateCommand).Assembly, optional: true)
            .Build()["ProductSurfaces:Segmentation:Roboflow:ApiKey"];
    }
}
