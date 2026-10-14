import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import SiteHeader from "../../components/site-header";
import Link from "next/link";
import Catalog from "./catalog";
import styles from "./catalog.module.css";

export const metadata: Metadata = pageMetadata("/urunler/", {
  title: "Ürünler | Xinobi",
  description: "Xinobi çay ve kahve makinelerini, hava temizleyicileri ve mutfak teknolojilerini keşfedin.",
});

export default function ProductsPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#catalog">Ürünlere geç</a>
    <SiteHeader />
    <main>
      <section className={styles.intro} aria-labelledby="catalog-title">
        <p>Xinobi koleksiyonu</p>
        <h1 id="catalog-title">Ürünler</h1>
        <span>Ürünleri keşfedin, detaylarında tüm renk seçeneklerini görün.</span>
      </section>
      <Catalog />
    </main>
    <footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/">Sessiz teknoloji</Link></footer>
  </div>;
}
