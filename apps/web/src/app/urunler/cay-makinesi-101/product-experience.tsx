"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./product.module.css";

import blue from "../../../../public/assets/products/tea-maker-101-blue.webp";
import red from "../../../../public/assets/products/tea-maker-101-red.webp";
import rose from "../../../../public/assets/products/tea-maker-101-rose-gold.webp";
import silver from "../../../../public/assets/products/tea-maker-101-silver.webp";

type Variant = { id: string; name: string; swatch: string; image: StaticImageData };
const variants: Variant[] = [
  { id: "blue", name: "Lacivert", swatch: "#18304d", image: blue },
  { id: "silver", name: "Gümüş gri", swatch: "#9ba0a1", image: silver },
  { id: "red", name: "Kırmızı", swatch: "#9f202b", image: red },
  { id: "rose", name: "Rose gold", swatch: "#b87d72", image: rose },
];

export default function ProductExperience() {
  const [selectedId, setSelectedId] = useState(variants[0].id);
  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];

  return <>
    <section className={styles.productHero} aria-labelledby="product-title">
      <div className={styles.gallery}>
        <div className={styles.galleryToolbar}><span>Demo ürün</span><span>01 / 01</span></div>
        <div className={styles.imageStage} aria-live="polite">
          <div className={styles.halo} />
          <Image key={selected.id} src={selected.image} alt={`Xinobi Çay Makinesi 101, ${selected.name}`} priority sizes="(max-width: 820px) 94vw, 55vw" />
        </div>
      </div>
      <div className={styles.productInfo}>
        <nav className={styles.breadcrumb} aria-label="Sayfa yolu"><Link href="/urunler">Ürünler</Link><span aria-hidden="true">/</span><span>Çay makineleri</span></nav>
        <p className={styles.eyebrow}>Çay makineleri</p>
        <h1 id="product-title">Çay Makinesi 101</h1>
        <p className={styles.lead}>Çayın ritmini sade bir kullanım deneyimi ve güçlü metal yüzeylerle buluşturan Xinobi yorumu.</p>
        <div className={styles.pendingPrice}><span>Fiyat bilgisi</span><strong>Ürün verisi bekleniyor</strong><p>D02 fiyat ve stok kaynağı kararı sonrasında güncellenecektir.</p></div>
        <fieldset className={styles.variants}>
          <legend>Renk: <strong>{selected.name}</strong></legend>
          <div>{variants.map((variant) => <button type="button" key={variant.id} aria-label={`${variant.name} rengini seç`} aria-pressed={selected.id === variant.id} className={selected.id === variant.id ? styles.selectedVariant : ""} onClick={() => setSelectedId(variant.id)}><span style={{ backgroundColor: variant.swatch }} /><small>{variant.name}</small></button>)}</div>
        </fieldset>
        <div className={styles.actions}>
          <button type="button" disabled aria-describedby="purchase-note">Satış bilgisi hazırlanıyor</button>
          <Link href="/urunler/cay-makinesi-101/kisisellestir">Kişiselleştirme seçenekleri <span aria-hidden="true">→</span></Link>
        </div>
        <p id="purchase-note" className={styles.purchaseNote}>Stok ve fiyat doğrulanmadan sepete ekleme etkinleştirilmez.</p>
        <ul className={styles.summary}>
          <li><span>01</span><p><strong>Renkle eşleşen deneyim</strong>Seçiminiz görsel, editör, sepet ve siparişte aynı varyant kimliğiyle korunacak.</p></li>
          <li><span>02</span><p><strong>Ürün merkezli tasarım</strong>Malzeme ve kullanım ayrıntıları gereksiz görsel kalabalık olmadan öne çıkar.</p></li>
        </ul>
      </div>
    </section>

    <section id="ozellikler" className={styles.features} aria-labelledby="features-title">
      <div><p className={styles.eyebrow}>Ürün yaklaşımı</p><h2 id="features-title">Her ayrıntı, daha sakin bir kullanım için.</h2></div>
      <div className={styles.featureGrid}><article><span>01</span><h3>Tek merkezde kontrol</h3><p>Çay ve su hazırlama deneyimini anlaşılır kontrollerle bir arada sunan ürün yaklaşımı.</p></article><article><span>02</span><h3>Metal yüzey karakteri</h3><p>Demo görsellerdeki malzeme, renk ve ışık dokusu değiştirilmeden sergilenir.</p></article><article><span>03</span><h3>Varyant bütünlüğü</h3><p>Seçilen renk, gerçek ürün verisi bağlandığında tüm satın alma akışında aynı kalır.</p></article></div>
    </section>

    <section id="kisisellestirme" className={styles.personalization} aria-labelledby="personalization-title">
      <div><p className={styles.eyebrow}>Xinobi Studio</p><h2 id="personalization-title">Size ait dokunuş için hazır.</h2><p>Kişiselleştirme alanı ve üretim ölçüleri D04 kararıyla doğrulandıktan sonra bu ürün deneyimine bağlanacaktır.</p></div>
      <div className={styles.placeholder}><span aria-hidden="true">+</span><p><strong>Tasarım alanı bekliyor</strong>Fiziksel baskı sınırı, güvenli alan ve çıktı standardı henüz kesinleşmedi.</p></div>
    </section>
  </>;
}
