import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SearchCompare from "./search-compare";
import styles from "./search.module.css";

export const metadata: Metadata = {
  title: "Ara ve Karşılaştır | Xinobi",
  description: "Xinobi ürünlerini bulun, özelliklerini yan yana karşılaştırın.",
};

export default function SearchPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#search-workspace">Arama alanına geç</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <nav aria-label="Arama sayfası menüsü"><Link href="/">Ana sayfa</Link><Link href="/urunler">Ürünler</Link><Link href="/arama" aria-current="page">Ara ve karşılaştır</Link></nav>
      <Link className={styles.closeLink} href="/urunler">Kataloğa dön <span aria-hidden="true">↗</span></Link>
    </header>
    <main id="search-workspace"><SearchCompare /></main>
  </div>;
}
