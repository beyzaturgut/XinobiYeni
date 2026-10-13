# XINOBI U tasarım yönü ve cevap kuralları

13.10.2026 tarihinde proje sahibinin istediği iki iyileştirme uygulandı: Xinobi görsel stilleri ve cevaplardan somut tasarım kuralları üretimi. İstem sürümü `xinobi-art-direction-1`.

## Dört görsel stil

| Yön | Mevcut cevaplardan seçim | Tasarım dili |
| --- | --- | --- |
| Sade geometrik | Minimal, geometrik, retro; botanik olmayan İskandinav | Kontrollü çizgi, temiz şekiller, ölçülü boşluk. Retro ve İskandinav seçimlerinin kendi çizgi karakteri korunur. |
| Zarif botanik | Orman/bahçe ilhamıyla suluboya, gravür veya İskandinav | Sade yaprak/taç yaprak, ince dal, kontrollü organik yerleşim. |
| Japon esintili | Mürekkep; botanik olmayan gravür | Az sayıda okunabilir mürekkep çizgisi, kontrollü fırça ritmi, boşluk. Seçilen doğa teması korunur. |
| Akışkan soyut | Soyut; botanik olmayan suluboya | Geniş organik kıvrımlar, ölçülü katmanlar, okunabilir konturlar. |

Bu stiller mevcut beş sorudan türetilir; yeni ekran veya ek soru yoktur. Doğa seçimi bir manzara fotoğrafı yerine motif sözlüğünü belirler: dalga çizgisi, yaprak, dağ konturu, kum kıvrımı gibi. Kullanıcının suluboya, gravür veya retro tercihi ayrıca çizgi/doku kurallarıyla korunur.

## Çelişmeyen kurallar

- Minimal ve İskandinav: en fazla üç renk, bir motif ailesi, en fazla iki motif ölçeği. Zengin/katmanlı yoğunluk seçilirse küçük karmaşık detaylar yerine basit motiflerin ritmi artar; %45–55 sakin zemin ve en fazla tek şekil katmanı istenir.
- Diğer stiller: seçilen paletten en fazla dört renk. Palet sırası sabittir; minimal seçiminde dördüncü renk eklenmez. Monokrom: beyaz zemin ve kömür grisi, renkli vurgu yoktur.
- Seyrek: %65–75 sakin zemin. Dengeli: %40–50. Zengin: %20–30 ve düzenli motif grupları.
- Tek odak: merkez bölgesinde tek ana motif ve %60–70 sakin zemin; zorunlu tekrar/döşeme yoktur.
- Akış: iki veya üç geniş diyagonal yol. Tekrar: karşı kenarları eşleşen düzenli desen. Asimetri: boşlukla dengelenmiş kaydırılmış gruplar. Katman: en fazla iki okunabilir katman.
- Ruh hâli çizginin ritmini, formu ve kontrastı değiştirir; renk sınırını veya yoğunluk kararını aşamaz.
- Tüm yönler düz iki boyutlu tasarım ister. Ürün maketi, perspektif, sahte metal yansıması, yazı ve logo istenmez. Mevcut içerik sınırları korunur.

Yüzdeler ve renk sınırları modele verilen tasarım talimatlarıdır; üretilmiş pikselleri ölçen veya düzelten bir kalite filtresi değildir. Güzel sonuç garantisi verilmez. Gerçek kalite, aynı cevaplarla üretilmiş örnekler ürün üzerinde karşılaştırılarak değerlendirilmeli.

## Uygulama ve doğrulama

`DesignArtDirection` sunucuda sabit seçenek kimliklerini kurallara çevirir. Soru sırası ve rastgele görünen seçenek ifadeleri sonucu değiştirmez. `QuestionBank.BuildPrompt` her eksenin tam bir kez bulunmasını ve cevabın o oturuma ait olmasını doğrular.

Yeni üretim kuyruğa alınırken tamamlanan istemle birlikte `GenerationPromptVersion` saklanır. Mevcut üretilmiş görseller yeniden üretilmez; kayıtlı eski istemler korunur. Banka sürümü, model, dört adımlı üretim, tek görsel sonucu, kota ve aynı isteğin tekrar üretim yapmaması davranışı değişmedi. SQL katalog ve ürün görsellerinde değişiklik yoktur.

19 izole test geçti. Testler dört yönü, minimal/yoğunluk çakışmasını, tek odak/monokrom kurallarını, sıra bağımsızlığını ve geçersiz cevapları kapsar. Bankanın 32.768 cevap kombinasyonunun tümünde kurallar çözümlenebildi ve istemler sağlayıcının 2.048 karakter sınırına sığdı. Üretim testleri sahte görsel sağlayıcısıyla çalıştı; ücretli AI çağrısı veya görsel kalite değerlendirmesi yapılmadı.

Bu değişiklik kaynak koddadır; canlıya uygulanması için sonraki API dağıtımı gerekir. Bu çalışma kapsamında ZIP oluşturulmadı.
