using System.Net.Http.Json;
using System.Text.Json;

namespace Xinobi.Api.Shipping;

public sealed class SuratKargoOptions
{
    public bool Enabled { get; set; }
    public bool AllowProduction { get; set; }
    public bool PollingEnabled { get; set; }
    public int PollIntervalSeconds { get; set; } = 300;
    public int TerminalPollIntervalSeconds { get; set; } = 86400;
    public string Mode { get; set; } = "Sandbox";
    public SuratAccount Sandbox { get; set; } = new();
    public SuratAccount Production { get; set; } = new();

    internal (Uri Host, SuratAccount Account) Resolve()
    {
        if (!Enabled) throw new SuratConfigurationException();
        var production = Mode == "Production";
        if ((!production && Mode != "Sandbox") || (production && !AllowProduction)) throw new SuratConfigurationException();
        var account = production ? Production : Sandbox;
        if (string.IsNullOrWhiteSpace(account.Username) || string.IsNullOrWhiteSpace(account.Password)) throw new SuratConfigurationException();
        // Provider hosts are fixed: credentials cannot be redirected to a configured arbitrary URL.
        return (new Uri(production ? "https://api01.suratkargo.com.tr/" : "https://api02.suratkargo.com.tr/"), account);
    }
}

public sealed class SuratAccount
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public override string ToString() => "SuratAccount [REDACTED]";
}
public sealed class SuratConfigurationException() : Exception("Sürat Kargo bağlantısı etkin ve doğrulanmış bir ortam hesabı gerektiriyor.");

// First slice: own-store, standard road/address, non-COD, identical parcels only.
// A caller must persist a stable reference/attempt BEFORE invoking CreateAsync.
public sealed record SuratShipment(
    string KisiKurum, string AliciAdresi, string Il, string Ilce, string TelefonCep,
    string OzelKargoTakipNo, int Adet, decimal BirimDesi, decimal BirimKg, int OdemeTipi)
{
    public int KargoTuru => 3;
    public int TasimaSekli => 1;
    public int TeslimSekli => 1;
    public int GonderiSekli => 0;
    public int Iademi => 0;
    public int Pazaryerimi => 0;
    public string EntegrasyonFirmasi => "";

    public void Validate()
    {
        string[] required = [KisiKurum, AliciAdresi, Il, Ilce, TelefonCep, OzelKargoTakipNo];
        if (required.Any(string.IsNullOrWhiteSpace) || required.Any(s => s.Any(char.IsControl)) ||
            OzelKargoTakipNo.Length > 50 || Adet <= 0 || BirimDesi <= 0 || BirimKg <= 0 || OdemeTipi is not (1 or 2))
            throw new ArgumentException("Alıcı, sabit gönderi referansı, paket ölçüleri ve kargo ödeme sorumluluğu geçerli olmalı.");
        var phone = TelefonCep;
        if (!phone.All(char.IsAsciiDigit) || !((phone.Length == 10 && phone.StartsWith('5')) ||
            (phone.Length == 11 && phone.StartsWith("05")) || (phone.Length == 12 && phone.StartsWith("905"))))
            throw new ArgumentException("Telefon 5..., 05... veya 905... biçiminde olmalı.");
    }
}

public enum SuratCreateState { Registered, ReconciliationRequired }
public sealed record SuratCreateResult(SuratCreateState State);
public enum SuratTrackingState { Available, AwaitingAcceptance, Unavailable }
public sealed record SuratTrackingResult(SuratTrackingState State, SuratTrackingDocument[] Documents, string? FailureKind = null);
public sealed record SuratTrackingDocument(string? Id, int? StatusCode, string? StatusText,
    string? TrackingNumber, string? LastMovementRaw, string? DeliveredDateRaw, string NormalizedState, JsonElement Source);

/// <summary>Server-only transport. Never changes order status or retries a write.</summary>
public interface ISuratKargoClient
{
    Task<SuratCreateResult> CreateAsync(SuratShipment shipment, CancellationToken cancellationToken = default);
    Task<SuratTrackingResult> TrackAsync(string reference, CancellationToken cancellationToken = default);
}

public sealed class SuratKargoClient(HttpClient http, Microsoft.Extensions.Options.IOptions<SuratKargoOptions> options) : ISuratKargoClient
{
    private static readonly JsonSerializerOptions Wire = new() { PropertyNamingPolicy = null };

