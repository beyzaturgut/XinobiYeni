import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Basket from "./basket";
import styles from "./basket.module.css";

export const metadata: Metadata = { title: "Sepetim | Xinobi", description: "Xinobi sepetinizi gözden geçirin." };

export default function BasketPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#basket">Sepete geç</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <nav aria-label="Sepet sayfası menüsü"><Link href="/">Ana sayfa</Link><Link href="/urunler">Ürünler</Link><Link href="/favoriler">Favorilerim</Link><Link href="/sepet" aria-current="page">Sepetim</Link></nav>
      <Link className={styles.continueLink} href="/urunler">Alışverişe devam et <span aria-hidden="true">↗</span></Link>
    </header>
    <main id="basket"><Basket /></main>
  </div>;
}
