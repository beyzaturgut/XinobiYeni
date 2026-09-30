import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Checkout from "./checkout";
import styles from "./checkout.module.css";

export const metadata: Metadata = { title: "Güvenli Ödeme | Xinobi", description: "Xinobi teslimat ve ödeme adımlarını gözden geçirin." };

export default function CheckoutPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#checkout">Ödeme formuna geç</a>
    <header className={styles.header}><Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link><div><span>Güvenli ödeme</span><strong>Demo checkout</strong></div><Link href="/sepet">Sepete dön <span aria-hidden="true">×</span></Link></header>
    <main id="checkout"><Checkout /></main>
  </div>;
}
