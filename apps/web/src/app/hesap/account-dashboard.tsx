"use client";

import { useState } from "react";
import styles from "./account.module.css";

type View = "profile" | "addresses";

export default function AccountDashboard() {
  const [view, setView] = useState<View>("profile");
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");

  function demoSave(label: string) {
    setEditing(false);
    setNotice(`${label} değişiklikleri yalnız bu oturumda önizlendi; sunucuya kaydedilmedi.`);
  }

  return <div className={styles.layout}>
    <aside className={styles.sidebar}>
      <p>Demo hesap</p><div className={styles.avatar}>BT</div><h1>Beyza Turgut</h1><span>Üyelik API&apos;si bekleniyor</span>
      <nav aria-label="Hesap bölümleri"><button type="button" aria-current={view === "profile" ? "page" : undefined} onClick={() => { setView("profile"); setEditing(false); }}>Profil bilgilerim <b>→</b></button><button type="button" aria-current={view === "addresses" ? "page" : undefined} onClick={() => { setView("addresses"); setEditing(false); }}>Adreslerim <b>→</b></button><button type="button" disabled>Siparişlerim <small>WEB-013</small></button><button type="button" disabled>Tasarımlarım <small>Faz06</small></button></nav>
      <div className={styles.privacy}><strong>D10 gizlilik kararı bekleniyor</strong><span>Veri saklama, hesap silme ve pazarlama tercihleri gerçek metinlerle bağlanacaktır.</span></div>
    </aside>

    <section className={styles.content} aria-live="polite">
      <div className={styles.contentHeader}><div><p>{view === "profile" ? "Kişisel bilgiler" : "Teslimat bilgileri"}</p><h2>{view === "profile" ? "Profilim" : "Adreslerim"}</h2></div><button type="button" onClick={() => setEditing(!editing)}>{editing ? "Vazgeç" : view === "profile" ? "Profili düzenle" : "Yeni adres"}</button></div>
      <div className={styles.demoNotice}><strong>Arayüz prototipi</strong><span>Gösterilen bilgiler örnektir. Gerçek müşteri verisi okunmaz veya kaydedilmez.</span></div>

      {view === "profile" ? <>
        <section className={styles.panel} aria-labelledby="profile-title"><div className={styles.panelTitle}><h3 id="profile-title">Hesap bilgileri</h3><span>Demo veri</span></div>{editing ? <div className={styles.formGrid}><label>Ad soyad<input defaultValue="Beyza Turgut" /></label><label>E-posta<input type="email" defaultValue="demo@xinobi.example" /></label><label>Telefon<input type="tel" defaultValue="05xx xxx xx xx" /></label><label>Doğum tarihi<input type="text" placeholder="GG.AA.YYYY" /></label><button type="button" onClick={() => demoSave("Profil")}>Demo değişiklikleri uygula</button></div> : <dl className={styles.dataList}><div><dt>Ad soyad</dt><dd>Beyza Turgut</dd></div><div><dt>E-posta</dt><dd>demo@xinobi.example</dd></div><div><dt>Telefon</dt><dd>05xx xxx xx xx</dd></div><div><dt>Parola</dt><dd>•••••••• <button type="button" disabled>Değiştir</button></dd></div></dl>}</section>
        <section className={styles.panel}><div className={styles.panelTitle}><h3>İletişim tercihleri</h3><span>D10 bekleniyor</span></div><label className={styles.toggle}><input type="checkbox" disabled /><span><strong>Kampanya ve ürün haberleri</strong><small>Onay metni ve kanal tercihleri hukuk kararı sonrası açılır.</small></span></label></section>
      </> : <>
        {editing && <section className={styles.panel}><div className={styles.panelTitle}><h3>Yeni adres</h3><span>Demo form</span></div><div className={styles.formGrid}><label>Adres başlığı<input placeholder="Ev, iş..." /></label><label>Ad soyad<input /></label><label>İl<input /></label><label>İlçe<input /></label><label className={styles.full}>Açık adres<textarea rows={3} /></label><button type="button" onClick={() => demoSave("Adres")}>Demo adresi hazırla</button></div></section>}
        <div className={styles.addressGrid}><article><div><span>Varsayılan</span><button type="button" disabled>•••</button></div><h3>Ev</h3><p>Beyza Turgut<br />Örnek Mahallesi, Demo Sokak<br />İstanbul</p><small>05xx xxx xx xx</small></article><div className={styles.addressEmpty}><span>+</span><strong>Başka adres ekleyin</strong><p>Gerçek kayıt API bağlantısından sonra açılır.</p></div></div>
      </>}
      <p className={styles.status}>{notice}</p>
    </section>
  </div>;
}
