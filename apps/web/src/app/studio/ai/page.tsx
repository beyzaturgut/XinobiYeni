import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AiDesignStudio from "./ai-design-studio";
import styles from "./ai.module.css";

export const metadata: Metadata = { title: "AI Tasarım Stüdyosu | Xinobi", description: "Xinobi ürününüz için tasarım fikirlerini keşfedin." };

export default function AiStudioPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#ai-studio">AI tasarım aracına geç</a>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><div><span>Xinobi Studio</span><strong>AI tasarım fikirleri</strong></div><Link href="/urunler/cay-makinesi-101/editor">Editöre dön <b aria-hidden="true">×</b></Link></header>
    <main id="ai-studio"><AiDesignStudio /></main>
  </div>;
}
