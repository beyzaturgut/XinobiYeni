"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import teaMaker from "../../../public/assets/products/tea-maker-101-blue.webp";
import styles from "./basket.module.css";

export default function Basket() {
  const [quantity, setQuantity] = useState(1);
  const [hasItem, setHasItem] = useState(true);

  return <>
    <section className={styles.hero}><p>Siparişe hazırlık</p><h1>Sepetim.</h1><span>Demo sepet · Sunucuya kaydedilmez ve stok ayırmaz.</span></section>
    <section className={styles.layout}>
      <div className={styles.lines} aria-live="polite">
        <div className={styles.sectionTitle}><h2>Ürünler</h2><span>{hasItem ? `${quantity} ürün` : "Sepet boş"}</span></div>
        {hasItem ? <article className={styles.line}>
          <Link className={styles.media} href="/urunler/cay-makinesi-101"><Image src={teaMaker} alt="Lacivert Çay Makinesi 101" sizes="(max-width: 680px) 38vw, 220px" /></Link>
          <div className={styles.lineCopy}><p>Çay makineleri</p><h2>Çay Makinesi 101</h2><dl><div><dt>Renk</dt><dd><i /> Lacivert</dd></div><div><dt>Kişiselleştirme</dt><dd>Eklenmedi</dd></div></dl><Link href="/urunler/cay-makinesi-101/kisisellestir">Kişiselleştir ↗</Link></div>
          <div className={styles.lineActions}><div className={styles.quantity} role="group" aria-label="Ürün adedi"><button type="button" onClick={() => quantity === 1 ? setHasItem(false) : setQuantity(quantity - 1)} aria-label="Adedi azalt">−</button><output aria-live="polite">{quantity}</output><button type="button" onClick={() => setQuantity(Math.min(9, quantity + 1))} disabled={quantity === 9} aria-label="Adedi artır">+</button></div><strong>Fiyat bekleniyor</strong><button className={styles.remove} type="button" onClick={() => setHasItem(false)}>Sepetten çıkar</button></div>
        </article> : <div className={styles.empty}><span aria-hidden="true">◇</span><h2>Sepetiniz şu anda boş.</h2><p>Ürünleri keşfederek alışverişe yeniden başlayabilirsiniz.</p><Link href="/urunler">Ürünleri keşfet →</Link></div>}
        <div className={styles.assurance}><article><span>01</span><div><strong>Stok doğrulaması</strong><p>Gerçek stok, API bağlandıktan sonra sepete ekleme ve ödeme öncesinde yeniden kontrol edilir.</p></div></article><article><span>02</span><div><strong>Güvenli fiyat</strong><p>Fiyat, vergi ve kampanya hesabında sunucu tek otorite olacaktır.</p></div></article></div>
      </div>

      <aside className={styles.summary} aria-labelledby="summary-title">
        <p>Sipariş özeti</p><h2 id="summary-title">Henüz hesaplanmadı.</h2>
        <dl><div><dt>Ara toplam</dt><dd>D02 bekleniyor</dd></div><div><dt>Kişiselleştirme</dt><dd>—</dd></div><div><dt>Teslimat</dt><dd>Adres sonrası</dd></div><div className={styles.total}><dt>Toplam</dt><dd>API bekleniyor</dd></div></dl>
        <button type="button" disabled aria-describedby="checkout-note">Ödemeye geç</button>
        <p id="checkout-note">Fiyat, stok ve rezervasyon kuralları D02/D03 ile doğrulanmadan ödeme başlatılamaz.</p>
        <div className={styles.blocker}><strong>İşlem güvenliği</strong><span>Bu ekranda ödeme alınmaz ve sipariş oluşturulmaz.</span></div>
      </aside>
    </section>
  </>;
}
