"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money } from "../../lib/commerce";
import styles from "./catalog.module.css";

import airPurifier from "../../../public/assets/products/air-purifier-101.webp";
import coffeeGold from "../../../public/assets/products/coffee-maker-101-gold.webp";
import coffeeRed from "../../../public/assets/products/coffee-maker-101-red.webp";
import coffeeTwo from "../../../public/assets/products/coffee-maker-102.webp";
import cookingMachine from "../../../public/assets/products/cooking-machine.webp";
import teaBlue from "../../../public/assets/products/tea-maker-101-blue.webp";
import teaRed from "../../../public/assets/products/tea-maker-101-red.webp";
import teaRose from "../../../public/assets/products/tea-maker-101-rose-gold.webp";
import teaSilver from "../../../public/assets/products/tea-maker-101-silver.webp";
import toastMaker from "../../../public/assets/products/toast-maker.webp";

type Category = string;
type Product = { id: string; name: string; category: Exclude<Category, "Tümü">; family: string; color: string; swatch: string; image: StaticImageData | string; price?: number; stock?: number; tall?: boolean; order: number; href?: string };

const fallbackCategories: Category[] = ["Tümü", "Çay", "Kahve", "Hava", "Pişirme"];
const fallbackProducts: Product[] = [
  { id: "tea-101-blue", name: "Çay Makinesi 101", category: "Çay", family: "Çay makineleri", color: "Lacivert", swatch: "#18304d", image: teaBlue, tall: true, order: 1, href: "/urunler/cay-makinesi-101" },
  { id: "tea-101-rose", name: "Çay Makinesi 101", category: "Çay", family: "Çay makineleri", color: "Rose gold", swatch: "#b87d72", image: teaRose, tall: true, order: 2, href: "/urunler/cay-makinesi-101" },
  { id: "coffee-101-gold", name: "Kahve Makinesi 101", category: "Kahve", family: "Kahve makineleri", color: "Gold", swatch: "#b78945", image: coffeeGold, order: 3 },
  { id: "air-101", name: "Air Purifier 101", category: "Hava", family: "Hava temizleyiciler", color: "Beyaz", swatch: "#efefed", image: airPurifier, tall: true, order: 4 },
  { id: "tea-101-silver", name: "Çay Makinesi 101", category: "Çay", family: "Çay makineleri", color: "Gümüş gri", swatch: "#9ba0a1", image: teaSilver, tall: true, order: 5, href: "/urunler/cay-makinesi-101" },
  { id: "tea-101-red", name: "Çay Makinesi 101", category: "Çay", family: "Çay makineleri", color: "Kırmızı", swatch: "#9f202b", image: teaRed, tall: true, order: 6, href: "/urunler/cay-makinesi-101" },
  { id: "coffee-101-red", name: "Kahve Makinesi 101", category: "Kahve", family: "Kahve makineleri", color: "Kırmızı", swatch: "#9f202b", image: coffeeRed, order: 7 },
  { id: "coffee-102", name: "Kahve Makinesi 102", category: "Kahve", family: "Kahve makineleri", color: "Siyah", swatch: "#202426", image: coffeeTwo, order: 8 },
  { id: "cooking", name: "Yemek Yapma Makinesi", category: "Pişirme", family: "Pişirme teknolojileri", color: "Siyah", swatch: "#202426", image: cookingMachine, tall: true, order: 9 },
  { id: "toast", name: "Tost Makinesi", category: "Pişirme", family: "Pişirme teknolojileri", color: "Siyah", swatch: "#202426", image: toastMaker, order: 10 },
];
const favoriteStorageKey = "xinobi-demo-favorites";

