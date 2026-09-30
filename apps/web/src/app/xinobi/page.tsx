import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import airPurifier from "../../../public/assets/products/air-purifier-101.webp";
import coffeeMaker from "../../../public/assets/products/coffee-maker-101-gold.webp";
import teaMaker from "../../../public/assets/products/tea-maker-101-blue.webp";
import styles from "./xinobi.module.css";

export const metadata: Metadata = {
  title: "Xinobi Dünyası | Tasarım yaklaşımımız",
  description: "Xinobi'nin gündelik ritüelleri yalın, kişisel ve anlaşılır teknolojiyle buluşturan tasarım yaklaşımını keşfedin.",
};

const principles = [
  { no: "01", title: "Sessiz işlev", copy: "Teknoloji kendini göstermek için değil, günlük akışı kolaylaştırmak için çalışır." },
  { no: "02", title: "Kalıcı sadelik", copy: "Gereksiz ayrıntıları azaltır, malzeme ve kullanımı görünür bırakırız." },
  { no: "03", title: "Kişisel alan", copy: "Seçili ürünlerde renk ve tasarım seçenekleriyle kullanıcıya söz hakkı veririz." },
];

export default function XinobiPage() {
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#content">İçeriğe geç</a>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <nav aria-label="Kurumsal menü"><Link href="#yaklasim">Yaklaşımımız</Link><Link href="#ilkeler">İlkeler</Link><Link href="#notlar">Xinobi notları</Link></nav>
      <Link className={styles.productsLink} href="/urunler">Ürünleri keşfet <span aria-hidden="true">↗</span></Link>
    </header>

    <main id="content">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}><p>Xinobi dünyası</p><h1 id="hero-title">Günün ritmine uyum sağlayan teknoloji.</h1><span>Ev teknolojilerini daha anlaşılır, daha kişisel ve daha sakin bir deneyime dönüştürmek için tasarlıyoruz.</span></div>
        <div className={styles.heroVisual}><div className={styles.orbit} /><Image src={teaMaker} alt="Lacivert Xinobi çay makinesi" priority sizes="(max-width: 760px) 94vw, 50vw" /></div>
      </section>

      <section id="yaklasim" className={styles.statement} aria-labelledby="approach-title"><p>Yaklaşımımız</p><h2 id="approach-title">İyi tasarım, gözünüzü değil gününüzü yormaz.</h2><div><span>Xinobi için yalınlık yalnızca bir görünüm değil; ürünü anlamayı, kullanmayı ve yaşam alanına katmayı kolaylaştıran bir karardır.</span><span>Bu sayfadaki marka anlatısı Faz02 prototip içeriğidir. Nihai kurumsal metinler içerik sahibi onayı ve Faz04 CMS yayınıyla kesinleşir.</span></div></section>

      <section id="ilkeler" className={styles.principles} aria-labelledby="principles-title"><div className={styles.sectionHeading}><p>Tasarım ilkeleri</p><h2 id="principles-title">Azaltılmış form.<br />Güçlü karakter.</h2></div><div className={styles.principleGrid}>{principles.map((item) => <article key={item.no}><span>{item.no}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section>

      <section className={styles.material} aria-labelledby="material-title"><div className={styles.materialVisual}><Image src={coffeeMaker} alt="Gold detaylı Xinobi kahve makinesi" sizes="(max-width: 760px) 100vw, 52vw" /></div><div className={styles.materialCopy}><p>Malzeme ve renk</p><h2 id="material-title">Yaşam alanına karışan, karakterini koruyan.</h2><span>Metal yüzeyler, dengeli renkler ve sade kontroller; ürünün hem yakından hem de bulunduğu mekânın bütünü içinde iyi hissettirmesi için bir araya gelir.</span><Link href="/urunler">Koleksiyonu incele <b aria-hidden="true">→</b></Link></div></section>

      <section id="notlar" className={styles.notes} aria-labelledby="notes-title"><div className={styles.sectionHeading}><p>Xinobi notları</p><h2 id="notes-title">Tasarım ve gündelik yaşam üzerine.</h2></div><div className={styles.noteGrid}><article><Image src={airPurifier} alt="Xinobi hava temizleyici" sizes="(max-width: 760px) 92vw, 46vw" /><div><span>Yaşam · Yakında</span><h3>Evde daha sakin bir teknoloji dili</h3><p>Bu içerik kartı görsel hiyerarşi prototipidir; henüz yayınlanmış bir yazı değildir.</p></div></article><article className={styles.emptyNote}><span>CMS yayını bekleniyor</span><h3>Yeni hikâyeler için ayrılmış alan.</h3><p>Blog, referans ve kampanya içerikleri Faz04 yayın akışı tamamlanınca yalnızca onaylı içerikten beslenecek.</p></article></div></section>

      <section className={styles.cta}><p>Bir ürünle başlayın</p><h2>Gündelik ritüelinize uygun Xinobi&apos;yi bulun.</h2><div><Link href="/urunler">Ürünleri keşfet</Link><Link href="/asistan">Asistana danış</Link></div></section>
    </main>

    <footer className={styles.footer}><Link href="/" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} /></Link><p>Gündelik ritüeller için sessiz teknoloji.</p><nav aria-label="Alt menü"><Link href="/urunler">Ürünler</Link><Link href="/kurumsal/teklif">Kurumsal teklif</Link><Link href="/asistan">Xinobi Asistan</Link></nav><span>© 2026 Xinobi · Faz02 prototipi</span></footer>
  </div>;
}
