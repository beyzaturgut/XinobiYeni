import type { Metadata } from "next";
import Link from "next/link";
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
    <main id="content">
      <section className={styles.hero} aria-labelledby="hero-title">
        <p className={styles.kicker}>Xinobi dünyası · Hakkımızda</p>
        <h1 id="hero-title">Teknolojiyi tasarımla, tasarımı sizin tarzınızla buluşturuyoruz.</h1>
        <p className={styles.lead}>Xinobi, modern yaşamın ihtiyaçlarından ilham alarak ileri teknolojiyi, zarif tasarımı ve güvenilir kaliteyi bir araya getiren premium küçük ev aletleri markasıdır.</p>
      </section>
      <section className={styles.introduction} aria-label="Xinobi yaklaşımı">
        <blockquote className={styles.statement}><p>Bizim için bir ürün yalnızca işlevini yerine getiren bir cihaz değil; yaşam alanının bir parçası, kişisel tarzın bir yansıması ve günlük yaşamı daha keyifli hale getiren bir deneyimdir.</p></blockquote>
        <div className={styles.index}>
          <p>Bu anlayışla Xinobi&apos;yi iki temel yaklaşım üzerine inşa ediyoruz: Xinobi U ve Premium Products.</p>
          <nav aria-label="Xinobi dünyası bölümleri"><ol>
            <li><Link href="#xinobi-u"><span>01</span>Xinobi U<b aria-hidden="true">↗</b></Link></li>
            <li><Link href="#premium-products"><span>02</span>Premium Products<b aria-hidden="true">↗</b></Link></li>
            <li><Link href="#inovasyon"><span>03</span>Bizim İçin İnovasyon<b aria-hidden="true">↗</b></Link></li>
          </ol></nav>
        </div>
      </section>
      <div className={styles.pillars}>
        <section id="xinobi-u" className={styles.pillar} aria-labelledby="personalization-title">
          <p className={styles.number} aria-hidden="true">01</p>
          <p className={styles.kicker}>Kişiselleştirilmiş tasarım</p>
          <h2 id="personalization-title">Xinobi U</h2>
          <p>Her insanın yaşam tarzı, zevki ve beklentisi farklıdır. Xinobi U, bu farklılıkları merkeze alan kişiselleştirilmiş tasarım yaklaşımımızdır.</p>
          <p>Farklı renk, malzeme, yüzey ve tasarım alternatifleriyle kullanıcıların kendi tarzlarını ürünlerine yansıtabilmelerini ve yaşam alanlarıyla uyumlu seçimler yapabilmelerini hedefliyoruz.</p>
          <p className={styles.emphasis}>Çünkü bir ürün, ancak size ait hissettirdiğinde özel kılar.</p>
          <Link className={styles.textLink} href="/xinobi-u">Xinobi U&apos;yu keşfet →</Link>
        </section>
        <section id="premium-products" className={styles.pillar} aria-labelledby="premium-title">
          <p className={styles.number} aria-hidden="true">02</p>
          <p className={styles.kicker}>Teknoloji, tasarım ve kalite</p>
          <h2 id="premium-title">Premium Products</h2>
          <p>Xinobi ürünleri; ileri teknoloji, zarif tasarım ve güvenilir kalite anlayışıyla geliştirilir.</p>
          <p>Minimal ve zamansız tasarım çizgisini akıllı teknolojilerle bir araya getirerek yalnızca yüksek performans sunan değil, aynı zamanda bulunduğu yaşam alanına değer katan ürünler tasarlıyoruz.</p>
          <p>Her detayda kullanım kolaylığını, estetiği ve kaliteyi bir arada düşünerek premium deneyimi günlük yaşamın doğal bir parçası haline getirmeyi amaçlıyoruz.</p>
          <Link className={styles.textLink} href="/urunler">Ürünleri keşfet →</Link>
        </section>
      </div>
      <section id="inovasyon" className={styles.innovation} aria-labelledby="innovation-title">
        <div className={styles.innovationInner}>
          <div><p className={styles.number} aria-hidden="true">03</p><p className={styles.kicker}>İnsan odaklı teknoloji</p><h2 id="innovation-title">Bizim İçin İnovasyon</h2></div>
          <div className={styles.innovationCopy}><p>Xinobi&apos;de inovasyonu yalnızca yeni teknolojiler geliştirmek olarak görmüyoruz. İnovasyonun, teknolojiyi insan ihtiyaçlarıyla doğru şekilde buluşturmak olduğuna inanıyoruz.</p><p>Kişiselleştirilebilir tasarım ile premium ürün anlayışını bir araya getirerek, kullanıcıların kendi tarzlarını yansıtabildiği ve her kullanımda farkını hissettiren ürünler geliştiriyoruz.</p></div>
        </div>
      </section>
    </main>
    <CommerceFooter />
  </div>;
}
