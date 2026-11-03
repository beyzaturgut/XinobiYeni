# TST-243 | Sürat Kargo ilk sunucu adaptörü

03.11.2026. KRG-SUR-01 ilk kod dilimi: HTTP sözleşme/ortam katmanı. Tam entegrasyon kabulü değildir.

- Kaynak: Sürat klasöründeki gönderi/takip PDF sözleşmesi ve e-posta; önceki ayrıntılı planla eşleştirildi. Postman farklı oluşturma metodu kullanılmadı.
- Disabled varsayılan, sabit host, test/canlı hesap ayrımı, ayrıca canlı izin bayrağı, eksik ayarda fail-closed. HttpClient logları ve redirect kapalı; süre 20sn, tampon 2MiB.
- Kendi mağaza / normal koli / aynı ölçülü paket / COD yok ilk sözleşmesi; zorunlu alan, telefon, desi/kg, ödeme enum ve referans kontrolü. Sadece tam Tamam/Kayıt Edildi kabul; diğer sonuçlar ve timeout belirsiz, retry yok.
- Takip boş/servis hatası ayrımı, tüm belgeler ve ham hareket/tarih korunması, büyük ID string, kod7 inceleme, kod12 iade, bilinmeyen kod unknown. Sipariş statüsüne yazma veya bildirim yok.
- Odaklı ilk koşu 15/15 PASS. Ek testlerle son koşu 17/17 PASS. Tam API paketi: 531 PASS, 29 SKIP, 0 FAIL (560 toplam). Derleme ve OpenAPI üretimi başarılı; sözleşme dosyasında fark oluşmadı. Git diff --check PASS.
- Testler sahte HttpMessageHandler ve sentetik hesap/alıcı kullanır. Sağlayıcıya gerçek HTTP/ücretli/yan etkili istek, gerçek credential yapılandırması ve deploy yok.
- Açık: kalıcı referans/attempt/idempotency ve uygunluk, yetkili admin bağlantısı, etiket, polling/outbox, müşteri DTO, gerçek sandbox/whitelist, fiziksel barkod kabulü. Adaptör bu korumalar tamamlanmadan çağrılabilir sipariş ucuna bağlanmadı.
- Ham takip verisi iç kullanım içindir; müşteri DTO olarak doğrudan yayınlanmaz. Sağlayıcı query parolası için ortam APM/proxy redaksiyonu ayrıca doğrulanmalı. Gerçek SQL kabulü bu koşuda atlanan testlerle kanıtlanmadı.
