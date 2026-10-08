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

public record PlaceOrderItem(string ProductId, string VariantId, int Quantity);
/// <summary>Demo order: no payment is taken and stock is not reserved. <paramref name="ClientRequestId"/> makes retries return the same order.</summary>
public record PlaceOrder(string AddressId, PlaceOrderItem[] Items, string ClientRequestId);
public record CustomerOrderLine(string ProductId, string VariantId, string Name, string Color, string? ImageUrl, Money UnitPrice, int Quantity, Money LineTotal);
public record CustomerOrder(string Id, string Number, DateTimeOffset CreatedAt, string Status, CustomerAddress Address, CustomerOrderLine[] Lines, Money Total);

public static class OrderStatuses
{
    /// <summary>Demo orders stop here: there is no payment, fulfilment or shipping yet.</summary>
    public const string Received = "received";
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
