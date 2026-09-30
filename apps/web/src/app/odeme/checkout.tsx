"use client";

import { useState } from "react";
import styles from "./checkout.module.css";

export default function Checkout() {
  const [method, setMethod] = useState<"card" | "transfer">("card");
  return <div className={styles.layout}>
    <section className={styles.formArea} aria-labelledby="checkout-title">
      <div className={styles.steps} aria-label="Ödeme adımları"><span className={styles.active}>1 <b>Teslimat</b></span><i /><span>2 <b>Ödeme</b></span><i /><span>3 <b>Sonuç</b></span></div>
      <p className={styles.eyebrow}>Adım 1 / 3</p><h1 id="checkout-title">Teslimat bilgileri.</h1>
      <div className={styles.notice}><strong>Güvenli prototip</strong><p>Bu form ödeme veya sipariş oluşturmaz. Girilen bilgiler sunucuya gönderilmez ve kalıcı tutulmaz.</p></div>
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset><legend>İletişim</legend><div className={styles.grid}><label>Ad soyad<input type="text" autoComplete="name" placeholder="Adınız ve soyadınız" /></label><label>Telefon<input type="tel" autoComplete="tel" placeholder="05xx xxx xx xx" /></label><label className={styles.full}>E-posta<input type="email" autoComplete="email" placeholder="ornek@eposta.com" /></label></div></fieldset>
        <fieldset><legend>Teslimat adresi</legend><div className={styles.grid}><label>İl<input type="text" autoComplete="address-level1" /></label><label>İlçe<input type="text" autoComplete="address-level2" /></label><label className={styles.full}>Adres<textarea autoComplete="street-address" rows={3} /></label></div></fieldset>
        <fieldset><legend>Ödeme yöntemi</legend><div className={styles.methods}><label className={method === "card" ? styles.selected : ""}><input type="radio" name="method" checked={method === "card"} onChange={() => setMethod("card")} /><span><strong>Kredi / banka kartı</strong><small>Sağlayıcı seçimi D05 bekliyor</small></span></label><label className={method === "transfer" ? styles.selected : ""}><input type="radio" name="method" checked={method === "transfer"} onChange={() => setMethod("transfer")} /><span><strong>Havale / EFT</strong><small>Hesap ve onay akışı D03 bekliyor</small></span></label></div></fieldset>
        <div className={styles.paymentPlaceholder}><span aria-hidden="true">◇</span><div><strong>{method === "card" ? "Kart alanı etkin değil" : "Banka bilgileri etkin değil"}</strong><p>Gerçek sağlayıcı, 3D Secure, havale hesabı ve idempotency sözleşmesi doğrulandıktan sonra güvenli alan burada açılacaktır.</p></div></div>
      </form>
    </section>
    <aside className={styles.summary}><p>Sipariş özeti</p><h2>1 demo ürün</h2><dl><div><dt>Çay Makinesi 101</dt><dd>Fiyat bekleniyor</dd></div><div><dt>Teslimat</dt><dd>Adres sonrası</dd></div><div><dt>Toplam</dt><dd>D02 bekleniyor</dd></div></dl><button type="button" disabled aria-describedby="payment-note">Ödemeyi başlat</button><p id="payment-note">D02 fiyat/stok, D03 ödeme-rezervasyon ve D05 sağlayıcı erişimi kapanmadan işlem başlatılamaz.</p><ul><li>Ham kart verisi Xinobi sunucusunda tutulmayacak.</li><li>Bu prototip herhangi bir tutar çekmez.</li><li>Başarı ekranı gerçek sağlayıcı sonucu olmadan gösterilmez.</li></ul></aside>
  </div>;
}
