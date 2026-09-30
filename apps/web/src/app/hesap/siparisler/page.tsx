import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Orders from "./orders";
import styles from "./orders.module.css";

export const metadata: Metadata = { title: "Siparişlerim | Xinobi", description: "Xinobi sipariş ve teslimat durumlarınızı görüntüleyin." };

export default function OrdersPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#orders">Siparişlere geç</a>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><nav aria-label="Hesap menüsü"><Link href="/hesap">Hesabım</Link><Link href="/hesap/siparisler" aria-current="page">Siparişlerim</Link><Link href="/favoriler">Favoriler</Link></nav><Link href="/urunler">Alışverişe dön ↗</Link></header>
    <main id="orders"><Orders /></main>
  </div>;
}
