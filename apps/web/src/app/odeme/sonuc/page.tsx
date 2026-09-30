import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PaymentResult from "./payment-result";
import styles from "./result.module.css";

export const metadata: Metadata = { title: "Ödeme Durumu | Xinobi", description: "Xinobi ödeme işlemi durumunu görüntüleyin." };

export default function PaymentResultPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#payment-result">Ödeme durumuna geç</a>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><span>Xinobi · İşlem durumu</span><Link href="/urunler">Ürünlere dön ↗</Link></header>
    <main id="payment-result"><PaymentResult /></main>
  </div>;
}
