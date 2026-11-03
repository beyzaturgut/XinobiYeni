using System.Text.RegularExpressions;
using Xinobi.Api.Catalog;

namespace Xinobi.Api.Identity;

/// <summary><paramref name="Phone"/>: null leaves it unchanged, an empty string removes it.</summary>
public record UpdateMyAccount(string Name, string? Phone = null);
public record ChangeMyPassword(string CurrentPassword, string NewPassword);
public record StartEmailChange(string NewEmail);
public record ConfirmEmailChange(string NewEmail, string VerificationId, string VerificationCode, string CurrentPassword);
public record DeleteMyAccount(string CurrentPassword);

public record CustomerAddress(string Id, string Title, string FullName, string Phone, string City, string District, string Line, string? PostalCode, bool IsDefault);
public record SaveCustomerAddress(string Title, string FullName, string Phone, string City, string District, string Line, string? PostalCode, bool IsDefault);

/// <summary><paramref name="DesignId"/> is one of the customer's saved designs, for a personalised product (XINOBI U or own image).</summary>
public record PlaceOrderItem(string ProductId, string VariantId, int Quantity, string? DesignId = null, string? ConfigurationId = null, int? ConfigurationRevision = null);
/// <summary>Demo order: no payment is taken and stock is not reserved. <paramref name="ClientRequestId"/> makes retries return the same order.</summary>
public record PlaceOrder(string AddressId, PlaceOrderItem[] Items, string ClientRequestId);
public record CustomerOrderLine(string ProductId, string VariantId, string Name, string Color, string? ImageUrl, Money UnitPrice, int Quantity, Money LineTotal,
    OrderPersonalization? Personalization = null);
/// <summary>
/// The design printed on a line, copied when the order was placed: deleting or renaming the saved design later does not change
/// the order. <paramref name="ImageUrl"/> is filled per request (customer or panel address); the image is a representative preview.
/// </summary>
public record OrderPersonalization(string DesignId, string Kind, string Name, string Mime, string? ImageUrl = null, int? SchemaVersion = null, Designs.DesignPlacement? Placement = null, string? ConfigurationId = null, int? ConfigurationRevision = null, string? SourceSha256 = null, string? Sku = null, Print.PrintSetupSnapshot? PrintSetup = null, OrderDesignFiles? Files = null);
/// <summary>A file copied into the order when it was placed; its checksum is verified whenever the order's copy is read.</summary>
public record OrderDesignFile(string Sha256, string Mime, long Bytes);
/// <summary>
/// The order line's own copies: the raw <paramref name="Pattern"/>, the product photo the editor masked (<paramref name="ProductSource"/>)
/// and the composed preview of the ordered placement revision (<paramref name="Composition"/>). Null means the file did not exist when
/// the order was placed (older orders have no <c>Files</c> at all); nothing is filled in from the current catalogue or design later.
/// </summary>
public record OrderDesignFiles(OrderDesignFile Pattern, OrderDesignFile? ProductSource = null, OrderDesignFile? Composition = null);
/// <summary>
/// <paramref name="Shipment"/>, <paramref name="History"/> and <paramref name="Requests"/> were added with the order lifecycle;
/// orders stored before have none.
/// </summary>
public record CustomerOrder(string Id, string Number, DateTimeOffset CreatedAt, string Status, CustomerAddress Address, CustomerOrderLine[] Lines, Money Total,
    OrderShipment? Shipment = null, OrderEvent[]? History = null, OrderRequest[]? Requests = null);

/// <summary>The carrier and tracking number the panel entered; <paramref name="TrackingUrl"/> only when the panel pasted the carrier's link.</summary>
public record OrderShipment(string Carrier, string TrackingNumber, string? TrackingUrl, DateTimeOffset ShippedAt, DateTimeOffset? DeliveredAt);
/// <summary>One status change. <paramref name="Actor"/> is <c>customer</c>, <c>panel</c> or <c>system</c>.</summary>
public record OrderEvent(string Status, DateTimeOffset At, string Actor, string? Note);
public record OrderRequestLine(string VariantId, int Quantity);
/// <summary>A cancellation (<c>cancel</c>) or return (<c>return</c>) the customer asked for and the panel decides.</summary>
public record OrderRequest(string Id, string Type, string Status, string Reason, string? Description, OrderRequestLine[] Lines, DateTimeOffset CreatedAt,
    DateTimeOffset? DecidedAt = null, string? Resolution = null);

/// <summary>An order with its customer, for the panel.</summary>
public record StaffOrder(CustomerOrder Order, string AccountId, string CustomerName, string CustomerEmail, string? CustomerPhone);

public record CancelMyOrder(string Reason, string? Description);
public record ReturnMyOrder(string Reason, string? Description, OrderRequestLine[] Lines);

public static class OrderStatuses
{
    public const string Received = "received";
    public const string Preparing = "preparing";
    public const string Shipped = "shipped";
    public const string Delivered = "delivered";
    public const string Cancelled = "cancelled";
    /// <summary>Every line came back through completed returns.</summary>
    public const string Returned = "returned";
}

public static class OrderRequestStatuses
{
    public const string Requested = "requested";
    public const string Approved = "approved";
    public const string Rejected = "rejected";
    public const string Completed = "completed";
}

public static partial class CustomerRules
{
    public const int MaxAddresses = 10;
    public const int MaxOrderItems = 50;

    /// <summary>Turkish numbers in any common spelling (0532 123 45 67, +90 532…, 532…) become +90XXXXXXXXXX.</summary>
    public static string ValidPhone(string? phone)
    {
        var digits = new string((phone ?? "").Where(char.IsDigit).ToArray());
        if (digits.StartsWith("90") && digits.Length == 12) digits = digits[2..];
        else if (digits.StartsWith('0') && digits.Length == 11) digits = digits[1..];
        if (!NationalNumber().IsMatch(digits)) throw new AccountException("invalid_phone", "Geçerli bir telefon numarası gir (ör. 0532 123 45 67).");
        return "+90" + digits;
    }

    public static string Text(string? value, string field, int min, int max, string message)
    {
        var text = (value ?? "").Trim();
        if (text.Length < min || text.Length > max || text.Any(char.IsControl)) throw new AccountException("invalid_" + field, message);
        return text;
    }

    public static SaveCustomerAddress ValidAddress(SaveCustomerAddress request)
    {
        var postal = string.IsNullOrWhiteSpace(request.PostalCode) ? null : request.PostalCode.Trim();
        if (postal is not null && !PostalCode().IsMatch(postal)) throw new AccountException("invalid_postal_code", "Posta kodu 5 haneli olmalı.");
        return new SaveCustomerAddress(
            Text(request.Title, "title", 1, 40, "Adres başlığı gir (ör. Ev, İş)."),
            Text(request.FullName, "full_name", 1, 80, "Teslim alacak kişinin adını gir."),
            ValidPhone(request.Phone),
            Text(request.City, "city", 1, 40, "İl gir."),
            Text(request.District, "district", 1, 60, "İlçe gir."),
            Text(request.Line, "line", 5, 250, "Açık adresi gir (en az 5 karakter)."),
            postal,
            request.IsDefault);
    }

    [GeneratedRegex("^[2-5][0-9]{9}$")]
    private static partial Regex NationalNumber();

    [GeneratedRegex("^[0-9]{5}$")]
    private static partial Regex PostalCode();
}
