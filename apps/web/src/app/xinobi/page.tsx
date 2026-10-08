import type { Metadata } from "next";
import SiteHeader from "../../components/site-header";
import CommerceFooter from "../../components/commerce-footer";
import styles from "./xinobi.module.css";

export const metadata: Metadata = {
  title: "Xinobi Dünyası | Hakkımızda",
  description: "Xinobi, ileri teknolojiyi, zarif tasarımı ve güvenilir kaliteyi bir araya getiren premium küçük ev aletleri markasıdır. Xinobi U ve Premium Products yaklaşımımızı keşfedin.",
};

export default function XinobiPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#content">İçeriğe geç</a>
    <SiteHeader />
    {/* Text from Proje Yönetimi/Hakkımızda.docx, laid out as a plain reading page (title, then paragraphs). */}
    <main id="content" className={styles.article}>
      <h1>Hakkımızda</h1>
      <p className={styles.tagline}>Teknolojiyi tasarımla, tasarımı sizin tarzınızla buluşturuyoruz.</p>
      <p>Xinobi, modern yaşamın ihtiyaçlarından ilham alarak ileri teknolojiyi, zarif tasarımı ve güvenilir kaliteyi bir araya getiren premium küçük ev aletleri markasıdır.</p>
      <p>Bizim için bir ürün yalnızca işlevini yerine getiren bir cihaz değil; yaşam alanının bir parçası, kişisel tarzın bir yansıması ve günlük yaşamı daha keyifli hale getiren bir deneyimdir.</p>
      <p>Bu anlayışla Xinobi&apos;yi iki temel yaklaşım üzerine inşa ediyoruz: Xinobi U ve Premium Products.</p>
      <section aria-labelledby="xinobi-u">
        <h2 id="xinobi-u">Xinobi U</h2>
        <p>Her insanın yaşam tarzı, zevki ve beklentisi farklıdır. Xinobi U, bu farklılıkları merkeze alan kişiselleştirilmiş tasarım yaklaşımımızdır.</p>
        <p>Farklı renk, malzeme, yüzey ve tasarım alternatifleriyle kullanıcıların kendi tarzlarını ürünlerine yansıtabilmelerini ve yaşam alanlarıyla uyumlu seçimler yapabilmelerini hedefliyoruz.</p>
        <p>Çünkü bir ürün, ancak size ait hissettirdiğinde özel kılar.</p>
      </section>
      <section aria-labelledby="premium-products">
        <h2 id="premium-products">Premium Products</h2>
        <p>Xinobi ürünleri; ileri teknoloji, zarif tasarım ve güvenilir kalite anlayışıyla geliştirilir.</p>
        <p>Minimal ve zamansız tasarım çizgisini akıllı teknolojilerle bir araya getirerek yalnızca yüksek performans sunan değil, aynı zamanda bulunduğu yaşam alanına değer katan ürünler tasarlıyoruz.</p>
        <p>Her detayda kullanım kolaylığını, estetiği ve kaliteyi bir arada düşünerek premium deneyimi günlük yaşamın doğal bir parçası haline getirmeyi amaçlıyoruz.</p>
      </section>
      <section aria-labelledby="inovasyon">
        <h2 id="inovasyon">Bizim İçin İnovasyon</h2>
        <p>Xinobi&apos;de inovasyonu yalnızca yeni teknolojiler geliştirmek olarak görmüyoruz. İnovasyonun, teknolojiyi insan ihtiyaçlarıyla doğru şekilde buluşturmak olduğuna inanıyoruz.</p>
        <p>Kişiselleştirilebilir tasarım ile premium ürün anlayışını bir araya getirerek, kullanıcıların kendi tarzlarını yansıtabildiği ve her kullanımda farkını hissettiren ürünler geliştiriyoruz.</p>
      </section>
    </main>
    <CommerceFooter />
  </div>;
}
