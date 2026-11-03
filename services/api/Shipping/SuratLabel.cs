using System.Globalization;
using System.Text;
using System.Xml;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Shipping;

/// <summary>Print at 100%: test-only 100x150 mm draft. Provider layout/reader acceptance is still required.</summary>
public static class SuratLabel
{
    private static readonly string[] Patterns = ["212222","222122","222221","121223","121322","131222","122213","122312","132212","221213","221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231","213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321","232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133","112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131","311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422","121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211","221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212","421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113","411311","113141","114131","311141","411131","211412","211214","211232","2331112"];
    public static int[] Symbols(string reference)
    {
        if (string.IsNullOrEmpty(reference) || reference.Length > 50 || reference.Any(c => c < 32 || c > 126))
            throw new ArgumentException("Code128-B için geçerli referans gerekli.");
        var symbols = new List<int> { 104 };
        symbols.AddRange(reference.Select(c => c - 32));
        var checksum = 104;
        for (var i = 1; i < symbols.Count; i++) checksum += symbols[i] * i;
        symbols.Add(checksum % 103); symbols.Add(106);
        return symbols.ToArray();
    }
    public static byte[] Render(SuratStoredShipment row)
    {
        if (row.Environment != "Sandbox") throw new ProblemException("label_layout_unapproved", "Canlı etiket şablonu sağlayıcı tarafından henüz onaylanmadı.", 409);
        if (row.State != "registered" || string.IsNullOrWhiteSpace(row.SenderCode))
            throw new ProblemException("label_not_ready", "Kayıt kabulü ve gönderici cari kodu olmadan etiket üretilemez.", 409);
        var symbols = Symbols(row.Reference);
        var width = symbols.Sum(s => Patterns[s].Sum(c => c - '0')) + 20; // 10 module quiet zones.
        var svg = new StringBuilder("""<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="150mm" viewBox="0 0 600 900" role="img" aria-label="Sürat Kargo test etiketi"><rect width="600" height="900" fill="white"/>""");
        void Text(string value, int y, int size = 22) => svg.Append($"""<text x="30" y="{y}" font-family="Arial,sans-serif" font-size="{size}">{Escape(value)}</text>""");
        Text("TEST - SEVK İÇİN KULLANILMAZ", 45, 25);
        Text("SÜRAT KARGO / XINOBI", 90, 27);
        Text("Cari: " + row.SenderCode, 135);
        Text("Referans: " + row.Reference, 180, 20);
        // Local barcode coordinates remain integral; scaling does not introduce bitmap blur.
        svg.Append($"""<g transform="translate(30 210) scale({(540d/width).ToString("0.########", CultureInfo.InvariantCulture)} 1)" fill="black">""");
        var x = 10;
        foreach (var symbol in symbols)
        {
            var bar = true;
            foreach (var digit in Patterns[symbol])
            {
                var w = digit - '0';
                if (bar) svg.Append($"""<rect x="{x}" y="0" width="{w}" height="110"/>""");
                x += w; bar = !bar;
            }
        }
        svg.Append("</g>");
        Text(row.Reference, 355, 20);
        Text("Alıcı", 410);
        var y = 445;
        foreach (var line in Wrap(row.Request.KisiKurum + " | " + row.Request.AliciAdresi + " | " + row.Request.Ilce + " / " + row.Request.Il, 38))
        { Text(line, y, 20); y += 28; }
        Text("Tel: " + row.Request.TelefonCep, 700, 20);
        Text($"Paket: {row.Request.Adet} | Birim desi/kg: {row.Request.BirimDesi.ToString(CultureInfo.InvariantCulture)}/{row.Request.BirimKg.ToString(CultureInfo.InvariantCulture)}", 745, 18);
        Text("Ödeme: " + (row.Request.OdemeTipi == 1 ? "Gönderici" : "Alıcı"), 785, 20);
        Text("Şablon taslağı - şube/okuyucu kabulü bekliyor", 850, 17);
        svg.Append("</svg>"); return Encoding.UTF8.GetBytes(svg.ToString());
    }
    private static IEnumerable<string> Wrap(string value, int width)
    {
        // Wrap whole words and Unicode runes, never truncate or split a surrogate pair.
        var lines = new List<string>();
        var line = "";
        foreach (var word in value.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            foreach (var part in word.EnumerateRunes().Select(r => r.ToString()).Chunk(width).Select(chunk => string.Concat(chunk)))
            {
                if (line.Length > 0 && line.EnumerateRunes().Count() + part.EnumerateRunes().Count() + 1 > width)
                { lines.Add(line); line = ""; }
                line += (line.Length == 0 ? "" : " ") + part;
            }
        }
        if (line.Length > 0) lines.Add(line);
        if (lines.Count > 8) throw new ProblemException("label_address_too_long", "Adres test etiketi alanına sığmıyor; onaylı şablon gerekli.", 409);
        return lines;
    }
    private static string Escape(string value)
    {
        using var output = new StringWriter();
        using (var writer = XmlWriter.Create(output, new XmlWriterSettings { OmitXmlDeclaration = true, ConformanceLevel = ConformanceLevel.Fragment })) writer.WriteString(value);
        return output.ToString();
    }
}
