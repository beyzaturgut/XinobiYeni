"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./legal-consent.module.css";

export default function LegalConsent() {
  const [open, setOpen] = useState(true);
  const [detail, setDetail] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [notice, setNotice] = useState("");

  function apply(label: string) {
    setNotice(`${label} seçimi yalnızca bu prototip ekranında gösterildi; cihazınıza kaydedilmedi.`);
    setDetail(false);
  }

  if (!open) return <button className={styles.reopen} type="button" onClick={() => setOpen(true)}>Çerez tercihleri</button>;

  return <aside className={styles.banner} aria-label="Çerez tercihleri" aria-live="polite">
    <div className={styles.copy} style={{ minWidth: 0 }}><span>Gizlilik tercihleri · Taslak</span><h2>Kontrol sizde.</h2><p>Bu prototip zorunlu olmayan çerezleri veya analitik araçlarını çalıştırmaz. Tercih kaydı D10 hukuk ve saklama kararı sonrasında uygulanacaktır.</p><Link href="/yasal">Taslak yasal merkezi inceleyin →</Link></div>
    {detail && <fieldset className={styles.options}><legend>Tercih kategorileri</legend><label><span><strong>Zorunlu</strong><small>Güvenlik ve temel sayfa işlevleri</small></span><input type="checkbox" checked disabled /></label><label><span><strong>Analitik</strong><small>Kullanım ölçümü — şu anda yüklenmez</small></span><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /></label><label><span><strong>Pazarlama</strong><small>Kişiselleştirme — şu anda yüklenmez</small></span><input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} /></label></fieldset>}
    {notice && <p className={styles.notice}>{notice}</p>}
    <div className={styles.actions}>{detail ? <button type="button" onClick={() => apply("Özel")}>Tercihi uygula</button> : <button type="button" onClick={() => { setDetail(true); setNotice(""); }}>Ayarları yönet</button>}<button type="button" onClick={() => apply("Yalnızca zorunlu")}>Yalnızca zorunlu</button><button type="button" onClick={() => apply("Tümüne izin ver")}>Tümüne izin ver</button><button className={styles.close} type="button" aria-label="Çerez tercih panelini kapat" onClick={() => setOpen(false)}>×</button></div>
  </aside>;
}
