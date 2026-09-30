import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SalesAssistant from "./sales-assistant";
import styles from "./assistant.module.css";

export const metadata: Metadata = { title: "Xinobi Asistan", description: "Xinobi ürünlerini keşfetmek için satış asistanı arayüzü." };

export default function AssistantPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#assistant">Asistana geç</a>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><div><span>Xinobi Asistan</span><strong>Ürün keşfi</strong></div><Link href="/">Kapat <b aria-hidden="true">×</b></Link></header>
    <main id="assistant"><SalesAssistant /></main>
  </div>;
}
