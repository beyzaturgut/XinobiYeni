import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import QuoteForm from "./quote-form";
import styles from "./quote.module.css";

export const metadata: Metadata = { title: "Kurumsal Teklif | Xinobi", description: "Xinobi kurumsal ve toplu ürün ihtiyaçlarınız için teklif talebi oluşturun." };

export default function QuotePage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#quote-form">Teklif formuna geç</a>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><nav aria-label="Kurumsal menü"><Link href="/">Ana sayfa</Link><Link href="/urunler">Ürünler</Link><Link href="/kurumsal/teklif" aria-current="page">Kurumsal teklif</Link></nav><Link href="/">Xinobi&apos;ye dön ↗</Link></header>
    <main id="quote-form"><QuoteForm /></main>
  </div>;
}
