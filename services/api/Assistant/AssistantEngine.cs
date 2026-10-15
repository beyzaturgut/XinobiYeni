using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Xinobi.Api.Catalog;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Assistant;

/// <summary>
/// Answers a customer message. Products are always looked up in the live catalogue on the server (price and stock are never taken from
/// the model); approved knowledge sources add policy texts. When a text model is configured and today's AI limit is not reached, the model
/// phrases the answer from those facts only; otherwise — or when it fails — a rules answer is built from the same facts.
/// </summary>
public sealed partial class AssistantEngine(AssistantStore store, ITextModelProvider model, ILogger<AssistantEngine> logger)
{
    public const int ClientDailyLimit = 100;
    private static readonly CultureInfo Turkish = new("tr-TR");

    public enum Intent { Compare, Quote, XinobiU, Handoff, Orders, Greeting }

    /// <summary>Lower-case, Turkish letters folded to ASCII, so "çay", "Çay" and "cay" match.</summary>
    public static string Fold(string text)
    {
        var lower = text.ToLower(Turkish);
        var builder = new StringBuilder(lower.Length);
        foreach (var c in lower)
            builder.Append(c switch { 'ç' => 'c', 'ğ' => 'g', 'ı' => 'i', 'ö' => 'o', 'ş' => 's', 'ü' => 'u', 'â' => 'a', 'î' => 'i', 'û' => 'u', _ => c });
        return builder.ToString();
    }

    private static readonly HashSet<string> StopWords = ["bir", "ve", "ile", "icin", "bana", "beni", "bu", "su", "ne", "nasil", "var", "mi", "mu", "misin", "olan", "gibi", "cok", "daha", "en", "istiyorum", "ariyorum", "lazim", "oneri", "oner", "onerir", "urun", "urunu", "urunler", "hangi", "merhaba", "selam"];

    public static string[] Words(string text) => [.. WordPattern().Matches(Fold(text)).Select(match => match.Value).Where(word => word.Length >= 3 && !StopWords.Contains(word)).Distinct()];

    public static HashSet<Intent> Intents(string message)
    {
        var text = Fold(message);
        var intents = new HashSet<Intent>();
        bool Any(params string[] needles) => needles.Any(needle => text.Contains(needle, StringComparison.Ordinal));
        if (Any("karsilastir", "fark", "hangisi daha", "arasinda")) intents.Add(Intent.Compare);
        if (Any("kurumsal", "toplu", "teklif", "firma", "sirket", "bayi") || QuantityPattern().IsMatch(text)) intents.Add(Intent.Quote);
        if (Any("kisisellestir", "xinobi u", "tasarla", "tasarim", "desen", "logo", "ismimi", "kendi gorsel")) intents.Add(Intent.XinobiU);
        if (Any("insan", "temsilci", "canli destek", "whatsapp", "musteri hizmet", "biriyle gorus", "yetkili")) intents.Add(Intent.Handoff);
        if (Any("siparis", "kargo", "iade", "iptal", "teslimat durum", "nerede kaldi")) intents.Add(Intent.Orders);
        if (text.Trim().Length < 25 && Any("merhaba", "selam", "iyi gunler", "nasilsin")) intents.Add(Intent.Greeting);
        return intents;
    }

    /// <summary>"3000 TL", "3.000 ₺", "bütçem 2500" → the budget in kuruş; null when none is given.</summary>
    public static long? Budget(string message)
    {
        var text = Fold(message);
        var match = BudgetPattern().Match(text);
        if (!match.Success) return null;
        var digits = match.Groups["amount"].Value.Replace(".", "").Replace(" ", "");
        return long.TryParse(digits, out var amount) && amount is > 0 and < 10_000_000 ? amount * 100 : null;
    }

    private static readonly Dictionary<string, string[]> CategoryHints = new()
    {
        ["cay"] = ["cay"], ["demlik"] = ["cay"], ["semaver"] = ["cay"], ["kahve"] = ["kahve"], ["espresso"] = ["kahve"], ["filtre"] = ["kahve"],
        ["hava"] = ["hava"], ["temizle"] = ["hava"], ["toz"] = ["hava"], ["alerji"] = ["hava"], ["tost"] = ["pisirme", "tost"], ["pisir"] = ["pisirme"], ["yemek"] = ["pisirme"],
        ["su"] = ["su"], ["kettle"] = ["su", "cay"], ["isitici"] = ["su"], ["titanyum"] = ["titanyum"],
    };

