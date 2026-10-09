using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Orders;

/// <summary>
/// Order status rules shared by the customer and the panel. Demo orders take no payment, so cancelling or returning moves no money;
/// the transitions and the return window are interim until D03 (ödeme, iptal/iade) is decided.
/// <code>received → preparing → shipped → delivered → (returned)</code>; <c>cancelled</c> from received or preparing.
/// </summary>
public static class OrderLifecycle
{
    public const int MaxReasonLength = 120;
    public const int MaxDescriptionLength = 1000;
    public static readonly string[] Carriers = ["Aras Kargo", "Yurtiçi Kargo", "MNG Kargo", "PTT Kargo", "Sürat Kargo", "HepsiJet", "Kolay Gelsin", "Diğer"];
    public static readonly string[] CancelReasons = ["Fikrimi değiştirdim", "Yanlış ürün veya renk seçtim", "Teslimat süresi uzun", "Diğer"];
    public static readonly string[] ReturnReasons = ["Fikrimi değiştirdim", "Ürün hasarlı ulaştı", "Yanlış ürün gönderildi", "Ürün beklentimi karşılamadı", "Diğer"];

    public static OrderEvent[] HistoryOf(CustomerOrder order) =>
        order.History is { Length: > 0 } history ? history : [new OrderEvent(OrderStatuses.Received, order.CreatedAt, "customer", null)];

    private static CustomerOrder Move(CustomerOrder order, string status, string actor, string? note, DateTimeOffset now) =>
        order with { Status = status, History = [.. HistoryOf(order), new OrderEvent(status, now, actor, note)] };

    private static OrderRequest? Pending(CustomerOrder order, string type) =>
        order.Requests?.FirstOrDefault(request => request.Type == type && request.Status is OrderRequestStatuses.Requested or OrderRequestStatuses.Approved);

    private static string Reason(string? reason, string[] allowed) =>
        allowed.Contains(reason?.Trim()) ? reason!.Trim() : throw new ProblemException("invalid_reason", "Listeden bir neden seç.");

    private static string? Description(string? description)
    {
        var text = description?.Trim();
        if (string.IsNullOrEmpty(text)) return null;
        if (text.Length > MaxDescriptionLength || text.Any(c => char.IsControl(c) && c is not '\n' and not '\r'))
            throw new ProblemException("invalid_description", $"Açıklama en fazla {MaxDescriptionLength} karakter olabilir.");
        return text;
    }

    /// <summary>
    /// A received order is cancelled at once; one being prepared needs the panel's approval, so a request is opened instead.
    /// Shipped orders cannot be cancelled — the customer returns them after delivery.
    /// </summary>
    public static CustomerOrder Cancel(CustomerOrder order, CancelMyOrder request, DateTimeOffset now)
    {
        var reason = Reason(request.Reason, CancelReasons);
        var description = Description(request.Description);
        if (Pending(order, "cancel") is not null) throw new ProblemException("request_pending", "Bu sipariş için iptal talebin zaten değerlendiriliyor.", StatusCodes.Status409Conflict);
        var lines = order.Lines.Select(line => new OrderRequestLine(line.VariantId, line.Quantity)).ToArray();
        return order.Status switch
        {
            OrderStatuses.Received => Move(order, OrderStatuses.Cancelled, "customer", reason, now) with
            {
                Requests = [.. order.Requests ?? [], new OrderRequest(NewId(), "cancel", OrderRequestStatuses.Completed, reason, description, lines, now, now, "Sipariş hazırlanmadan iptal edildi.")],
            },
            OrderStatuses.Preparing => order with
            {
                Requests = [.. order.Requests ?? [], new OrderRequest(NewId(), "cancel", OrderRequestStatuses.Requested, reason, description, lines, now)],
            },
            _ => throw new ProblemException("not_cancellable", order.Status is OrderStatuses.Cancelled or OrderStatuses.Returned
                ? "Bu sipariş zaten kapandı."
                : "Kargoya verilen sipariş iptal edilemez. Teslim aldıktan sonra iade talebi oluşturabilirsin.", StatusCodes.Status409Conflict),
        };
    }