const categoryLabel = (name: string) => ({'Çay makineleri':'Çay', 'Kahve makineleri':'Kahve', 'Hava temizleme':'Hava', 'Pişirme teknolojileri':'Pişirme'} as Record<string, string>)[name] || name;
export default function Catalog() {
  const { state, error, enabled } = useCommerce();
  const products: Product[] = useMemo(() => state ? state.products.filter(product => product.active).flatMap((product, order) => product.variants.map(variant => ({ id: variant.id, name: product.name, category: categoryLabel(product.category), family: product.category, color: variant.color, swatch: variant.hex || '#777777', image: mediaUrl(variant.image, commerceApi), order, price: state.prices[variant.id], stock: variant.stock, href: product.id === 'DEMO-P101' ? '/urunler/cay-makinesi-101' : `/urunler/detay?id=${encodeURIComponent(product.id)}` }))) : enabled ? [] : fallbackProducts, [state, enabled]);
  const categories = state ? ["Tümü", ...new Set((state.categories ?? state.products.map(product => product.category)).map(categoryLabel))] : fallbackCategories;
  const [category, setCategory] = useState<Category>("Tümü");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const selectedCategory = new URLSearchParams(window.location.search).get("category");
      if (selectedCategory) setCategory(categoryLabel(selectedCategory));
      try { setFavorites(JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]")); } catch { setFavorites([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
      return next;
    });
  }

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const filtered = products.filter((product) => (category === "Tümü" || product.category === category) && (!normalizedQuery || `${product.name} ${product.family} ${product.color}`.toLocaleLowerCase("tr-TR").includes(normalizedQuery)));
    return [...filtered].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "tr") || a.color.localeCompare(b.color, "tr") : a.order - b.order);
  }, [category, query, sort, products]);

  return <section id="catalog" className={styles.catalog} aria-label="Ürün kataloğu">
    {error && <p role="alert">{error}</p>}
    <div className={styles.toolbar}>
      <div className={styles.search}><label htmlFor="product-search">Ürünlerde ara</label><div><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg><input id="product-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ürün, kategori veya renk" /></div></div>
      <div className={styles.sort}><label htmlFor="product-sort">Sırala</label><select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Öne çıkanlar</option><option value="name">Ürün adı</option></select></div>
    </div>
    <div className={styles.categoryBar} aria-label="Kategori filtresi">{categories.map((item) => <button type="button" key={item} className={category === item ? styles.activeCategory : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className={styles.resultSummary} aria-live="polite"><strong>{visibleProducts.length} ürün varyantı</strong><span>Ürünler</span></div>
    {visibleProducts.length > 0 ? <div className={styles.grid}>{visibleProducts.map((product) => <article className={styles.card} key={product.id}>
      <div className={styles.media}><span className={styles.demoBadge}>Xinobi</span>{product.image ? <Image className={product.tall ? styles.tallImage : ""} src={product.image} width={600} height={600} alt={`${product.name}, ${product.color}`} sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 32vw" /> : <span>Görsel yok</span>}</div>
      <button type="button" className={styles.favoriteButton} aria-label={`${product.name} ${product.color} ürününü ${favorites.includes(product.id) ? "favorilerden çıkar" : "favorilere ekle"}`} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><span aria-hidden="true">{favorites.includes(product.id) ? "♥" : "♡"}</span></button>
      <div className={styles.cardBody}><p>{product.family}</p><h2>{product.name}</h2><div className={styles.variant}><span style={{ backgroundColor: product.swatch }} /><span>{product.color}</span></div><div className={styles.cardFooter}><span>{money(product.price)}<br />{product.stock === undefined ? "Stok bilgisi bekleniyor" : product.stock > 0 ? `${product.stock} adet stokta` : "Stokta yok"}</span>{product.href ? <Link href={product.href} aria-label={`${product.name} ${product.color} ürününü incele`}>İncele <b aria-hidden="true">→</b></Link> : <button type="button" disabled title="Ürün detay tasarımı hazırlanıyor">Hazırlanıyor</button>}</div></div>
    </article>)}</div> : <div className={styles.empty}><span aria-hidden="true">⌕</span><h2>Aradığınız ürün bulunamadı.</h2><p>Arama ifadenizi değiştirin veya başka bir kategori seçin.</p><button type="button" onClick={() => { setCategory("Tümü"); setQuery(""); }}>Filtreleri temizle</button></div>}
  </section>;
}
