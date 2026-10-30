import AccountRequestState from "../../components/account-request-state";
import SiteHeader from "../../components/site-header";
import type { Metadata } from "next";
import Checkout from "./checkout";
import styles from "./checkout.module.css";

export const metadata: Metadata = { title: "Güvenli Ödeme | Xinobi", description: "Xinobi teslimat ve ödeme adımlarını gözden geçirin." };

export default function CheckoutPage() {
  return <div className={styles.page}>
    <a data-skip-link className={styles.skipLink} href="#checkout">Ödeme formuna geç</a>
    <SiteHeader />
    <main id="checkout"><AccountRequestState resource="addresses"><Checkout /></AccountRequestState></main>
  </div>;
}
