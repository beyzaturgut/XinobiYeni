# TST-204 — Genel proje durumu PDF / 03.11.2026

Kullanıcı isteği: çok detaya girmeden mevcut durum ve kalan genel tasklar PDF'i.

- Kaynak kesiti: `bfc4c29`; Faz00,120 task kapanış listesi, web TST-179, admin TST-188, Flutter TST-196 ve son inceleme TST-203.
- Çıktı: [2 sayfalık yönetim özeti](../../output/pdf/xinobi-proje-durumu-2026-11-03.pdf).
- İçerik: dört alanın mevcut/açık durumu, müşteriden/iş sahibinden beklenen girdiler,13 ana kapanış paketi ve önerilen sıra. 120 alt task tek tek çoğaltılmadı; kapanış durumu kodun hiç yazılmadığı anlamına gelmez. Yüzde/tarih/sorumlu veya resmi kabul uydurulmadı.
- ReportLab ile oluşturuldu; Türkçe Arial normal/kalın fontları gömüldü. `pdfinfo`:2 A4 sayfa, şifreleme yok.
- Bundled Python/pypdf metin kontrolü:2 sayfa,13 ana task;23 ürün/SKU117, iOS, Mikro ve üç pazaryeri kapsamı mevcut; replacement karakter yok.
- `pdftoppm -scale-to 1400 -png` ile iki sayfa render edildi; başlık/tablo/satır kırılımı/altbilgi ve Türkçe karakterler görsel olarak incelendi. Taşma, kırpılma veya siyah glif yok.
- İlk son doğrulama komutu yanlışlıkla sistem Python'uyla çalıştı; pypdf bulunamadı ve kayıt oluşturulmadı. Bundled Python ile başarılı tekrar yapıldı. PDF üretimi ve ilk metin kontrolü zaten bundled runtime ile başarılıydı.
- PDF'in incelenmesi uygulama regresyonu değildir. Uygulama testleri bu belge işi için tekrar çalıştırılmadı. Web/admin/Flutter/API veya iş verisi değiştirilmedi.

Sonuç: **PASS / DOCUMENT / PDF VISUAL QA**. Ara script ve render'lar `/tmp/create_xinobi_status_pdf.py`, `/tmp/xinobi-status-review-1.png`, `/tmp/xinobi-status-review-2.png`; geçici çıktılar commit edilmez.
