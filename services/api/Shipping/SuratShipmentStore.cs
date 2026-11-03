using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Shipping;

public sealed record SuratStoredShipment(string OrderId, string Environment, string AccountFingerprint,
    string Reference, string AttemptId, string RequestFingerprint, string State, DateTimeOffset StartedAt,
    DateTimeOffset? CompletedAt, string ActorId, SuratShipment Request);
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
                if (existing.RequestFingerprint != fingerprint || existing.AccountFingerprint != account)
                    throw new ProblemException("shipment_conflict", "Bu sipariş için farklı bilgilerle bir gönderi denemesi var; önce kayıt uzlaştırılmalı.", 409);
                return new SuratShipmentClaim(existing, false);
            }
            var reference = "XNB-" + Guid.NewGuid().ToString("N");
            var request = draft with { OzelKargoTakipNo = reference };
            request.Validate();
            var row = new SuratStoredShipment(orderId, environment, account, reference, Guid.NewGuid().ToString("N"), fingerprint,
                "submitting", now, null, actorId, request);
            state.Shipments.Add(row);
            return new SuratShipmentClaim(row, true);
        });
    }

    public Task<SuratStoredShipment> Complete(SuratStoredShipment claim, SuratCreateState result, DateTimeOffset now) => store.Update(state =>
    {
        var index = state.Shipments.FindIndex(s => s.AttemptId == claim.AttemptId && s.OrderId == claim.OrderId && s.Environment == claim.Environment);
        if (index < 0) throw ProblemException.Unavailable("Kargo denemesi");
        var row = state.Shipments[index];
        if (row.State != "submitting") return row;
        row = row with { State = result == SuratCreateState.Registered ? "registered" : "reconciliation_required", CompletedAt = now };
        state.Shipments[index] = row;
        return row;
    });

    private static string Hash(string input) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input)));
}
