import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Catalog from "./catalog";
import styles from "./catalog.module.css";

export const metadata: Metadata = {
  title: "Ürünler | Xinobi",
  description: "Xinobi çay ve kahve makinelerini, hava temizleyicileri ve mutfak teknolojilerini keşfedin.",
};

export default function ProductsPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#catalog">Ürünlere geç</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <nav aria-label="Ürün sayfası menüsü"><Link href="/">Ana sayfa</Link><Link href="/urunler" aria-current="page">Ürünler</Link><Link href="/arama">Ara ve karşılaştır</Link><Link href="/#kisisellestirme">Kişiselleştir</Link></nav>
      <Link className={styles.backLink} href="/favoriler">Favorilerim <span aria-hidden="true">♡</span></Link>
    </header>
    <main>
      <section className={styles.intro} aria-labelledby="catalog-title">
        <p>Xinobi koleksiyonu</p>
        <h1 id="catalog-title">Günün her anı için yalın teknoloji.</h1>
        <span>Demo katalog · Fiyat ve stok verileri D02 kararı sonrasında bağlanacaktır.</span>
      </section>
      <Catalog />
    </main>
    <footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/">Sessiz teknoloji</Link></footer>
  </div>;
}
