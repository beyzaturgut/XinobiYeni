"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money, stockText } from "../lib/commerce";
import TitaniumFeature from '../components/titanium-feature';
import PersonalizationFeature from '../components/personalization-feature';
import SiteHeader from '../components/site-header';
import CategoryGallery from '../components/category-gallery';
import SiteFooter from "../components/site-footer";
import styles from "./page.module.css";

import airPurifier from "../../public/assets/products/air-purifier-101.webp";
import coffeeMaker from "../../public/assets/products/coffee-maker-101-red.webp";
import cookingMachine from "../../public/assets/products/cooking-machine.webp";
import teaMaker from "../../public/assets/products/tea-maker-101-blue.webp";
import toastMaker from "../../public/assets/products/toast-maker.webp";

type IconName = "arrow" | "bag" | "search" | "user";
type Product = { name: string; category: string; image: StaticImageData | string; price?: number; stock?: number; badge?: string; href?: string; colorCount?: number };

const fallbackSlides: { src: string; alt: string; type?: string; duration?: number }[] = [
  { src: "/assets/banners/home-slider-1.png", alt: "Kömür grisi stüdyoda beyaz Xinobi hava temizleyici" },
  { src: "/assets/banners/home-slider-2.png", alt: "Minimal koyu fonda Xinobi kahve makinesi" },
  { src: "/assets/banners/home-slider-3.png", alt: "Sade koyu stüdyoda Xinobi çay makinesi ve çay bardağı" },
];

const fallbackProducts: Product[] = [
  { name: "Çay Makinesi 101", category: "Çay makineleri", image: teaMaker, badge: "Yeni" },
  { name: "Kahve Makinesi 101", category: "Kahve makineleri", image: coffeeMaker },
  { name: "Hava Temizleme 101", category: "Hava temizleme", image: airPurifier },
];

const fallbackCategories = [
  { name: "Çay makineleri", image: teaMaker }, { name: "Kahve makineleri", image: coffeeMaker },
  { name: "Tost makineleri", image: toastMaker }, { name: "Pişirme makineleri", image: cookingMachine },
  { name: "Hava temizleme", image: airPurifier },
];

function Icon({ name }: { name: IconName }) {
  const common = { "aria-hidden": true, fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8, viewBox: "0 0 32 32" };
  if (name === "search") return <svg {...common}><circle cx="14" cy="14" r="8.5" /><path d="m20.5 20.5 6 6" /></svg>;
  if (name === "user") return <svg {...common}><circle cx="16" cy="10" r="5" /><path d="M7.5 27c.7-7 3.7-10.5 8.5-10.5S23.8 20 24.5 27" /></svg>;
  if (name === "bag") return <svg {...common}><path d="M7 10h18l-1.4 17H8.4L7 10Z" /><path d="M12 11V7a4 4 0 0 1 8 0v4" /></svg>;
  return <svg {...common}><path d="M6 16h19M19 10l6 6-6 6" /></svg>;
}

function NobiMark({ compact = false }: { compact?: boolean }) {
  return <svg className={compact ? styles.nobiPanelMark : styles.nobiMark} viewBox="0 0 112 108" aria-hidden="true"><path className={styles.nobiAntenna} d="M56 22V35" /><circle className={styles.nobiAntennaTip} cx="56" cy="14" r="10" /><rect className={styles.nobiShell} x="13" y="31" width="86" height="68" rx="31" /><rect className={styles.nobiFace} x="25" y="48" width="62" height="40" rx="17" /><path className={styles.nobiSmile} d="M35 68c0-7 4-11 9-11 8 0 7 15 15 15s7-15 15-15c5 0 9 4 9 11" /></svg>;
}


