export type MaskPromptSource = {
  productName: string; color?: string; productId: string; variantId?: string; sourceRevision?: number;
  width: number; height: number; sourceSha256: string;
}

export const defaultMaskTarget = 'Kaynak görselde görünen, desen kaplanmasına uygun ana dış gövde yüzeyleri. Birden fazla ayrı gövde varsa aralarındaki birleşim ve boşlukları koruyarak ayrı bölgeler olarak seç.'

export function buildMaskPrompt(source: MaskPromptSource, target: string) {
  const { width, height } = source
  return `Eklediğim kaynak ürün fotoğrafından, ürün üzerine desen giydirmede kullanılacak tam hizalı bir ALFA MASKESİ hazırla. Yeni bir ürün fotoğrafı üretme; kaynak fotoğrafın mevcut piksellerinin koordinatlarına göre maske çıkar.

KAYNAK GÖRSELE AİT OTOMATİK BİLGİLER
Ürün: ${JSON.stringify(source.productName)}
${source.variantId ? `Seçili renk: ${JSON.stringify(source.color)}\nÜrün / varyant kimliği: ${source.productId} / ${source.variantId}` : `Ürün kimliği: ${source.productId}\nKaynak sürümü: ${source.sourceRevision}`}
Kaynak dosyanın piksel genişliği: ${width}
Kaynak dosyanın piksel yüksekliği: ${height}
Tam tuval: ${width} × ${height} piksel (genişlik × yükseklik).
Kaynak dosya SHA-256: ${source.sourceSha256}
Bu metnin yanına paneldeki “Maskeleme için kaynak fotoğrafı indir” düğmesinden aldığım dosyayı ekliyorum. Bu dosyayı esas al. Eklenen dosyanın gerçek piksel boyutlarını kontrol et; farklıysa işleme devam etmeden uyuşmazlığı bildir. Sohbette küçültülmüş görünen önizlemeyi tuval boyutu olarak kullanma.

SEÇİLECEK YÜZEY
${target.trim() || defaultMaskTarget}
Yüzeyin gerçek sınırlarını ekli fotoğraftan belirle. Ürün adından veya başka bir modelin fotoğrafından konum tahmin etme. Kulp, ağız/emzik, kapak, düğme, kablo, ayak/taban, metal birleşim halkası, logo, yazı ve arka planı desen bölgesine katma. Bu parçalar yalnız görselde varsa hariç tutulmalı; olmayan parça veya logo uydurma.

FOTOĞRAFA ÖZEL LOGO İNCELEMESİ
- Bu şablon logo adı, rengi veya konumu tespit edilmiş gibi bilgi vermez. Bunları yalnız ekli kaynak fotoğrafı inceleyerek belirle: görünen yazı, amblem, küçük simgeler, gerçek konturları ve kaynak piksel konumları. Okuyamadığın yazıyı marka adından tamamlama; okunamasa da görünür çizgilerini koru. Logo yoksa logo boşluğu üretme.
- Gövdeye basılmış logoda yalnız harflerin, amblemin ve simgelerin gerçek çizgilerini alfa 0 yap. Harflerin arasındaki boşluklar, harflerin iç boşlukları ve logonun çevresindeki kaplanabilir gövde alfa 255 kalmalı. Logonun sınır kutusunu (bounding box) delik olarak KULLANMA; dikdörtgen bir gövde parçasını koruma.
- Kaynakta gerçekten ayrı bir etiket, plaka veya rozet varsa onun görünen fiziksel sınırını koru. Fotoğrafta bulunmayan renkli dikdörtgen, etiket zemini, çerçeve veya logo arka planı oluşturma. Basılı işaret ile fiziksel etiketi ayıramıyorsan tahmin etmeden sor.
- Logoyu yeniden çizme, renklendirme, taşıma veya kaynak fotoğraftan dikdörtgen olarak kesip yapıştırma. Logo konturunu güvenilir biçimde ayıramıyorsan daha büyük bir dikdörtgeni hariç tutarak başarılı görünmeye çalışma; sınırlamayı bildir.

UYGULAMANIN GERÇEK ÇİZİM KURALI
Bu WebP akışında ayrı bir logo katmanı yoktur. Uygulama önce kaynak fotoğrafı çizer, deseni maskeyle destination-in kullanarak keser ve üstüne çizer. Alfa 0 olan yerde kaynak fotoğrafın aynı pikseli görünür; alfa 255 olan yerde desen görünür. Bu yüzden logo çevresinde gereksiz şeffaf dikdörtgen bırakırsan o alandaki eski gövde rengi de görünür ve yama oluşur. Çözüm yalnız gerçek logo çizgilerini (ve varsa gerçek fiziksel etiketi) şeffaf bırakmaktır. Maskenin içine kaynak fotoğraf veya logo pikselleri koyma.

HİZALAMA SÖZLEŞMESİ
- Koordinat başlangıcı tuvalin sol üst köşesi: (0, 0). X sağa, Y aşağı artar.
- Piksel koordinatları: x = 0…${width - 1}; y = 0…${height - 1}.
- Maske tuvali fotoğraf tuvaliyle birebir aynı: ${width} × ${height}.
- Üst üste bindirme konumu: x=0, y=0; ölçek=1; dönüş=0 derece.
- Kaynağı veya maskeyi kırpma, döndürme, aynalama, merkezleme, perspektif düzeltme veya yeniden kadrajlama yapma.
- Ürünün yerini, boyutunu, şeklini ve tuvaldeki boş kenarları değiştirme. “İçeriğe göre kırp/trim” veya yalnız gövdeyi kapsayan dar tuval kullanma.
- Boyutları desteklemek için başka çözünürlükte yeni bir görsel üretip yeniden ölçekleme. Kaynak çözünürlüğünde segmentasyon/görüntü işleme kullan; fotoğrafı yeniden çizme.

WebP VE ALFA KURALLARI
- Çıktı alfa kanallı, kayıpsız (lossless) WebP olsun; animasyon veya kayıplı sıkıştırma kullanma; tam ${width} × ${height} piksel.
- Desen uygulanacak bölge: beyaz RGB (255,255,255), alfa 255 — tam opak.
- Diğer tüm bölgeler ve korunacak logo: alfa 0 — tam şeffaf.
- Siyah fakat opak arka plan KULLANMA. destination-in işlemi siyah/beyaz renge değil ALFA kanalına bakar; alfa 255 olan siyah alan da deseni geçirir.
- Şeffaflık dama desenini dosyanın içine çizme. Kaynak ürün fotoğrafını, deseni, renkli önizlemeyi, çerçeveyi veya açıklamayı maske WebP’sine ekleme.

TESLİM ÖNCESİ KONTROL
Kaynak ile maskeyi hiç ölçeklemeden (0,0) konumunda üst üste kontrol et. Gövde sınırı, logo çizgileri ve ayrı parçalar aynı kaynak koordinatlarında olmalı. Geçici düz bir renkle kaplama kontrolü yap: logo çevresindeki gövde de kaplanmalı; kaynakta gerçek etiket yoksa dikdörtgen renk yaması kalmamalı. Bu kontrol rengini teslim maskesine ekleme. Gerçek piksel boyutlarını ve alfa kanalının yalnız 0 ve 255 değerlerini içerdiğini dosyadan kontrol et; her iki değer de bulunmalı. Bu kontrolleri veya tam hizalı WebP üretimini yapamıyorsan tamamlanmış gibi sunma; hangi kısıtın engellediğini açıkça söyle.

İndirilebilir çıktının adı: surface-mask-${width}x${height}.webp
Yanıtında maskeyi dosya olarak ver; varsa açıklama ve kontrol önizlemesini ayrı tut. Görselde hangi yüzeyin seçileceği belirsizse tahmin etmek yerine önce sor.`
}