    /// <summary>How many of each variant can still be asked back: ordered minus what open or completed returns already cover.</summary>
    public static Dictionary<string, int> Returnable(CustomerOrder order)
    {
        // A colour can appear on several lines (plain and with designs); requests count units per colour.
        var left = order.Lines.GroupBy(line => line.VariantId).ToDictionary(group => group.Key, group => group.Sum(line => line.Quantity));
        foreach (var request in order.Requests ?? [])
            if (request.Type == "return" && request.Status is not OrderRequestStatuses.Rejected)
                foreach (var line in request.Lines)
                    if (left.ContainsKey(line.VariantId)) left[line.VariantId] -= line.Quantity;
        return left.Where(pair => pair.Value > 0).ToDictionary();
    }

    public static CustomerOrder Return(CustomerOrder order, ReturnMyOrder request, int windowDays, DateTimeOffset now)
    {
        var reason = Reason(request.Reason, ReturnReasons);
        var description = Description(request.Description);
        if (order.Status != OrderStatuses.Delivered)
            throw new ProblemException("not_returnable", "İade talebi yalnız teslim edilen siparişler için oluşturulabilir.", StatusCodes.Status409Conflict);
        var deliveredAt = order.Shipment?.DeliveredAt ?? HistoryOf(order).LastOrDefault(item => item.Status == OrderStatuses.Delivered)?.At ?? now;
        if (now > deliveredAt.AddDays(windowDays))
            throw new ProblemException("return_window_closed", $"İade süresi teslimattan sonra {windowDays} gündür; bu siparişte süre doldu.", StatusCodes.Status409Conflict);
        var left = Returnable(order);
        var lines = (request.Lines ?? []).Where(line => line.Quantity > 0).GroupBy(line => line.VariantId)
            .Select(group => new OrderRequestLine(group.Key, group.Sum(line => line.Quantity))).ToArray();
        if (lines.Length == 0) throw new ProblemException("invalid_lines", "İade edilecek en az bir ürün seç.");
        foreach (var line in lines)
            if (!left.TryGetValue(line.VariantId, out var available) || line.Quantity > available)
                throw new ProblemException("invalid_lines", "Seçtiğin adet, iade edilebilecek adedi aşıyor.");
        return order with { Requests = [.. order.Requests ?? [], new OrderRequest(NewId(), "return", OrderRequestStatuses.Requested, reason, description, lines, now)] };
    }

    /// <summary>Panel status change: preparing, delivered or cancelled. Shipping goes through <see cref="Ship"/>.</summary>
    public static CustomerOrder SetStatus(CustomerOrder order, string status, string? note, DateTimeOffset now)
    {
        var allowed = (order.Status, status) switch
        {
            (OrderStatuses.Received, OrderStatuses.Preparing) => true,
            (OrderStatuses.Received or OrderStatuses.Preparing, OrderStatuses.Cancelled) => true,
            (OrderStatuses.Shipped, OrderStatuses.Delivered) => true,
            _ => false,
        };
        if (!allowed) throw new ProblemException("invalid_transition", $"Sipariş '{order.Status}' durumundan '{status}' durumuna geçemez.", StatusCodes.Status409Conflict);
        var next = Move(order, status, "panel", Note(note), now);
        if (status == OrderStatuses.Delivered && next.Shipment is { } shipment) next = next with { Shipment = shipment with { DeliveredAt = now } };
        // Cancelling closes any open cancellation request as approved.
        if (status == OrderStatuses.Cancelled) next = Close(next, "cancel", OrderRequestStatuses.Approved, "Sipariş panelden iptal edildi.", now);
        return next;
    }

    public static CustomerOrder Ship(CustomerOrder order, string? carrier, string? trackingNumber, string? trackingUrl, DateTimeOffset now)
    {
        if (order.Status is not (OrderStatuses.Received or OrderStatuses.Preparing))
            throw new ProblemException("invalid_transition", "Yalnız alınan veya hazırlanan sipariş kargoya verilebilir.", StatusCodes.Status409Conflict);
        if (Pending(order, "cancel") is not null)
            throw new ProblemException("request_pending", "Önce bekleyen iptal talebini sonuçlandır.", StatusCodes.Status409Conflict);
        var name = Carriers.Contains(carrier?.Trim()) ? carrier!.Trim() : throw new ProblemException("invalid_carrier", "Kargo firmasını seç.");
        var number = trackingNumber?.Trim() ?? "";
        if (number.Length is < 4 or > 40 || !number.All(c => char.IsAsciiLetterOrDigit(c) || c is '-'))
            throw new ProblemException("invalid_tracking_number", "Takip numarası 4–40 harf, rakam veya tire olmalı.");
        string? url = null;
        if (!string.IsNullOrWhiteSpace(trackingUrl))
        {
            if (!Uri.TryCreate(trackingUrl.Trim(), UriKind.Absolute, out var parsed) || parsed.Scheme != Uri.UriSchemeHttps || trackingUrl.Length > 500)
                throw new ProblemException("invalid_tracking_url", "Takip bağlantısı https:// ile başlayan geçerli bir adres olmalı.");
            url = parsed.ToString();
        }
        return Move(order, OrderStatuses.Shipped, "panel", $"{name} · {number}", now) with { Shipment = new OrderShipment(name, number, url, now, null) };
    }

