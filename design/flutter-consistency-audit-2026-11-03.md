# Flutter–web tasarım ve davranış eşliği — 03.11.2026

Kapsam: yalnız `apps/mobile` (native Flutter). Başlangıç `main / b608d46`; Faz00/02/11, [120 task planı](../docs/tasks/project-closure-2026-10-30.md) (MOB-06, QA-03) ve [web tutarlılık denetimi](web-consistency-audit-2026-10-30.md) (C01–C11) referans alındı. Web/admin/API/hosting/deploy değişmedi; APK yayımlanmadı.

## Yöntem ve sınırlar

- Web denetimindeki istek durumları (yüklenme / boş / hata + tekrar dene / teyitli başarı, taslak koruma, işlem kilidi) Flutter ekranlarında kaynak üzerinden karşılaştırıldı.
- **Widget matrisi:** 26 oturum açık + 6 oturum kapalı rota × 320/390/700 px × 1x/2x metin = 192 hücre. Inter ve MaterialIcons yüklü; taşma veya istisna hücreyi düşürür. Bu ölçek doğrusaldır. Android 14+ doğrusal olmayan ölçeği ayrı bir testte taklit edildi.
- **Android:** Pixel_8 emülatörü (Android 15, `sdk_gphone64_arm64`), debug APK ve yerel API 5003. Yalnız oturum kapalı akışlar ve OS yazı ölçeği 1.0/2.0 denendi. Kullanıcının yerel veritabanında yeni hesap açılmadığı için oturum açık akışlar cihazda değil, yalnız widget testlerinde doğrulandı.
- **iOS:** Bloke. Bu Mac'te yalnız CommandLineTools var; Xcode ve simülatör olmadığı için iOS derlenemedi ve çalıştırılamadı.
- Gerçek telefon, TalkBack/VoiceOver, gerçek ödeme/push ve Creative/UX handoff bu çalışmanın kapsamında değildir.

## Ekran matrisi

K = kontrol edildi, D = düzeltildi. "Android" sütunu emülatör kanıtıdır; "iOS" sütunu her satırda Bloke'dur (Xcode yok).

| Ekran (rota) | Web karşılığı | Sonuç | Android emülatör | iOS |
|---|---|---|---|---|
| Ana sayfa `/` | `/` | K — matris; de99958 düzeni korunur | K 1x | Bloke |
| Ürünler `/urunler` | `/urunler/` | D — ızgara yüksekliği metin ölçeğiyle büyür; kalp oturum kapalıyken girişe götürür | D 1x/2x | Bloke |
| Ürün detayı `/urunler/:id` | `/urunler/detay/` | D — favori işlemi hesap API'si, hata bildirimi | — | Bloke |
| XINOBI U `/xinobi-u` | `/xinobi-u/` | D — CTA'lı kart %200'de sığar | K 2x | Bloke |
| Sepet `/sepet` | `/sepet/` | D — boş durum kaydırılabilir; adet/Kaldır satırı taşmaz | K 2x (boş) | Bloke |
| Ödeme `/odeme` | `/odeme/` | K — katalog/adres hata kapısı zaten vardı | — | Bloke |
| Favoriler `/favoriler` | `/favoriler/` | D — hesap listesi; giriş / yükleniyor / hata / boş ayrımı; temizlemede onay | K oturum kapalı | Bloke |
| Hesap, profil, parola, e-posta, sil | `/hesap/` | K — matris | — | Bloke |
| Adresler, yeni, düzenle | `/hesap/adresler/` | D — silme onayı, teyitli başarı, liste hatası ≠ "bulunamadı", rozet sarılır | — | Bloke |
| Siparişler, detay | `/hesap/siparisler/` | D — seçenek hatası + tekrar dene; iptal başarı bildirimi; satır tutarı adın altında | — | Bloke |
| İade `/hesap/siparisler/:id/iade` | `/hesap/siparisler/iade/` | D — koşullar gelmeden "iade edilemez" denmez; bilinmeyen siparişte sonsuz yükleme yok | — | Bloke |
| Bildirimler | `/hesap/bildirimler/` | D — okundu işaretleme kilidi, hata/başarı bildirimi, giriş düğmesi | — | Bloke |
| Tasarımlarım | `/hesap/tasarimlarim/` | D — yeniden adlandırmada taslak korunur; silme hatası gösterilir; 320 px'te tek sütun; menü | — | Bloke |
| Teklif, takip, tekliflerim | `/kurumsal/teklif/…` | K — matris | — | Bloke |
| Nobi `/nobi` | Nobi | K — matris | — | Bloke |
| Duyurular, karşılaştır, giriş, parola sıfırla | ilgili | K — matris | K giriş | Bloke |

