using Microsoft.Extensions.Options;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Shipping;

public sealed record CreateSuratShipment(int ParcelCount, decimal ParcelDesi, decimal ParcelKg, int PaymentType);
// Never expose the saved address, raw request, credentials or provider payload in this operation DTO.
public sealed record SuratShipmentView(string Reference, string State, DateTimeOffset StartedAt, DateTimeOffset? CompletedAt, string Message)
{
    public static SuratShipmentView From(SuratStoredShipment row) => new(row.Reference, row.State, row.StartedAt, row.CompletedAt, row.State switch
    {
        "registered" => "Gönderi kaydı alındı; şube kabulü bekleniyor. Sipariş henüz kargolandı sayılmaz.",
        "confirmed_not_created" => "Sağlayıcı kaydın oluşmadığını kanıtla teyit etti. Aynı referansla kontrollü yeni deneme yapılabilir.",
        "submitting" => "Gönderim başlatıldı; sonuç kesinleşmeden tekrar gönderilmez. Kesinti yaşandıysa uzlaştırma gerekir.",
        _ => "Sonuç kesinleşmedi; ikinci gönderim engellendi. Sağlayıcıyla uzlaştırma gerekli."
    });
}

public sealed class SuratShipmentWorkflow(SuratShipmentStore store, ISuratKargoClient client, IOptions<SuratKargoOptions> options, TimeProvider clock)
{
    public async Task<SuratShipmentView> Create(CustomerOrder order, CreateSuratShipment input, string actorId, CancellationToken token)
    {
        Validate(order, input);
        var settings = options.Value;
        var draft = Draft(order, input);
        token.ThrowIfCancellationRequested();
        var claim = await store.Claim(order.Id, settings.Mode, settings.Sandbox.Username, actorId, draft, clock.GetUtcNow());
        if (!claim.IsNew) return SuratShipmentView.From(claim.Shipment);
        // Persisted before network I/O. No automatic retries, including after crash between send and complete.
        var result = await client.CreateAsync(claim.Shipment.Request, token);
        var saved = await store.Complete(claim.Shipment, result.State, clock.GetUtcNow(), result.Diagnostic);
        return SuratShipmentView.From(saved);
    }
    // Called inside ChangeOrder's account transaction before any provider write. A durable
    // reservation survives process death and cannot silently expire after an uncertain write.
    public const string Reservation = "surat_submission_reserved";
    public static CustomerOrder Reserve(CustomerOrder order, CreateSuratShipment input, DateTimeOffset now)
    {
        ValidateOrder(order, input);
        return order.History?.Any(e => e.Actor == Reservation) == true ? order : order with
        { History = [.. Xinobi.Api.Orders.OrderLifecycle.HistoryOf(order), new OrderEvent(order.Status, now, Reservation, "Sürat test gönderimi; iptal öncesi sağlayıcı uzlaştırması gerekir.")] };
    }
    public void Validate(CustomerOrder order, CreateSuratShipment input)
    {
        try { options.Value.Resolve(); }
        catch (SuratConfigurationException) { throw ProblemException.Unavailable("Sürat Kargo bağlantısı"); }
        if (options.Value.Mode != "Sandbox") throw new ProblemException("shipment_eligibility_unconfirmed", "Canlı gönderim için doğrulanmış ödeme ve operasyon uygunluğu henüz tanımlanmadı.", 409);
        ValidateOrder(order, input);
    }
    private static void ValidateOrder(CustomerOrder order, CreateSuratShipment input)
    {
        if (order.Status is not (OrderStatuses.Received or OrderStatuses.Preparing) || order.Shipment is not null ||
            order.Requests?.Any(r => r.Type == "cancel" && r.Status is OrderRequestStatuses.Requested or OrderRequestStatuses.Approved) == true)
            throw new ProblemException("order_not_shippable", "Siparişin mevcut durumu gönderi oluşturmaya uygun değil.", 409);
        var draft = Draft(order, input);
        try { draft.Validate(); }
        catch (ArgumentException) { throw new ProblemException("invalid_shipment", "Alıcı adresi, telefon, paket ölçüleri ve kargo ödeme tipi kontrol edilmeli."); }
    }
    private static SuratShipment Draft(CustomerOrder order, CreateSuratShipment input)
    {
        var a = order.Address;
        return new(a.FullName, a.Line, a.City, a.District, a.Phone.StartsWith("+90", StringComparison.Ordinal) ? a.Phone[1..] : a.Phone, "DRAFT", input.ParcelCount, input.ParcelDesi, input.ParcelKg, input.PaymentType);
    }

}
