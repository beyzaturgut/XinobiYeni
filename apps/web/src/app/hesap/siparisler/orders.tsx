"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import teaMaker from "../../../../public/assets/products/tea-maker-101-blue.webp";
import coffeeMaker from "../../../../public/assets/products/coffee-maker-101-gold.webp";
import styles from "./orders.module.css";

type OrderState = "preparing" | "shipped";
const orders = [
  { id: "DEMO-2401", state: "preparing" as OrderState, label: "Hazırlanıyor", name: "Çay Makinesi 101", color: "Lacivert", image: teaMaker },
  { id: "DEMO-2312", state: "shipped" as OrderState, label: "Kargoda", name: "Kahve Makinesi 101", color: "Gold", image: coffeeMaker },
];

export default function Orders() {
  const [selected, setSelected] = useState(orders[0]);
  return <div className={styles.shell}>
    <div className={styles.title}><div><p>Demo hesap geçmişi</p><h1>Siparişlerim.</h1></div><span>Gerçek sipariş verisi değildir</span></div>
    <div className={styles.notice}><strong>D03/API bekleniyor</strong><p>Numaralar ve durumlar yalnız ekran senaryosudur. Kargo sağlayıcısından canlı veri alınmaz.</p></div>
    <div className={styles.layout}>
      <section className={styles.list} aria-label="Sipariş listesi">{orders.map((order) => <button type="button" key={order.id} aria-pressed={selected.id === order.id} onClick={() => setSelected(order)}><Image src={order.image} alt="" sizes="90px" /><span><small>{order.id} · Örnek tarih</small><strong>{order.name}</strong><i>{order.color}</i></span><b data-state={order.state}>{order.label}</b></button>)}</section>
      <section className={styles.detail} aria-live="polite" aria-labelledby="order-title">
        <div className={styles.detailHeader}><div><p>Sipariş detayı</p><h2 id="order-title">{selected.id}</h2></div><span data-state={selected.state}>{selected.label}</span></div>
        <article className={styles.product}><Image src={selected.image} alt={`${selected.name}, ${selected.color}`} sizes="130px" /><div><p>{selected.name}</p><span>{selected.color} · 1 adet</span><small>Fiyat anlık görüntüsü D02/D03 bekleniyor</small></div></article>
        <ol className={styles.timeline}><li className={styles.done}><i>✓</i><div><strong>Sipariş alındı</strong><span>Demo durum</span></div></li><li className={styles.done}><i>✓</i><div><strong>Hazırlanıyor</strong><span>Üretim/kargo API verisi bekleniyor</span></div></li><li className={selected.state === "shipped" ? styles.done : ""}><i>{selected.state === "shipped" ? "✓" : "3"}</i><div><strong>Kargoya verildi</strong><span>{selected.state === "shipped" ? "Demo kargo durumu" : "Henüz doğrulanmadı"}</span></div></li><li><i>4</i><div><strong>Teslim edildi</strong><span>Canlı takip bağlı değil</span></div></li></ol>
        <div className={styles.tracking}><div><small>Kargo firması</small><strong>Sağlayıcı bekleniyor</strong></div><div><small>Takip numarası</small><strong>Oluşturulmadı</strong></div><button type="button" disabled>Kargoyu takip et</button></div>
        <div className={styles.actions}><button type="button" disabled>Faturayı görüntüle</button><Link href="/#destek">Yardım al</Link><button type="button" disabled>İade talebi</button></div>
      </section>
    </div>
  </div>;
}
