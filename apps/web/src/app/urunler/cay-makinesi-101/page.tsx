import type { Metadata } from "next";
import Image from "next/image";
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
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <nav aria-label="Ürün detay menüsü"><Link href="/">Ana sayfa</Link><Link href="/urunler">Ürünler</Link><a href="#ozellikler">Özellikler</a><Link href="/urunler/cay-makinesi-101/kisisellestir">Kişiselleştirme</Link></nav>
      <Link className={styles.catalogLink} href="/urunler">Kataloğa dön <span aria-hidden="true">↗</span></Link>
    </header>
    <main id="product-detail"><ProductExperience /></main>
    <footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/urunler">Tüm ürünler</Link></footer>
  </div>;
}
