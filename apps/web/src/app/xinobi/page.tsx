import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import CommerceFooter from "../../components/commerce-footer";
import coffeeMaker from "../../../public/assets/products/coffee-maker-101-gold.webp";
import teaMaker from "../../../public/assets/products/tea-maker-101-blue.webp";
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
        <div className={styles.heroCopy}><p className={styles.kicker}>Xinobi dünyası · Hakkımızda</p><h1 id="hero-title">Teknolojiyi tasarımla, tasarımı sizin tarzınızla buluşturuyoruz.</h1><p className={styles.lead}>Xinobi, modern yaşamın ihtiyaçlarından ilham alarak ileri teknolojiyi, zarif tasarımı ve güvenilir kaliteyi bir araya getiren premium küçük ev aletleri markasıdır.</p></div>
        <div className={styles.heroVisual}><Image src={teaMaker} alt="Lacivert Xinobi çay makinesi" priority sizes="(max-width: 760px) 90vw, 45vw" /></div>
      </section>
      <section className={styles.introduction} aria-label="Xinobi yaklaşımı">
        <p>Bizim için bir ürün yalnızca işlevini yerine getiren bir cihaz değil; yaşam alanının bir parçası, kişisel tarzın bir yansıması ve günlük yaşamı daha keyifli hale getiren bir deneyimdir.</p>
        <p>Bu anlayışla Xinobi&apos;yi iki temel yaklaşım üzerine inşa ediyoruz: Xinobi U ve Premium Products.</p>
        <nav className={styles.sectionNav} aria-label="Xinobi dünyası bölümleri"><Link href="#xinobi-u">Xinobi U ↗</Link><Link href="#premium-products">Premium Products ↗</Link><Link href="#inovasyon">Bizim İçin İnovasyon ↗</Link></nav>
      </section>
      <section id="xinobi-u" className={styles.personalization} aria-labelledby="personalization-title">
        <div className={styles.sectionCopy}><p className={styles.kicker}>01 · Kişiselleştirilmiş tasarım</p><h2 id="personalization-title">Xinobi U</h2><p>Her insanın yaşam tarzı, zevki ve beklentisi farklıdır. Xinobi U, bu farklılıkları merkeze alan kişiselleştirilmiş tasarım yaklaşımımızdır.</p><p>Farklı renk, malzeme, yüzey ve tasarım alternatifleriyle kullanıcıların kendi tarzlarını ürünlerine yansıtabilmelerini ve yaşam alanlarıyla uyumlu seçimler yapabilmelerini hedefliyoruz.</p><p className={styles.emphasis}>Çünkü bir ürün, ancak size ait hissettirdiğinde özel kılar.</p><Link className={styles.textLink} href="/xinobi-u">Xinobi U&apos;yu keşfet →</Link></div>
        <div className={styles.designVisual}><span className={styles.designLabel}>Sizin tarzınız. Sizin Xinobi&apos;niz.</span><Image src="/assets/banners/xinobi-personalized-tea-makers.png" alt="Farklı tasarımlarla kişiselleştirilmiş Xinobi çay makineleri" width={1200} height={800} sizes="(max-width: 760px) 90vw, 45vw" /></div>
      </section>
      <section id="premium-products" className={styles.premium} aria-labelledby="premium-title">
        <div className={styles.productVisual}><Image src={coffeeMaker} alt="Gold detaylı Xinobi kahve makinesi" sizes="(max-width: 760px) 90vw, 45vw" /></div>
        <div className={styles.sectionCopy}><p className={styles.kicker}>02 · Teknoloji, tasarım ve kalite</p><h2 id="premium-title">Premium Products</h2><p>Xinobi ürünleri; ileri teknoloji, zarif tasarım ve güvenilir kalite anlayışıyla geliştirilir.</p><p>Minimal ve zamansız tasarım çizgisini akıllı teknolojilerle bir araya getirerek yalnızca yüksek performans sunan değil, aynı zamanda bulunduğu yaşam alanına değer katan ürünler tasarlıyoruz.</p><p>Her detayda kullanım kolaylığını, estetiği ve kaliteyi bir arada düşünerek premium deneyimi günlük yaşamın doğal bir parçası haline getirmeyi amaçlıyoruz.</p><Link className={styles.textLink} href="/urunler">Ürünleri keşfet →</Link></div>
      </section>
      <section id="inovasyon" className={styles.innovation} aria-labelledby="innovation-title"><p className={styles.kicker}>İnsan odaklı teknoloji</p><h2 id="innovation-title">Bizim İçin İnovasyon</h2><div><p>Xinobi&apos;de inovasyonu yalnızca yeni teknolojiler geliştirmek olarak görmüyoruz. İnovasyonun, teknolojiyi insan ihtiyaçlarıyla doğru şekilde buluşturmak olduğuna inanıyoruz.</p><p>Kişiselleştirilebilir tasarım ile premium ürün anlayışını bir araya getirerek, kullanıcıların kendi tarzlarını yansıtabildiği ve her kullanımda farkını hissettiren ürünler geliştiriyoruz.</p></div></section>
    </main>
    <CommerceFooter />
  </div>;
}
