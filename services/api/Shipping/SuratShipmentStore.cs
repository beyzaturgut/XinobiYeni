using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Shipping;

public sealed record SuratShipmentAttempt(string AttemptId, string State, DateTimeOffset StartedAt, DateTimeOffset? CompletedAt,
    string ActorId, SuratShipment Request, string? Evidence, string? ReconciledBy, SuratCreateDiagnostic? CreateDiagnostic = null);

public sealed record SuratStoredShipment(string OrderId, string Environment, string AccountFingerprint,
    string Reference, string AttemptId, string RequestFingerprint, string State, DateTimeOffset StartedAt,
    DateTimeOffset? CompletedAt, string ActorId, SuratShipment Request, string? SenderCode = null, SuratTrackingSnapshot? Tracking = null,
    SuratTrackingLease? TrackingLease = null, string? ReconciliationEvidence = null, string? ReconciledBy = null, SuratShipmentAttempt[]? PreviousAttempts = null, SuratCreateDiagnostic? CreateDiagnostic = null);
public sealed class SuratShipmentState
{
    public List<SuratStoredShipment> Shipments { get; set; } = [];
}
public sealed record SuratShipmentClaim(SuratStoredShipment Shipment, bool IsNew);

/// <summary>SQL uses the shared FeatureDocuments transaction/application lock; local Development is single-process only.</summary>
public sealed class SuratShipmentStore(FeatureDocuments documents)
{
    private readonly DocumentStore<SuratShipmentState> store = documents.Open("shipping/surat-shipments.json", () => new SuratShipmentState(), "Kargo kayıtları");
    public async Task<SuratStoredShipment?> Find(string orderId, string environment) =>
        (await store.Read()).Shipments.SingleOrDefault(s => s.OrderId == orderId && s.Environment == environment);

    public Task<SuratShipmentClaim> Claim(string orderId, string environment, string username, string actorId, SuratShipment draft, DateTimeOffset now)
    {
        // All fields, including the address snapshot, participate in retry equality. No credential is persisted.
        var fingerprint = Hash(JsonSerializer.Serialize(draft with { OzelKargoTakipNo = "" }));
        var account = Hash(username);
        return store.Update(state =>
        {
            var existing = state.Shipments.SingleOrDefault(s => s.OrderId == orderId && s.Environment == environment);
            if (existing is not null)
            {
                if (existing.AccountFingerprint != account || (existing.State != "confirmed_not_created" && existing.RequestFingerprint != fingerprint))
                    throw new ProblemException("shipment_conflict", "Bu sipariş için farklı bilgilerle bir gönderi denemesi var; önce kayıt uzlaştırılmalı.", 409);
                if (existing.State != "confirmed_not_created") return new SuratShipmentClaim(existing, false);
                var corrected = draft with { OzelKargoTakipNo = existing.Reference };
                corrected.Validate();
                var old = new SuratShipmentAttempt(existing.AttemptId, existing.State, existing.StartedAt, existing.CompletedAt,
                    existing.ActorId, existing.Request, existing.ReconciliationEvidence, existing.ReconciledBy, existing.CreateDiagnostic);
                var retry = existing with { AttemptId = Guid.NewGuid().ToString("N"), RequestFingerprint = fingerprint, State = "submitting",
                    StartedAt = now, CompletedAt = null, ActorId = actorId, Request = corrected, TrackingLease = null,
                    ReconciliationEvidence = null, ReconciledBy = null, CreateDiagnostic = null, PreviousAttempts = [.. existing.PreviousAttempts ?? [], old] };
                state.Shipments[state.Shipments.IndexOf(existing)] = retry;
                return new SuratShipmentClaim(retry, true);
            }
            var reference = "XNB-" + Guid.NewGuid().ToString("N");
            var request = draft with { OzelKargoTakipNo = reference };
            request.Validate();
            var row = new SuratStoredShipment(orderId, environment, account, reference, Guid.NewGuid().ToString("N"), fingerprint,
                "submitting", now, null, actorId, request, username);
            state.Shipments.Add(row);
            return new SuratShipmentClaim(row, true);
        });
    }

    public Task<SuratStoredShipment> Complete(SuratStoredShipment claim, SuratCreateState result, DateTimeOffset now, SuratCreateDiagnostic? diagnostic = null) => store.Update(state =>
    {
        var index = state.Shipments.FindIndex(s => s.AttemptId == claim.AttemptId && s.OrderId == claim.OrderId && s.Environment == claim.Environment);
        if (index < 0) throw ProblemException.Unavailable("Kargo denemesi");
        var row = state.Shipments[index];
        if (row.State != "submitting") return row;
        row = row with { State = result == SuratCreateState.Registered ? "registered" : "reconciliation_required", CompletedAt = now, CreateDiagnostic = diagnostic };
        state.Shipments[index] = row;
        return row;
    });

    public async Task<SuratStoredShipment[]> DueTracking(string environment, DateTimeOffset now, string? username = null) =>
        (await store.Read()).Shipments.Where(s => s.Environment == environment && s.State == "registered" && (username == null || s.AccountFingerprint == Hash(username)) &&
            (s.Tracking?.NextAttempt ?? DateTimeOffset.MinValue) <= now && (s.TrackingLease?.Until ?? DateTimeOffset.MinValue) <= now).OrderBy(s => s.Tracking?.NextAttempt ?? DateTimeOffset.MinValue).Take(20).ToArray();

