# DEPLOY-012 — Mobil editör ve sipariş önizlemesi

- Tarih/saat: 25.10.2026 19:16 Europe/Istanbul; sorumlu: Codex (hazırlık).
- Durum: **HAZIRLANDI**. Sunucuda yayın, geri alma veya hosting ayarı değişikliği yapılmadı.
- Kaynak: `main`, `902066f261a13f9a217dd7e8ec943d67a0a38b68`; temiz kaynak ağacı.
- Hedef: mevcut test sunucusu 109.104.120.91; IIS `XinobiYeni`, web/admin
  `C:\inetpub\wwwroot\XinobiYeni\XinobiDeploy\out` (HTTP 8014, HTTPS 443);
  IIS `XinobiYeniApi`, `C:\inetpub\wwwroot\XinobiYeniApi\api` (HTTP 8024).
- Tür: birleşik web/admin/API release ZIP ve Android release APK.
- Komutlar: `node tools/build-apk.mjs`, `node tools/package-release.mjs`.

| Artefakt | Bayt | SHA256 |
| --- | ---: | --- |
| `paketler/releases/xinobi-902066f/xinobi.zip` | 261636691 | `37c6f59d4fd1d0789eececbc2e06dd5f1611c7dc264b7664b717b8895e64917b` |
| `paketler/apk/XinobiYeni-mobile-902066f.apk` | 69389175 | `a27a8a30e752104f2b2ecd14ed5d6c3bddb9cae5dfc9def0a7469fde0a95b9c5` |

APK API: `http://109.104.120.91:8024`; paylaşılan web önizleme: `http://109.104.120.91:8014`.
ZIP hash'i yan dosyayla, içindeki release.json ise kaynak commit ile doğrulandı.
Release henüz GitHub Releases'a yüklenmedi; yükleme komutu:
`node tools/publish-release.mjs xinobi-902066f`.

- Değişiklik: ürünsüz editör girişinde ürün seçimi; siparişte sahipliğe bağlı kalıcı
  ürün önizlemesi, tam ekran ve iki parmakla büyütme. Yeni web önizlemeleri 1440 piksele
  kadar korunur; 2 MB JPEG sınırı uygulanır. Önceki prompt düzeltmesi de dahildir.
- Kontroller: 71 testlik mobil paket geçti; ardından eklenen eski-sipariş senaryosunu
  içeren 3 önizleme testi geçti. Flutter analyze temiz. 19 API testi, 4 görsel kayıt
  testi ve web TypeScript/production build başarılı. Fiziksel Android testi yapılmadı.
- HTTP/HTTPS canlı smoke: uygulanmadı; henüz yayın yok.
- Veritabanı: migration gerekmiyor ve uygulanmadı. Eski kompozisyonlar geriye dönük
  üretilmez; kayıtlı revizyon varsa kullanılır, yoksa temsili/eksik önizleme açıklanır.
- Öncesi yedek/geri alma: henüz yeni sunucu yedeği alınmadı. Gerçek yayında güncel
  deploy-release.ps1 mevcut web/API klasörlerini `*-previous-<tarih>` olarak saklamalı;
  ürettiği deployment.json kaydı ve sunucu doğrulamaları bu hazırlık kaydına eklenmeli.
