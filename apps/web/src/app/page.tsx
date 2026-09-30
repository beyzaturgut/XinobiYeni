import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

import airPurifier from "../../public/assets/products/air-purifier-101.webp";
import coffeeMaker from "../../public/assets/products/coffee-maker-101-gold.webp";
import cookingMachine from "../../public/assets/products/cooking-machine.webp";
import teaMaker from "../../public/assets/products/tea-maker-101-blue.webp";
import toastMaker from "../../public/assets/products/toast-maker.webp";

type IconName = "arrow" | "bag" | "search" | "spark" | "user";
type Product = { name: string; category: string; description: string; image: StaticImageData; tall?: boolean; accent: string; swatch: string };

const products: Product[] = [
  { name: "Çay Makinesi 101", category: "Çay makineleri", description: "Günün ritmine uyum sağlayan modern çay deneyimi.", image: teaMaker, tall: true, accent: "Lacivert", swatch: "#18304d" },
  { name: "Kahve Makinesi 101", category: "Kahve makineleri", description: "İki fincanı aynı anda hazırlayan dengeli tasarım.", image: coffeeMaker, accent: "Gold", swatch: "#b78945" },
  { name: "Air Purifier 101", category: "Hava temizleyiciler", description: "Sade form, ev yaşamına uyumlu temiz hava yaklaşımı.", image: airPurifier, tall: true, accent: "Beyaz", swatch: "#e9e9e7" },
];

const categories = [
  { name: "Çay makineleri", image: teaMaker, tall: true },
  { name: "Kahve makineleri", image: coffeeMaker },
  { name: "Pişirme", image: cookingMachine, tall: true },
  { name: "Tost makineleri", image: toastMaker },
];

function Icon({ name }: { name: IconName }) {
  const common = { "aria-hidden": true, fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.7, viewBox: "0 0 24 24" };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>;
  if (name === "user") return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>;
  if (name === "bag") return <svg {...common}><path d="M5 8.5h14l-1 12H6l-1-12Z" /><path d="M9 9V6.5a3 3 0 0 1 6 0V9" /></svg>;
  if (name === "spark") return <svg {...common}><path d="m12 2 1.5 5.2L19 9l-5.5 1.8L12 16l-1.5-5.2L5 9l5.5-1.8L12 2Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></svg>;
  return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5" /></svg>;
}

function Header() {
  return <header className={styles.header}>
    <a className={styles.skipLink} href="#main-content">İçeriğe geç</a>
    <div className={styles.utilityBar}><p>Xinobi ile ev teknolojisini yeniden keşfedin.</p><nav aria-label="Yardımcı bağlantılar"><Link href="#destek">Destek</Link><Link href="/kurumsal/teklif">Kurumsal</Link></nav></div>
    <div className={styles.mainNav}>
      <Link className={styles.brand} href="#top" aria-label="Xinobi ana sayfa"><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority /></Link>
      <nav className={styles.desktopNav} aria-label="Ana menü"><Link href="/urunler">Ürünler</Link><Link href="#kategoriler">Kategoriler</Link><Link href="#kisisellestirme">Kişiselleştir</Link><Link href="#hikaye">Xinobi dünyası</Link></nav>
      <div className={styles.navActions}><Link href="/arama" aria-label="Ara"><Icon name="search" /></Link><Link href="/hesap/giris" aria-label="Hesabım"><Icon name="user" /></Link><Link href="/sepet" aria-label="Sepet"><Icon name="bag" /></Link></div>
      <details className={styles.mobileMenu}><summary>Menü</summary><nav aria-label="Mobil menü"><Link href="/urunler">Ürünler</Link><Link href="#kategoriler">Kategoriler</Link><Link href="#kisisellestirme">Kişiselleştir</Link><Link href="#hikaye">Xinobi dünyası</Link></nav></details>
    </div>
  </header>;
}

function ProductCard({ product }: { product: Product }) {
  return <article className={styles.productCard}>
    <div className={styles.productMedia}><span className={styles.productBadge}>Yeni</span><Image className={`${styles.productImage} ${product.tall ? styles.productImageTall : ""}`} src={product.image} alt={`${product.name}, ${product.accent}`} sizes="(max-width: 760px) 88vw, (max-width: 1100px) 45vw, 31vw" /></div>
    <div className={styles.productBody}><p className={styles.eyebrow}>{product.category}</p><h3>{product.name}</h3><p>{product.description}</p><div className={styles.productMeta}><span><i style={{ backgroundColor: product.swatch }} />{product.accent}</span><span>Fiyat bilgisi yakında</span></div><Link className={styles.textLink} href="#urunler">Ürünü incele <Icon name="arrow" /></Link></div>
  </article>;
}

