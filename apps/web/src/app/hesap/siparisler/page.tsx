import SiteHeader from "../../../components/site-header";
import type { Metadata } from "next";
import Orders from "./orders";
import styles from "./orders.module.css";

export const metadata: Metadata = { title: "Siparişlerim | Xinobi", description: "Xinobi sipariş ve teslimat durumlarınızı görüntüleyin." };

export default function OrdersPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#orders">Siparişlere geç</a>
    <SiteHeader />
    <main id="orders"><Orders /></main>
  </div>;
}
