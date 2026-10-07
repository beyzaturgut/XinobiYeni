import type { Metadata } from "next";
import AccountAccess from "./account-access";
import styles from "./account.module.css";

export const metadata: Metadata = { title: "Xinobi Hesabım", description: "Xinobi hesabınıza giriş yapın veya yeni hesap oluşturun." };

export default function AccountPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#account-form">Hesap formuna geç</a>
    <main id="account-form"><AccountAccess /></main>
  </div>;
}
