import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Favorites from "./favorites";
import styles from "./favorites.module.css";

export const metadata: Metadata = { title: "Favorilerim | Xinobi", description: "Beğendiğiniz Xinobi ürünlerini yeniden keşfedin." };

export default function FavoritesPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#favorites">Favorilere geç</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <nav aria-label="Favoriler sayfası menüsü"><Link href="/">Ana sayfa</Link><Link href="/urunler">Ürünler</Link><Link href="/arama">Ara ve karşılaştır</Link><Link href="/favoriler" aria-current="page">Favorilerim</Link></nav>
      <Link className={styles.catalogLink} href="/urunler">Ürünleri keşfet <span aria-hidden="true">↗</span></Link>
    </header>
    <main id="favorites"><Favorites /></main>
  </div>;
}
