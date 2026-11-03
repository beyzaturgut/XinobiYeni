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
        var settings = options.Value;
        try { settings.Resolve(); }
        catch (SuratConfigurationException) { throw ProblemException.Unavailable("Sürat Kargo bağlantısı"); }
        // Orders currently have no verified payment/fulfilment eligibility. Never turn a demo into a real shipment.
        if (settings.Mode != "Sandbox") throw new ProblemException("shipment_eligibility_unconfirmed", "Canlı gönderim için doğrulanmış ödeme ve operasyon uygunluğu henüz tanımlanmadı.", 409);
        if (order.Status is not (OrderStatuses.Received or OrderStatuses.Preparing) || order.Shipment is not null ||
            order.Requests?.Any(r => r.Type == "cancel" && r.Status is OrderRequestStatuses.Requested or OrderRequestStatuses.Approved) == true)
            throw new ProblemException("order_not_shippable", "Siparişin mevcut durumu gönderi oluşturmaya uygun değil.", 409);
        var a = order.Address;
        var draft = new SuratShipment(a.FullName, a.Line, a.City, a.District, a.Phone.StartsWith("+90", StringComparison.Ordinal) ? a.Phone[1..] : a.Phone, "DRAFT", input.ParcelCount, input.ParcelDesi, input.ParcelKg, input.PaymentType);
        try { draft.Validate(); }
        catch (ArgumentException) { throw new ProblemException("invalid_shipment", "Alıcı adresi, telefon, paket ölçüleri ve kargo ödeme tipi kontrol edilmeli."); }
        token.ThrowIfCancellationRequested();
        var claim = await store.Claim(order.Id, settings.Mode, settings.Sandbox.Username, actorId, draft, clock.GetUtcNow());
        if (!claim.IsNew) return SuratShipmentView.From(claim.Shipment);
        // Persisted before network I/O. No automatic retries, including after crash between send and complete.
        var result = await client.CreateAsync(claim.Shipment.Request, token);
        var saved = await store.Complete(claim.Shipment, result.State, clock.GetUtcNow());
        return SuratShipmentView.From(saved);
    }
}
