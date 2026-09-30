"use client";

import Image from "next/image";
import { useState } from "react";
import teaMaker from "../../../../../public/assets/products/tea-maker-101-blue.webp";
import styles from "./return.module.css";

type RequestType = "cancel" | "return";

export default function ReturnRequest() {
  const [type, setType] = useState<RequestType>("return");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [previewed, setPreviewed] = useState(false);
  const ready = Boolean(reason && description.trim().length >= 10);

  return <div className={styles.layout}>
    <section className={styles.formArea} aria-labelledby="return-title">
      <p className={styles.eyebrow}>Demo talep akışı</p><h1 id="return-title">Nasıl yardımcı olabiliriz?</h1>
      <div className={styles.notice}><strong>Gerçek talep oluşturulmaz</strong><span>Bu form arayüz önizlemesidir. Veriler gönderilmez; iptal, iade veya ücret geri ödemesi başlatılmaz.</span></div>
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset><legend>01 · İşlem türü</legend><div className={styles.typeGrid}><label className={type === "cancel" ? styles.selected : ""}><input type="radio" name="type" checked={type === "cancel"} onChange={() => { setType("cancel"); setPreviewed(false); }} /><span><strong>İptal talebi</strong><small>Hazırlık aşamasındaki siparişler için</small></span></label><label className={type === "return" ? styles.selected : ""}><input type="radio" name="type" checked={type === "return"} onChange={() => { setType("return"); setPreviewed(false); }} /><span><strong>İade talebi</strong><small>Teslim edilen ürünler için</small></span></label></div></fieldset>
        <fieldset><legend>02 · Ürün</legend><label className={styles.product}><input type="checkbox" defaultChecked /><Image src={teaMaker} alt="Lacivert Çay Makinesi 101" sizes="80px" /><span><strong>Çay Makinesi 101</strong><small>Lacivert · 1 adet · DEMO-2401</small></span></label></fieldset>
        <fieldset><legend>03 · Talep nedeni</legend><label className={styles.field}>Neden<select value={reason} onChange={(event) => { setReason(event.target.value); setPreviewed(false); }}><option value="">Seçiniz</option><option>Fikrimi değiştirdim</option><option>Yanlış ürün seçtim</option><option>Ürün hasarlı ulaştı</option><option>Ürün beklentimi karşılamadı</option><option>Diğer</option></select></label><label className={styles.field}>Açıklama<textarea rows={5} value={description} onChange={(event) => { setDescription(event.target.value.slice(0, 500)); setPreviewed(false); }} placeholder="Talebinizi en az 10 karakterle açıklayın" /><small>{description.length}/500</small></label></fieldset>
        <fieldset><legend>04 · Görsel veya belge</legend><div className={styles.upload}><span aria-hidden="true">↑</span><strong>Dosya yükleme henüz etkin değil</strong><small>Dosya türü, boyut, virüs taraması ve saklama politikası D10/API sonrası tanımlanacaktır.</small><button type="button" disabled>Dosya seç</button></div></fieldset>
        <button className={styles.previewButton} type="button" disabled={!ready} onClick={() => setPreviewed(true)}>Demo talep özetini hazırla</button>
      </form>
      <p className={styles.status} aria-live="polite">{previewed ? "Demo özet hazırlandı; talep sunucuya gönderilmedi." : ""}</p>
    </section>
    <aside className={styles.summary}><p>Talep özeti</p><h2>{type === "return" ? "İade" : "İptal"} önizlemesi</h2><dl><div><dt>Sipariş</dt><dd>DEMO-2401</dd></div><div><dt>Ürün</dt><dd>Çay Makinesi 101</dd></div><div><dt>Neden</dt><dd>{reason || "Henüz seçilmedi"}</dd></div><div><dt>Uygunluk</dt><dd>D03 bekleniyor</dd></div><div><dt>Geri ödeme</dt><dd>Hesaplanmadı</dd></div></dl><button type="button" disabled>Talebi gönder</button><p>D03 iptal/iade ve ücret iadesi kuralları ile D10 saklama metni doğrulanmadan işlem açılamaz.</p><ul><li>Kişiselleştirilmiş ürün uygunluğu ayrıca değerlendirilir.</li><li>Ücret iadesi ödeme sağlayıcısı sonucuyla kesinleşir.</li><li>Talep geçmişi değiştirilemez audit kaydı taşır.</li></ul></aside>
  </div>;
}
