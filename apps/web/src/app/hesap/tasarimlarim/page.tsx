import SiteHeader from "../../../components/site-header";
import CommerceFooter from "../../../components/commerce-footer";
import type { Metadata } from "next";
import MyDesigns from "./my-designs";
import styles from "../account.module.css";

export const metadata: Metadata = { title: "Tasarımlarım | Xinobi", description: "XINOBI U ile oluşturduğun ve yüklediğin tasarımlar." };

export default function DesignsPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#designs">Tasarımlara geç</a>
    <SiteHeader />
    <main id="designs"><MyDesigns /></main>
    <CommerceFooter />
  </div>;
}
