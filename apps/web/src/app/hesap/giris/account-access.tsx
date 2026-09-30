"use client";

import { useState } from "react";
import styles from "./account.module.css";

type Mode = "login" | "register" | "reset";

export default function AccountAccess() {
  const [mode, setMode] = useState<Mode>("login");
  const [visible, setVisible] = useState(false);
  const copy = mode === "login" ? { kicker: "Tekrar hoş geldiniz", title: "Hesabınıza giriş yapın.", action: "Giriş yap" } : mode === "register" ? { kicker: "Xinobi'ye katılın", title: "Yeni hesabınızı oluşturun.", action: "Hesap oluştur" } : { kicker: "Hesap kurtarma", title: "Parolanızı yenileyin.", action: "Yenileme bağlantısı gönder" };

  return <div className={styles.layout}>
    <section className={styles.story}><div><p>Xinobi hesabı</p><h1>Seçimleriniz, tasarımlarınız ve siparişleriniz tek yerde.</h1></div><ul><li><span>01</span>Favorilerinizi cihazlarınız arasında koruyun.</li><li><span>02</span>Kişisel tasarımlarınıza yeniden ulaşın.</li><li><span>03</span>Sipariş ve teslimat durumunuzu izleyin.</li></ul><small>Bu özellikler kimlik ve iş API&apos;leri tamamlandıktan sonra etkinleşecektir.</small></section>
    <section className={styles.formPanel} aria-labelledby="access-title">
      <div className={styles.tabs} role="tablist" aria-label="Hesap işlemi"><button type="button" role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")}>Giriş</button><button type="button" role="tab" aria-selected={mode === "register"} onClick={() => setMode("register")}>Yeni hesap</button></div>
      <p className={styles.kicker}>{copy.kicker}</p><h2 id="access-title">{copy.title}</h2>
      <div className={styles.demoNotice}><strong>Arayüz prototipi</strong><span>Form verileri gönderilmez; gerçek kullanıcı veya oturum oluşturulmaz.</span></div>
      <form onSubmit={(event) => event.preventDefault()}>
        {mode === "register" && <label>Ad soyad<input type="text" autoComplete="name" placeholder="Adınız ve soyadınız" /></label>}
        <label>E-posta adresi<input type="email" autoComplete="email" placeholder="ornek@eposta.com" /></label>
        {mode !== "reset" && <label>Parola<div className={styles.password}><input type={visible ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="En az 8 karakter" /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Parolayı gizle" : "Parolayı göster"}>{visible ? "Gizle" : "Göster"}</button></div></label>}
        {mode === "register" && <label className={styles.consent}><input type="checkbox" /><span>Üyelik koşullarını ve gizlilik bildirimini okudum. <small>D10 yasal metni bekleniyor.</small></span></label>}
        <button className={styles.submit} type="submit" disabled>{copy.action}</button>
      </form>
      {mode === "login" && <button className={styles.textAction} type="button" onClick={() => setMode("reset")}>Parolamı unuttum</button>}
      {mode === "reset" && <button className={styles.textAction} type="button" onClick={() => setMode("login")}>Giriş ekranına dön</button>}
      <p className={styles.blocker}>Kimlik API&apos;si, e-posta sağlayıcısı, brute-force koruması ve D10 metinleri tamamlanmadan işlem açılamaz.</p>
    </section>
  </div>;
}
