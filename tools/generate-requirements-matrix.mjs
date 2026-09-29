import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "docs/sources/Xinobi_Proje_Kapsami.md");
const outputPath = resolve(root, "docs/discovery/requirements-traceability.csv");
const lines = readFileSync(sourcePath, "utf8").split(/\r?\n/);

const domains = [
  { match: /Kavramsal Analiz/i, code: "DSC", phase: "Faz01", surface: "Dokümantasyon", api: "Ortak", data: "Karar/kanıt", uat: "Gereksinim, süreç ve karar kaydı PM tarafından izlenebilir" },
  { match: /UI\/UX Tasarımı/i, code: "UX", phase: "Faz02", surface: "Web/Panel/Mobil", api: "Ekran sözleşmeleri", data: "Tasarım tokenı/asset", uat: "Onaylı prototip, durumlar, responsive ve erişilebilirlik kanıtı" },
  { match: /Merkezi Yönetim Paneli/i, code: "ADM", phase: "Faz03-Faz10", surface: "Panel", api: "Yönetim API", data: "İlgili modül + AuditLog", uat: "Yetkili/yasaklı işlem, kayıt ve denetim izi" },
  { match: /Kurumsal Web Sitesi/i, code: "WEB", phase: "Faz04", surface: "Web", api: "CMS/Katalog", data: "Page/SeoMetadata/Product", uat: "Responsive sayfa, içerik yayını, SEO ve erişilebilirlik" },
  { match: /E-Ticaret Sistemi/i, code: "B2C", phase: "Faz05", surface: "Web/Mobil/Panel", api: "Kimlik/Sepet/Checkout/Sipariş", data: "Customer/Cart/Order/Payment", uat: "Gerçek ürünle uçtan uca müşteri, ödeme ve sipariş senaryosu" },
  { match: /Ürün Kişiselleştirme Sistemi/i, code: "PER", phase: "Faz06", surface: "Web/Mobil/Panel", api: "Tasarım/Baskı", data: "Design/DesignVersion/PrintOutput", uat: "Tasarım kaydet-aç, sepete bağla ve baskı çıktısını doğrula" },
  { match: /Gelişmiş Ürün Tasarım Editörü/i, code: "EDT", phase: "Faz06", surface: "Web/Mobil", api: "Tasarım/Baskı", data: "DesignDocument/DesignVersion", uat: "Katman/geometri/geçmiş/kalite ve golden çıktı testi" },
  { match: /Kurumsal Teklif ve Toplu Sipariş Sistemi/i, code: "B2B", phase: "Faz07", surface: "Web/Mobil/Panel", api: "Teklif", data: "QuoteRequest/QuoteHistory", uat: "Talep, durum, not ve onaylı siparişe dönüşüm" },
  { match: /iOS Mobil Uygulaması/i, code: "IOS", phase: "Faz11", surface: "iOS", api: "Ortak /api/v1", data: "Ortak merkezi kayıt", uat: "Gerçek iOS cihazda kanal eşliği" },
  { match: /Android Mobil Uygulaması/i, code: "AND", phase: "Faz11", surface: "Android", api: "Ortak /api/v1", data: "Ortak merkezi kayıt", uat: "Gerçek Android cihazda iOS işlev eşliği" },
  { match: /Mikro Muhasebe Entegrasyonu/i, code: "MIK", phase: "Faz08", surface: "Panel/Worker", api: "Mikro adapter", data: "ExternalMapping/SyncJob", uat: "Gerçek erişimle alan yönü, tekrar ve mutabakat" },
  { match: /Pazaryeri Entegrasyonları/i, code: "MKT", phase: "Faz09", surface: "Panel/Worker", api: "Pazaryeri adapterları", data: "ExternalMapping/ExternalOrderRef", uat: "Trendyol, Hepsiburada ve N11 ayrı sandbox/erişim kanıtı" },
  { match: /Merkezi Sipariş Yönetimi/i, code: "ORD", phase: "Faz09", surface: "Panel", api: "Sipariş/Entegrasyon", data: "Order/ExternalOrderRef", uat: "Tüm kanallarda tekil sipariş ve durum mutabakatı" },
  { match: /AI Destekli Tasarım Üretimi/i, code: "AID", phase: "Faz10", surface: "Web/Mobil/Panel", api: "AI tasarım adapterı", data: "AiJob/GeneratedAsset/AiUsage", uat: "Limit, moderasyon, hata ve editöre aktarım" },
  { match: /AI Satış Asistanı/i, code: "AIA", phase: "Faz10", surface: "Web/Mobil/Panel", api: "AI asistan adapterı", data: "AiConversation/Lead/KnowledgeSource", uat: "Kaynaklı yanıt, öneri, lead ve insan devri" },
  { match: /AI Yönetim Paneli/i, code: "AIM", phase: "Faz10", surface: "Panel", api: "AI yönetim", data: "AiUsage/KnowledgeSource/SystemSetting", uat: "Yetkili ayar, limit, maliyet ve hata raporu" },
  { match: /SEO ve Dijital Pazarlama Altyapısı/i, code: "SEO", phase: "Faz04", surface: "Web/Panel", api: "CMS/SEO", data: "SeoMetadata/Consent", uat: "Teknik SEO, yapılandırılmış veri, analitik ve rıza testi" },
  { match: /$a/, code: "OPS", phase: "Faz11", surface: "Operasyon/Dokümantasyon", api: "Dağıtım ve işletim", data: "Runbook/UAT kanıtı", uat: "UAT, eğitim, canlı geçiş ve geri alma kanıtı" }
];

