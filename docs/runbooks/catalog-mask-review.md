# Development catalog mask review

> **10.11.2026 — Tarihsel / uyumluluk kaydı.** Aşağıdaki eski adımlar yeni tek kaynak akışının talimatı veya kabul kanıtı değildir. Güncel giriş: [tek kaynak kişiselleştirme](single-source-personalization.md). Fotoğraf üretimi, renkler arası hizalama ve çoklu fotoğrafa maske uygulama yeni akışta yoktur. Eski kayıtlar/dosyalar ve test kanıtları korunur; kaldırılmış yazma uçları kullanılmaz.


No inference occurs on startup, product selection, reads or approval. Real segmentation requires the existing `--roboflow` runtime opt-in and explicit Admin confirmation of image transmission and possible credits. Cloudflare remains separately enabled by `--cloudflare`; its application daily cap stays disabled. Do not restart occupied QA ports automatically.

The launcher now expects the local API build in `services/api/App_Data/integration-runtime/catalog-generic-api/`. Build with OpenAPI generation disabled before a permitted restart:

```powershell
dotnet build services/api/Xinobi.Api.csproj -c Release -p:OpenApiGenerateDocumentsOnBuild=false -o services/api/App_Data/integration-runtime/catalog-generic-api
node tools/start-xinobi-qa.cjs --cloudflare --roboflow
```

Admin: http://127.0.0.1:5176/ — use the existing ProductSurface review catalog selector, choose the exact product and variant, enter the target, then explicitly request a catalog mask. Review its real/mock provenance. Edit the pending candidate; supply a source-aligned branding PNG containing original source pixels where protection is needed. Review metal boundaries and branding before explicit approval. Saving a draft never activates it. Previously accepted versions can be explicitly restored.

Customer: http://127.0.0.1:3032/xinobi-u/ — both own-image and generated-pattern previews resolve only the exact selected variant's validated acceptance. Unsupported, stale or corrupt masks fail closed.

Storage is isolated under `services/api/App_Data/catalog-surface-review`: persistent one-attempt records, immutable pending candidates, corrected drafts, immutable accepted versions and an atomic current-version pointer. Approval revalidates current catalog source SHA/version/dimensions, mask integrity, original-candidate bounds and branding exclusion. Source images and existing CM101 acceptance are not overwritten. Restoring the legacy CM101 acceptance changes only the new registry pointer.

Sources must be validated local-commerce image filenames, at most 20 MiB, 6000 pixels per side and 20 million decoded pixels. Larger or unsupported sources are rejected explicitly. Generic cylindrical fitting uses the existing canonical algorithm; products needing different geometry still require visual review. Mock masks exercise integration only and never prove real segmentation quality.

Verification: `node tools/test-catalog-surface-flow.cjs` exercises an isolated EC501 source copy with mocked HTTP, manual correction, explicit approval, immutable versions/rollback and both customer preview paths. It never sends inference requests or alters the received catalog/CM101 approval.

## Readiness and protection review

Admin lists every catalog variant with source, candidate, accepted-version and integrity status. Select a row to open the existing workflow. Only exact, current validated acceptance is customer-ready; products without personalization eligibility remain unavailable.

In the generic editor, use Koruma ekle / Koruma kaldır to paint locked protection regions. Export uses original source pixels, never the orange editing overlay. Protection changes support undo/redo; Add remains restricted to the original candidate. Save a new pending draft, open Kaydedilmiş taslağı koruma deseninde test et, inspect the canonical stress-pattern preview and run Piksel kontrollerini çalıştır. Zero outside-mask, branding and alpha differences plus nonzero artwork coverage are required. The server binds the browser pixel-check result to the revalidated exact saved bytes/version; any edit invalidates it. This is development review evidence, not a substitute for manual boundary inspection. Approval remains explicit and does not replace history. Synthetic approvals are rejected in normal storage; only isolated automated test storage can exercise mock acceptance.

Existing CM101 acceptance and renderer are preserved. After source changes, corrupt assets or invalid protection, customer reads fail closed. New handler activation requires an explicitly permitted restart of the D: mask server only.
