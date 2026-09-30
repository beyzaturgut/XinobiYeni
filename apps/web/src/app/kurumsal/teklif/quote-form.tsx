"use client";

import Image from "next/image";
import { useState } from "react";
import teaMaker from "../../../../public/assets/products/tea-maker-101-blue.webp";
import coffeeMaker from "../../../../public/assets/products/coffee-maker-101-gold.webp";
import styles from "./quote.module.css";

export default function QuoteForm() {
  const [product, setProduct] = useState("Çay Makinesi 101");
  const [quantity, setQuantity] = useState(25);
  const [personalized, setPersonalized] = useState(false);
  const [previewed, setPreviewed] = useState(false);

  return <>
    <section className={styles.hero}><div><p>Xinobi for Business</p><h1>İşinize özel, sakin teknoloji.</h1><span>Toplu ürün, kurumsal hediye ve kişiselleştirme ihtiyaçlarınızı tek talepte anlatın.</span></div><div className={styles.heroProduct}><div /><Image src={product.startsWith("Çay") ? teaMaker : coffeeMaker} alt={product} priority sizes="(max-width: 800px) 80vw, 42vw" /></div></section>
    <section className={styles.layout}>
      <form onSubmit={(event) => event.preventDefault()}>
        <div className={styles.intro}><p>Teklif talebi</p><h2>İhtiyacınızı birlikte şekillendirelim.</h2><div><strong>Demo form</strong><span>Bilgiler gönderilmez; gerçek teklif veya müşteri kaydı oluşturulmaz.</span></div></div>
        <fieldset><legend>01 · Firma ve iletişim</legend><div className={styles.grid}><label>Firma adı<input type="text" autoComplete="organization" /></label><label>Yetkili kişi<input type="text" autoComplete="name" /></label><label>Kurumsal e-posta<input type="email" autoComplete="email" /></label><label>Telefon<input type="tel" autoComplete="tel" /></label></div></fieldset>
        <fieldset><legend>02 · Ürün ve adet</legend><div className={styles.productChoices}><button type="button" aria-pressed={product === "Çay Makinesi 101"} onClick={() => { setProduct("Çay Makinesi 101"); setPreviewed(false); }}><Image src={teaMaker} alt="" /><span>Çay Makinesi 101</span></button><button type="button" aria-pressed={product === "Kahve Makinesi 101"} onClick={() => { setProduct("Kahve Makinesi 101"); setPreviewed(false); }}><Image src={coffeeMaker} alt="" /><span>Kahve Makinesi 101</span></button></div><label className={styles.quantity}>Tahmini adet<input type="number" min={10} max={10000} value={quantity} onChange={(event) => { setQuantity(Number(event.target.value)); setPreviewed(false); }} /><small>Demo alt sınır: 10 · Gerçek minimum adet D07 bekliyor.</small></label></fieldset>
        <fieldset><legend>03 · Proje ayrıntıları</legend><label className={styles.check}><input type="checkbox" checked={personalized} onChange={(event) => { setPersonalized(event.target.checked); setPreviewed(false); }} /><span><strong>Kurumsal kişiselleştirme istiyorum</strong><small>Logo, isim veya kampanya tasarımı · D04 üretim standardı bekleniyor</small></span></label><div className={styles.grid}><label>Hedef teslim zamanı<input type="text" placeholder="Örneğin: Aralık 2026" /></label><label>Kullanım amacı<select defaultValue=""><option value="" disabled>Seçiniz</option><option>Kurumsal hediye</option><option>Ofis kullanımı</option><option>Kampanya</option><option>Diğer</option></select></label><label className={styles.full}>Notunuz<textarea rows={5} placeholder="Projenizi, renk veya teslimat beklentinizi anlatın" /></label></div></fieldset>
        <fieldset><legend>04 · Dosya</legend><div className={styles.upload}><span>↑</span><strong>Logo veya brief yükleme henüz etkin değil</strong><small>Dosya güvenliği ve saklama politikası kesinleştiğinde açılacaktır.</small><button type="button" disabled>Dosya seç</button></div></fieldset>
        <button className={styles.previewButton} type="button" onClick={() => setPreviewed(true)}>Demo talep özetini hazırla</button><p className={styles.status} aria-live="polite">{previewed ? "Demo talep özeti hazırlandı; sunucuya gönderilmedi." : ""}</p>
      </form>
      <aside className={styles.summary}><p>Talep özeti</p><h2>Kurumsal proje</h2><dl><div><dt>Ürün</dt><dd>{product}</dd></div><div><dt>Adet</dt><dd>{quantity || "—"}</dd></div><div><dt>Kişiselleştirme</dt><dd>{personalized ? "İsteniyor" : "İstenmiyor"}</dd></div><div><dt>Birim/toplam fiyat</dt><dd>D07 bekleniyor</dd></div><div><dt>Termin</dt><dd>Değerlendirilecek</dd></div></dl><button type="button" disabled>Teklif talebini gönder</button><p>D07 fiyatlama, onay, minimum adet, termin ve tekliften siparişe dönüşüm kuralları olmadan gönderim açılamaz.</p><ol><li><b>1</b>Talep incelenir</li><li><b>2</b>Ürün ve üretim uygunluğu doğrulanır</li><li><b>3</b>Yetkili teklif paylaşır</li></ol></aside>
    </section>
  </>;
}
