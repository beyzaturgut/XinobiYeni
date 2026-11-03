using System.Net;
using System.Net.Sockets;
using System.Security.Authentication;
using System.Text.Json;

namespace Xinobi.Api.Shipping;

public sealed record SuratAccessProbe(string Target, string Endpoint, int? HttpStatus, string Result,
    bool CloudflareHeader = false, bool AccessDeniedMarker = false, bool? ProviderIsError = null, int? ShipmentCount = null, string? EgressIp = null);
public sealed record SuratPreflightReport(DateTimeOffset CheckedAtUtc, string Scope, bool CreatedShipment,
    bool? SandboxAccountConfigured, SuratAccessProbe[] Probes);

/// <summary>Standalone read-only command: never builds/starts the API, its workers, SQL or IIS.</summary>
public static class SuratPreflightCommand
{
    public const string Command = "--surat-preflight";
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web) { WriteIndented = true };

    public static async Task<int> RunAsync(string[] args, TextWriter output)
    {
        if (args.Skip(1).Any(a => a is not ("--with-test-account" or "--include-egress-ip")))
        {
            await output.WriteLineAsync("{\"error\":\"invalid_preflight_option\"}");
            return 2;
        }
        try
        {
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Production";
            // Restrict the filename component; never interpret arbitrary input as a settings path.
            if (env.Any(c => !char.IsAsciiLetterOrDigit(c) && c != '_')) throw new InvalidOperationException();
            var config = new ConfigurationBuilder().SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile($"appsettings.{env}.json", optional: true);
            if (env == "Development") config.AddJsonFile("appsettings.Local.json", optional: true);
            if ((Environment.GetEnvironmentVariable("XINOBI_SERVER_SETTINGS") ?? (OperatingSystem.IsWindows() ? @"C:\XinobiData\config\appsettings.Server.json" : null)) is { } path)
                config.AddJsonFile(path, optional: true);
            var settings = config.AddEnvironmentVariables().Build();
            using var settingsLifetime = settings as IDisposable;
            using var handler = new SocketsHttpHandler { AllowAutoRedirect = false };
            using var http = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(20) };
            var report = await Check(http, settings, args.Contains("--with-test-account"), args.Contains("--include-egress-ip"));
            await output.WriteLineAsync(JsonSerializer.Serialize(report, Json));
            var relevant = args.Contains("--with-test-account")
                ? report.Probes.Where(p => p.Target is "sandbox_read_only_tracking" or "egress_ip") : report.Probes;
            return relevant.Any(p => p.Result is not ("http_reachable" or "tracking_response_received" or "tracking_reference_not_found" or "egress_identified")) ? 1 : 0;
        }
        catch
        {
            // Configuration errors can include secrets; do not print their exception or source content.
            await output.WriteLineAsync("{\"error\":\"preflight_configuration_unavailable\"}");
            return 2;
        }
    }

    public static async Task<SuratPreflightReport> Check(HttpClient http, IConfiguration configuration, bool withTestAccount, bool includeEgressIp, CancellationToken token = default)
    {
        // No credentials on either root request, including the Production edge probe.
        var roots = await Task.WhenAll(
            Probe(http, "sandbox_edge", new Uri("https://api02.suratkargo.com.tr/"), false, false, token),
            Probe(http, "production_edge", new Uri("https://api01.suratkargo.com.tr/"), false, false, token));
        var probes = roots.ToList(); bool? configured = null;
        if (withTestAccount)
        {
            var username = configuration["Shipping:Surat:Sandbox:Username"];
            var password = configuration["Shipping:Surat:Sandbox:Password"];
            configured = !string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password);
            var endpoint = "https://api02.suratkargo.com.tr/api/KargoTakipHareketDetayi";
            if (configured == true)
            {
                var uri = new Uri(endpoint + "?CariKodu=" + Uri.EscapeDataString(username!) + "&Sifre=" + Uri.EscapeDataString(password!) +
                    "&WebSiparisKodu=" + Uri.EscapeDataString("XNB-ACCESS-CHECK-" + Guid.NewGuid().ToString("N")));
                probes.Add(await Probe(http, "sandbox_read_only_tracking", uri, true, false, token));
            }
            else probes.Add(new("sandbox_read_only_tracking", endpoint, null, "not_configured"));
        }
        if (includeEgressIp) probes.Add(await Probe(http, "egress_ip", new Uri("https://api.ipify.org?format=json"), false, true, token));
        return new(DateTimeOffset.UtcNow, "this_process_host_read_only", false, configured, probes.ToArray());
    }

    private static async Task<SuratAccessProbe> Probe(HttpClient http, string target, Uri uri, bool tracking, bool egress, CancellationToken token)
    {
        // Endpoint never contains query parameters, even on an HTTP/network failure.
        var endpoint = uri.GetLeftPart(UriPartial.Path);
        try
        {
            using var deadline = CancellationTokenSource.CreateLinkedTokenSource(token);
            deadline.CancelAfter(TimeSpan.FromSeconds(20));
            using var request = new HttpRequestMessage(tracking ? HttpMethod.Post : HttpMethod.Get, uri);
            request.Headers.Accept.ParseAdd("application/json");
            using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, deadline.Token);
            var status = (int)response.StatusCode;
            var cloudflare = response.Headers.Server.Any(s => s.ToString().Contains("cloudflare", StringComparison.OrdinalIgnoreCase));
            await using var stream = await response.Content.ReadAsStreamAsync(deadline.Token);
            var buffer = new byte[64 * 1024]; var count = 0;
            while (count < buffer.Length)
            {
                var read = await stream.ReadAsync(buffer.AsMemory(count), deadline.Token);
                if (read == 0) break; count += read;
            }
            var text = System.Text.Encoding.UTF8.GetString(buffer, 0, count);
            var denied = text.Contains("access denied", StringComparison.OrdinalIgnoreCase) || text.Contains("blocked", StringComparison.OrdinalIgnoreCase);
            if (!response.IsSuccessStatusCode)
                return new(target, endpoint, status, status == 403 ? "http_forbidden" : status is >= 300 and < 400 ? "redirect_blocked" : "http_error", cloudflare, denied);
            if (!tracking && !egress) return new(target, endpoint, status, "http_reachable", cloudflare, denied);
            try
            {
                using var json = JsonDocument.Parse(text); var root = json.RootElement;
                if (root.ValueKind == JsonValueKind.Object && egress && root.TryGetProperty("ip", out var ip) && ip.ValueKind == JsonValueKind.String && IPAddress.TryParse(ip.GetString(), out var address))
                    return new(target, endpoint, status, "egress_identified", cloudflare, denied, EgressIp: address.ToString());
                if (root.ValueKind == JsonValueKind.Object && tracking && root.TryGetProperty("IsError", out var error) && error.ValueKind is JsonValueKind.True or JsonValueKind.False)
                {
                    var isError = error.GetBoolean();
                    var total = root.TryGetProperty("Gonderiler", out var docs) && docs.ValueKind == JsonValueKind.Array ? (int?)docs.GetArrayLength() : null;
                    return new(target, endpoint, status, SuratKargoClient.IsReferenceNotFound(root) ? "tracking_reference_not_found" : isError ? "provider_error" : total is not null ? "tracking_response_received" : "unexpected_response", cloudflare, denied, isError, total);
                }
            }
            catch (JsonException) { }
            return new(target, endpoint, status, "unexpected_response", cloudflare, denied);
        }
        catch (OperationCanceledException) { return new(target, endpoint, null, "timeout"); }
        catch (HttpRequestException e)
        { return new(target, endpoint, null, e.InnerException is AuthenticationException ? "tls_failure" : e.InnerException is SocketException ? "connection_failure" : "network_failure"); }
        catch (IOException) { return new(target, endpoint, null, "network_failure"); }
    }
}
