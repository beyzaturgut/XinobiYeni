import type { Product } from '../../commerce'

export const defaultCoating = 'Kaynak fotoğraftaki kişiselleştirilebilir ana dış gövdenin tamamı; varsa bu gövdeye ait dışa uzanan dökme ağzı, ağız ucunun görünen yüzeyleri, yanları, kenarları ve gövdeyle birleşim bölgesi. Kaplama gövde ile ağız arasında kesintisiz devam etsin; yanlışlıkla eski renkte alan bırakma. Yalnız fotoğrafta bulunan parçaları değerlendir.'
export const defaultProtectedParts = 'Cam ve şeffaf parçalar, süzgeç, kapak, kapak düğmesi, kulplar, düğmeler, kablo, taban ve ayrı metal bağlantı halkaları (yalnız kaynakta varsa). Logo ve yazıların gerçek çizgileri her durumda korunmalı.'

function slug(value: string) {
  return value.toLocaleLowerCase('tr-TR').replaceAll('ı', 'i').replaceAll('ş', 's').replaceAll('ğ', 'g').replaceAll('ü', 'u').replaceAll('ö', 'o').replaceAll('ç', 'c').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'urun'
}

export function buildCatalogPhotoPrompt(product: Product, referenceId: string, coating: string, protectedParts: string) {
  const reference = product.variants.find(v => v.id === referenceId) ?? product.variants[0]
  const variants = reference ? [reference, ...product.variants.filter(v => v.id !== reference.id)] : []
  return `Eklediğim ana görseldeki ${JSON.stringify(product.name || '[ÜRÜN ADI EKSİK]')} ürününden aşağıdaki kurallara uygun ${variants.length} ayrı katalog görseli hazırla. Amaç aynı ürünün dış kaplamasını katalogdaki renklerde göstermektir. Görseller tek desen maskesiyle kullanılacağı için piksel düzeyinde aynı hizada olmalıdır.

ÜRÜNE AİT GÜNCEL BİLGİLER
Ürün kimliği: ${product.id}
Kategori: ${JSON.stringify(product.category)}
Açıklama (geometriyi fotoğraftan belirle): ${JSON.stringify(product.description)}
Referans varyant: ${reference ? JSON.stringify(reference.color) + ' / ' + reference.sku : '[VARYANT EKSİK]'}
Ana görseli bu metne dosya olarak ekliyorum. Katalogdaki görsel adreslerini eklenmiş kaynak dosya sayma. Ürün adı, varyant, renk veya geçerli #RRGGBB kodu eksikse tahmin etme; eksik bilgiyi iste ve üretimi durdur.

KAYNAĞA SADAKAT
- Şekli, oranları, kamera açısını, perspektifi ve bütün parçaları yalnız ana görselden al. Aynalama, döndürme veya yeniden tasarlama.
- Dekoru, diğer nesneleri ve ortamı kaldır. Cam parçalar ve kulp boşluklarından görünen ortamı da temizle; arkalarında beyaz fon görünsün. Camın kendi çizgilerini ve yansımalarını koru.
- Logo ve yazıların kaynak şekli, konumu, boyutu ve rengini koru. Okunamayan ayrıntıları uydurma. Basılı logonun yalnız gerçek çizgilerini koru; çevresindeki kaplanabilir gövdeyi dikdörtgen olarak hariç tutma. Gerçek fiziksel etiket varsa kendi sınırını koru.

ORTAK TUVAL VE YERLEŞİM
- Her dosyanın gerçek boyutu tam 1333 × 2000 piksel; opak saf beyaz #FFFFFF arka plan.
- Zemin çizgisi, yansıma yüzeyi, dekor veya gölge ekleme.
- Ürün bütün parçalarıyla yaklaşık 1600 piksel yüksekliğinde; üst ve altta yaklaşık 200'er piksel boşluk. Dış sınırları yatayda ortala; hiçbir parçayı kırpma.
- Geniş ürünlerde bütün parçaları kırpmadan sığdırmak önceliklidir: en-boy oranını koru, yüksekliği gerekirse azalt ve gerçek yerleşimi raporla. Ürünü esnetme.

KAPLAMA ALANI
${coating.trim() || defaultCoating}

KORUNACAK PARÇALAR
${protectedParts.trim() || defaultProtectedParts}
Fotoğrafta olmayan parça ekleme. Kaplanacak ve korunacak alanlar çelişiyorsa veya sınır belirsizse tahmin etmeden sor.

YÜZEY VE PARLAKLIK
- İnce dokulu, hafif metalik saten kaplama. Ana görselin ışık yönünü ve hacmi anlatan yumuşak gölgeleri koru.
- Aşırı krom, ayna etkisi, patlayan beyaz alan veya keskin beyaz ışık şeritleri oluşturma. Düz, gölgesiz boyama yapma.
- Parlama ve gölgelerin konumu, şekli ve dağılımı bütün renklerde aynı olsun. HEX ana tondur; ışık ve gölgede doğal açık/koyu karşılıklarını kullan.

RENKLER VE DOSYA ADLARI (ilk satır ortak kalıp)
${variants.map((v, i) => `${i + 1}. ${JSON.stringify(v.color || '[RENK EKSİK]')} — ${/^#[0-9a-f]{6}$/i.test(v.hex || '') ? v.hex : '[GEÇERLİ HEX EKSİK]'}; SKU: ${JSON.stringify(v.sku)}; varyant: ${v.id}\n   ${slug(v.sku || product.name)}-${slug(v.color)}-${i + 1}-1333x2000.webp`).join('\n')}

ZORUNLU İŞLEM SIRASI
1. Önce yalnız ilk listedeki referans rengin katalog görselini hazırla. Gümüş varyant varsa operatör bunu referans seçebilir; listede olmayan renk üretme.
2. Tuvali, ürün boyutunu, konumunu ve beyaz fonu son haline getir. Bu görsel ortak KALIP olsun.
3. Kalıpta belirtilen kaplama alanının tamamını kapsayan tek maske oluştur. Logo çizgilerini ve korunacak parçaları çıkar. Bu renk dönüşümü maskesini bütün varyantlarda aynen kullan.
4. Diğer renkleri ayrı ayrı yeniden üretme. Aynı kalıp ve aynı maske üzerinde piksel tabanlı renk dönüşümü uygula.
5. Bütün renklerde aynı ışıklılık haritasını kullan; doğal ve ölçülü metalik görünümü koru.
6. Varyantlar oluşturulduktan sonra ayrı kırpma, ölçekleme, döndürme veya konum düzeltmesi yapma.
7. Maskenin dışındaki çözülmüş RGB pikselleri bütün dosyalarda birebir aynı tut.

TESLİM VE DOĞRULAMA
- Her görseli ayrı kayıpsız WebP olarak ve bütün dosyaları tek ZIP içinde teslim et. Kayıplı WebP'ye sessizce geçme.
- Kaydedilen dosyaları tekrar aç; formatı, kayıpsız kodlamayı ve her birinin 1333 × 2000 piksel olduğunu doğrula.
- (0,0) konumu, ölçek 1 ve dönüş 0 ile üst üste koy; dış sınırlar ve bütün parçalar tam çakışmalı.
- Çözülmüş piksel karşılaştırmasında farkların yalnız kaplama maskesinde kaldığını doğrula; maske dışı farklı piksel sayısını ve dosya boyutlarını raporla.
- Varsa gövdenin ağız ve uç kısmının da renklendirildiğini görsel olarak kontrol et. Fonun saf beyaz olduğunu kontrol et.
- Boyut, hizalama, kayıpsız format veya piksel eşitliğini kontrol edemiyorsan açıkça belirt. Doğrulanmayan sonucu kontrol edilmiş veya tamamlanmış olarak sunma.
- Bu katalog fotoğrafı hazırlama işlemidir. Desen giydirme için alfa maskesi, son kalıp fotoğrafa bağlı olarak ayrıca hazırlanıp panelde kontrol edilmelidir.`
}
