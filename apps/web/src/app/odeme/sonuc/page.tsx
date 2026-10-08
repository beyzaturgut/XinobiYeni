import SiteHeader from "../../../components/site-header";
import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentResult from "./payment-result";
import styles from "./result.module.css";

export const metadata: Metadata = { title: "Ödeme Durumu | Xinobi", description: "Xinobi ödeme işlemi durumunu görüntüleyin." };

export default function PaymentResultPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#payment-result">Ödeme durumuna geç</a>
    <SiteHeader />
    <main id="payment-result"><Suspense><PaymentResult /></Suspense></main>
  </div>;
}
