import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import EditorWorkspace from "./editor-workspace";
import styles from "./editor.module.css";

export const metadata: Metadata = {
  title: "Gelişmiş Tasarım Editörü | Xinobi Studio",
  description: "Xinobi Studio gelişmiş tasarım editörü deneyimini keşfedin.",
};

export default function AdvancedEditorPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#editor-workspace">Editör çalışma alanına geç</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <div className={styles.documentTitle}><span>Xinobi Studio</span><strong>İsimsiz tasarım</strong><small>Demo · Kaydedilmedi</small></div>
      <div className={styles.headerActions}>
        <Link href="/urunler/cay-makinesi-101/kisisellestir">Basit moda dön</Link>
        <button type="button" disabled>Sepete aktar</button>
      </div>
    </header>
    <main id="editor-workspace"><EditorWorkspace /></main>
  </div>;
}
