# TST-206 - MostGate task/prompt dokümanı / 03.11.2026

Kullanıcı mevcut sipariş tasarım detayı planındaki bütün tasklar için önce MostGate konusu/açıklaması, ardından prompt içeren doküman istedi. Kapsam SIP-TAS-01...09; projenin120 ana taskı veya uygulama geliştirmesi değildir.

- [Markdown kaynak](../../docs/tasks/order-design-mostgate-prompts-2026-11-03.md):9 konu,9 açıklama,9 bağımsız text prompt; her taskta faz/ana task, bağımlılık, kapsam, kabul, doğrulama ve teslim adımları.
- [PDF](../../output/pdf/xinobi-siparis-tasarim-mostgate-tasklar-ve-promptlar-2026-11-03.pdf):10 sayfa (kapak/içindekiler + task başına1 sayfa). Arial Türkçe normal/kalın gömüldü; ReportLab ile üretildi.
- pypdf kontrolü:her task kendi sayfasında, konu/açıklama/prompt ve son Teslim paragrafı aynı sayfada; replacement karakter yok. Markdown ID ve blok sayısı9/9; ana planla bağımlılıklar eşlendi.
- Poppler ile10 sayfa render edildi; iki temas sayfasında bütün sayfalar, ayrıca uzun prompt sayfası tam boy incelendi. Kesilme, taşma veya bozuk Türkçe glif yok. İçindekiler sayfa numaraları2...10 ile eşleşiyor.
- Üç ayrı görsel ve üretime hazırlık kapsamı dışarıda kalacak şekilde task sınırları korundu. Dosya tasklarında temel yetki, SIP-TAS-07'ye ertelenmedi. Eski kayıtlarda uydurma/fallback ve gerçek veriye toplu değişiklik planlanmadı.
- Bu belge çalışmasında uygulama kaynağı/veri/task durumları değiştirilmedi; MostGate araçlarıyla task açılmadı. Çalışma sırasında ayrı admin kaynak değişiklikleri oluştuğu görüldü; bunlar bu belge commitine alınmadı. Uygulama testleri/build yeniden koşulmadı. Plan yalnız ileride kullanılacak prompt metnidir.

İlk son kontrol bütün worktree içinde uygulama değişikliği olmamasını beklediği için ayrı admin değişikliklerinde durdu. Kontrol belge teslim kapsamına daraltıldı; dış değişiklikler korunarak yalnız bu işe ait dosyalar seçildi.

Sonuç: PASS / DOCUMENT / PDF VISUAL QA. Kaynak kesiti d1f5852. Geçici üretim scripti `/tmp/create_order_task_prompts.py`, veri `/tmp/xinobi-order-task-prompts.json`; PDF render'ları `/tmp/xinobi-mostgate-review-*.png` ve temas sayfaları `/tmp/xinobi-mostgate-contact-*.jpg`. Geçici dosyalar commit edilmez.
