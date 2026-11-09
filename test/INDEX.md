# Test raporu indeksi

| Rapor ID | Tarih | Kapsam | Sonuç | Ortam/seviye | Rapor |
|---|---|---|---|---|---|
| TST-264 | 09.11.2026 | KIS-TEK-07 web tek kaynak: yöntem/yükleme/AI/önizleme, gerçek koordinatlar, responsive/%200/axe | PASS 16/16 + odaklı geri dönüş; lint/TS/build PASS | WEB / ISOLATED BROWSER | [Rapor](2026-11-09/TST-264-single-source-web.md) |
| TST-263 | 09.11.2026 | KIS-TEK-06 tek kaynak yayın, eski yazma uçlarının kaldırılması, RAM bütçesi, TS/Dart ve manifest | PASS API 615 / SKIP 29 / FAIL 0; Dart 10; tools 5 | API / CONTRACT / ISOLATED | [Rapor](2026-11-09/TST-263-single-source-publication.md) |
| TST-239 | 03.11.2026 | SIP-TAS-09 API kabul: kimlik/yerleşim/üç dosya eşliği düzenleme, silme, katalog/maske değişimi ve dosya deposu restart sonrası | PASS 16/16 | API / ISOLATED ACCEPTANCE | [Rapor](2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md) |
| TST-240 | 03.11.2026 | API tam paket + Release derleme + sözleşme | PASS 514 (29 atlandı; 17 SQL) | API / CONTRACT | [Rapor](2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md) |
| TST-241 | 03.11.2026 | Admin ekran kabulü 320/390/768/1440 × normal/%200, axe, klavye/odak/duyuru, üretim eylemi yok | PASS (1 tek seferlik taşma ölçümü raporda) | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md) |
| TST-242 | 03.11.2026 | Admin 18 + tools 4 regresyon, admin/web statik, web design-configuration e2e | PASS; web e2e 17/18 (bilinen kararsız test) | ADMIN / WEB | [Rapor](2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md) |
| TST-235 | 03.11.2026 | SIP-TAS-08 eski kayıt API fixture (doğrulanmamış eski kopyalar, saklanmayan dosyalar, 503≠eksik) + salt okunur dry-run envanteri | PASS 15/15; yazma yok | API / ISOLATED FIXTURE | [Rapor](2026-11-03/TST-235-sip-tas-08-legacy-records.md) |
| TST-236 | 03.11.2026 | API tam paket + sözleşme üretimi (değişiklik yok) | PASS 513, 29 atlandı | API / CONTRACT | [Rapor](2026-11-03/TST-235-sip-tas-08-legacy-records.md) |
| TST-237 | 03.11.2026 | Admin lint/TS/build | PASS; 4 eski uyarı | ADMIN / STATIC | [Rapor](2026-11-03/TST-235-sip-tas-08-legacy-records.md) |
| TST-238 | 03.11.2026 | Eski/eksik/kısmi kayıt Chrome matrisi (7 durum) + regresyonlar | PASS | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-235-sip-tas-08-legacy-records.md) |
| TST-231 | 03.11.2026 | SIP-TAS-07 dosya erişim matrisi (3 dosya × anonim/müşteri/başka müşteri/izinsiz/MFA'sız/süresi dolmuş; başka sipariş/satır; 404/503; açık medya sızıntısı) | PASS 13/13 | API / ISOLATED SECURITY | [Rapor](2026-11-03/TST-231-sip-tas-07-file-access.md) |
| TST-232 | 03.11.2026 | API tam paket + güvenlik alt kümesi | PASS 511 (29 atlandı); 36/36 | API / ISOLATED | [Rapor](2026-11-03/TST-231-sip-tas-07-file-access.md) |
| TST-233 | 03.11.2026 | Admin lint/TS/build | PASS; 4 eski uyarı | ADMIN / STATIC | [Rapor](2026-11-03/TST-231-sip-tas-07-file-access.md) |
| TST-234 | 03.11.2026 | Admin indirme durumları 21 Chrome senaryosu (kilit/odak/duyuru/tekrar dene/oturum) + regresyonlar | PASS | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-231-sip-tas-07-file-access.md) |
| TST-227 | 03.11.2026 | SIP-TAS-06 kompozisyon API fixture (revizyon/bayt/hash, desen silme, sonraki düzenleme, tekrar indirme, eksik/bozuk, yetki) | PASS 12/12 | API / ISOLATED FIXTURE | [Rapor](2026-11-03/TST-227-sip-tas-06-composition.md) |
| TST-228 | 03.11.2026 | API tam test paketi | PASS 510, 29 atlandı | API / ISOLATED | [Rapor](2026-11-03/TST-227-sip-tas-06-composition.md) |
| TST-229 | 03.11.2026 | Sözleşme + admin lint/TS/build + web tsc/eslint + Flutter analiz | PASS; 4 eski lint uyarısı | CONTRACT / STATIC | [Rapor](2026-11-03/TST-227-sip-tas-06-composition.md) |
| TST-230 | 03.11.2026 | Admin kompozisyon kartı Chrome fixture + regresyonlar; web design-configuration e2e | Admin PASS; web 16/18 (2 kararsız, baseline'da da düşüyor; değişiklikle 2/2 PASS) | ADMIN / WEB E2E | [Rapor](2026-11-03/TST-227-sip-tas-06-composition.md) |
| TST-223 | 03.11.2026 | SIP-TAS-05 ürün kaynak görseli indirme API fixture (katalog/renk/maske değişimi, bayt/hash, tür, tuval, yetki, eksik kaynak, yol aşımı/keyfi URL) | PASS 10/10 | API / ISOLATED FIXTURE | [Rapor](2026-11-03/TST-223-sip-tas-05-source-download.md) |
| TST-224 | 03.11.2026 | API tam test paketi | PASS 508, 29 atlandı | API / ISOLATED | [Rapor](2026-11-03/TST-223-sip-tas-05-source-download.md) |
| TST-225 | 03.11.2026 | Sözleşme + admin lint/TS/build + web/Flutter tüketici kontrolleri | PASS; 4 eski lint uyarısı | CONTRACT / STATIC | [Rapor](2026-11-03/TST-223-sip-tas-05-source-download.md) |
| TST-226 | 03.11.2026 | Ürün kaynak görseli kartı Chrome fixture + sipariş/tasarım regresyonları | PASS | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-223-sip-tas-05-source-download.md) |
| TST-219 | 03.11.2026 | SIP-TAS-04 ham desen indirme API fixture (bayt/hash, MIME/ad, satır/revizyon, yetki, silinmiş tasarım, eksik/bozuk dosya) | PASS 8/8 | API / ISOLATED FIXTURE | [Rapor](2026-11-03/TST-219-sip-tas-04-pattern-download.md) |
| TST-220 | 03.11.2026 | API tam test paketi | PASS 506, 29 atlandı | API / ISOLATED | [Rapor](2026-11-03/TST-219-sip-tas-04-pattern-download.md) |
| TST-221 | 03.11.2026 | Sözleşme + admin lint/TS/build + web/Flutter tüketici kontrolleri | PASS; 4 eski lint uyarısı | CONTRACT / STATIC | [Rapor](2026-11-03/TST-219-sip-tas-04-pattern-download.md) |
| TST-222 | 03.11.2026 | Admin indirme düğmesi Chrome fixture + sipariş/tasarım regresyonları | PASS | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-219-sip-tas-04-pattern-download.md) |
| TST-215 | 03.11.2026 | SIP-TAS-03 admin lint/TypeScript/derleme | PASS; 4 eski uyarı | ADMIN / STATIC | [Rapor](2026-11-03/TST-215-sip-tas-03-order-placement.md) |
| TST-216 | 03.11.2026 | Kayıtlı yerleşim Chrome fixture (revizyon, tuval, sıfır/eksik, bölge, şema, uzun metin, 320/390/1440 %200) | PASS | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-215-sip-tas-03-order-placement.md) |
| TST-217 | 03.11.2026 | Sipariş/tasarım admin regresyonları (7 dosya) | PASS | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-215-sip-tas-03-order-placement.md) |
| TST-218 | 03.11.2026 | Kayıtlı yerleşim temsilî ekran görüntüleri | PASS; sentetik veri | ADMIN / VISUAL | [Rapor](2026-11-03/TST-215-sip-tas-03-order-placement.md) |
| TST-211 | 03.11.2026 | SIP-TAS-02 siparişe bağlı dosya/revizyon fixture testleri (5 yeni + SavedDesign) | PASS 12/12 | API / ISOLATED FIXTURE | [Rapor](2026-11-03/TST-211-sip-tas-02-order-design-files.md) |
| TST-212 | 03.11.2026 | API tam test paketi | PASS 502, 29 atlandı | API / ISOLATED | [Rapor](2026-11-03/TST-211-sip-tas-02-order-design-files.md) |
| TST-213 | 03.11.2026 | Sözleşme üretimi/kontrolü + admin/web/Flutter tüketici kontrolleri | PASS | CONTRACT / STATIC | [Rapor](2026-11-03/TST-211-sip-tas-02-order-design-files.md) |
| TST-214 | 03.11.2026 | SIP-TAS-02 izole SQL kalıcılığı | AÇIK; izole SQL yok | SQL / NOT RUN | [Rapor](2026-11-03/TST-211-sip-tas-02-order-design-files.md) |
| TST-207 | 03.11.2026 | SIP-TAS-01 admin lint/TypeScript/derleme | PASS; 4 eski uyarı | ADMIN / STATIC | [Rapor](2026-11-03/TST-207-sip-tas-01-order-design-detail.md) |
| TST-208 | 03.11.2026 | Sipariş tasarım detayı odaklı Chrome fixture (4 genişlik, axe, %200, dosya durumları) | PASS | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-207-sip-tas-01-order-design-detail.md) |
| TST-209 | 03.11.2026 | Admin izole regresyonları (15 test dosyası + 4 tools senaryosu) | PASS; toplu runner takılması raporda | ADMIN / ISOLATED BROWSER | [Rapor](2026-11-03/TST-207-sip-tas-01-order-design-detail.md) |
| TST-210 | 03.11.2026 | Sipariş tasarım detayı temsilî ekran görüntüleri | PASS; sentetik veri | ADMIN / VISUAL | [Rapor](2026-11-03/TST-207-sip-tas-01-order-design-detail.md) |
| TST-206 | 03.11.2026 | 9 MostGate konu/açıklama/prompt dokümanı | PASS; 10 sayfa ve metin/görsel QA | DOCUMENT / PDF | [Rapor](2026-11-03/TST-206-mostgate-prompt-document.md) |
| TST-205 | 03.11.2026 | Sipariş tasarım detayı: 9 alt task/faz kapsam planı | PASS; uygulama yapılmadı | DOCUMENTATION / STATIC | [Rapor](2026-11-03/TST-205-order-design-scope-plan.md) |
| TST-204 | 03.11.2026 | Genel durum ve 13 ana iş PDF | PASS; 2 sayfa, görsel/metin kontrolü | DOCUMENT / PDF | [Rapor](2026-11-03/TST-204-project-status-pdf.md) |
| TST-203 | 03.11.2026 | Flutter eşlik bağımsız inceleme | 280/280 ve analiz PASS; 2 açık bulgu | REVIEW / ISOLATED | [Rapor](2026-11-03/TST-203-flutter-parity-review.md) |
| TST-196 | 03.11.2026 | Flutter analiz | PASS; sınırlar raporda | FLUTTER / WIDGET / STATIC | [Rapor](2026-11-03/TST-196-flutter-web-consistency.md) |
| TST-197 | 03.11.2026 | Flutter 13 istek durumu/favori testi | PASS; sınırlar raporda | FLUTTER / WIDGET / STATIC | [Rapor](2026-11-03/TST-196-flutter-web-consistency.md) |
| TST-198 | 03.11.2026 | Flutter 192 hücre ekran matrisi + doğrusal olmayan ölçek | PASS; sınırlar raporda | FLUTTER / WIDGET / STATIC | [Rapor](2026-11-03/TST-196-flutter-web-consistency.md) |
| TST-199 | 03.11.2026 | Flutter tam paket 280/280 | PASS; sınırlar raporda | FLUTTER / WIDGET / STATIC | [Rapor](2026-11-03/TST-196-flutter-web-consistency.md) |
| TST-200 | 03.11.2026 | Android emülatör oturum kapalı + OS %200 yazı | PASS; sınırlar raporda | ANDROID EMULATOR | [Rapor](2026-11-03/TST-196-flutter-web-consistency.md) |
| TST-201 | 03.11.2026 | iOS — BLOKE (Xcode/simülatör yok) | BLOKE | iOS / BLOCKED | [Rapor](2026-11-03/TST-196-flutter-web-consistency.md) |
| TST-202 | 03.11.2026 | Flutter belge/diff/upstream | PASS; sınırlar raporda | FLUTTER / WIDGET / STATIC | [Rapor](2026-11-03/TST-196-flutter-web-consistency.md) |
| TST-188 | 30.10.2026 | Admin 16 modül / 128 görünüm / 16 axe | PASS; sınırlar/ilk hatalar raporda | ADMIN / ISOLATED / STATIC | [Rapor](2026-10-30/TST-188-admin-consistency.md) |
| TST-189 | 30.10.2026 | Admin 48 giriş durumu / 15 odaklı senaryo | PASS; sınırlar/ilk hatalar raporda | ADMIN / ISOLATED / STATIC | [Rapor](2026-10-30/TST-188-admin-consistency.md) |
| TST-190 | 30.10.2026 | Admin 15 mevcut browser regresyonu | PASS; sınırlar/ilk hatalar raporda | ADMIN / ISOLATED / STATIC | [Rapor](2026-10-30/TST-188-admin-consistency.md) |
| TST-191 | 30.10.2026 | Admin ortak request | PASS; sınırlar/ilk hatalar raporda | ADMIN / ISOLATED / STATIC | [Rapor](2026-10-30/TST-188-admin-consistency.md) |
| TST-192 | 30.10.2026 | Admin TypeScript/production build | PASS; sınırlar/ilk hatalar raporda | ADMIN / ISOLATED / STATIC | [Rapor](2026-10-30/TST-188-admin-consistency.md) |
| TST-193 | 30.10.2026 | Admin lint: 0 error / 5 mevcut warning | PASS; sınırlar/ilk hatalar raporda | ADMIN / ISOLATED / STATIC | [Rapor](2026-10-30/TST-188-admin-consistency.md) |
| TST-194 | 30.10.2026 | Admin görsel inceleme | PASS; sınırlar/ilk hatalar raporda | ADMIN / ISOLATED / STATIC | [Rapor](2026-10-30/TST-188-admin-consistency.md) |
| TST-195 | 30.10.2026 | Admin belge/diff/upstream | PASS; sınırlar/ilk hatalar raporda | ADMIN / ISOLATED / STATIC | [Rapor](2026-10-30/TST-188-admin-consistency.md) |
| TST-179 | 30.10.2026 | Web rota/envanter ve kaynak inceleme | Ayrıntılı sonuç/sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-180 | 30.10.2026 | Web 264 rota/boyut/metin ve 33 axe | Ayrıntılı sonuç/sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-181 | 30.10.2026 | Web 19 izole durum/akış testi | Ayrıntılı sonuç/sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-182 | 30.10.2026 | Web tam regresyon paketi | PASS 97/97; sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-183 | 30.10.2026 | Web TypeScript/lint | Ayrıntılı sonuç/sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-184 | 30.10.2026 | Web production build 38 çıktı | Ayrıntılı sonuç/sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-185 | 30.10.2026 | Web görsel inceleme | Ayrıntılı sonuç/sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-186 | 30.10.2026 | 24 ürün/8 kategori gerçek readonly katalog | Ayrıntılı sonuç/sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-187 | 30.10.2026 | Web belge/diff/upstream | Ayrıntılı sonuç/sınırlar raporda | WEB / CHROME / STATIC | [Rapor](2026-10-30/TST-179-web-consistency.md) |
| TST-175 | 30.10.2026 | Faz task eşleme: 120 task / 11 ana faz / 16 commit | PASS | DOCUMENTATION / STATIC | `2026-10-30/TST-175-phase-closure-sync.md` |
| TST-176 | 30.10.2026 | Faz task eşleme: yerel link ve anchor | PASS | DOCUMENTATION / STATIC | `2026-10-30/TST-175-phase-closure-sync.md` |
| TST-177 | 30.10.2026 | Faz task eşleme: tarihsel kayıt ve kabul koruması | PASS | DOCUMENTATION / STATIC | `2026-10-30/TST-175-phase-closure-sync.md` |
| TST-178 | 30.10.2026 | Faz task eşleme: diff ve upstream | PASS | DOCUMENTATION / STATIC | `2026-10-30/TST-175-phase-closure-sync.md` |
| TST-170 | 30.10.2026 | Flutter ana sayfa analiz | PASS; sınırlar raporda | STATIC | `2026-10-30/TST-170-flutter-home-web-parity.md` |
| TST-171 | 30.10.2026 | Flutter ana sayfa 7 yerleşim/CTA kontrolü | PASS; sınırlar raporda | WIDGET | `2026-10-30/TST-170-flutter-home-web-parity.md` |
| TST-172 | 30.10.2026 | Flutter ana sayfa 79 test regresyon | PASS; sınırlar raporda | FLUTTER FIXTURE | `2026-10-30/TST-170-flutter-home-web-parity.md` |
| TST-173 | 30.10.2026 | Flutter ana sayfa 390px görsel kontrol | PASS; sınırlar raporda | WIDGET RENDER | `2026-10-30/TST-170-flutter-home-web-parity.md` |
| TST-174 | 30.10.2026 | Flutter ana sayfa diff/upstream | PASS; sınırlar raporda | STATIC / GIT | `2026-10-30/TST-170-flutter-home-web-parity.md` |
| TST-167 | 30.10.2026 | Mevcut staff request/refresh regresyonu | PASS; kapsam sınırları raporda | ISOLATED FETCH | `2026-10-30/TST-167-live-admin-login-diagnosis.md` |
| TST-168 | 30.10.2026 | Canlı admin anonim erişim teşhisi | PASS; kapsam sınırları raporda | READ-ONLY LIVE | `2026-10-30/TST-167-live-admin-login-diagnosis.md` |
| TST-169 | 30.10.2026 | Canlı admin Chrome ve IAB giriş ekranı | PASS; kapsam sınırları raporda | LIVE UI / NO LOGIN | `2026-10-30/TST-167-live-admin-login-diagnosis.md` |
| TST-157 | 30.10.2026 | KIS-01 48 hedefli API/ölçü/snapshot testi | PASS; sınırlar ve ilk hatalar raporda | ISOLATED / UNIT | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-158 | 30.10.2026 | KIS-01 tam API regresyonu | PASS; sınırlar ve ilk hatalar raporda | ISOLATED / SQL SKIP | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-159 | 30.10.2026 | KIS-01 sözleşme ve tekrar üretim | PASS; sınırlar ve ilk hatalar raporda | BUILD / CONTRACT | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-160 | 30.10.2026 | KIS-01 admin Chrome üç boyut ve readonly | PASS; sınırlar ve ilk hatalar raporda | CHROME MOCK | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-161 | 30.10.2026 | KIS-01 admin tip/lint/build | PASS; sınırlar ve ilk hatalar raporda | STATIC / BUILD | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-162 | 30.10.2026 | KIS-01 web lint/build | PASS; sınırlar ve ilk hatalar raporda | STATIC / BUILD | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-163 | 30.10.2026 | KIS-01 Dart analiz ve 9 test | PASS; sınırlar ve ilk hatalar raporda | STATIC / UNIT | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-164 | 30.10.2026 | KIS-01 Flutter analiz ve 72 test | PASS; sınırlar ve ilk hatalar raporda | STATIC / FIXTURE | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-165 | 30.10.2026 | KIS-01 yenilenen local web/admin/API | PASS; sınırlar ve ilk hatalar raporda | READ-ONLY LOCAL | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-166 | 30.10.2026 | KIS-01 diff ve upstream | PASS; sınırlar ve ilk hatalar raporda | STATIC / GIT | `2026-10-30/TST-157-kis01-print-profiles.md` |
| TST-150 | 30.10.2026 | WEB-07 mevcut 21 erişilebilirlik testi | PASS (ilk hatalar ve tekrarlar raporda) | CHROME FIXTURE / E2E | `2026-10-30/TST-150-web07-accessibility.md` |
| TST-151 | 30.10.2026 | WEB-07 52 rota/boyut, 27 benzersiz test; son odaklı tekrarlar | PASS (ilk hatalar ve tekrarlar raporda) | CHROME FIXTURE / AXE / KEYBOARD / 200% TEXT | `2026-10-30/TST-150-web07-accessibility.md` |
| TST-152 | 30.10.2026 | WEB-07 gerçek public katalog 15 axe taraması | PASS (ilk hatalar ve tekrarlar raporda) | READ-ONLY LOCAL / AXE | `2026-10-30/TST-150-web07-accessibility.md` |
| TST-153 | 30.10.2026 | WEB-07 lint ve TypeScript | PASS (ilk hatalar ve tekrarlar raporda) | STATIC | `2026-10-30/TST-150-web07-accessibility.md` |
| TST-154 | 30.10.2026 | WEB-07 production build, 38 sayfa | PASS (ilk hatalar ve tekrarlar raporda) | BUILD | `2026-10-30/TST-150-web07-accessibility.md` |
| TST-155 | 30.10.2026 | WEB-07 diff bütünlüğü | PASS (ilk hatalar ve tekrarlar raporda) | STATIC | `2026-10-30/TST-150-web07-accessibility.md` |
| TST-156 | 30.10.2026 | WEB-07 büyük metin DOM tanılaması | PASS (ilk hatalar ve tekrarlar raporda) | LOCAL DOM DIAGNOSTIC | `2026-10-30/TST-150-web07-accessibility.md` |
| TST-142 | 30.10.2026 | WEB-02 medya 107/110 -> üç yerel restore -> 110/110 | PASS | READ-ONLY HTTP / LOCAL MEDIA | `2026-10-30/TST-142-web02-product-detail.md` |
| TST-143 | 30.10.2026 | WEB-02 24 ürün, 79 renk, üç boyutta 237 kontrol | PASS | LOCAL CATALOG / E2E / GET FIXTURE | `2026-10-30/TST-142-web02-product-detail.md` |
| TST-144 | 30.10.2026 | WEB-02 renk/maske/yorum/kesinti 5+1 regresyon | PASS | CHROME FIXTURE / E2E | `2026-10-30/TST-142-web02-product-detail.md` |
| TST-145 | 30.10.2026 | WEB-02 TypeScript | PASS | STATIC | `2026-10-30/TST-142-web02-product-detail.md` |
| TST-146 | 30.10.2026 | WEB-02 tam web lint | PASS | STATIC | `2026-10-30/TST-142-web02-product-detail.md` |
| TST-147 | 30.10.2026 | WEB-02 üretim build, 38 sayfa | PASS | BUILD | `2026-10-30/TST-142-web02-product-detail.md` |
| TST-148 | 30.10.2026 | WEB-02 diff bütünlüğü | PASS | STATIC | `2026-10-30/TST-142-web02-product-detail.md` |
| TST-149 | 30.10.2026 | WEB-02 gerçek yüzey uygunluğu 30/30 | PASS | READ-ONLY LOCAL API | `2026-10-30/TST-142-web02-product-detail.md` |
| TST-136 | 30.10.2026 | WEB-01 gerçek katalog 24 ürün/8 kategori, üç boyut ve kenar durumları | PASS; ilk çerez paneli test engeli düzeltilip tekrarlandı | READ-ONLY LOCAL / E2E / GET FIXTURE | `2026-10-30/TST-136-web01-catalog-navigation.md` |
| TST-137 | 30.10.2026 | Mevcut katalog/arama/karşılaştırma 3 regresyon | PASS | CHROME FIXTURE / E2E | `2026-10-30/TST-136-web01-catalog-navigation.md` |
| TST-138 | 30.10.2026 | WEB-01 TypeScript | PASS | STATIC | `2026-10-30/TST-136-web01-catalog-navigation.md` |
| TST-139 | 30.10.2026 | WEB-01 tam web ESLint | PASS | STATIC | `2026-10-30/TST-136-web01-catalog-navigation.md` |
| TST-140 | 30.10.2026 | WEB-01 statik production build, 38 sayfa | PASS | BUILD | `2026-10-30/TST-136-web01-catalog-navigation.md` |
| TST-141 | 30.10.2026 | WEB-01 diff bütünlüğü | PASS | STATIC | `2026-10-30/TST-136-web01-catalog-navigation.md` |
| ADMIN-ACCEPT-20261019 | 19.10.2026 | Full isolated API/admin acceptance, price result and actual session permission display | 429 PASS / 24 SKIP; local SELECT test 1 PASS; signed-in browser SKIP | ISOLATED / CHROME FIXTURE / REAL SELECT | `2026-10-19/admin-technical-acceptance.md` |
| ADMIN-SQL-20261019 | 19.10.2026 | SQL recorded-row Dashboard summary, UTC ranges, privilege/fallback and generated contracts | PASS: 44 existing + 3 summary API; Dart 9; Chrome four widths; real authenticated browser acceptance not run | READ-ONLY LOCAL SQL / FIXTURE / CONTRACT | `2026-10-19/admin-sql-summary.md` |
| ADMIN-DATA-20261019 | 19.10.2026 | Dashboard/stok/ayar/entegrasyon doğrulanmış veri sınırları | PASS; API 44/44; real SQL writes/authenticated acceptance not run | CHROME FIXTURES / UNIT / READ-ONLY SQL | `2026-10-19/admin-data-honesty.md` |
| ADMIN-20261019 | 19.10.2026 | Isolated admin staff refresh, operation error/retry, navigation and SQL metadata | PASS; 53 API PASS / 2 SQL SKIP; authenticated SQL acceptance pending | MOCK FETCH / CHROME FIXTURES / READ-ONLY LOCAL SQL | `2026-10-19/admin-readiness-isolated.md` |
| TST-001 | 29.09.2026 | Başlangıçtan bugüne tüm doğrulama geçmişi | Kısmi başarılı; SQL dış erişimi bloke | LOCAL / CONNECTIVITY / MOCK | `2026-09-29/TST-001-initial-validation-history.md` |
| TST-002 | 29.09.2026 | Test raporu klasör ve kayıt bütünlüğü | Başarılı | LOCAL | `2026-09-29/TST-002-report-integrity.md` |
| TST-003 | 29.09.2026 | Docker'sız CI komut zinciri | Başarılı; bir yerel dizin çağrısı düzeltilerek tekrarlandı | LOCAL / CI CONTRACT | `2026-09-29/TST-003-ci-workflow.md` |
| TST-004 | 29.09.2026 | API health, request ID, Problem Details ve OpenAPI sözleşmesi | Başarılı; Release build 0/0, test 6/6 | INTEGRATION / CONTRACT | `2026-09-29/TST-004-api-contract-integration.md` |
| TST-005 | 29.09.2026 | Build-time OpenAPI, ortak TypeScript istemci ve CI drift kontrolü | Başarılı; ilk peer/şema sorunları düzeltildi, tüm regresyonlar geçti | UNIT / INTEGRATION / CONTRACT / CI CONTRACT | `2026-09-29/TST-005-openapi-typescript-client.md` |
| TST-006 | 29.09.2026 | TCP/IP etkinleştirme sonrası uzak SQL Server ve XinobiYeniDB tekrar bağlantısı | Bloke; 1433 timeout, named instance bulunamadı | CONNECTIVITY / INTEGRATION | `2026-09-29/TST-006-sql-server-connectivity-retry.md` |
| TST-007 | 29.09.2026 | OpenAPI Dart/Dio istemcisi ve Flutter paket entegrasyonu | Başarılı; ara jeneratör/analyzer sorunları düzeltildi, tam regresyon geçti | UNIT / INTEGRATION / CONTRACT / CI CONTRACT | `2026-09-29/TST-007-openapi-dart-flutter-client.md` |
| TST-008 | 29.09.2026 | API liveness ve gerçek SQL bağlantı probe'lu readiness ayrımı | Başarılı; .NET 9/9, istemci/web/panel ve mobil regresyonlar geçti | UNIT / INTEGRATION / CONTRACT / CI CONTRACT | `2026-09-29/TST-008-liveness-readiness.md` |
| TST-009 | 29.09.2026 | Kesin 1433 bilgisiyle dış SQL Server ve XinobiYeniDB bağlantısı | Bloke; TCP ve ODBC login timeout, kimlik doğrulamaya ulaşılamadı | CONNECTIVITY / INTEGRATION | `2026-09-29/TST-009-sql-1433-external-connectivity.md` |
| TST-010 | 29.09.2026 | Uzak sunucu TCP 64019 aday SQL portu | Başarılı; TCP bağlantısı kuruldu | CONNECTIVITY | `2026-09-29/TST-010-sql-external-port-64019.md` |
| TST-011 | 29.09.2026 | TCP 64019 üzerinden SQL Server ve XinobiYeniDB kimlik doğrulaması | Bloke; port erişilebilir, SQL login üç denemede reddedildi | CONNECTIVITY / INTEGRATION | `2026-09-29/TST-011-sql-login-on-64019.md` |
| TST-012 | 29.09.2026 | `xinobiyeni_app` ile uzak SQL Server ve XinobiYeniDB kimlik doğrulaması | Başarılı; veritabanı, login ve instance doğrulandı | CONNECTIVITY / INTEGRATION | `2026-09-29/TST-012-sql-login-xinobiyeni-app.md` |
| TST-013 | 30.09.2026 | Uzak SQL Server süreklilik ve metadata envanteri tekrar kontrolü | Bloke; SQL login öncesi ve ham TCP bağlantısında timeout | CONNECTIVITY / INTEGRATION | `2026-09-30/TST-013-sql-availability-recheck.md` |
| TST-014 | 30.09.2026 | Faz01 veri sahipliği ve durum geçişi teslim kontrolü | Başarılı; kapsam, açık karar ayrımı ve belge bağlantıları doğrulandı | DOCUMENT / CONTRACT | `2026-09-30/TST-014-phase01-data-state-document.md` |
| TST-015 | 30.09.2026 | Bildirilen tam `nc -vz 109.104.120.91 64019` komutuyla tekrar | Bloke; 30 saniyede yanıt yok, önceki süreli kontrolde timeout | CONNECTIVITY | `2026-09-30/TST-015-sql-exact-nc-retry.md` |
| TST-016 | 30.09.2026 | Faz01 iş sahibi karar formu kapsam kontrolü | Başarılı; D01–D10 ve kapanış alanları doğrulandı | DOCUMENT / CONTRACT | `2026-09-30/TST-016-stakeholder-decision-intake.md` |
| TST-017 | 30.09.2026 | Uzak SQL Server sürüm, şema, migration ve yetki envanteri | Başarılı; SQL 2022 Express, boş DB ve geçici db_owner yetkisi doğrulandı | CONNECTIVITY / INTEGRATION | `2026-09-30/TST-017-sql-environment-inventory.md` |
| TST-018 | 30.09.2026 | Faz02 tasarım sistemi ve responsive ana sayfa başlangıcı | Başarılı build/smoke; gerçek tarayıcı görsel QA bekliyor | STATIC / BUILD / SMOKE | `2026-09-30/TST-018-phase02-home-foundation.md` |
| TST-019 | 30.09.2026 | Faz02 WEB-002 responsive ürün kataloğu | Başarılı lint/build/HTTP smoke; browser interaction QA bekliyor | STATIC / BUILD / SMOKE | `2026-09-30/TST-019-phase02-product-catalog.md` |
| TST-020 | 30.09.2026 | Faz02 WEB-004 ürün detay ve dört renk varyantı | Başarılı lint/build/HTTP smoke; browser interaction QA bekliyor | STATIC / BUILD / SMOKE | `2026-09-30/TST-020-phase02-product-detail.md` |
| TST-021 | 30.09.2026 | Faz02 WEB-005 basit kişiselleştirme stüdyosu | Başarılı lint/build/HTTP smoke; browser interaction QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-021-phase02-simple-personalization.md` |
| TST-022 | 30.09.2026 | Faz02 WEB-006 gelişmiş editör araç ve katman kabuğu | Başarılı; ilk lint apostrof kaçışı düzeltildi, build/smoke geçti | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-022-phase02-advanced-editor.md` |
| TST-023 | 30.09.2026 | Faz02 WEB-003 arama ve karşılaştırma | Başarılı; ilk komut yolu düzeltildi, lint/build/smoke geçti | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-023-phase02-search-compare.md` |
| TST-024 | 30.09.2026 | Faz02 WEB-007 favoriler | Başarılı; ilk React effect lint hatası düzeltildi, build/smoke geçti | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-024-phase02-favorites.md` |
| TST-025 | 30.09.2026 | Faz02 WEB-008 sepet kabuğu | Başarılı lint/build/HTTP smoke; browser interaction QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-025-phase02-basket.md` |
| TST-026 | 30.09.2026 | Faz02 WEB-009 güvenli ödeme form kabuğu | Başarılı lint/build/HTTP smoke; gerçek sağlayıcı ve browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-026-phase02-checkout.md` |
| TST-027 | 30.09.2026 | Faz02 WEB-010 ödeme sonucu senaryoları | Başarılı lint/build/HTTP smoke; sağlayıcı/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-027-phase02-payment-result.md` |
| TST-028 | 30.09.2026 | Faz02 WEB-011 üyelik/oturum kabuğu | Başarılı; ilk JSX apostrof lint hataları düzeltildi, build/smoke geçti | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-028-phase02-account-access.md` |
| TST-029 | 30.09.2026 | Faz02 WEB-012 hesap/adres kabuğu | Başarılı lint/build/HTTP smoke; kimlik API ve browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-029-phase02-account-address.md` |
| TST-030 | 30.09.2026 | Faz02 WEB-013 sipariş/kargo takip kabuğu | Başarılı lint/build/HTTP smoke; D03/kargo API/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-030-phase02-orders-tracking.md` |
| TST-031 | 30.09.2026 | Faz02 WEB-014 iptal/iade form kabuğu | Başarılı lint/build/HTTP smoke; D03/D10/API/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-031-phase02-return-request.md` |
| TST-032 | 30.09.2026 | Faz02 WEB-015 kurumsal teklif formu | Başarılı lint/build/HTTP smoke; D07/dosya API/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-032-phase02-corporate-quote.md` |
| TST-033 | 30.09.2026 | Faz02 WEB-016 teklif takip/revizyon kabuğu | Başarılı lint/build/HTTP smoke; D07/API/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-033-phase02-quote-tracking.md` |
| TST-034 | 30.09.2026 | IIS statik yayın artefaktı | Artefakt başarılı; uzak IIS deployment erişim bekliyor | BUILD / STATIC EXPORT / DEPLOYMENT PRECHECK | `2026-09-30/TST-034-iis-static-export.md` |
| TST-035 | 30.09.2026 | DEPLOY-001 IIS sunucu içi ve dış bağlantı | Sunucu içi başarılı; dış TCP 8014 timeout | DEPLOYMENT / CONNECTIVITY / SMOKE | `2026-09-30/TST-035-iis-preview-connectivity.md` |
| TST-036 | 30.09.2026 | Firewall sonrası DEPLOY-001 dış HTTP smoke | Başarılı; üç rota HTTP 200, HTTPS bekliyor | DEPLOYMENT / CONNECTIVITY / SMOKE | `2026-09-30/TST-036-iis-external-http-smoke.md` |
| TST-037 | 30.09.2026 | Faz02 WEB-017 AI tasarım senaryo kabuğu | Başarılı; ilk görsel yolu build hatası düzeltildi, static export geçti | STATIC / BUILD / INTERACTION CONTRACT | `2026-09-30/TST-037-phase02-ai-design.md` |
| TST-038 | 30.09.2026 | Faz02 WEB-018 AI satış asistanı kabuğu | Başarılı lint/build/static smoke; sağlayıcı/browser QA bekliyor | STATIC / BUILD / SMOKE / INTERACTION CONTRACT | `2026-09-30/TST-038-phase02-ai-sales-assistant.md` |
| TST-039 | 30.09.2026 | Faz02 WEB-019 kurumsal/içerik kabuğu | Başarılı lint ve 22 sayfalık static export; iki ağ-kısıtlı deneme kayıtlı | STATIC / BUILD / CONTENT CONTRACT | `2026-09-30/TST-039-phase02-corporate-content.md` |
| TST-040 | 30.09.2026 | WEB-019 menü tipografi eşlemesi | Başarılı lint, TypeScript ve 22/22 static export | STATIC / BUILD / VISUAL TOKEN | `2026-09-30/TST-040-web019-menu-typography.md` |
| TST-041 | 30.09.2026 | Faz02 WEB-020 yasal/çerez tercih kabuğu | Başarılı lint, 23/23 static export ve kritik sınır smoke | STATIC / BUILD / CONSENT CONTRACT / SMOKE | `2026-09-30/TST-041-phase02-legal-consent.md` |
| TST-042 | 30.09.2026 | DEPLOY-002 güncel IIS tam paket bütünlüğü | Başarılı; 226 girdi, ZIP CRC ve SHA-256 doğrulandı | BUILD / STATIC EXPORT / DEPLOYMENT PRECHECK | `2026-09-30/TST-042-deploy-002-package.md` |
| TST-043 | 30.09.2026 | Faz02 ilk Chrome responsive görsel QA grubu | Kısmi başarılı; 1440/500 px geçti, iki taşma koruması düzeltildi, 390 px gerçek cihaz açık | BROWSER / RESPONSIVE / BUILD | `2026-09-30/TST-043-phase02-browser-responsive-qa-01.md` |
| TST-044 | 01.10.2026 | Faz02 ikinci Chrome responsive görsel QA grubu | Kısmi başarılı; altı rota 500 px görsel kontrolden geçti, interaction/gerçek cihaz açık | BROWSER / RESPONSIVE / VISUAL | `2026-10-01/TST-044-phase02-browser-responsive-qa-02.md` |
| TST-045 | 01.10.2026 | Faz02 üçüncü Chrome responsive görsel QA grubu | Başarılı görsel grup; yedi rota geçti, dört mobil header düzeltildi ve tekrar doğrulandı | BROWSER / RESPONSIVE / BUILD | `2026-10-01/TST-045-phase02-browser-responsive-qa-03.md` |
| TST-046 | 01.10.2026 | Faz02 dördüncü Chrome uzun sayfa görsel QA grubu | Başarılı; WEB-017–020 500 px uzun görünüm geçti, gecikmeli görsel yükleme ayrıştırıldı | BROWSER / RESPONSIVE / VISUAL | `2026-10-01/TST-046-phase02-browser-responsive-qa-04.md` |
| TST-047 | 01.10.2026 | Faz02 Playwright kritik etkileşim/klavye altyapısı | İlk koşu 2/3, fixture beklentisi düzeltildi; final 3/3 ve 23 rota build başarılı | E2E / KEYBOARD / BUILD | `2026-10-01/TST-047-phase02-playwright-critical-interactions.md` |
| TST-048 | 01.10.2026 | Faz02 Playwright kritik etkileşim kapsam genişletme | İlk koşu 7/8; belirsiz test seçicisi düzeltildi, final 8/8 başarılı | E2E / INTERACTION / KEYBOARD | `2026-10-01/TST-048-phase02-playwright-interactions-02.md` |
| TST-049 | 01.10.2026 | Faz02 Playwright kalan kritik etkileşimler | Ara koşular 11/13 ve 12/13; seçiciler düzeltildi, final 13/13, lint ve 23 rota build başarılı | E2E / INTERACTION / BUILD | `2026-10-01/TST-049-phase02-playwright-interactions-03.md` |
| TST-050 | 01.10.2026 | Faz02 otomatik erişilebilirlik ve klavye odağı | İlk tarama 4/22; kontrast ve ad sorunları düzeltildi, final a11y 22/22 ve birleşik E2E 35/35 başarılı | E2E / A11Y / WCAG / KEYBOARD / BUILD | `2026-10-01/TST-050-phase02-accessibility.md` |
| TST-051 | 01.10.2026 | Faz02 katalog, ürün, favori, ödeme ve kişiselleştirme etkileşimleri | İlk genişletilmiş koşu 15/18; seçiciler düzeltildi, final kritik 18/18 ve birleşik E2E 40/40 başarılı | E2E / INTERACTION / REGRESSION | `2026-10-01/TST-051-phase02-playwright-interactions-04.md` |
| TST-052 | 01.10.2026 | Ana sayfa, Xinobi dünyası ve yasal merkez navigasyon smoke | İç hedefler ve tüm dahili rota yanıtları başarılı; 3/3 | E2E / NAVIGATION / SMOKE | `2026-10-01/TST-052-phase02-navigation-smoke.md` |
| TST-053 | 01.10.2026 | Faz02 web bileşen sözleşmesi ve token eşliği | JSON geçerli; 10 sözleşme bölümü ve zorunlu durum/erişilebilirlik/karar işaretleri mevcut | DOCUMENT / DESIGN CONTRACT / A11Y | `2026-10-01/TST-053-phase02-component-contract.md` |
| TST-054 | 01.10.2026 | Faz02 web, panel ve Flutter kanal akış sözleşmesi | Başarılı; WEB 20/20, ADM 12/12, MOB 6/6 ve D02–D10 izlenebilir | DOCUMENT / DESIGN CONTRACT / FLOW TRACEABILITY | `2026-10-01/TST-054-phase02-channel-flows.md` |
| TST-055 | 01.10.2026 | Analiz2 yaratıcı/web tasarım ve CTO AI karar kapısının fazlara eklenmesi | Başarılı; K-01–K-21, kullanıcı tasarım onayları, AI-P01 ve ADR-001 sınırı planlandı | DOCUMENT / REQUIREMENTS / DECISION-GATE | `2026-10-01/TST-055-analysis2-plan-gap-update.md` |
| TST-056 | 01.10.2026 | Cloudflare Workers AI sağlayıcı ve Creative/Web Designer ortak tek tasarım kararı | Başarılı; ADR-002, Faz10 uygulama sınırı ve iki kullanıcı tasarım kapısı kayıtlı | DOCUMENT / ARCHITECTURE DECISION / DESIGN GOVERNANCE | `2026-10-01/TST-056-cloudflare-and-single-design-decision.md` |
| TST-057 | 01.10.2026 | Creative Designer ve Web Designer ortak tasarım başlangıç paketi | Başarılı; K-01–K-21 21/21, ortak art direction, medya/içerik rehberi ve WEB-001 responsive wireframe hazır | DOCUMENT / DESIGN TRACEABILITY / RESPONSIVE WIREFRAME | `2026-10-01/TST-057-shared-creative-direction.md` |
| TST-058 | 01.10.2026 | WEB-001 ortak yüksek doğruluklu HTML/CSS tasarım ve beş responsive render | Başarılı; her kırılımda 14/14 görsel, yatay taşma yok, Creative/Web QA revizyonları işlendi; etkileşim kabulü açık | DESIGN / BROWSER RENDER / RESPONSIVE / VISUAL QA | `2026-10-01/TST-058-web001-hifi-render.md` |
| TST-059 | 01.10.2026 | WEB-001 admin yönetimli alanların geçici/temsili içerik açıklamaları | Başarılı; dört içerik alanı etiketlendi, beş responsive renderda 14/14 görsel ve taşmasız görünüm | DESIGN / CONTENT GOVERNANCE / RESPONSIVE RENDER | `2026-10-01/TST-059-web001-admin-placeholder-labels.md` |
| TST-060 | 01.10.2026 | WEB-001 etkileşimli yerel tasarım prototipi | Başarılı; masaüstü mega menü/hero/Nobi, mobil drawer/carousel ve beş taşmasız responsive render doğrulandı | DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE | `2026-10-01/TST-060-web001-interactive-prototype.md` |
| TST-061 | 01.10.2026 | WEB-001 kullanıcı tasarım geri bildirimi 01 | Başarılı; görsel-only slider, kategori menüsü/rayı, inceltilmiş XINOBI U, küçük ürün görselleri ve Keşfet kaldırma doğrulandı | DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE | `2026-10-01/TST-061-web001-design-feedback-01.md` |
| TST-062 | 01.10.2026 | Ana sayfa ve admin slider geri bildirimi | Başarılı; header ayrımı, kategori dropdown, kişiselleştirme bannerı ve fotoğraf/video slider yönetimi doğrulandı | DESIGN / ADMIN UI / BROWSER / BUILD | `2026-10-01/TST-062-home-admin-slider-feedback.md` |
| TST-063 | 01.10.2026 | WEB-001 XINOBI U sabit CTA bannerı | Başarılı; sabit kalınlık, admin görsel alanı, sabit CTA rotası ve düzenlenebilir buton rengi doğrulandı | DESIGN PROTOTYPE / ADMIN UI / RESPONSIVE / BROWSER | `2026-10-01/TST-063-xinobi-u-fixed-cta-banner.md` |
| TST-064 | 02.10.2026 | WEB-001 slider ve XINOBI U banner yenilemesi | Başarılı; üç yeni slider görseli, yeni XINOBI U bannerı ve küçültülmüş CTA beş responsive boyutta doğrulandı | DESIGN PROTOTYPE / ADMIN UI / RESPONSIVE / BROWSER | `2026-10-02/TST-064-web001-banner-refresh.md` |
| TST-065 | 02.10.2026 | WEB-001 öne çıkan ürün hizalama | Başarılı; üç ürünün medya alanı, taban çizgisi ve bilgi satırları eşitlendi, mobil karusel korundu | DESIGN PROTOTYPE / BROWSER / RESPONSIVE / VISUAL | `2026-10-02/TST-065-featured-product-alignment.md` |
| TST-066 | 02.10.2026 | WEB-001 slider görsel yenilemesi 02 | Başarılı; hava temizleyici, kahve makinesi ve çay makinesi görsellerinin üçü de SHA-256 ve Chrome slider testiyle doğrulandı | DESIGN PROTOTYPE / ASSET INTEGRITY / BROWSER / RESPONSIVE | `2026-10-02/TST-066-slider-image-refresh-02.md` |
| TST-067 | 02.10.2026 | WEB-001 header ikonları ve Nobi robot işareti | Başarılı; üç ikonlu header, erişilebilir adlar, yeni robot sembolü ve Nobi etkileşimi beş responsive boyutta doğrulandı | DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE / ACCESSIBILITY | `2026-10-02/TST-067-header-icons-nobi-mark.md` |
| TST-068 | 02.10.2026 | WEB-001 ortak Nobi sembolü | Başarılı; launcher ve panel başlığı tek SVG robot kaynağına bağlandı, gelecek tüm Nobi temas noktaları için tasarım kuralı kaydedildi | DESIGN SYSTEM / BROWSER / INTERACTION / RESPONSIVE / VISUAL | `2026-10-02/TST-068-shared-nobi-symbol.md` |
| TST-069 | 02.10.2026 | WEB-001 Nobi tetikleyici boyutu | Başarılı; masaüstü ve mobil Nobi tetikleyicisi küçültüldü, panel simgesi korundu ve beş responsive boyutta doğrulandı | DESIGN PROTOTYPE / BROWSER / RESPONSIVE / INTERACTION | `2026-10-02/TST-069-nobi-launcher-size.md` |
| TST-070 | 02.10.2026 | Onaylı WEB-001 tasarımının gerçek Next.js ana sayfasına aktarılması | Başarılı; lint, 23 rota build, 43/43 E2E ve statik masaüstü/mobil görsel test geçti | BUILD / E2E / ACCESSIBILITY / RESPONSIVE / VISUAL | `2026-10-02/TST-070-production-homepage-integration.md` |
| TST-071 | 02.10.2026 | DEPLOY-003 güncel IIS tam paket bütünlüğü | Başarılı; doğru `out/` kökü, 233 girdi, ZIP CRC ve SHA-256 doğrulandı | BUILD / STATIC EXPORT / DEPLOYMENT PRECHECK | `2026-10-02/TST-071-deploy-003-package.md` |
| TST-072 | 02.10.2026 | Çerez tercihleri ve Nobi konum ayrımı | Başarılı; çerez düğmesi sol alta taşındı, masaüstü/mobil koordinat testi ve 43/43 regresyon geçti | UI REGRESSION / RESPONSIVE / E2E / VISUAL | `2026-10-02/TST-072-cookie-nobi-position.md` |
| TST-073 | 02.10.2026 | Mobil çerez paneli ve XINOBI U banner yerleşimi | Başarılı; 390/412 px konum, taşma ve tam kadraj testi ile 43/43 regresyon geçti; deploy alınmadı | UI REGRESSION / RESPONSIVE / E2E / VISUAL | `2026-10-02/TST-073-mobile-consent-personalize.md` |
| TST-087 | 06.10.2026 kayıt; önceki Step 1 koşusu | ProductSurfaces Step 1 odaklı xUnit | İlk Debug build dosya kilidiyle başarısız; Release tekrarında final 24/24 geçti | UNIT / MOCK / RETROSPECTIVE | `2026-10-06/TST-087-product-surfaces-step1-tests.md` |
| TST-088 | 06.10.2026 kayıt; önceki Step 1 koşusu | ProductSurfaces Step 1 Release API build | Başarılı; 0 uyarı / 0 hata; OpenAPI üretimi kapalı | BUILD / RETROSPECTIVE | `2026-10-06/TST-088-product-surfaces-step1-build.md` |
| TST-089 | 06.10.2026 kayıt; önceki Step 1 kontrolü | ProductSurfaces OpenAPI korunması | Başlangıç ve sonuç SHA-256 aynı; önceden mevcut değişiklik korundu | FILE INTEGRITY / RETROSPECTIVE | `2026-10-06/TST-089-product-surfaces-openapi-integrity.md` |
| TST-090 | 06.10.2026 | ProductSurfaces Step 2 decode/alpha ve Step 1 regresyon | İlk 37/37, iki ek edge-case sonrası final 39/39 başarılı; gerçek asset istatistikleri kaydedildi | UNIT / MOCK / REAL ASSET | `2026-10-06/TST-090-product-surfaces-step2-tests.md` |
| TST-091 | 06.10.2026 | ProductSurfaces Step 2 Release API build | 0 uyarı / 0 hata; OpenAPI üretimi kapalı | BUILD | `2026-10-06/TST-091-product-surfaces-step2-build.md` |
| TST-092 | 06.10.2026 | ProductSurfaces Step 2 dosya güvenliği | OpenAPI/source/mask checksum değişmedi; diff whitespace kontrolü başarılı | FILE INTEGRITY / DIFF | `2026-10-06/TST-092-product-surfaces-step2-integrity.md` |

| TST-093 | 06.10.2026 | ProductSurfaces Step 3 backend | Final başarılı; ilk deneme/tekrar kanıtları raporda | LOCAL / DEVELOPMENT | `2026-10-06/TST-093-product-surfaces-step3-backend.md` |
| TST-094 | 06.10.2026 | ProductSurfaces Step 3 api-build | Final başarılı; ilk deneme/tekrar kanıtları raporda | LOCAL / DEVELOPMENT | `2026-10-06/TST-094-product-surfaces-step3-api-build.md` |
| TST-095 | 06.10.2026 | ProductSurfaces Step 3 admin-types | Final başarılı; ilk deneme/tekrar kanıtları raporda | LOCAL / DEVELOPMENT | `2026-10-06/TST-095-product-surfaces-step3-admin-types.md` |
| TST-096 | 06.10.2026 | ProductSurfaces Step 3 admin-build | Final başarılı; ilk deneme/tekrar kanıtları raporda | LOCAL / DEVELOPMENT | `2026-10-06/TST-096-product-surfaces-step3-admin-build.md` |
| TST-097 | 06.10.2026 | ProductSurfaces Step 3 admin-lint | Final başarılı; ilk deneme/tekrar kanıtları raporda | LOCAL / DEVELOPMENT | `2026-10-06/TST-097-product-surfaces-step3-admin-lint.md` |
| TST-098 | 06.10.2026 | ProductSurfaces Step 3 admin-e2e | Final başarılı; ilk deneme/tekrar kanıtları raporda | LOCAL / DEVELOPMENT | `2026-10-06/TST-098-product-surfaces-step3-admin-e2e.md` |
| TST-099 | 06.10.2026 | ProductSurfaces Step 3 integrity | Final başarılı; ilk deneme/tekrar kanıtları raporda | LOCAL / DEVELOPMENT | `2026-10-06/TST-099-product-surfaces-step3-integrity.md` |
| TST-100 | 06.10.2026 | ProductSurfaces Step 4B-1 mocked HTTP | 111/111 backend/API, 5/5 Admin, build/type/lint/diff ve OpenAPI hash başarılı; gerçek inference yok | MOCK HTTP / LOCAL API / E2E / BUILD / INTEGRITY | `2026-10-06/TST-100-product-surfaces-step4b1-mocked-http.md` |
| TST-101 | 06.10.2026 | ProductSurfaces Step 4B-2 single automatic smoke | Tam 1 yetkili real call HTTP 200; aligned pending mask; 120/120 local backend, 5/5 Admin, build/hash başarılı; interactive/retry yok | AUTHORIZED REAL SMOKE / LOCAL VALIDATION / MOCK REGRESSION / VISUAL | `2026-10-06/TST-101-product-surfaces-step4b2-single-automatic-smoke.md` |
| TST-102 | 06.10.2026 | ProductSurfaces Step 4B-3 single interactive smoke | Tam 1 yetkili PVS HTTP 200; aligned pending mask + exact lineage; 126/126 backend, 5/5 Admin; automatic/retry yok | AUTHORIZED REAL INTERACTIVE SMOKE / MOCK REGRESSION / VISUAL | `2026-10-06/TST-102-product-surfaces-step4b3-single-interactive-smoke.md` |
| TST-103 | 06.10.2026 | ProductSurfaces Step 4C-2 Tea Maker opt-in refinement | 5718 enclosed pixels filled; raw/exterior/silhouette unchanged; 17 focused, 148 backend, 6 Admin passed; inference0 | LOCAL DETERMINISTIC / REAL LOCAL FIXTURE / API / E2E / BUILD / INTEGRITY | `2026-10-06/TST-103-product-surfaces-step4c2-tea-maker-refinement.md` |

| TST-104 | 06.10.2026 | ProductSurfaces Step 4D-2 minimal local Add/Remove correction | 21 focused, 169 backend/API, 10 Admin passed; immutable pending derivation; local bottom QA +88px; inference0 | LOCAL HUMAN / RASTER / API / E2E / BUILD / INTEGRITY | `2026-10-06/TST-104-product-surfaces-step4d2-local-correction.md` |
| TST-105 | 06.10.2026 | ProductSurfaces Step 5B development accepted-surface renderer bridge | 18 focused /187 backend, 15 bridge-renderer +6 existing web tests passed; exact manual/source/branding; inference0 | LOCAL MEDIA / API / WEB / PIXEL / E2E / BUILD / INTEGRITY | `2026-10-06/TST-105-product-surfaces-step5b-accepted-rendering-bridge.md` |

- 02.10.2026 · [TST-074 mobil deploy paketi](2026-10-02/TST-074-mobile-deploy-package.md) — Build/mobil/ZIP başarılı; canlı yayın açık.
- 02.10.2026 · [TST-075 editör/AI spec](2026-10-02/TST-075-editor-ai-spec.md) — Belge taslağı kontrolü başarılı; rol kabulü açık.

- 02.10.2026 · [TST-076 handoff bütünlüğü](2026-10-02/TST-076-handoff.md) — 22 varlık ve API durumu doğrulandı; kabul açık.

- 02.10.2026 · [TST-077 ana sayfa dokunma alanları](2026-10-02/TST-077-home-touch-targets.md) — Lint/build ve 48/48 E2E başarılı.

- 02.10.2026 · [TST-078 yönetim paneli](2026-10-02/TST-078-admin-panel.md) — Build/lint ve dashboard/sipariş/CMS tarayıcı kontrolleri başarılı.

- 03.10.2026 · [TST-079 katalog ve varyantlar](2026-10-03/TST-079-admin-catalog.md) — Build/lint, katalog akışı ve mevcut panel regresyonu başarılı.

- 03.10.2026 · [TST-080 stok/depo yönetimi](2026-10-03/TST-080-admin-inventory.md) — Build/lint, stok/mutabakat/sayım ve panel regresyonu başarılı.

- 03.10.2026 · [TST-081 fiyat/kampanya yönetimi](2026-10-03/TST-081-admin-pricing.md) — Hesaplama ve UI testleri, build/lint ve panel regresyonu başarılı.

- 03.10.2026 · [TST-082 kurumsal teklifler](2026-10-03/TST-082-admin-quotes.md) — Revizyon modeli/UI, build/lint ve panel regresyonu başarılı.

- 03.10.2026 · [TST-083 tasarım/baskı operasyonları](2026-10-03/TST-083-admin-print.md) — Build/lint, sürüm/çıktı/not ve panel regresyonu başarılı.

- 03.10.2026 · [TST-084 entegrasyon izleme](2026-10-03/TST-084-admin-integrations.md) — Model/UI, build/lint ve panel regresyonu başarılı.

- 03.10.2026 · [TST-085 AI yönetimi](2026-10-03/TST-085-admin-ai.md) — Model/UI, build/lint ve panel regresyonu başarılı.

- [TST-086 — ADM-002 rol, ayar ve denetim](2026-10-03/TST-086-admin-settings.md)

- 07.10.2026 · [TST-087 faz eksiklik maddeleri](2026-10-07/TST-087-phase-gap-update.md) — Faz00–Faz11 belge revizyonu; diff temiz, işaretler tutarlı, kod değişmedi.

- 06.10.2026 · [XINOBI U yerel gerçek Cloudflare doğrulaması](2026-10-06/TST-XINOBI-U-live.md) — Numarasız rapor; 07.10.2026'da indekse eklendi. İki gerçek üretim, API 21 test, web/admin build ve uçtan uca akış başarılı.

- 06.10.2026 · [Ücretsiz ürün yüzeyi önizlemesi](2026-10-06/TST-XINOBI-U-free-preview.md) — Numarasız rapor; 07.10.2026'da indekse eklendi. Masaüstü/mobil, orijinal piksel koruma ve PNG indirme başarılı; ücretli çağrı yok.

- 07.10.2026 · [TST-088 kayıt açığı sonrası HEAD doğrulaması](2026-10-07/TST-088-retroactive-head-validation.md) — Mimari testler 26/26, admin/web lint ve build başarılı; uçtan uca yerel testler çalıştırılmadı.

- 07.10.2026 · [TST-089 yerel uçtan uca regresyon](2026-10-07/TST-089-local-e2e-regression.md) — 22 araçtan 16 başarılı, 6 başarısız: 5 eski test (kasıtlı UI değişiklikleri), 1 süresi dolmuş oturum; ürün hatası bulunmadı, kullanıcı verisi değişmedi.

- 07.10.2026 · [TST-090 eski testlerin güncellenmesi](2026-10-07/TST-090-stale-test-updates.md) — Beş eski test güncel davranışa uyarlandı, free-preview kalıcı fixture'a geçti; 22/22 başarılı, kullanıcı verisi değişmedi, ücretli çağrı yok.

- 07.10.2026 · [TST-091 Faz03 çekirdek şema](2026-10-07/TST-091-faz03-initial-core-schema.md) — İlk migration, idempotent/geri alma script'i ve 12 yeni test; 38/38 başarılı. XinobiYeniDB'ye uygulama BLOKE: SQL portu 64019 dışarıdan kapalı.

- 07.10.2026 · [TST-092 Dyson header ölçüleri](2026-10-07/TST-092-dyson-header-metrics.md) — Header ölçüleri dyson.com.tr ile eşlendi; lint/build, 16 yerel araç başarılı. Web e2e 29/48; 19 başarısızlık header'dan önce de aynı (4 kontrast, 15 eski test).

- 07.10.2026 · [TST-093 ortak katalog API sözleşmesi](2026-10-07/TST-093-catalog-api-contract.md) — 5 salt okunur uç, TS/Dart istemcileri; .NET 54/54, Dart 3/3, Flutter temiz, kayma 0, gerçek veriyle duman testi başarılı.

- 07.10.2026 · [TST-094 XINOBI U oturum sözleşmesi](2026-10-07/TST-094-xinobi-u-api-contract.md) — 5 uç sözleşmede, korumalar aynen, Production'da 503; .NET 58/58, Dart 4/4, Flutter temiz, kayma 0; ücretli çağrı yok.

- 07.10.2026 · [TST-095 Flutter iskeleti ve katalog ekranları](2026-10-07/TST-095-flutter-app-skeleton.md) — Riverpod/go_router, tokenlardan tema, 4 ekran; flutter analyze temiz, 10/10 test; Android emülatöründe gerçek veriyle doğrulandı; 3 taşma ve 1 erişilebilirlik hatası düzeltildi.

- 07.10.2026 · [TST-096 mobil XINOBI U ve renk adımının kaldırılması](2026-10-07/TST-096-mobile-xinobi-u-flow.md) — Mobil anket akışı, gerçek Cloudflare ile 13 sn üretim; bugün 3 sağlayıcı çağrısı (1 test + 2 proje sahibinin emülatördeki denemesi); renk adımı web+mobilden kaldırıldı; .NET 66/66, Flutter 15/15, Dart 4/4; web XINOBI U e2e dev API yeniden başlatılmayı bekliyor.

- 07.10.2026 · [TST-097 mobil sepet](2026-10-07/TST-097-mobile-cart.md) — Web ile aynı sepet kuralları, `maxQuantity` sözleşmesi; .NET 70/70, Flutter 20/20, Dart 4/4; emülatörde kopya veriyle sepete ekleme ve toplam doğrulandı; kullanıcı verisi değişmedi.

- 07.10.2026 · [TST-098 ortak hesap API'si ve mobil hesap](2026-10-07/TST-098-account-api-mobile.md) — Kayıt/giriş/yenileme/çıkış/profil, jetonlar özetli; .NET 77/77, Flutter 25/25; emülatörde üyelik ve oturum geri yükleme doğrulandı. Olay: ilk koşuda testlerden 5 gerçek doğrulama e-postası `ayse@example.com`'a gitti; düzeltildi ve güvenceye alındı.

- 07.10.2026 · [TST-099 web hesabı ortak API'ye geçti](2026-10-07/TST-099-web-account-api.md) — HttpOnly cookie + CSRF başlığı; .NET 78/78; gerçek tarayıcıda kayıt, yenilemede oturum, çıkış; mobilde açılan hesapla web girişi başarılı. Dev API yeniden başlatılmalı.

- 07.10.2026 · [TST-100 rol/yetki kataloğu](2026-10-07/TST-100-roles-permissions.md) — 17 kaynak, `super_admin`, `RequirePermission`, varsayılan ret (herkese açık alanlar açık liste), konsoldan bir kez süper yönetici; .NET 82/82.

- 07.10.2026 · [TST-101 mobil favoriler](2026-10-07/TST-101-mobile-favorites.md) — Web ile aynı cihaz içi biçim; kart ve ürün sayfasında kalp, `/favoriler`, Hesap bağlantısı; Flutter 30/30; emülatörde doğrulandı.

- 07.10.2026 · [TST-102 mobil header ve duyurular](2026-10-07/TST-102-mobile-header-news.md) — Arama kaldırıldı, favoriler + duyurular header'da; okunmamış rozeti; Flutter 34/34; emülatörde doğrulandı.

- [TST-106 — ProductSurfaces separate-worktree integration](2026-10-06/TST-106-product-surfaces-worktree-integration.md): backend214/214, Admin10/10, canonical web17/17; full web55/65 with preserved contrast/legacy expectation failures. Uncommitted merge; no inference.

- 09.10.2026 · [REP-20261009 — Kullanıcının paylaştığı doğrulama özeti](2026-10-09/REP-20261009-owner-validation-summary.md) — Bildirilen .NET 306/306, mobil 49/49, web/admin TypeScript ve lint; yeniden çalıştırılmadı. Son mobil emülatör doğrulaması ve iki bilinen test sorunu açık.

- 09.10.2026 · [TST-107 bekleyen işler](2026-10-09/TST-107-pending-work-validation.md) — .NET 306/306, mobil 49/49 ve cihaz 5/5, Temsilidir 3/3; Tasarımlarım iki hata düzeltildi. Normal mobil APK 5003’e döndü; harici erişimler, ürün kararları ve yeniden üretilemeyen yüzey hatası açık.

- 09.10.2026 · [TST-108 web regresyonlarının giderilmesi](2026-10-09/TST-108-web-regression-resolution.md) — Tam web e2e 107/107, atlanan/flaky 0; 20 rota erişilebilirlik taraması, kontrast/dokunma alanı düzeltmeleri, güncel sözleşmeli akış testleri. Build/TypeScript/lint temiz; SQL değişmedi.

- 09.10.2026 · [TST-109 SQL bağlantı teşhisi](2026-10-09/TST-109-sql-connectivity-diagnosis.md) — İlk kontrolde eksik ayar ve TCP timeout; ayar düzeltmesi sonrası tekrar kontrolünde TCP, SQL login, XinobiYeniDB ve API readiness başarılı. Parola ve yerel ayar Git dışında.

- 09.10.2026 · [TST-110 ilk SQL migration uygulaması](2026-10-09/TST-110-initial-core-migration-application.md) — Model/script testleri 12/12; boş XinobiYeniDB’ye InitialCore uygulandı, 12 temel tablo ve 1 sürüm kaydı doğrulandı; ikinci uygulama sonucu aynı, API SQL ready. Yerel iş verileri henüz SQL’e taşınmadı.

- 09.10.2026 · [TST-111 SQL katalog hazırlığı](2026-10-09/TST-111-sql-catalog-preparation.md) — 0002 migration, SQL depo ve doğrulamalı aktarım hazır; .NET 315 geçti / 1 gerçek SQL testi atlandı. COPY_ONLY/CHECKSUM yedeği alındı, VERIFYONLY Msg262 yetki hatası nedeniyle canlı migration/aktarım bekliyor. SQL yöneticisine çalıştırılacak doğrulama dosyası hazırlandı.

- 09.10.2026 · [TST-112 hesap/sipariş şeması ve yedek tekrarı](2026-10-09/TST-112-customer-schema-and-backup-retry.md) — VERIFYONLY tekrarında Msg262/3013 devam ediyor. 0003 profil/oturum/adres/sipariş migration ve script'leri hazır; .NET 321 geçti / 1 gerçek SQL testi atlandı. Canlı uygulama ve veri taşıma henüz yapılmadı.

- 09.10.2026 · [TST-113 SQL migration'ları uygulandı ve yerel veri aktarıldı](2026-10-09/TST-113-sql-migrations-applied-and-local-data-transferred.md) — Proje sahibi onayıyla 0002–0004 boş DB'ye uygulandı (`-I`), ikinci çalıştırma no-op. SQL hesap ve özellik belgesi depoları, gerçek SQL testleri geçti; .NET 322 geçti / 3 atlandı. Katalog 17/69, 1 hesap, Nobi belgesi doğrulanarak aktarıldı; yerel API SQL'den okuyor.

- 09.10.2026 · [TST-114 panel güvenliği, dosya deposu, arka plan işleri, kişiselleştirilmiş sipariş](2026-10-09/TST-114-panel-security-storage-jobs-personalised-order.md) — Panel personel + rota izni ister; medya/tasarım `IFileStore`'da; bildirim kuyruğu sahiplenmeli ve SQL'de çalışır; kayıtlı tasarım sepete eklenip siparişe değişmez kopyayla geçer (0005 uygulandı). .NET 341 geçti / 4 atlandı, Flutter 50/50.

- 14.10.2026 · [TST-115 HEAD regresyonu ve faz denetimi](2026-10-14/TST-115-head-regression-and-phase-audit.md) — `b1573d0`: .NET 385 geçti / 13 atlandı / 0 başarısız, Flutter analyze temiz + 55/55, lint (5 admin uyarısı) ve web/admin TypeScript temiz. 09–13 Ekim’deki 31 kayıtsız commit için toplu doğrulama; e2e, gerçek SQL ve canlı smoke çalıştırılmadı.

- 14.10.2026 · [TST-116 denetim kaydı](2026-10-14/TST-116-audit-trail.md) — Faz03 03.06: panel/yönetim değişiklik denemeleri (başarılı, 4xx, 401/403) gövdesiz kaydediliyor, `audit.read` ile okunuyor; AuditTrailTests 2/2, tam .NET 387/14 atlandı/0, admin tsc/lint/build temiz.

- 14.10.2026 · [TST-117 parola sıfırlama](2026-10-14/TST-117-password-reset.md) — Faz03 03.03: hesap ifşa etmeyen kodlu sıfırlama, tüm oturumları kapatır; web + mobil ekran. .NET 389/14 atlandı/0, Dart 4/4, Flutter 56/56, hedefli web e2e 4/4. Tam web e2e’de önceden var olan storefront mock ve cm101 spec sorunları kayıtlı.

- 14.10.2026 · [TST-118 web e2e storefront mock ve CM101 koruması](2026-10-14/TST-118-web-e2e-storefront-mock.md) — Test sahte sunucusu `/catalog/storefront`’u yanıtlıyor, yerel CM101 verisi yoksa spec gerekçeyle atlanıyor; tam paket 70 geçti / 50 başarısız / 1 atlandı. Kritik etkileşim hatalarının 6/9’u giderildi; kalan 50 hata XINOBI U/yüzey testlerinde, önceden var.

- 14.10.2026 · [TST-119 web e2e güncel XINOBI U akışı](2026-10-14/TST-119-web-e2e-current-flows.md) — Test API demo kataloğu ve asset adresi, production e2e derlemesinde env ile açılan geliştirme önizleme köprüsü (canlı değişmedi), kaldırılan demo sayfalarına bağlı testler `/urunler/detay` ve `/xinobi-u/renk`’e taşındı. Onaylı CM101 piksel referansı güncellemesiyle tam paket **117 geçti / 0 başarısız / 1 atlandı**.

- 14.10.2026 · [TST-120 SEO temeli](2026-10-14/TST-120-seo-foundation.md) — Faz04: `NEXT_PUBLIC_SITE_URL` yokken (test sunucusu) robots/sitemap/meta ile indeks kapalı; alan adıyla canonical, 8 URL’lik sitemap, özel sayfa engeli; ana sayfa Organization/WebSite ve ürün detayı Product JSON-LD. seo.spec 2/2, tam web e2e 119/0/1.

- 16.10.2026 · [Faz kayıtları belge denetimi](2026-10-16/REP-20261016-phase-document-audit.md) — Faz00–11 oran tutarlılığı, commit eşlemesi, dosya bağlantıları ve diff kontrolü; yeni uygulama test koşusu yok.

- 16.10.2026 · [TST-121 kaba kılavuz ve ortak renk maskesi](2026-10-16/TST-121-guided-shared-mask.md) — İç noktalardan sahte SAM3 visual, tek maskeyi seçili renklere tek onayla aktarım; .NET 422/23 atlandı/0, admin tarayıcı akışı ve web adapter kontrolü. Gerçek inference yok.

- 16.10.2026 · [TST-122 pasif Roboflow düğmesi](2026-10-16/TST-122-guided-mask-unsaved-brush.md) — Kaydedilmemiş boyamadan tek düğmeyle kaydet/segment; sağlayıcı hatasında kılavuz korunur, tekrar boyama uygulanmaz. İzole tarayıcı normal/hata senaryoları, admin build/lint başarılı.

- 16.10.2026 · [TST-123 yüzey API 401](2026-10-16/TST-123-surface-admin-session-refresh.md) — Tek personel refresh ve özgün isteği bir kez tekrar; refresh reddinde boyamayı koruyan giriş yönlendirmesi. İki izole tarayıcı senaryosu, admin build/lint başarılı.

- 16.10.2026 · [TST-124 Roboflow boş sonuç ayrımı](2026-10-16/TST-124-roboflow-empty-result-diagnostics.md) — Boş eşleşme/bozuk maske/bozuk şema ayrı mesajlar, kısa tarif açıklaması; 59/59 sahte sağlayıcı testi ve admin build/lint geçti. Geçmiş gerçek hatanın nedeni kesinleşmedi, yeni inference yok.

- 16.10.2026 · [TST-125 boyama dışına taşmayı sınırlama](2026-10-16/TST-125-guided-mask-containment.md) — AI sonucu kılavuz ve 0–16 piksel açık toleransla sınırlı; boş örtüşmede taslak korunur. 62/62 ve izole admin tarayıcı testi geçti, gerçek inference yok.

- 16.10.2026 · [TST-126 yerel eğri/PNG denemesi](2026-10-16/TST-126-local-curve-png-trial.md) — Push yok; geri dönüş adac37a. Eğri/delik, editable kayıt ve alpha/siyah-beyaz import; .NET 429/23 atlandı/0, son odaklı 13/13, iki admin browser akışı başarılı.

- 16.10.2026 · [TST-127 maske kaynak indirme](2026-10-16/TST-127-exact-mask-source-download.md) — 2000 px yükleme ölçeği doğrulandı; aktif kaynak fotoğraf byte eşitliği/SHA ile indiriliyor. Admin build/lint ve izole browser geçti; local/push yok.

- 16.10.2026 · [TST-128 kaynak tabanlı maskeleme promptu](2026-10-16/TST-128-source-bound-mask-prompt.md) — Dinamik boyut/renk/hash/koordinatlar ve alfa kuralları, hedef düzenleme/kopyalama, pano reddi ve 390px testi başarılı. Local/push yok; AI çağrısı yok.

- 16.10.2026 · [TST-129 fotoğrafa özel logo promptu](2026-10-16/TST-129-photo-specific-logo-mask-prompt.md) — Gerçek logo konturu/etiket ayrımı, dikdörtgen yama önleme; admin build/lint ve browser testi geçti. Local/push yok.

- 16.10.2026 · [TST-130 anonim onaylı maske önizlemesi](2026-10-16/TST-130-anonymous-approved-mask-preview.md) — 401 düzeltildi; 13/13, gerçek ürün previewAvailable=true ve PNG 200. Yerel/push yok.

- 20.10.2026 · [TST-131 renk başına maske hizalama](2026-10-20/TST-131-per-colour-mask-alignment.md) — Ortak maske her renkte kaydırma/ölçek/dönüş ile oturtulur, hizalanan renk kendi PNG'sini alır. 14/14, admin build ve browser testleri geçti; tam .NET'te TST-130 kaynaklı 1 yetki testi başarısız. Local/push yok.
- 20.10.2026 · [TST-132 web önizlemede ortak onaylı maske](2026-10-20/TST-132-web-shared-mask-preview.md) — Maske API'den doğrudan alınır; aynı maskeli renkler arasında yerleşim aktarımsız geçer
- 20.10.2026 · [TST-133 admin maskelemede yalnız PNG](2026-10-20/TST-133-png-only-admin-masking.md) — Eğri/fırça/Roboflow/hizalama ve eski katalog incelemesi admin+API'den kaldırıldı
- 20.10.2026 · [TST-134 XINOBI önizleme e2e kök nedeni](2026-10-20/TST-134-xinobi-preview-e2e-regression.md) — CM121 yayın paketi orijinal boyutta yayımlanıyordu; test kataloğu/proxy eksikti. 11 önizleme testi geçiyor
- 20.10.2026 · [TST-135 canlıda ürün yüzey maskelemesi](2026-10-20/TST-135-production-surface-masking.md) — Admin maskeleme ve onaylı maske önizlemesi SQL admin kataloğuyla canlıda; .NET 434/25/0, önizleme e2e 34/34

- 27.10.2026 · [Faz dokümanları denetimi](2026-10-27/TST-phase-audit.md) — 12 faz dosyası, 64 commit–faz eşlemesi, yeni yerel bağlantılar, rol/PM hücreleri ve Markdown diff kontrolü; uygulama testleri yeniden çalıştırılmadı.

- 27.10.2026 · [AI prompt v3](2026-10-27/TST-art-direction-v3.md) — 25 hedefli test, 32.768 kombinasyonda prompt sınırı; motif hiyerarşisi/renk rolleri ve yerel readiness başarılı. Görsel kalite ve canlı deploy bekliyor.

- 27.10.2026 · [Baskı alanı varsayılan kapalı](2026-10-27/TST-print-area-default.md) — Ortak web/mobil önizleme; yeniden açılışta checkbox işaretsiz, dosya lint temiz.


- 27.10.2026 · [Prompt v5 / tek aday üretim](2026-10-27/TST-art-direction-v5.md) — Açık yazı/imza/eşya yasakları; ek denetim kaldırıldı, 25 hedefli test geçti.

- 27.10.2026 · [Release dda85b6 doğrulaması](2026-10-27/TST-release-dda85b6.md) — Web/admin/API üretim derlemesi, ZIP ve yayımlanmış üç asset/hash doğrulandı; IIS kurulumu bekliyor.

- 03.11.2026 · [TST-231 Sürat Kargo entegrasyon planı](2026-11-03/TST-231-surat-kargo-integration-plan.md) — ZIP/e-posta incelemesi, task/alan/secret planı ve prompt; 14 sayfa PDF görsel kontrolü PASS. Uygulama ve sağlayıcı çağrısı yok.

- 03.11.2026 · [TST-232 belge arşivi](2026-11-03/TST-232-document-archive.md) — 6 PDF tarihli klasörlerde; SHA-256/sayfa ve dizin bağlantıları PASS. Eski yollar ve belge içerikleri korundu.

- 03.11.2026 · [TST-235 entegrasyon klasörleri](2026-11-03/TST-235-integration-folders.md) — 13 klasör, kapsam/durum/kaynak notları ve yerel bağlantılar PASS; uygulama yok.

- 03.11.2026 · [TST-239 Sürat iletilen bilgiler](2026-11-03/TST-239-surat-provided-information.md) — E-posta + teknik plan yerel 16 sayfa; parolalar özgün RTF referansıyla; görsel/secret dışlama kontrolü PASS.

- 03.11.2026 · [TST-243 Sürat sunucu adaptörü](2026-11-03/TST-243-surat-server-adapter.md) — 17/17 odaklı, tam API 531 PASS / 29 SKIP / 0 FAIL. Gerçek çağrı yok; kalıcı gönderi/admin/etiket/takip işi açık.

- 03.11.2026 · [TST-244 Sürat kalıcı gönderi/admin API](2026-11-03/TST-244-surat-persistent-admin-api.md) — 26 odaklı PASS; tam API 540 PASS / 29 SKIP / 0 FAIL; sözleşme/TS/Dart PASS. Gerçek çağrı ve SQL kabulü yok.

- 03.11.2026 · [TST-245 Sürat ekran/etiket/takip teslimi](2026-11-03/TST-245-surat-shipment-delivery.md) — 38 odaklı, tam API 552 PASS / 29 SKIP / 0 FAIL; admin 20/20, Flutter 283, web 2/2 PASS. Gerçek salt okunur test erişimi 403; canlı kabul açık.

- 03.11.2026 · [TST-246 Sürat erişim/ön kontrol](2026-11-03/TST-246-surat-preflight-access.md) — .NET test takip HTTP 200 / Sipariş bulunamadı.; önceki 403 genel blokaj değil. 51 odaklı PASS, tam API 565 PASS / 29 SKIP / 0 FAIL. Gerçek gönderi yok.

- 03.11.2026 · [TST-247 Sürat ön kontrol paketi](2026-11-03/TST-247-surat-preflight-package.md) — Windows dağıtımı için 41 dosyalı paket; secret dışlama/manifest/CRC ve ayrı klasör .NET smoke PASS. Gerçek Windows sunucu kabulü ve deploy yok.

- 04.11.2026 · [TST-248 Sürat güvenilirlik ve iptal yarışı](2026-11-04/TST-248-surat-hardening.md) — Atomik sipariş rezervasyonu, iptal/manuel sevk koruması ve takip belge sürüm arşivi; API 572 PASS / 29 SKIP / 0 FAIL, Release ve admin build/lint, altı Chrome senaryosu PASS. Gerçek gönderi/IIS/SQL/fiziksel kabul açık; canlı oluşturma kapalı.

- 04.11.2026 · [TST-249 Sürat uçtan uca test](2026-11-04/TST-249-surat-end-to-end.md) — Gerçek API/adaptör + sahte sağlayıcı; form/hatalı belge/hata sınıfları düzeltildi. API 589 geçti / 29 atlandı / 0 başarısız, Release/admin build/lint, 8 admin ve 2 web Chrome testi, yazılımsal Code128 geçti. Gerçek gönderi/takip, IIS ve fiziksel kabul çalıştırılamadı; onaylı veri/test hesabı yok.

- 05.11.2026 · [TST-250 Sürat güncel Swagger](2026-11-05/TST-250-surat-live-schema.md) — Iademi boolean ve desi/kg string wire düzeltmesi; 75 izole PASS. Eski denemenin nedeni kesin değil; yeniden gerçek gönderim/deploy yok.


05.11.2026 — TST-251: Gönderim sonucu için güvenli HTTP durum/kategori kaydı ve attempt geçmişi eklendi; public DTO/otomatik retry davranışı korunur. Eski belirsiz kayıtlara geriye dönük teşhis üretilemez. Ayrıntı: `test/2026-11-05/TST-251-surat-create-diagnostics.md`. Gerçek gönderim/deploy yok.


## 05.11.2026 — SIP-TAS-01…09 güncel regresyon

[TST-252](2026-11-05/TST-252-order-design-regression.md): 36 API PASS / 1 SQL SKIP / 0 FAIL; beş admin tarayıcı paketi, 21 dosya durumu ve 7 eski kayıt senaryosu, dört genişlik/%200 metin, admin build/lint geçti (4 eski lint uyarısı). Yeni uygulama kusuru bulunmadı; kod/veri değiştirilmedi. SQL/IIS/manuel cihaz ve PM kabulü açık; deploy yapılmadı.


## 05.11.2026 — Admin UI/UX denetimi

[TST-253](2026-11-05/TST-253-admin-ux-audit.md): 20/20 izole admin test dosyası PASS; 64 responsive matris satırı, 48 boş/hata/yetki durumu. Sipariş/kargo odaklı denetimde 3 P1 ve 4 P2 bulgu; taslak kaybı, kritik onaylar ve varsayılan sağlayıcı teyidi öncelikli. Bu teslim denetim/önceliklendirme; uygulama düzeltmesi yapılmadı, gerçek veri/deploy yok. Rapor: `design/admin-ux-audit-2026-11-05.md`.


## 05.11.2026 — UI/UX bulguları düzeltme turu

[TST-254](2026-11-05/TST-254-admin-ux-fixes.md): ADM-UX-01…07 için taslak/ayrılma ve busy koruması, kritik işlem özeti/onayı, tarafsız manuel teyit, readonly alanlar, dürüst etiket handoff mesajı ve ortak form düzeni uygulandı. Gerçek veri/sağlayıcı/deploy yok. SQL/IIS/manuel cihaz ve PM kabulü açık. Nihai test sonuçları raporda.


## 05.11.2026 — Yayın öncesi birleşik regresyon

[TST-255](2026-11-05/TST-255-pre-release-regression.md): API 595 PASS / 29 SKIP / 0 FAIL; admin 21/21 dosya + ayrıca üretim profilinde MFA/login/logout testi PASS; web 24/24 e2e, lint/tip ve üretim derlemeleri PASS. Yerel yazılım engeli bulunmadı. Sürat gerçek kabulü, ödeme/sevk uygunluğu, SQL çoklu süreç, IIS/SMTP/cihaz/PM ve yeni repo sunucu erişimi raporda açık. Canlı Sürat kapalı; deploy/paket yayını yapılmadı.


05.11.2026 — [DEPLOY-017 release doğrulaması](../deployments/DEPLOY-017-validated-release-published.md): birleşik ZIP SHA256/CRC/commit, gizli ayar dışlama, gerçek arşiv admininde sentetik MFA/login/logout PASS; GitHub 3 asset digest eşleşti. Önceki canlı ortam GET smoke PASS; yeni IIS kurulumu değil.

- 05.11.2026 · [TST-256 sekme simgeleri](2026-11-05/TST-256-brand-tab-icons.md): web Xinobi logo/admin marka favicon, üretim yolları/build ve 16/32/128 px görsel kontrol PASS. Deploy yok.


## 06.11.2026 — KIS-TEK-02

[TST-257 — kişiselleştirme geçiş planı](2026-11-06/TST-257-personalization-migration-plan.md): salt okunur SQL envanteri, 7 ürün/boş kaynak-SKU seçimi, 526 dosya değişmezliği, tekrar çalışma eşliği, published 24/24 ve fixture 32/32 hash PASS. Sipariş manifestli 6 dosya PASS; yerel eksikler/asıl sunucu/restore/apply ayrı açık. Gerçek veriye yazma/deploy yok.


## 06.11.2026 — KIS-TEK-03

[TST-258 — admin tek kaynak yönetimi](2026-11-06/TST-258-personalization-source-management.md): API 601 PASS / 29 SKIP / 0 FAIL; admin seri 23/23 paket, kaynak alanı responsive/klavye/axe PASS; lint 0 hata/4 eski uyarı, TS/üretim build PASS. Immutable kaynak kopyası, revizyon, hata/yetki/stale ve taslak korumaları uygulandı. Gerçek veri/migration/deploy/APK yok; maske/müşteri akışı sonraki tasklar.


## 06.11.2026 — KIS-TEK-04

[TST-259 — fotoğraf üretim promptu kaldırıldı](2026-11-06/TST-259-direct-source-no-photo-prompt.md): katalog ve Medya girişleri/kullanılmayan modüller kaldırıldı; kaynak ve katalog tarayıcı senaryoları, 5001×3730 PNG ham yükleme/indirme, 6 odaklı API testi, lint/TS/üretim build PASS. Maskeleme promptu korundu; task 05/06 kapsamı açık. Gerçek veri/deploy/APK yok.


## 06.11.2026 — KIS-TEK-03/04 yeniden kontrol

[TST-260](2026-11-06/TST-260-source-task03-04-recheck.md): katalog güncellemesinde kaynak taslağının kaybı düzeltildi; ürün sırası/işareti değişiminde koruma, Task 04 prompt yokluğu ve büyük kaynak bayt eşliği PASS. 6 API testi, admin lint/TS/build ve genişletilen izole kaynak tarayıcı paketi PASS. Gerçek veri/deploy yok; Task 05’e başlanmadı.


## 06.11.2026 — KIS-TEK-05

[TST-261 — tek kaynak maskeleme](2026-11-06/TST-261-single-source-masking.md): API 607 PASS/29 SKIP/0 FAIL; 12 odaklı kaynak/maske testi; admin seri 24/24 paket ve 15 durum senaryosu PASS. Tek kaynak yükle/onay/geri al/WebP indir, prompt, kaynak değişiminde stale/temiz canvas, readonly ve a11y PASS. Lint 0 hata/1 eski uyarı, admin/API üretim build PASS. Legacy rotalar/public yayın ve 20 MP kapasite 06’da açık. Gerçek veri/AI/deploy/APK yok.


## 06.11.2026 — Sürat destek örneği

[TST-262](2026-11-06/TST-262-surat-provider-support-example.md): destek JSON’una açık boş alanlar ve COD 0/null uyumu; 82 izole Sürat testi PASS, API Release PASS. Sağlayıcı kayıt yokluğu teyidi ve kontrollü tekrar/hareket adımları belgelendi. Gerçek gönderi, kayıt mutabakatı veya e-posta/deploy yapılmadı; gerçek kabul açık.
