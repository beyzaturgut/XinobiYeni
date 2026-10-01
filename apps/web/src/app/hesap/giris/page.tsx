import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AccountAccess from "./account-access";
import styles from "./account.module.css";

export const metadata: Metadata = { title: "Xinobi Hesabım", description: "Xinobi hesabınıza giriş yapın veya yeni hesap oluşturun." };

export default function AccountPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#account-form">Hesap formuna geç</a>
    <header className={styles.header} data-mobile-three-column><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><span>Xinobi hesabı</span><Link href="/">Ana sayfaya dön <b aria-hidden="true">×</b></Link></header>
    <main id="account-form"><AccountAccess /></main>
  </div>;
}
