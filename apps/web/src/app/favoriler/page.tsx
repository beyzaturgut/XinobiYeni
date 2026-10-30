import AccountRequestState from "../../components/account-request-state";
import SiteHeader from "../../components/site-header";
import type { Metadata } from "next";
import Favorites from "./favorites";
import styles from "./favorites.module.css";

export const metadata: Metadata = { title: "Favorilerim | Xinobi", description: "Beğendiğiniz Xinobi ürünlerini yeniden keşfedin." };

export default function FavoritesPage() {
  return <div className={styles.page}>
    <a data-skip-link className={styles.skipLink} href="#favorites">Favorilere geç</a>
    <SiteHeader />
    <main id="favorites"><AccountRequestState><Favorites /></AccountRequestState></main>
  </div>;
}