export default function Home() {
  return <div id="top" className={styles.page}>
    <Header />
    <main id="main-content">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}><p className={styles.heroKicker}>Xinobi ev teknolojileri</p><h1 id="hero-title">Gündelik ritüeller için sessiz teknoloji.</h1><p className={styles.heroLead}>Metalin güçlü karakterini, yalın tasarımı ve kişisel seçimleri aynı üründe buluşturun.</p><div className={styles.heroActions}><Link className={styles.primaryButton} href="/urunler">Ürünleri keşfet <Icon name="arrow" /></Link><Link className={styles.secondaryButton} href="#kisisellestirme">Kişiselleştirmeyi gör</Link></div></div>
        <div className={styles.heroVisual}><div className={styles.heroHalo} /><Image className={styles.heroProduct} src={teaMaker} alt="Lacivert Xinobi Çay Makinesi 101" priority sizes="(max-width: 820px) 92vw, 52vw" /><div className={styles.heroNote}><span>01</span><p>Renk, form ve kullanım deneyimi tek bir dengede.</p></div></div>
      </section>

      <section className={styles.valueStrip} aria-label="Xinobi yaklaşımı"><article><strong>Ürün merkezli</strong><span>Her detay işlevi görünür kılar.</span></article><article><strong>Size özgü</strong><span>Seçili ürünlerde kişisel dokunuş.</span></article><article><strong>Tek deneyim</strong><span>Web ve mobilde aynı Xinobi dili.</span></article></section>

      <section id="urunler" className={styles.section} aria-labelledby="featured-title"><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Öne çıkanlar</p><h2 id="featured-title">Gününüz için tasarlandı.</h2></div><Link className={styles.textLink} href="/urunler">Tüm ürünler <Icon name="arrow" /></Link></div><div className={styles.productGrid}>{products.map((product) => <ProductCard key={product.name} product={product} />)}</div></section>

      <section id="kisisellestirme" className={styles.personalize} aria-labelledby="personalize-title"><div className={styles.personalizeImage}><Image src={coffeeMaker} alt="Gold detaylı Xinobi kahve makinesi" sizes="(max-width: 820px) 100vw, 50vw" /></div><div className={styles.personalizeCopy}><span className={styles.sparkIcon}><Icon name="spark" /></span><p className={styles.eyebrow}>Xinobi Studio</p><h2 id="personalize-title">Ürününüzde size ait bir iz.</h2><p>Seçili ürünlerde renk, yüzey ve kişisel tasarım seçeneklerini tek bir akışta keşfedin.</p><p className={styles.prototypeNote}>Kişiselleştirme ölçüleri ve baskı seçenekleri D04 üretim kararıyla kesinleşecektir.</p><Link className={styles.lightButton} href="/urunler/cay-makinesi-101/kisisellestir">Nasıl çalışır? <Icon name="arrow" /></Link></div></section>

      <section id="kategoriler" className={styles.section} aria-labelledby="categories-title"><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Koleksiyonu keşfedin</p><h2 id="categories-title">Evin her anına eşlik eder.</h2></div></div><div className={styles.categoryGrid}>{categories.map((category) => <Link className={styles.categoryCard} href="#urunler" key={category.name}><Image className={category.tall ? styles.categoryImageTall : ""} src={category.image} alt="" sizes="(max-width: 640px) 90vw, 24vw" /><span>{category.name}<Icon name="arrow" /></span></Link>)}</div></section>

      <section id="hikaye" className={styles.story} aria-labelledby="story-title"><p className={styles.eyebrow}>Xinobi dünyası</p><h2 id="story-title">İyi tasarım, gözünüzü değil gününüzü yormaz.</h2><p>Xinobi, ev teknolojilerini daha anlaşılır, daha kişisel ve daha sakin bir deneyime dönüştürmek için tasarlanır.</p><Link className={styles.textLink} href="/asistan">Xinobi asistana danışın <Icon name="arrow" /></Link></section>
    </main>

    <footer id="destek" className={styles.footer}><div className={styles.footerBrand}><Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} /><p>Gündelik ritüeller için sessiz teknoloji.</p></div><nav aria-label="Alt menü"><div><h2>Ürünler</h2><Link href="#urunler">Çay makineleri</Link><Link href="#urunler">Kahve makineleri</Link><Link href="#urunler">Hava temizleyiciler</Link></div><div><h2>Xinobi</h2><Link href="#hikaye">Hakkımızda</Link><Link href="/kurumsal/teklif">Kurumsal</Link><Link href="#kisisellestirme">Xinobi Studio</Link></div><div><h2>Destek</h2><Link href="#destek">İletişim</Link><Link href="#destek">Sıkça sorulanlar</Link><Link href="#destek">Garanti ve servis</Link></div></nav><div className={styles.footerBottom}><span>© 2026 Xinobi</span><span>Faz02 arayüz prototipi</span></div></footer>
  </div>;
}
