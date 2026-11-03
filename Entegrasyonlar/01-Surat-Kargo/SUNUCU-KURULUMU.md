# Sürat Kargo sunucu adaptörü - ilk uygulama

03.11.2026. `services/api/Shipping/SuratKargoClient.cs` ve Program.cs kaydı eklendi. Bu sürüm taşıma/sözleşme katmanıdır; admin gönderi oluşturma, kalıcı deneme kaydı, etiket ve otomatik takip henüz bağlı değildir. Manuel kargo davranışı değiştirilmedi. Hiçbir gerçek sağlayıcı çağrısı yapılmadı.

## Güvenli ayar yerleşimi

Mevcut sunucu ayar dosyasının `Shipping:Surat` bölümünü veya ortam değişkenlerini kullan. Gerçek dosya Git dışında kalır. Kullanıcı bilgilerini özgün yerel `kargo.rtf` dosyasından yetkili kurulum sırasında al; bu belgeye kopyalama.

| Anahtar | İlk kurulum |
| --- | --- |
| `Shipping__Surat__Enabled` | `false` (varsayılan) |
| `Shipping__Surat__Mode` | `Sandbox` |
| `Shipping__Surat__AllowProduction` | `false` (varsayılan) |
| `Shipping__Surat__Sandbox__Username` | Test hesabı; gizli ayar deposu |
| `Shipping__Surat__Sandbox__Password` | Test parolası; gizli ayar deposu |
| `Shipping__Surat__Production__Username` | Canlı hesap; gizli ayar deposu |
| `Shipping__Surat__Production__Password` | Canlı parola; gizli ayar deposu |

Canlı için hem Mode=Production hem AllowProduction=true gerekir. Bilinmeyen ortam, kapalı bağlantı ve eksik hesapta ağ isteği gönderilmez. Hostlar sabittir; kimlik bilgileri keyfi URL'ye yönlendirilemez. HTTP yönlendirmeleri kapalıdır. Başlangıçta otomatik bağlantı denemesi yoktur.

HttpClient logları kaldırıldı; uygulama ham istek/yanıt/parola/exception URL'sini loglamaz veya geri döndürmez. Takip sözleşmesi query içinde parola gerektirdiği için gerçek ortamdaki APM, proxy ve HTTP tracing redaksiyonu ayrıca doğrulanmadan gerçek sorgu açılmamalıdır. Bu katman sunucu içindir; istemciye doğrudan açılmaz.

## Desteklenen ilk sözleşme

- Kendi mağazamız: normal Koli, aynı ölçülü paketler, karayolu, adrese, COD kapalı. Ödeme sorumluluğu çağıran tarafından açıkça verilir; ürün ödeme şekliyle karıştırılmaz.
- Zorunlu alıcı, 50 karaktere kadar sabit referans, gerçek pozitif paket/desi/kg, enum ve telefon doğrulanır. Eksik değer sıfırla tamamlanmaz.
- POST `GonderiyiKargoyaGonder`: yalnız tam `Tamam` veya `Kayıt Edildi` yanıtı kayıtlıdır. HTTP hata/bağlantı kopması/timeout/diğer içerik uzlaştırma gerektirir. Write retry yoktur. Kayıtlı sonucu kargolandı veya teslim edildi anlamına gelmez.
- POST query takip: boş liste kabul bekliyor; servis/şema hatası erişilemiyor. Tüm belgeler, hareketler ve ham tarihler korunur; büyük kimlik string okunur. Kod 7 inceleme, kod 12 iade teslimidir. Normalize durumu tek başına sipariş güncellemez.
- Taşıma katmanındaki `Source` sağlayıcı belge/hareket verisidir ve kişisel veri içerebilir. Yeni public DTO olarak doğrudan yayımlanmaz; kalıcı depoda erişim/saklama politikası gerektirir.

## Sıradaki zorunlu adımlar

1. Kalıcı gönderi/paket/attempt modeli, migration ve transaction/idempotency kilidi; POST öncesi referans kalıcılaştırma. Demo siparişleri gerçek çıkıştan ayıran uygunluk kuralı.
2. Yetkili admin oluşturma ve uzlaştırma ekranı. Kayıt aşamasında mevcut `Ship` veya `order_shipped` bildirimi kullanılmaz.
3. Sağlayıcı onaylı Code128 etiket, tekrar indirme, fiziksel okuyucu testi.
4. Kalıcı takip işi, olay sırası/iade ayrımı, müşteri DTO ve web/Flutter gösterimi.
5. Kaynak plandaki sözleşme çelişkileri, egress IP/whitelist ve gerçek hesap yetkileri; ayrı izinli sandbox kabulü. Canlı pilot/deploy bu ilk kod tesliminde yok.

[Asıl task/alan eşleştirmesi](../../docs/tasks/surat-kargo-integration-plan-2026-11-03.md).
