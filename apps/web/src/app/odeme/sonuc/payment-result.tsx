"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./result.module.css";

type Status = "pending" | "failed" | "success";
const states = {
  pending: { eyebrow: "İşlem bekliyor", icon: "…", title: "Ödeme sonucu henüz kesinleşmedi.", copy: "Sağlayıcıdan doğrulanmış sonuç gelmeden sipariş başarılı kabul edilmez. Gerçek uygulamada durum güvenli biçimde yeniden sorgulanır.", action: "Durumu yeniden kontrol et" },
  failed: { eyebrow: "İşlem tamamlanamadı", icon: "×", title: "Ödeme onaylanmadı.", copy: "Başarısız işlem sipariş oluşturmaz. Gerçek hata kodu güvenli bir kullanıcı mesajına çevrilir ve aynı ödeme körlemesine tekrarlanmaz.", action: "Ödeme adımına dön" },
  success: { eyebrow: "Örnek başarılı durum", icon: "✓", title: "Ödeme doğrulandı.", copy: "Bu yalnız tasarım önizlemesidir. Gerçek ekranda bu durum ancak sağlayıcı sonucu sunucuda doğrulandıktan ve sipariş kesinleştikten sonra gösterilir.", action: "Sipariş örneğini gör" },
} as const;

export default function PaymentResult() {
  const [status, setStatus] = useState<Status>("pending");
  const current = states[status];
  return <div className={styles.shell}>
    <div className={styles.demoSwitch} role="group" aria-label="Ödeme sonucu senaryosu"><span>Senaryo önizlemesi</span>{(["pending", "failed", "success"] as const).map((item) => <button type="button" key={item} aria-pressed={status === item} onClick={() => setStatus(item)}>{item === "pending" ? "Bekliyor" : item === "failed" ? "Başarısız" : "Başarılı"}</button>)}</div>
    <section className={styles.resultCard} data-status={status} aria-live="polite">
      <div className={styles.icon} aria-hidden="true">{current.icon}</div><p>{current.eyebrow}</p><h1>{current.title}</h1><span>{current.copy}</span>
      <div className={styles.reference}><div><small>İşlem referansı</small><strong>DEMO-İŞLEM</strong></div><div><small>Sipariş numarası</small><strong>Oluşturulmadı</strong></div></div>
      <div className={styles.actions}>{status === "failed" ? <Link href="/odeme">{current.action} →</Link> : <button type="button" disabled>{current.action}</button>}<Link href="/urunler">Alışverişe dön</Link></div>
      <aside><strong>Gerçek işlem değildir</strong><span>Bu sayfa ödeme sağlayıcısına bağlı değildir; para çekilmedi ve sipariş oluşturulmadı.</span></aside>
    </section>
    <section className={styles.timeline} aria-label="Ödeme doğrulama adımları"><article><b>01</b><div><strong>Sağlayıcı dönüşü</strong><span>İmzalı sonuç ve işlem kimliği alınır.</span></div></article><article><b>02</b><div><strong>Sunucu doğrulaması</strong><span>Tutar, para birimi ve idempotency kontrol edilir.</span></div></article><article><b>03</b><div><strong>Sipariş kesinleşmesi</strong><span>Yalnız doğrulama sonrası sipariş durumu güncellenir.</span></div></article></section>
  </div>;
}
