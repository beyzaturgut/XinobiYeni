"use client";

import { useState } from "react";
import styles from "./tracking.module.css";

export default function QuoteTracking() {
  const [revision, setRevision] = useState(2);
  const [message, setMessage] = useState("");
  const [prepared, setPrepared] = useState(false);
  return <div className={styles.shell}>
    <section className={styles.hero}><p>Kurumsal süreç</p><h1>Teklifinizi takip edin.</h1><span>Demo kayıt · Gerçek teklif, fiyat veya firma verisi değildir.</span><form onSubmit={(event) => event.preventDefault()}><label htmlFor="quote-code">Teklif kodu</label><div><input id="quote-code" defaultValue="DEMO-Q-2401" /><button type="submit" disabled>Teklifi getir</button></div><small>Gerçek kod doğrulaması ve erişim yetkisi API sonrasında açılır.</small></form></section>
    <div className={styles.notice}><strong>D07/API bekleniyor</strong><span>Bu sayfadaki fiyat, tarih ve durumlar gösterim amaçlıdır; bağlayıcı teklif veya sipariş oluşturmaz.</span></div>
    <div className={styles.layout}>
      <section className={styles.main}>
        <div className={styles.quoteHeader}><div><p>DEMO-Q-2401</p><h2>Kurumsal ürün projesi</h2><span>Örnek Teknoloji A.Ş. · 25 adet</span></div><b>Revizyon bekleniyor</b></div>
        <ol className={styles.timeline}><li className={styles.done}><i>✓</i><div><strong>Talep alındı</strong><span>Demo tarih</span></div></li><li className={styles.done}><i>✓</i><div><strong>İncelendi</strong><span>Ürün ve üretim uygunluğu senaryosu</span></div></li><li className={styles.active}><i>3</i><div><strong>Revizyon bekleniyor</strong><span>Müşteri yanıtı bekleme örneği</span></div></li><li><i>4</i><div><strong>Onay ve sipariş</strong><span>D07 kuralları bekleniyor</span></div></li></ol>
        <section className={styles.revisions} aria-labelledby="revision-title"><div className={styles.sectionTitle}><div><p>Sürüm geçmişi</p><h3 id="revision-title">Teklif revizyonları</h3></div><span>Değişmez sürüm önizlemesi</span></div><div className={styles.revisionTabs}>{[1,2].map((item) => <button type="button" key={item} aria-pressed={revision === item} onClick={() => setRevision(item)}>Revizyon {item}</button>)}</div><dl><div><dt>Ürün</dt><dd>{revision === 1 ? "Çay Makinesi 101" : "Çay Makinesi 101 · Lacivert"}</dd></div><div><dt>Adet</dt><dd>{revision === 1 ? "20" : "25"}</dd></div><div><dt>Kişiselleştirme</dt><dd>{revision === 1 ? "Değerlendirilecek" : "Logo · D04 bekleniyor"}</dd></div><div><dt>Birim fiyat</dt><dd>D07/API bekleniyor</dd></div><div><dt>Geçerlilik</dt><dd>Tanımlanmadı</dd></div></dl><button type="button" disabled>Teklif PDF&apos;ini indir</button></section>
        <section className={styles.response}><div className={styles.sectionTitle}><div><p>Geri bildirim</p><h3>Revizyon notu</h3></div></div><label htmlFor="revision-note">Talebiniz<textarea id="revision-note" rows={4} value={message} onChange={(event) => { setMessage(event.target.value.slice(0,500)); setPrepared(false); }} placeholder="Adet, renk, termin veya kişiselleştirme beklentinizi yazın" /><small>{message.length}/500</small></label><button type="button" disabled={message.trim().length < 10} onClick={() => setPrepared(true)}>Demo revizyon notunu hazırla</button><p aria-live="polite">{prepared ? "Demo revizyon notu hazırlandı; sunucuya gönderilmedi." : ""}</p></section>
      </section>
      <aside className={styles.summary}><p>Teklif özeti</p><h2>Revizyon {revision}</h2><dl><div><dt>Durum</dt><dd>Revizyon bekleniyor</dd></div><div><dt>Toplam</dt><dd>Hesaplanmadı</dd></div><div><dt>Termin</dt><dd>Doğrulanmadı</dd></div><div><dt>Yetkili</dt><dd>Atanmadı</dd></div></dl><button type="button" disabled>Teklifi onayla</button><button type="button" disabled>Siparişe dönüştür</button><p>Yetkili teklif sürümü, fiyat, stok, termin ve onay sahibi doğrulanmadan hiçbir işlem açılamaz.</p></aside>
    </div>
  </div>;
}