    public async Task<SuratCreateResult> CreateAsync(SuratShipment shipment, CancellationToken cancellationToken = default)
    {
        var (host, account) = options.Value.Resolve();
        shipment.Validate();
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, new Uri(host, "api/GonderiyiKargoyaGonder"))
            {
                Content = JsonContent.Create(new { KullaniciAdi = account.Username, Sifre = account.Password, Gonderi = shipment }, options: Wire)
            };
            using var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode) return new(SuratCreateState.ReconciliationRequired);
            var body = (await response.Content.ReadAsStringAsync(cancellationToken)).Trim();
            // Some REST hosts JSON-encode their string return; reject every other structure.
            if (body.StartsWith('"'))
            {
                try { body = JsonSerializer.Deserialize<string>(body)?.Trim() ?? ""; }
                catch (JsonException) { return new(SuratCreateState.ReconciliationRequired); }
            }
            return new(body is "Tamam" or "Kayıt Edildi" ? SuratCreateState.Registered : SuratCreateState.ReconciliationRequired);
        }
        catch (Exception e) when (e is HttpRequestException or OperationCanceledException or IOException)
        {
            // The carrier may have committed before disconnect/cancellation. No exception URI/body escapes.
            return new(SuratCreateState.ReconciliationRequired);
        }
    }

    public async Task<SuratTrackingResult> TrackAsync(string reference, CancellationToken cancellationToken = default)
    {
        var (host, account) = options.Value.Resolve();
        if (string.IsNullOrWhiteSpace(reference) || reference.Length > 50 || reference.Any(char.IsControl)) throw new ArgumentException("Geçerli gönderi referansı gerekli.");
        try
        {
            var path = "api/KargoTakipHareketDetayi?CariKodu=" + Uri.EscapeDataString(account.Username) +
                "&Sifre=" + Uri.EscapeDataString(account.Password) + "&WebSiparisKodu=" + Uri.EscapeDataString(reference);
            using var request = new HttpRequestMessage(HttpMethod.Post, new Uri(host, path));
            using var response = await http.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode) return new(SuratTrackingState.Unavailable, [], response.StatusCode is System.Net.HttpStatusCode.Unauthorized or System.Net.HttpStatusCode.Forbidden ? "authentication_or_access" : "provider_http");
            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var root = json.RootElement;
            if (root.ValueKind != JsonValueKind.Object || !root.TryGetProperty("IsError", out var error) ||
                !root.TryGetProperty("Gonderiler", out var docs) || docs.ValueKind != JsonValueKind.Array)
                return new(SuratTrackingState.Unavailable, [], "invalid_response");
            // Observed read-only sandbox contract: an unaccepted/unknown reference is an IsError=true response.
            // Exact message AND empty documents only; never classify auth/general errors or partial data as empty.
            if (IsReferenceNotFound(root)) return new(SuratTrackingState.AwaitingAcceptance, []);
            if (error.ValueKind != JsonValueKind.False) return new(SuratTrackingState.Unavailable, [], "provider_error");
            if (docs.EnumerateArray().Any(d => d.ValueKind != JsonValueKind.Object ||
                (Value(d, "KargoObjId") is null && Value(d, "KargoTakipNo") is null && Value(d, "KargonunDurumuSayi") is null)))
                return new(SuratTrackingState.Unavailable, [], "invalid_response");
            var documents = docs.EnumerateArray().Select(d =>
            {
                int? code = int.TryParse(Value(d, "KargonunDurumuSayi"), out var n) ? n : null;
                return new SuratTrackingDocument(Value(d, "KargoObjId"), code, Value(d, "KargonunDurumu"),
                    Value(d, "KargoTakipNo"), Value(d, "SonHareketTarihi"), Value(d, "TeslimTarihi"), Normalize(code), d.Clone());
            }).ToArray();
            return new(documents.Length == 0 ? SuratTrackingState.AwaitingAcceptance : SuratTrackingState.Available, documents);
        }
        catch (Exception e) when (e is HttpRequestException or OperationCanceledException or IOException or JsonException or InvalidOperationException)
        { return new(SuratTrackingState.Unavailable, [], e switch
            { OperationCanceledException => "timeout_or_cancelled", HttpRequestException or IOException => "connection_failure", _ => "invalid_response" }); }
    }

    public static bool IsReferenceNotFound(JsonElement root) => root.ValueKind == JsonValueKind.Object &&
        root.TryGetProperty("IsError", out var error) && error.ValueKind == JsonValueKind.True &&
        root.TryGetProperty("Gonderiler", out var docs) && docs.ValueKind == JsonValueKind.Array && docs.GetArrayLength() == 0 &&
        root.TryGetProperty("errorMessage", out var message) && message.ValueKind == JsonValueKind.String &&
        message.GetString()?.Trim() == "Sipariş bulunamadı.";

    private static string? Value(JsonElement d, string key) => d.TryGetProperty(key, out var v) ? v.ValueKind switch
    { JsonValueKind.String => v.GetString(), JsonValueKind.Number => v.GetRawText(), _ => null } : null;

    public static string Normalize(int? code) => code switch
    {
        1 => "awaiting_acceptance", 2 or 3 => "in_transit", 4 => "delivery_branch", 5 => "out_for_delivery",
        6 => "delivered", 7 => "needs_review", 8 => "redirecting", 9 or 10 or 11 or 13 or 14 or 15 or 16 => "return_in_progress",
        12 => "return_delivered", _ => "unknown"
    };
}
