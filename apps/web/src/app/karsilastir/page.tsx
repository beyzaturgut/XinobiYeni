import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import Comparison from "./comparison";
import styles from "./compare.module.css";

export const metadata: Metadata = { title: "Ürün Karşılaştırma | Xinobi", description: "Xinobi ürünlerini fiyat, renk, stok, puan ve teknik özelliklerine göre yan yana karşılaştırın." };

export default function ComparePage() {
  return <div className={styles.page}>
    <a data-skip-link className={styles.skipLink} href="#compare">Karşılaştırmaya geç</a>
    <SiteHeader />
    <main id="compare"><Suspense fallback={<p role="status">Karşılaştırma yükleniyor…</p>}><Comparison /></Suspense></main>
    <SiteFooter />
  </div>;
}
