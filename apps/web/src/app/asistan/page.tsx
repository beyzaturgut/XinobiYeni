import SiteHeader from "../../components/site-header";
import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import NobiChat from "../../components/nobi/nobi-chat";
import styles from "./assistant.module.css";

export const metadata: Metadata = pageMetadata("/asistan/", { title: "Nobi · Xinobi Asistan", description: "Xinobi ürünlerini bulmak, karşılaştırmak ve kişiselleştirmek için satış asistanı Nobi." });

export default function AssistantPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#assistant">Asistana geç</a>
    <SiteHeader />
    <main id="assistant" className={styles.layout}>
      <aside className={styles.context}><p>Nobi</p><h1>Doğru ürünü birlikte bulalım.</h1><span>Ürün, bütçe veya ihtiyacını yaz; Nobi güncel katalogdan öneri yapar, karşılaştırmaya ekler ve kurumsal alım ya da XINOBI U için yönlendirir.</span><nav aria-label="Hızlı işlemler"><Link href="/urunler">Tüm ürünler <b>→</b></Link><Link href="/karsilastir">Karşılaştırma <b>→</b></Link><Link href="/kurumsal/teklif">Kurumsal teklif <b>→</b></Link><Link href="/xinobi-u">XINOBI U <b>→</b></Link></nav></aside>
      <section aria-label="Nobi sohbeti"><NobiChat full /></section>
    </main>
  </div>;
}