    /// <summary>
    /// approve / reject / complete a request. An approved cancellation cancels the order; a completed return that brings
    /// every line back marks the order returned.
    /// </summary>
    public static CustomerOrder Decide(CustomerOrder order, string requestId, string decision, string? resolution, DateTimeOffset now)
    {
        var request = order.Requests?.FirstOrDefault(item => item.Id == requestId) ?? throw ProblemException.NotFound("request_not_found", "Talep bulunamadı.");
        var note = Note(resolution);
        var status = (request.Type, request.Status, decision) switch
        {
            ("cancel", OrderRequestStatuses.Requested, "approve") => OrderRequestStatuses.Completed,
            (_, OrderRequestStatuses.Requested, "reject") => OrderRequestStatuses.Rejected,
            ("return", OrderRequestStatuses.Requested, "approve") => OrderRequestStatuses.Approved,
            ("return", OrderRequestStatuses.Approved, "complete") => OrderRequestStatuses.Completed,
            _ => throw new ProblemException("invalid_decision", "Bu talep için bu işlem yapılamaz.", StatusCodes.Status409Conflict),
        };
        var next = order with { Requests = [.. order.Requests!.Select(item => item.Id == requestId ? item with { Status = status, DecidedAt = now, Resolution = note } : item)] };
        if (request.Type == "cancel" && status == OrderRequestStatuses.Completed)
        {
            if (order.Status is not (OrderStatuses.Received or OrderStatuses.Preparing))
                throw new ProblemException("invalid_transition", "Kargoya verilen sipariş iptal edilemez.", StatusCodes.Status409Conflict);
            next = Move(next, OrderStatuses.Cancelled, "panel", note ?? request.Reason, now);
        }
        if (request.Type == "return" && status == OrderRequestStatuses.Completed)
        {
            var returned = (next.Requests ?? []).Where(item => item.Type == "return" && item.Status == OrderRequestStatuses.Completed)
                .SelectMany(item => item.Lines).GroupBy(line => line.VariantId).ToDictionary(group => group.Key, group => group.Sum(line => line.Quantity));
            if (order.Lines.GroupBy(line => line.VariantId).All(group => returned.GetValueOrDefault(group.Key) >= group.Sum(line => line.Quantity)))
                next = Move(next, OrderStatuses.Returned, "panel", note, now);
        }
        return next;
    }

    private static CustomerOrder Close(CustomerOrder order, string type, string status, string resolution, DateTimeOffset now) => order with
    {
        Requests = order.Requests?.Select(item => item.Type == type && item.Status == OrderRequestStatuses.Requested ? item with { Status = status, DecidedAt = now, Resolution = resolution } : item).ToArray(),
    };

    private static string? Note(string? note)
    {
        var text = note?.Trim();
        if (string.IsNullOrEmpty(text)) return null;
        return text.Length <= 500 && !text.Any(char.IsControl) ? text : throw new ProblemException("invalid_note", "Not en fazla 500 karakter olabilir.");
    }

    private static string NewId() => Guid.NewGuid().ToString("N");

    public static string StatusText(string status) => status switch
    {
        OrderStatuses.Received => "Sipariş alındı",
        OrderStatuses.Preparing => "Hazırlanıyor",
        OrderStatuses.Shipped => "Kargoya verildi",
        OrderStatuses.Delivered => "Teslim edildi",
        OrderStatuses.Cancelled => "İptal edildi",
        OrderStatuses.Returned => "İade edildi",
        _ => status,
    };
}