function ProductCard({ product }: { product: Product }) {
  return <Link href={product.href || '/urunler'} className={styles.productCard}><div className={styles.productMedia}>{(product.colorCount || 0) > 1 && <span className={styles.multiColorBadge}>• {product.colorCount} renk</span>}{product.badge && <span className={styles.productBadge}>{product.badge}</span>}{product.image ? <Image className={styles.productImage} src={product.image} width={600} height={600} alt={product.name} sizes="(max-width: 760px) 88vw, 31vw" /> : <span>Görsel yok</span>}</div><p className={styles.eyebrow}>{product.category}</p><h3>{product.name}</h3><p>{[money(product.price), stockText(product.stock)].filter(Boolean).join(' · ')}</p><span className={styles.productLink}>Ürünü incele <Icon name="arrow" /></span></Link>;
}

export default function Home() {
  const { state, error, enabled } = useCommerce();
  const slides = state ? state.content.slides.filter(item => item.active) : enabled ? [] : fallbackSlides;
  const products: Product[] = state ? (state.content.featuredProducts == null ? state.products.filter(product => product.active).slice(0,4) : state.content.featuredProducts.flatMap(id => {const product=state.products.find(product=>product.id===id&&product.active);return product?[product]:[]})).map(product => ({ name: product.name, category: product.category, image: mediaUrl(product.originalImage || product.variants[0]?.image || '', commerceApi), href: `/urunler/detay?id=${encodeURIComponent(product.id)}`, colorCount: product.variants.length, price: state.prices[product.variants[0]?.id], stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0) })) : enabled ? [] : fallbackProducts.slice(0,4);
  const categories: {name: string; image: StaticImageData | string; alt?: string; modelCount?: number; description?: string}[] = state ? (state.categories ?? [...new Set(state.products.map(product => product.category))]).flatMap(name => {
    const selected = state.content.categoryProducts?.[name];
    if (selected === '') return [];
    const candidates = state.products.filter(product => product.active && product.category === name);
    const customImage = state.content.categoryImages?.[name];
    if(customImage) return [{name,image:mediaUrl(customImage,commerceApi),alt:`${name} kategori fotoğrafı`,modelCount:candidates.length,description:candidates[0]?.description || `${name} koleksiyonunu keşfedin. Kendinize uygun modeli ve rengi seçin.`}];
    for (const product of candidates) {
      const variant = selected === undefined ? product.variants.find(variant => variant.image) : product.variants.find(variant => variant.id === selected && variant.image);
      if (variant) return [{name, image: mediaUrl(selected === undefined ? (product.originalImage || variant.image) : variant.image, commerceApi), alt: `${product.name} · ${variant.color}`, modelCount: candidates.length, description: product.description || `${name} koleksiyonunu keşfedin. Kendinize uygun modeli ve rengi seçin.`}];
    }
    return [];
  }) : enabled ? [] : fallbackCategories;
  const titaniumImage = state?.content.titaniumImage ?? '/assets/products/titanium-bronze-gold.png';
  const [slide, setSlide] = useState(0);
  const [nobiOpen, setNobiOpen] = useState(false);
  const slideCount = slides.length;
  const slideDuration = slides[slide % Math.max(slideCount, 1)]?.duration || 6;
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = window.setTimeout(() => setSlide((current) => (current + 1) % Math.max(slideCount, 1)), slideDuration * 1000); return () => window.clearTimeout(timer); }, [slideCount, slide, slideDuration]);
  useEffect(() => { const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setNobiOpen(false); }; document.addEventListener("keydown", closeOnEscape); return () => document.removeEventListener("keydown", closeOnEscape); }, []);

  return <div id="top" className={styles.page}>
    {error && <p role="alert">{error}</p>}
    <a className={styles.skipLink} href="#main-content">İçeriğe geç</a><SiteHeader categories={state ? (state.categories ?? [...new Set(state.products.map(product => product.category))]).map(name => ({name})) : enabled ? [] : fallbackCategories} />
    <main id="main-content">
      <h1 className={styles.srOnly}>Xinobi ev teknolojileri</h1>
      {slides.length > 0 && <section className={styles.hero} aria-label="Xinobi ürün tanıtımları">{slides[slide % slides.length].type === 'Video' ? <video className={styles.heroImage} style={{ width: '100%', height: '100%' }} src={mediaUrl(slides[slide % slides.length].src, commerceApi)} autoPlay muted loop playsInline /> : <Image className={styles.heroImage} src={mediaUrl(slides[slide % slides.length].src, commerceApi)} alt={slides[slide % slides.length].alt} fill priority sizes="100vw" />}<div className={styles.sliderDots} aria-label="Slider sayfaları">{slides.map((item, index) => <button type="button" key={item.src} className={index === slide % slides.length ? styles.activeDot : ""} onClick={() => setSlide(index)} aria-label={`${index + 1}. görsel`} aria-current={index === slide % slides.length ? "true" : undefined} />)}</div></section>}
      <PersonalizationFeature />
      <CategoryGallery categories={categories} />
      <TitaniumFeature image={titaniumImage ? mediaUrl(titaniumImage,commerceApi) : ''} />
      <section id="urunler" className={`${styles.section} ${styles.products}`} aria-labelledby="featured-title"><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Öne çıkanlar</p><h2 id="featured-title">Form ve işlev, tek çizgide.</h2></div><Link className={styles.textLink} href="/urunler">Tüm ürünler <Icon name="arrow" /></Link></div><div className={styles.productGrid}>{products.map((product) => <ProductCard key={product.name} product={product} />)}</div></section>
      <section className={styles.values} aria-label="Xinobi değerleri"><div><span>01</span><h3>Ürün merkezli</h3><p>Gerçek ürün, doğru varyant ve açık bilgi.<br/>Abartısız mühendislik, saf malzeme kalitesi.</p></div><div><span>02</span><h3>Size özgü</h3><p>Kişisel seçimlerinize alan açan tasarım.<br/>Yapay zekâ ile her eve biricik dokunuşlar.</p></div><div><span>03</span><h3>Tek deneyim</h3><p>Web ve mobilde aynı sakin akış.<br/>Karmaşadan uzak, pürüzsüz müşteri yolculuğu.</p></div></section>
      <section className={styles.story} id="hikaye"><p className={styles.eyebrow}>Xinobi Dünyası</p><h2>Teknoloji görünür olmak için değil,<br />hayatınıza uyum sağlamak için.</h2><Link className={styles.textLink} href="/xinobi">Hikâyemizi keşfedin <Icon name="arrow" /></Link></section>
    </main>
    <SiteFooter />
    <section id="nobi-panel" className={styles.nobiPanel} aria-labelledby="nobi-title" hidden={!nobiOpen}><div className={styles.nobiHead}><div><NobiMark compact /><div><p className={styles.eyebrow}>NOBI</p><h2 id="nobi-title">Size nasıl yardımcı olabilirim?</h2></div></div><button type="button" onClick={() => setNobiOpen(false)} aria-label="Nobi panelini kapat">×</button></div><p>Ürünleri keşfetmenize veya XINOBI U adımlarını anlamanıza yardımcı olabilirim.</p><div className={styles.nobiQuick}><Link href="/urunler">Çay makinesi arıyorum</Link><Link href="/xinobi-u">XINOBI U nasıl çalışır?</Link><Link href="/kurumsal/teklif">Kurumsal teklif almak istiyorum</Link></div><p className={styles.nobiDemo}>Temsili asistan · Gerçek yanıtlar Faz10’da Cloudflare Workers AI ve onaylı katalog verisiyle bağlanacak.</p></section>
    <button className={styles.nobi} type="button" aria-label="Nobi’ye sor" aria-expanded={nobiOpen} aria-controls="nobi-panel" onClick={() => setNobiOpen((open) => !open)}><NobiMark /><b>Nobi’ye sor</b></button>
  </div>;
}
