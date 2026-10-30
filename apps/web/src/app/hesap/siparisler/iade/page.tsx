import AccountRequestState from "../../../../components/account-request-state";
import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import ReturnRequest from "./return-request";
import styles from "./return.module.css";

export const metadata: Metadata = { title: "İptal ve İade Talebi | Xinobi", description: "Xinobi siparişiniz için iptal veya iade talebi oluşturun." };

export default function ReturnPage() {
  return <div className={styles.page}>
    <a data-skip-link className={styles.skipLink} href="#return-form">Talep formuna geç</a>
    <header className={styles.header} data-mobile-three-column><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><span>Destek · İptal ve iade</span><Link href="/hesap/siparisler">Siparişe dön <b aria-hidden="true">×</b></Link></header>
    <main id="return-form"><AccountRequestState resource="orders"><Suspense fallback={<p role="status">Yükleniyor…</p>}><ReturnRequest /></Suspense></AccountRequestState></main>
  </div>;
}
