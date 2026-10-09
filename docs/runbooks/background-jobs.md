# Arka plan işleri

API süreci içinde çalışan `BackgroundService` işçileri. İstek tetiklemez; uygulama başlarken açılır.

| İşçi | Ne yapar | Varsayılan |
|---|---|---|
| `NotificationWorker` | E-posta/SMS/push kuyruğunu 3 sn'de bir dağıtır; hatada 30 sn × 2ⁿ geri çekilme, 5 deneme, sonra `failed` (panelden yeniden denenebilir). | Development'ta ve `Features:StorageProvider=SqlServer` olan her ortamda açık. `Notifications:WorkerEnabled` ile ezilir. |
| `MaintenanceWorker` | Saatte bir süresi dolmuş SQL oturumlarını siler. Hesaplar dosyadayken hiçbir şey yapmaz. | Açık. `Maintenance:WorkerEnabled=false` ile kapanır. |
| `DesignGenerationWorker` | XINOBI U görsel üretim kuyruğu (oturum durumu dosyada). | Development ve `XinobiU:Enabled=true` test sunucusu; tek süreç varsayımı. |

## Birden fazla API süreci

Bildirim kuyruğu öğeleri gönderilmeden önce aynı kilitli yazmada **sahiplenilir** (bir sonraki deneme 2 dk ileri alınır). Bu yüzden iki süreç aynı mesajı göndermez. Gönderim sırasında süreç düşerse öğe 2 dk sonra yeniden denenir: teslim en az bir kez olur, mesaj kaybolmaz. Kilitler SQL `sp_getapplock` ile süreçler arasıdır; dosya modunda yalnız tek süreç desteklenir.

Önerilen üretim düzeni: işçiler tek bir süreçte çalışsın.

- Web istekleri alan süreçler: `Notifications__WorkerEnabled=false`.
- Tek işçi süreci: varsayılan ayarlar (aynı API, dışarıya açık olması gerekmez).

XINOBI U üretim kuyruğu henüz süreçler arası paylaşılmaz; test sunucusunda tek API süreci çalıştırılmalıdır. Çoklu süreç gerekirse oturumlar SQL'e taşınmalıdır (ayrı iş).

## İzleme

- Panel › Bildirimler: bekleyen, gönderilen, başarısız ve atlanan öğeler; başarısızlar yeniden denenebilir.
- Loglar: `Notification delivery round failed`, `Removed N expired sessions`, `Session cleanup skipped`.
