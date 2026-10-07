import SiteHeader from "../../components/site-header";
import type { Metadata } from "next";
import SalesAssistant from "./sales-assistant";
import styles from "./assistant.module.css";

export const metadata: Metadata = { title: "Xinobi Asistan", description: "Xinobi ürünlerini keşfetmek için satış asistanı arayüzü." };

export default function AssistantPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#assistant">Asistana geç</a>
    <SiteHeader />
    <main id="assistant"><SalesAssistant /></main>
  </div>;
}