## Kusurlar

| ID / öncelik | Durum / tekrar adımı | Düzeltme |
|---|---|---|
| M01 P1 | Favoriler yalnız cihazda tutuluyordu; web ise hesaba bağlı (`/me/favorites`) | Hesap API'si; eski cihaz listesi girişte taşınır (yayından kalkanlar atlanır); oturum kapalıyken giriş istenir, girişten sonra ürün kaydedilir |
| M02 P1 | Beklenmeyen hata, ham teknik metinle gösteriliyordu | `UserFacingException`; diğer hatalar genel bir cümleyle gösterilir |
| M03 P1 | İade: seçenek servisi hata verince ekran sonsuza kadar yükleniyordu | Hata + tekrar dene; sipariş bulunamazsa mesaj |
| M04 P2 | Sipariş detayı: seçenekler gelmeyince iptal/iade sessizce kayboluyordu | Açık mesaj + tekrar dene; iptal başarı bildirimi |
| M05 P2 | Bildirim okundu işaretleme hatası yutuluyordu, çift dokunma kilidi yoktu | Kilit, hata/başarı bildirimi |
| M06 P2 | Adres onaysız siliniyordu; liste hatası "Adres bulunamadı" görünüyordu | Onay penceresi, başarı bildirimi, hata/tekrar dene |
| M07 P2 | Tasarım adı reddedilince yeni ad kayboluyordu; hata yakalanmıyordu | Kayıt pencere içinde yapılır; taslak ve neden görünür |
| M08 P1 | 390 px'te Tasarımlarım işlem satırı 25 px taşıyordu | Yeniden adlandır/sil menüye alındı; 48 px hedefler korundu |
| M09 P1 | %200 metinde ürün kartı, sepet, adres rozeti, sipariş satırı, boş/hata mesajları taşıyordu (matris ilk koşusu 11 hücre) | Metin ölçeğiyle büyüyen ızgara, OverflowBar, Wrap, kaydırılabilir mesajlar |
| M10 P1 | Android 14+ doğrusal olmayan yazı ölçeğinde ürün adı yarıda kesiliyordu (emülatörde görüldü; doğrusal testler kaçırmıştı) | Yükseklik gövde metni ölçek oranıyla çarpılır; ad yüksekliğini ölçen test eklendi |
| M11 P2 | Cihaz anahtar deposu okunamazsa oturum durumu sonsuza kadar "yükleniyor"da kalıyordu | Çıkış yapılmış duruma düşer |

## Açık işler

| İş | Kapanış koşulu |
|---|---|
| iOS derleme ve çalıştırma | Xcode/simülatör veya cihaz; aynı matris iOS sütununa |
| Oturum açık akışların cihazda denenmesi | İzinli test hesabıyla Android/iOS'ta favori web↔mobil eşitlemesi, adres/sipariş/iade |
| Gerçek telefon, TalkBack/VoiceOver | Fiziksel cihaz tutanağı (QA-03) |
| Güncel APK/telefon kurulumu | Sahip isterse APK (MOB-HOME-02) |
| Creative/UX handoff, PM kabulü | Rol imzaları |

Teknik testlerin geçmesi faz, rol veya PM onayı yerine geçmez. Komutlar ve sonuçlar: [TST-196](../test/2026-11-03/TST-196-flutter-web-consistency.md).
