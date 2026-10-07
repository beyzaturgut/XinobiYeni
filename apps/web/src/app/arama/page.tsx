import SiteHeader from "../../components/site-header";
import type { Metadata } from "next";
import SearchCompare from "./search-compare";
import styles from "./search.module.css";

export const metadata: Metadata = {
  title: "Ara ve Karşılaştır | Xinobi",
  description: "Xinobi ürünlerini bulun, özelliklerini yan yana karşılaştırın.",
};

export default function SearchPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#search-workspace">Arama alanına geç</a>
    <SiteHeader />
    <main id="search-workspace"><SearchCompare /></main>
  </div>;
}
