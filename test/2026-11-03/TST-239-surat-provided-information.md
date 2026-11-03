# TST-239 | Sürat iletilen bilgiler eki

03.11.2026. Kullanıcının eklediği kargo.rtf kaynak alındı.

- Test/canlı kullanıcı adları, cari kodu, takip yetkisi bildirimi ve e-posta kuralları yerel birleşik PDF/Markdown içine alındı. Parolalar yeni çıktılara çoğaltılmadı; özgün RTF kaynak gösterildi.
- PDF 16 sayfa: 2 yeni e-posta sayfası + önceki 14 sayfalık plan. Yeni 2 sayfa render/görsel kontrol PASS; önceki sayfalar değiştirilmeden birleştirildi.
- Kaynaktaki parola değerlerinin PDF/Markdown içinde bulunmadığı programatik kontrol PASS; iki kullanıcı adı ve cari kodu mevcut.
- Yerel nüsha, özgün RTF ve ek klasörü .gitignore ile dışlandı. Gizli olmayan plan/README bilgiler alındı olarak düzeltildi; bağlantı kabulü iddia edilmedi.
- İlk parola çoğaltma işlemi otomatik onay incelemesince reddedildi; uygulanmadı. Daha güvenli parola referansı yaklaşımı tamamlandı.
- git diff --check PASS. Servis çağrısı, uygulama kodu veya canlı ayar değişikliği yok.
