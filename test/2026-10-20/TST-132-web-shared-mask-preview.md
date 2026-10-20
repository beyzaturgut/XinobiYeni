# TST-132 — Web önizlemede ortak onaylı maske

20.10.2026 · Faz06 · Yerel.

## Sorun

- Normal yerel kurulumda (web :3000, API :5003, aynı-origin proxy kapalı) web onaylı maske bilgisini kendi adresinden istiyordu; istek 404 aldı ve AI tasarımı ürüne giydirilmedi.
- XINOBI U önizlemesinde renk değiştirince yerleşim aktarımı yalnız iki gövdeli (CM 101 tipi) maskeyi kabul ettiği için tek gövdeli ortak maskede her renk "Güvenli yerleşim aktarımı yapılamadı" ile reddedildi.

## Değişiklik

- `accepted-surface-api.ts`: commerce API adresi mutlaksa ortak maske bilgisi ve görselleri doğrudan o origin'den istenir (CORS yerel web origin'ine izin verir). Proxy açıkken davranış aynı.
- `accepted-surface-editor.tsx`: hedef renk aynı maske SHA'sını ve boyutunu kullanıyorsa aktarım atlanır, yerleşim aynen korunur. Farklı maskeli ürünlerde eski aktarım sürer.

## Kontroller

- Web tür denetimi hatasız.
- Chrome :3000 → Demo Tasarım gümüş ve kırmızı için maske bilgisi alındı; kaynak ve maske 1333×2000, piksel okunabilir.
- Gerçek Demo Tasarım oturumuyla `/xinobi-u/onizleme/`: 5 renk düğmesinin her biri seçildi, uyarı yok; Metalik Kırmızı'da tasarım maskeli gövdede görüldü.
