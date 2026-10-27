import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../../../components/site-header";
import styles from "../../../xinobi-u/flow.module.css";

export const metadata:Metadata={title:"Ürün seçimi | Xinobi",description:"Güncel kişiselleştirilebilir Xinobi ürünlerini keşfedin."};

/** Retain old bookmarks without reintroducing the retired simple-mode screen. */
export default function PersonalizeTeaMakerPage(){
 return <><SiteHeader/><main className={styles.page}><p role="status">Bu örnek ürün artık katalogda yer almıyor.</p><Link href="/xinobi-u">Güncel ürünlerden birini seç →</Link></main></>;
}
