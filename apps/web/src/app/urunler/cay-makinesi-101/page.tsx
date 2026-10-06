import type { Metadata } from "next";
import SiteHeader from "../../../components/site-header";
import Link from "next/link";
import ProductExperience from "./product-experience";
import styles from "./product.module.css";

export const metadata: Metadata = {
  title: "Çay Makinesi 101 | Xinobi",
  description: "Xinobi Çay Makinesi 101 renklerini ve ürün deneyimini keşfedin.",
};

export default function TeaMakerPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#product-detail">Ürün detayına geç</a>
    <SiteHeader />
    <main id="product-detail"><ProductExperience /></main>
    <footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/urunler">Tüm ürünler</Link></footer>
  </div>;
}