    /// <summary>Products ranked against the message; with a budget only those whose cheapest colour fits remain.</summary>
    public static (CommerceProduct Product, int Score)[] Rank(CommerceState state, string message)
    {
        var words = Words(message);
        var budget = Budget(message);
        long? Lowest(CommerceProduct product) => product.Variants.Select(variant => state.Prices.TryGetValue(variant.Id, out var cents) && cents > 0 ? cents : (long?)null).Where(price => price is not null).Min();
        return [.. state.Products.Where(product => product.Active)
            .Select(product =>
            {
                var name = Fold(product.Name);
                var category = Fold(product.Category);
                var rest = Fold(string.Join(' ', [product.Description, .. product.Variants.Select(variant => variant.Color), .. (product.Specs ?? []).Select(spec => spec.Name + " " + spec.Value)]));
                var score = 0;
                foreach (var word in words)
                {
                    if (name.Contains(word, StringComparison.Ordinal)) score += 3;
                    if (category.Contains(word, StringComparison.Ordinal)) score += 2;
                    if (rest.Contains(word, StringComparison.Ordinal)) score += 1;
                    foreach (var (hint, targets) in CategoryHints)
                        if (word.StartsWith(hint, StringComparison.Ordinal) && targets.Any(target => category.Contains(target, StringComparison.Ordinal) || name.Contains(target, StringComparison.Ordinal))) score += 2;
                }
                return (Product: product, Score: score, Price: Lowest(product));
            })
            .Where(item => budget is null ? item.Score > 0 : item.Price is not null && item.Price <= budget && (item.Score > 0 || words.Length <= 2))
            .OrderByDescending(item => item.Score).ThenBy(item => item.Price ?? long.MaxValue)
            .Select(item => (item.Product, item.Score))];
    }

    public static KnowledgeSource[] RankKnowledge(IEnumerable<KnowledgeSource> sources, string message)
    {
        var words = Words(message);
        return [.. sources.Select(source => (source, score: words.Count(word => source.Keywords.Any(keyword => Fold(keyword).Contains(word, StringComparison.Ordinal) || word.Contains(Fold(keyword), StringComparison.Ordinal)))
                * 3 + words.Count(word => Fold(source.Title).Contains(word, StringComparison.Ordinal)) * 2 + words.Count(word => Fold(source.Body).Contains(word, StringComparison.Ordinal))))
            .Where(item => item.score > 1).OrderByDescending(item => item.score).Take(3).Select(item => item.source)];
    }

    private static string StockText(int stock) => stock <= 0 ? "stokta yok" : stock <= 5 ? $"son {stock} ürün" : "stokta";

    private static string Fact(CommerceState state, CommerceProduct product)
    {
        var prices = product.Variants.Select(variant => state.Prices.GetValueOrDefault(variant.Id)).Where(cents => cents > 0).ToArray();
        var price = prices.Length == 0 ? "fiyat tanımlı değil" : prices.Distinct().Count() > 1 ? string.Create(Turkish, $"{prices.Min() / 100m:N2} TL'den başlayan") : string.Create(Turkish, $"{prices[0] / 100m:N2} TL");
        var specs = product.Specs is { Length: > 0 } list ? " · özellikler: " + string.Join("; ", list.Select(spec => $"{spec.Name}={spec.Value}")) : "";
        return $"[P:{product.Id}] {product.Name} · {product.Category} · {price} · {StockText(product.Variants.Sum(variant => variant.Stock))} · renkler: {string.Join(", ", product.Variants.Select(variant => variant.Color))} · XINOBI U: {(CatalogProjection.IsPersonalizable(product) ? "var" : "yok")}{specs} · açıklama: {Truncate(product.Description, 200)}";
    }

    private static string Truncate(string? text, int max) => string.IsNullOrEmpty(text) ? "" : text.Length <= max ? text : text[..max].TrimEnd() + "…";