function inferDomain(section, requirement) {
  const direct = domains.find(({ match }) => match.test(section));
  if (direct) return direct;

  const text = requirement;
  const inferred = [
    [/canlı ortam|test|UAT|eğitim|teknik dokümantasyon|proje yönetimi/i, "OPS"],
    [/AI yönetim paneli|model ve servis ayarları|maliyet raporları/i, "AIM"],
    [/AI destekli tasarım|tasarım üretimi|görsel iyileştirme|arka plan kaldırma/i, "AID"],
    [/AI satış asistanı|görüşme|lead|ürün önerisi/i, "AIA"],
    [/mobil|iOS|Android|App Store|Google Play/i, "IOS"],
    [/Mikro|muhasebe|fatura|tahsilat/i, "MIK"],
    [/pazaryeri|Trendyol|Hepsiburada|N11/i, "MKT"],
    [/merkezi sipariş/i, "ORD"],
    [/AI|yapay zekâ|prompt/i, "AIA"],
    [/gelişmiş ürün tasarım editörü/i, "EDT"],
    [/kişiselleştir|baskı/i, "PER"],
    [/kurumsal teklif|toplu sipariş/i, "B2B"],
    [/kurumsal web/i, "WEB"],
    [/B2C|e-ticaret/i, "B2C"],
    [/merkezi yönetim paneli/i, "ADM"],
    [/SEO|analitik|Google|Meta Pixel/i, "SEO"],
    [/stok|fiyat|ürün|kategori|kampanya|kupon/i, "ADM"],
    [/sipariş|ödeme|sepet|müşteri/i, "B2C"],
    [/UI\/UX|tasarım/i, "UX"],
    [/dokümantasyon/i, "DSC"]
  ].find(([pattern]) => pattern.test(text));

  return domains.find(({ code }) => code === (inferred?.[1] ?? "DSC"));
}

const counters = new Map();
const rows = [];
let section = "Belirtilmemiş";

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];
  const heading = line.match(/^#{2,3}\s+(.+)$/);
  if (heading) section = heading[1].trim();

  const bullet = line.match(/^-\s+(.+)$/);
  const androidParity = section === "Android Mobil Uygulaması" && line.trim() && !line.startsWith("#") && !bullet;
  if (!bullet && !androidParity) continue;

  const requirement = (bullet?.[1] ?? line.trim()).replaceAll("\"", "\"\"");
  const domain = inferDomain(section, requirement);
  const next = (counters.get(domain.code) ?? 0) + 1;
  counters.set(domain.code, next);
  rows.push({
    id: `REQ-${domain.code}-${String(next).padStart(3, "0")}`,
    line: index + 1,
    section,
    requirement,
    ...domain
  });
}

const header = [
  "RequirementId", "SourceDocument", "SourceLine", "SourceSection", "Requirement",
  "TargetPhase", "Surface", "ApiDomain", "DataDomain", "UatEvidence",
  "DecisionDependencies", "Status"
];

function csv(value) {
  return `"${String(value).replaceAll("\"", "\"\"")}"`;
}

function decisions(row) {
  const map = {
    MIK: "D02;D06", MKT: "D02;D03;D06", B2C: "D03;D05;D10",
    PER: "D04", EDT: "D04;D09", B2B: "D07", AID: "D05;D08;D10",
    AIA: "D05;D08;D10", AIM: "D05;D08;D10", IOS: "D03;D04;D05;D09;D10",
    AND: "D03;D04;D05;D09;D10", SEO: "D10", WEB: "D10", ADM: "D02;D10",
    OPS: "D05;D06;D09;D10"
  };
  return map[row.code] ?? "D01";
}

const body = rows.map((row) => [
  row.id, "Xinobi_Proje_Kapsami.md", row.line, row.section, row.requirement,
  row.phase, row.surface, row.api, row.data, row.uat, decisions(row), "Planned"
].map(csv).join(","));

writeFileSync(outputPath, `${header.map(csv).join(",")}\n${body.join("\n")}\n`);
console.log(`Generated ${rows.length} traceability rows at ${outputPath}`);
