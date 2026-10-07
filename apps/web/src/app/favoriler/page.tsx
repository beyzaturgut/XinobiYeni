import SiteHeader from "../../components/site-header";
import type { Metadata } from "next";
import Favorites from "./favorites";
import styles from "./favorites.module.css";

export const metadata: Metadata = { title: "Favorilerim | Xinobi", description: "Beğendiğiniz Xinobi ürünlerini yeniden keşfedin." };

export default function FavoritesPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#favorites">Favorilere geç</a>
    <SiteHeader />
    <main id="favorites"><Favorites /></main>
  </div>;
}
