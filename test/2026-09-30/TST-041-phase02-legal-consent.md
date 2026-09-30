# TST-041 — Faz02 WEB-020 yasal/çerez tercih kabuğu

- Tarih: 2026-09-30
- Commit/branch: `main` / `406c892` sonrası çalışma ağacı

## Kapsam

- `/yasal` taslak belge merkezi, yayın uyarısı, veri sahibi hakları ve iletişim bekleme durumu.
- Tüm web rotalarında global tercih paneli; zorunlu, analitik ve pazarlama kategorileri.
- Ayarları yönet, yalnızca zorunlu, tümüne izin ver, paneli kapat ve yeniden aç durumları.

## Sonuç

- ESLint ve TypeScript başarılı.
- Next.js IIS static export başarılı; 23/23 sayfa üretildi.
- Yerel HTTP smoke testinde yasal merkez, D10 bekleme, yayın durumu, analitik çalışmama uyarısı ve tercih eylemleri doğrulandı.
- Uygulamada gerçek çerez, üçüncü taraf analitik/pazarlama betiği veya kalıcı rıza kaydı eklenmedi.

## Açık testler

- Gerçek tarayıcı klavye, ekran okuyucu, odak sırası, dar ekran ve panel taşma QA.
- D10/hukuk onayı sonrasında sürümlü metin, granular rıza, geri çekme, kayıt süresi ve sunucu kanıtı.
- Sağlayıcı envanteri tamamlandıktan sonra izin öncesi/sonrası ağ isteği ve çerez taraması.

## Deployment

Deployment yapılmadı; kullanıcı açıkça istediğinde hazırlanacak.