    public async Task<(StoredAssistantMessage Reply, AiUsageEntry Usage)> Answer(CommerceState state, string message, IReadOnlyList<StoredAssistantMessage> history, AssistantPolicy policy, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var intents = Intents(message);
        var ranked = Rank(state, message);
        var knowledge = RankKnowledge(await store.UsableKnowledge(), message);
        // History keeps the conversation's topic, e.g. "hangisi daha sessiz?" after a tea-maker question.
        var context = ranked.Length > 0 ? ranked : history.Count > 0 ? Rank(state, string.Join(' ', history.Where(item => item.Role == "user").TakeLast(2).Select(item => item.Text))) : [];
        var facts = context.Take(6).Select(item => item.Product).ToArray();

        string? text = null;
        var source = "rules";
        var usage = new AiUsageEntry(now, "assistant", "rules", 0, 0, true, null, null);
        var useModel = model.IsConfigured && policy.DailyAiLimit > 0 && await store.AiCallsToday("assistant") < policy.DailyAiLimit && !intents.Contains(Intent.Greeting);
        if (useModel)
        {
            var system = new StringBuilder(policy.SystemPrompt.Trim())
                .Append("\n\nÜRÜNLER (yalnız bunları önerebilirsin):\n").Append(facts.Length == 0 ? "Bu mesajla eşleşen ürün yok." : string.Join('\n', facts.Select(product => Fact(state, product))))
                .Append("\n\nBİLGİ (onaylı mağaza metinleri):\n").Append(knowledge.Length == 0 ? "Yok." : string.Join("\n---\n", knowledge.Select(item => $"{item.Title}: {Truncate(item.Body, 1200)}")))
                .Append($"\n\nTüm ürün sayısı: {state.Products.Count(product => product.Active)}. Karşılaştırma için /karsilastir, toplu alım için kurumsal teklif formu, kişiselleştirme için XINOBI U var.");
            var turns = new List<ChatTurn> { new("system", system.ToString()) };
            turns.AddRange(history.TakeLast(6).Select(item => new ChatTurn(item.Role == "user" ? "user" : "assistant", Truncate(item.Text, 600))));
            turns.Add(new ChatTurn("user", message));
            try
            {
                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                timeout.CancelAfter(TimeSpan.FromSeconds(25));
                var answer = await model.CompleteAsync(policy.Model, turns, policy.Temperature, timeout.Token);
                usage = usage with { Model = answer.Model, InputTokens = answer.InputTokens, OutputTokens = answer.OutputTokens };
                if (!string.IsNullOrWhiteSpace(answer.Text)) { text = answer.Text.Trim(); source = "ai"; }
            }
            catch (Exception error) when (error is TextModelException or HttpRequestException or OperationCanceledException or System.Text.Json.JsonException)
            {
                logger.LogWarning("Nobi model call failed ({Error}); answering with rules.", error is TextModelException model ? model.Code : error.GetType().Name);
                usage = usage with { Model = policy.Model, Success = false, Error = error is TextModelException failure ? failure.Code : error.GetType().Name };
            }
        }

        // Product cards: the ids the model referenced (only ones we gave it), otherwise the best matches.
        var referenced = text is null ? [] : ProductToken().Matches(text).Select(match => match.Groups["id"].Value).Distinct().Where(id => facts.Any(product => product.Id == id)).ToArray();
        var products = referenced.Length > 0 ? referenced : ranked.Take(intents.Contains(Intent.Compare) ? 4 : 3).Select(item => item.Product.Id).ToArray();
        text = text is null ? RulesText(state, message, intents, ranked.Select(item => item.Product).ToArray(), knowledge, policy) : Clean(text);

        var actions = new List<AssistantAction>();
        if (products.Length >= 2 && (intents.Contains(Intent.Compare) || referenced.Length == 0)) actions.Add(new("compare", "Bu ürünleri karşılaştır", products));
        if (intents.Contains(Intent.XinobiU)) actions.Add(new("xinobi_u", "XINOBI U ile tasarla", Url: "/xinobi-u"));
        if (intents.Contains(Intent.Quote)) actions.Add(new("quote", "Kurumsal teklif iste", Url: "/kurumsal/teklif"));
        if (intents.Contains(Intent.Orders)) actions.Add(new("orders", "Siparişlerime git", Url: "/hesap/siparisler"));
        if (intents.Contains(Intent.Handoff) || source == "rules" && products.Length == 0 && knowledge.Length == 0 && intents.Count == 0)
        {
            actions.Add(new("handoff", policy.WhatsAppNumber is null ? "Destek ekibine yaz" : "WhatsApp'tan bağlan"));
            actions.Add(new("lead", "Beni arayın / yazın"));
        }
        return (new StoredAssistantMessage(Guid.NewGuid().ToString("N"), "assistant", text, products, [.. actions], DateTimeOffset.UtcNow, source), usage);
    }