    public Task<(SuratStoredShipment Row, SuratTrackingLease? Lease)> ClaimTracking(string orderId, string environment, string username, DateTimeOffset now) => store.Update(state =>
    {
        var index = state.Shipments.FindIndex(s => s.OrderId == orderId && s.Environment == environment);
        if (index < 0) throw ProblemException.NotFound("shipment_not_found", "Gönderi kaydı bulunamadı.");
        var row = state.Shipments[index];
        if (row.AccountFingerprint != Hash(username)) throw new ProblemException("shipment_account_changed", "Bu gönderi başka ortam hesabına ait.", 409);
        if (row.TrackingLease?.Until > now || row.Tracking?.NextAttempt > now) return (row, (SuratTrackingLease?)null);
        var lease = new SuratTrackingLease(Guid.NewGuid().ToString("N"), now.AddMinutes(2));
        state.Shipments[index] = row with { TrackingLease = lease };
        return (row, (SuratTrackingLease?)lease);
    });

    public Task<SuratStoredShipment> CompleteTracking(SuratStoredShipment claim, SuratTrackingLease lease, SuratTrackingResult result, DateTimeOffset now, int interval, int? terminalInterval = null) => store.Update(state =>
    {
        var index = state.Shipments.FindIndex(s => s.AttemptId == claim.AttemptId);
        if (index < 0) throw ProblemException.Unavailable("Kargo kaydı");
        var row = state.Shipments[index];
        if (row.TrackingLease?.Token != lease.Token) return row; // Expired/replaced lease cannot overwrite a newer query.
        var ok = result.State != SuratTrackingState.Unavailable;
        var failures = ok ? 0 : Math.Min(10, (row.Tracking?.Failures ?? 0) + 1);
        var previous = row.Tracking?.Documents ?? [];
        // A provider may omit an earlier parcel/return document in a later response. Keep its last known record.
        static string Key(SuratTrackingDocument d) => !string.IsNullOrWhiteSpace(d.Id) ? "id:" + d.Id :
            !string.IsNullOrWhiteSpace(d.TrackingNumber) ? "tracking:" + d.TrackingNumber : "raw:" + Hash(d.Source.GetRawText());
        var docs = result.State == SuratTrackingState.Available
            ? result.Documents.Concat(previous).GroupBy(Key).Select(g => g.First()).ToArray() : previous;
        // Keep every distinct provider document version, including omitted movements on
        // later responses for the same parcel. Never expose this raw archive in public DTOs.
        var history = (row.Tracking?.History ?? []).Concat(previous).Concat(result.Documents)
            .DistinctBy(d => JsonSerializer.Serialize(d)).ToArray();
        var effectiveInterval = docs.Length > 0 && docs.All(d => d.StatusCode is 6 or 12) ? terminalInterval ?? interval : interval;
        var delay = Math.Min(86400, effectiveInterval * Math.Pow(2, failures));
        var snapshot = new SuratTrackingSnapshot(result.State switch { SuratTrackingState.Available => "available", SuratTrackingState.AwaitingAcceptance => "awaiting_acceptance", _ => "unavailable" },
            now, result.State == SuratTrackingState.Available ? now : row.Tracking?.LastSuccess, now.AddSeconds(delay + Random.Shared.Next(0, 15)), failures, docs, history, result.FailureKind);
        row = row with { Tracking = snapshot, TrackingLease = null };
        state.Shipments[index] = row;
        return row;
    });

    public Task<SuratStoredShipment> Reconcile(string orderId, string environment, string actor, string evidence, DateTimeOffset now, string resolution = "registered") => store.Update(state =>
    {
        if (resolution is not ("registered" or "not_created")) throw new ProblemException("invalid_resolution", "Sağlayıcı teyit sonucu geçersiz.");
        if (string.IsNullOrWhiteSpace(evidence) || evidence.Length > 500 || evidence.Any(char.IsControl))
            throw new ProblemException("invalid_evidence", "Sağlayıcının kayıt kabulüne ilişkin kanıtı en fazla 500 karakterle yazın.");
        var index = state.Shipments.FindIndex(s => s.OrderId == orderId && s.Environment == environment);
        if (index < 0) throw ProblemException.NotFound("shipment_not_found", "Gönderi bulunamadı.");
        var row = state.Shipments[index];
        if (row.State == "submitting" && now - row.StartedAt < TimeSpan.FromMinutes(2))
            throw new ProblemException("shipment_in_progress", "Devam eden gönderimin sonucunu bekleyin.", 409);
        if (row.State == "registered") return row;
        row = row with { State = resolution == "registered" ? "registered" : "confirmed_not_created", CompletedAt = row.CompletedAt ?? now, ReconciliationEvidence = evidence.Trim(), ReconciledBy = actor };
        state.Shipments[index] = row;
        return row;
    });

    private static string Hash(string input) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input)));
}
