import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AccountDashboard from "./account-dashboard";
import styles from "./account.module.css";

export const metadata: Metadata = { title: "Hesabım | Xinobi", description: "Xinobi profil ve adres tercihlerinizi yönetin." };

export default function AccountPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#account">Hesap içeriğine geç</a>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><nav aria-label="Hesap menüsü"><Link href="/hesap" aria-current="page">Hesabım</Link><Link href="/favoriler">Favoriler</Link><Link href="/sepet">Sepet</Link></nav><Link href="/">Çıkış önizlemesi <span aria-hidden="true">↗</span></Link></header>
    <main id="account"><AccountDashboard /></main>
  </div>;
}
