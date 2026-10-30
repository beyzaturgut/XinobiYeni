import { Suspense } from "react";
import SiteHeader from "../../components/site-header";
import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import SearchCompare from "./search-compare";
import styles from "./search.module.css";

export const metadata: Metadata = pageMetadata("/arama/", {
  title: "Ara ve Karşılaştır | Xinobi",
  description: "Xinobi ürünlerini bulun, özelliklerini yan yana karşılaştırın.",
});

export default function SearchPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#search-workspace">Arama alanına geç</a>
    <SiteHeader />
    <main id="search-workspace"><Suspense fallback={<p role="status">Arama yükleniyor…</p>}><SearchCompare /></Suspense></main>
  </div>;
}
