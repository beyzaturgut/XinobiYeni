# TST-268 — KIS-TEK-11 bağlı belge, araç ve ekran temizliği

Tarih: 10.11.2026. Taban: `2f3e431` (task 10). Kapsam: yeni tek kaynak iş akışını tek girişte toplama, tarihsel belge/araç ayrımı ve kalan eski ekran metinleri. Task 12 birleşik kabulü değildir.

## Teslim ve kabul kriterleri

| Kriter | Sonuç / kanıt |
|---|---|
| Tek güncel iş akışı | [Güncel rehber](../../docs/runbooks/single-source-personalization.md): görsel yükle → kaynağı indir → gerçek ölçülü maskeleme promptu → WebP yükle/incele/onayla. README ve ayrıntılı rehberler buraya bağlandı. |
| Fotoğraf üretimi ve çoklu fotoğrafa maske uygulama yok | Güncel maskeleme ekranında renk/toplu onay bulunmaması tarayıcıda doğrulandı. Promptun kullanılmayan color/variant dalı kaldırıldı, sourceRevision zorunlu. Fotoğraf üretmeme, gerçek tuval ve logo kuralları test edildi. |
| Eski ekran metinleri temiz | Kaynak değişiminde yeniden onaya kadar yeni önizlemenin kapanması; maske onayında yeni tasarımların güncel yüzeyi kullanması açıklanır. Eski sipariş dosyalarının korunması belirtilir. |
| Tarihsel kanıtlar korunur | Eski fotoğraf üretimi, aile transferi, renk hizalama, eski WebP/PNG ve QA belgelerine tarihsel üst bilgi eklendi. Tarihli test/PDF/medya/manifest değiştirilmedi. |
| Çağıran kontrolü olmadan rota/kod kaldırılmaz | [Envanter](../../docs/reports/single-source-workflow-inventory-2026-11-10.md): publisher/dev-local/package-iis; importer/fixture; local-editor/family/checkpoint; legacy okuyucular incelendi. Kullanılan modüller/rotalar korundu. |
| Normal katalog / fiyat / stok / kargo etkisi açık | Görsel renk seçimi ve ticari SKU ayrı; normal alışveriş ve sağlayıcı ayarları değiştirilmedi. Gerçek kayıt yazılmadı. |

## Bu teslimde çalıştırılan kontroller

- `pnpm --filter admin lint`: PASS; sıfır hata, önceden mevcut `AuditHistory.tsx` react(set-state-in-effect) uyarısı aynı.
- `pnpm --filter admin build`: PASS; TypeScript + Vite üretim derlemesi.
- Legacy QA `plan()` salt bellek içi kontrolü: 7 servis, offline modda tüm API dış generation/segmentation bayrakları false; süreç başlatılmadı veya ağ isteği yapılmadı.
- `node --check` start-xinobi-qa.cjs, import-xinobi-u-fixtures.cjs ve single-source-mask.mjs: PASS.
- `node --test tools/export-single-source-previews.test.mjs tools/publish-product-previews.test.mjs`: **5 PASS / 0 FAIL**. Yeni ürün yayını kimlik/hash/boyut/onay değişimi, güvenli origin; eski 8 varyant fixture yayını/stale kaldırma regresyonu. Yalnız mock HTTP ve geçici çıktı dizini.
- İzole tarayıcı `apps/admin/tests/single-source-mask.mjs`: PASS; yükle/onay/indir, prompt/gerçek ölçü, kaynak değişimi, bozuk/eksik dosya, servis hatası, yetki, responsive/%200 ve axe. Kaynak indirmesi birebir bayt eşliği; eski fotoğraf/renk promptu yok. Yeni onay mesajı doğrulandı.
- İzole tarayıcı `apps/admin/tests/personalization-source.mjs`: PASS; SKU eşlemesi, değişiklik koruması, kayıt hatasında taslak koruma, bozuk başarı reddi, yükle/indir, readonly, eski kaynak ve responsive/%200. Her iki eski fotoğraf prompt girişinin yokluğu doğrulandı.
- Yeni/değişen Markdown yerel dosya bağlantıları denetlendi; 61 bağlantı PASS, kırık yeni bağlantı yok. `git diff --check`: PASS.

Tarayıcı komutları `--import ./apps/admin/tests/helpers/isolated-browser.mjs` ile ve `ADMIN_UI_URL=http://127.0.0.1:5173/` üzerinde çalıştı. Mock fixture dışında API/veri veya harici sağlayıcı isteği yapılmadı. Görsel inceleme: `/tmp/xinobi-single-mask-ui/mask-320-2x.png` ve `mask-1440.png`; 320 px/%200 metinde tek kaynak, prompt, yükleme ve onay akışı okunabilir. Ekran görüntüleri yerel geçici çıktıdır.

Loglar: `/tmp/task11-admin-lint.log`, `/tmp/task11-admin-build.log`, `/tmp/task11-tools.log`, `/tmp/task11-admin-mask.log`, `/tmp/task11-admin-source.log`. Kalıcı sonuç özeti bu rapordadır; geçici loglar repoya eklenmez.

## Sınırlar ve sıradaki iş

API wire sözleşmesi, SQL DDL, Flutter/web davranışı ve entegrasyonlar değişmediği için bu dar teslimde tam API/Flutter/web derleme paketi yeniden çalıştırılmadı. TST-267'nin 623 API / 302 Flutter / 7 web sonuçları önceki teslimin kanıtıdır; bu taskın yeni testi olarak sayılmadı.

Task 12: birleşik tek kaynak regresyonu. Gerçek kaynak/SKU seçimi, veri geçişi/restore, SQL çoklu süreç/IIS, Android/iOS fiziksel cihaz, VoiceOver/TalkBack ve iş sahibi kabulü açık. 23 ürün içeriği ve SKU 117 fiyatı açık. Kargo sağlayıcı kabulü/ödeme ayrı bağımlılıklardır. Deploy/release/APK ve gerçek veri yazımı yok.
