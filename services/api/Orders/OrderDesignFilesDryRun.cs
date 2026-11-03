using System.Security.Cryptography;
using System.Text.Json;
using Xinobi.Api.Designs;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Orders;

/// <summary>What exists for one order-time file of a personalised line, and whether a missing reference could be proven.</summary>
public sealed record OrderFileFinding(bool Recorded, bool CopyPresent, string Status, string? Proposal);

/// <summary>One personalised order line; no customer name, e-mail, address or storage path is included.</summary>
public sealed record OrderDesignLineFinding(string OrderId, string OrderNumber, int Line, int? SchemaVersion, bool Placement, int? ConfigurationRevision,
    OrderFileFinding Pattern, OrderFileFinding ProductSource, OrderFileFinding Composition);

public sealed record OrderDesignFilesReport(DateTimeOffset GeneratedAt, int Orders, int PersonalisedLines, IReadOnlyDictionary<string, int> Proposals,
    OrderDesignLineFinding[] Lines);

/// <summary>
/// SIP-TAS-08: a read-only inventory of older and incomplete order design records, with a backfill proposal only where the order's
/// own copy can be proven to belong to the same order revision. It never writes: no order, file or reference is changed, and the
/// current catalogue or design is never consulted. Applying a backfill is a separate, approved step (see the rollback plan).
/// </summary>
public static class OrderDesignFilesDryRun
{
    public const string Command = "order-design-files-dry-run";

    public static async Task<OrderDesignFilesReport> Plan(IAccountStore accounts, SavedDesignStore designs, TimeProvider clock)
    {
        var orders = await accounts.AllOrders();
        var lines = new List<OrderDesignLineFinding>();
        foreach (var order in orders.Select(item => item.Order).OrderBy(item => item.CreatedAt).ThenBy(item => item.Id, StringComparer.Ordinal))
            for (var line = 0; line < order.Lines.Length; line++)
                if (order.Lines[line].Personalization is { } design)
                    lines.Add(await Inspect(order, line, design, designs));
        var proposals = lines.SelectMany(item => new[] { item.Pattern, item.ProductSource, item.Composition }).Where(item => item.Proposal is not null)
            .GroupBy(item => item.Proposal!).ToDictionary(group => group.Key, group => group.Count());
        return new(clock.GetUtcNow(), orders.Length, lines.Count, proposals, [.. lines]);
    }

    private static async Task<OrderDesignLineFinding> Inspect(CustomerOrder order, int line, OrderPersonalization design, SavedDesignStore designs)
    {
        var files = design.Files;
        // Pattern: provable when the order's own copy matches the placement's recorded pattern checksum.
        OrderFileFinding pattern;
        var patternBytes = await Read(designs.OrderImage(order.Id, line, design.Mime));
        if (files is not null) pattern = new(true, patternBytes is not null, patternBytes is null ? "missing-copy" : Sha(patternBytes) == files.Pattern.Sha256 ? "verified" : "checksum-mismatch", null);
        else if (patternBytes is null) pattern = new(false, false, "missing-copy", null);
        else if (design.SourceSha256 is { } expected)
            pattern = Sha(patternBytes) == expected ? new(false, true, "provable", "record-pattern-reference") : new(false, true, "checksum-mismatch", null);
        else pattern = new(false, true, "unprovable-no-recorded-checksum", null);

        // Product photo: before file references no order copy was kept; the live catalogue photo is never a substitute.
        var sourceBytes = files?.ProductSource is { } source ? await Read(designs.OrderSourceImageUnchecked(order.Id, line, source.Mime)) : null;
        OrderFileFinding productSource = files?.ProductSource is { } recordedSource
            ? new(true, sourceBytes is not null, sourceBytes is null ? "missing-copy" : Sha(sourceBytes) == recordedSource.Sha256 ? "verified" : "checksum-mismatch", null)
            : new(false, false, design.Placement is null ? "no-placement" : "not-kept-for-this-order", null);

        // Composition: an older order may own its order-time copy, but nothing recorded proves its bytes; it stays unverified.
        var compositionBytes = await Read(designs.OrderPreview(order.Id, line));
        OrderFileFinding composition = files?.Composition is { } recordedComposition
            ? new(true, compositionBytes is not null, compositionBytes is null ? "missing-copy" : Sha(compositionBytes) == recordedComposition.Sha256 ? "verified" : "checksum-mismatch", null)
            : files is not null ? new(false, compositionBytes is not null, "not-uploaded-for-revision", null)
            : design.Placement is null ? new(false, compositionBytes is not null, "no-placement", null)
            : compositionBytes is null ? new(false, false, "not-kept-for-this-order", null)
            : new(false, true, "order-copy-unverified", "decide-unverified-composition");

        return new(order.Id, order.Number, line, design.SchemaVersion, design.Placement is not null, design.ConfigurationRevision, pattern, productSource, composition);
    }

    private static async Task<byte[]?> Read(Task<StoredFile?> open)
    {
        var file = await open;
        if (file is null) return null;
        await using (file)
        {
            using var buffer = new MemoryStream();
            await file.Content.CopyToAsync(buffer);
            return buffer.ToArray();
        }
    }

    private static string Sha(byte[] bytes) => Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();

    /// <summary>Console entry: writes the report as JSON. Exit 0 on success, 2 when orders or files cannot be read.</summary>
    public static async Task<int> Run(IServiceProvider services, TextWriter output, TextWriter error)
    {
        try
        {
            var report = await Plan(services.GetRequiredService<IAccountStore>(), services.GetRequiredService<SavedDesignStore>(), services.GetRequiredService<TimeProvider>());
            await output.WriteLineAsync(JsonSerializer.Serialize(report, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true }));
            return 0;
        }
        catch (Exception exception) when (exception is ProblemException or AccountUnavailableException or IOException)
        {
            // An unreadable store is not an empty one: no report is printed rather than a misleading "nothing to do".
            await error.WriteLineAsync("Sipariş veya dosya deposu okunamadı; rapor üretilmedi.");
            return 2;
        }
    }
}