    /// <summary>Removes product tokens and stray markup from a model answer.</summary>
    public static string Clean(string text) => WhiteSpace().Replace(ProductToken().Replace(text, ""), " ").Replace(" .", ".").Replace(" ,", ",").Trim();

    private static string RulesText(CommerceState state, string message, HashSet<Intent> intents, CommerceProduct[] products, KnowledgeSource[] knowledge, AssistantPolicy policy)
    {
        if (intents.Contains(Intent.Greeting)) return policy.Greeting + " Ürün bulma, karşılaştırma, XINOBI U ile kişiselleştirme ve kurumsal alımlarda yardımcı olabilirim.";
        var parts = new List<string>();
        if (intents.Contains(Intent.Handoff))
            parts.Add(policy.WhatsAppNumber is null
                ? "Seni ekibimize bağlayabilirim. İletişim bilgilerini bırakırsan en kısa sürede sana dönerler."
                : "Seni ekibimize bağlayabilirim. Aşağıdan WhatsApp'a geçebilir ya da iletişim bilgilerini bırakabilirsin.");
        if (intents.Contains(Intent.Orders)) parts.Add("Sipariş, kargo, iptal ve iade işlemlerini Hesabım > Siparişlerim sayfasından izleyip başlatabilirsin. Ben sipariş bilgilerine erişemem.");
        if (intents.Contains(Intent.Quote)) parts.Add("Toplu ve kurumsal alımlarda adet, kişiselleştirme ve terminle birlikte kurumsal teklif formunu doldurman yeterli; satış ekibimiz birim fiyatlı teklif hazırlar.");
        if (intents.Contains(Intent.XinobiU)) parts.Add("XINOBI U ile beş kısa soruyu yanıtlıyorsun, yapay zekâ sana özel bir tasarım üretiyor ve seçtiğin ürünün üzerinde görüyorsun. Kendi görselini de yükleyebilirsin.");
        if (products.Length > 0)
        {
            var budget = Budget(message);
            parts.Add((budget is null ? "Aradığına uygun ürünler:" : $"{budget / 100:N0} TL bütçene uygun ürünler:") + " " +
                string.Join("; ", products.Take(3).Select(product =>
                {
                    var prices = product.Variants.Select(variant => state.Prices.GetValueOrDefault(variant.Id)).Where(cents => cents > 0).ToArray();
                    return $"{product.Name} ({(prices.Length == 0 ? "fiyat tanımlı değil" : $"{prices.Min() / 100m:N2} TL'den")}, {StockText(product.Variants.Sum(variant => variant.Stock))})";
                })) + ". Fiyat ve stok sepette yeniden doğrulanır.");
        }
        if (knowledge.Length > 0) parts.Add($"{knowledge[0].Title}: {Truncate(knowledge[0].Body, 400)}");
        if (parts.Count == 0)
            parts.Add(Budget(message) is not null
                ? "Bu bütçeye uygun bir ürün bulamadım. Bütçeni biraz artırmayı ya da kategorileri incelemeyi deneyebilirsin."
                : "Bunu tam anlayamadım. Ürün adı, kategori (çay, kahve, hava temizleme, pişirme) ya da bütçeni yazabilirsin; istersen ekibimize de bağlanabilirim.");
        return string.Join(' ', parts);
    }

    [GeneratedRegex(@"[a-z0-9]+")]
    private static partial Regex WordPattern();

    [GeneratedRegex(@"\b(\d{2,})\s*(adet|tane)")]
    private static partial Regex QuantityPattern();

    [GeneratedRegex(@"(?<amount>\d{1,3}(?:[.\s]\d{3})+|\d+)\s*(tl|₺|lira)|butce[^\d]{0,15}(?<amount>\d{1,3}(?:[.\s]\d{3})+|\d+)")]
    private static partial Regex BudgetPattern();

    [GeneratedRegex(@"\[P:(?<id>[^\]\s]{1,80})\]")]
    private static partial Regex ProductToken();

    [GeneratedRegex(@"[ \t]{2,}")]
    private static partial Regex WhiteSpace();
}
