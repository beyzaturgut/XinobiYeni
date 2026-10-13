import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PersonalizationStudio from "./personalization-studio";
import styles from "./studio.module.css";

export const metadata: Metadata = {
  title: "Ürün seçimi | Xinobi Studio",
  description: "Xinobi Studio basit kişiselleştirme deneyimini keşfedin.",
};

export default function PersonalizeTeaMakerPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#studio">Kişiselleştirme aracına geç</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <div className={styles.headerTitle}><span>Xinobi Studio</span><strong>Basit kişiselleştirme</strong></div>
      <Link className={styles.closeLink} href="/urunler/cay-makinesi-101">Ürüne dön <span aria-hidden="true">×</span></Link>
    </header>
    <main id="studio"><PersonalizationStudio /></main>
  </div>;
}
