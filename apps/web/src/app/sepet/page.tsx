import type { Metadata } from "next";
import SiteHeader from "../../components/site-header";
import CommerceFooter from "../../components/commerce-footer";
import Basket from "./basket";
import styles from "./basket.module.css";

export const metadata: Metadata = { title: "Sepetim | Xinobi", description: "Xinobi sepetinizi gözden geçirin." };

export default function BasketPage() {
  return <div className={styles.page}>
    <a data-skip-link className={styles.skipLink} href="#basket">Sepete geç</a>
    <SiteHeader/>
    <main id="basket"><Basket /></main>
    <CommerceFooter />
  </div>;
}
