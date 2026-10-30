import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import QuoteTracking from "./quote-tracking";
import styles from "./tracking.module.css";

export const metadata: Metadata = { title: "Teklif Takibi | Xinobi", description: "Xinobi kurumsal teklifinizin durumunu ve revizyonlarını görüntüleyin." };

export default function QuoteTrackingPage() {
  return <div className={styles.page}>
    <a data-skip-link className={styles.skipLink} href="#quote-tracking">Teklif takibine geç</a>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><nav aria-label="Kurumsal menü"><Link href="/kurumsal/teklif">Yeni talep</Link><Link href="/kurumsal/teklif/takip" aria-current="page">Teklif takibi</Link></nav><Link href="/">Ana sayfaya dön ↗</Link></header>
    <main id="quote-tracking"><Suspense fallback={<p role="status">Yükleniyor…</p>}><QuoteTracking /></Suspense></main>
  </div>;
}
