"use client";

import { useEffect, useMemo, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money, stockText } from "../../lib/commerce";
import styles from "./catalog.module.css";
import CatalogProductCard, { catalogFavoriteStorageKey, type CatalogProductCardData } from "../../components/catalog-product-card";

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
type Product = CatalogProductCardData & { category: Exclude<Category, "Tümü">; price?: number; stock?: number; order: number; href?: string };

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
const categoryLabel = (name: string) => ({'Çay makineleri':'Çay', 'Kahve makineleri':'Kahve', 'Hava temizleme':'Hava', 'Pişirme teknolojileri':'Pişirme'} as Record<string, string>)[name] || name;
export default function Catalog() {
  const { state, error, enabled } = useCommerce();
  const products: Product[] = useMemo(() => state ? state.products.filter(product => product.active).map((product, order) => ({ id: product.id, name: product.name, category: categoryLabel(product.category), family: product.category, color: product.variants.map(variant=>variant.color).join(', '), swatch: product.variants[0]?.hex || '#777777', image: mediaUrl(product.originalImage || product.variants[0]?.image || '', commerceApi), order, colorCount: product.variants.length, price: state.prices[product.variants[0]?.id], stock: product.variants.reduce((sum,variant)=>sum+variant.stock,0), href: `/urunler/detay?id=${encodeURIComponent(product.id)}` })) : enabled ? [] : fallbackProducts.filter((product,index,items)=>items.findIndex(other=>other.name===product.name)===index).map(product=>({...product,colorCount:fallbackProducts.filter(other=>other.name===product.name).length})), [state, enabled]);
  const categories = state ? ["Tümü", ...new Set((state.categories ?? state.products.map(product => product.category)).map(categoryLabel))] : fallbackCategories;
  const [category, setCategory] = useState<Category>("Tümü");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const selectedCategory = new URLSearchParams(window.location.search).get("category");
      if (selectedCategory) setCategory(categoryLabel(selectedCategory));
      try { setFavorites(JSON.parse(localStorage.getItem(catalogFavoriteStorageKey) || "[]")); } catch { setFavorites([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(catalogFavoriteStorageKey, JSON.stringify(next));
      return next;
    });
  }

  const activeCategory = categories.includes(category) ? category : 'Tümü';
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const filtered = products.filter((product) => (activeCategory === "Tümü" || product.category === activeCategory) && (!normalizedQuery || `${product.name} ${product.family} ${product.color}`.toLocaleLowerCase("tr-TR").includes(normalizedQuery)));
    return [...filtered].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "tr") || a.color.localeCompare(b.color, "tr") : a.order - b.order);
  }, [activeCategory, query, sort, products]);

  return <section id="catalog" className={styles.catalog} aria-label="Ürün kataloğu">
    {error && <p role="alert">{error}</p>}
    <div className={styles.toolbar}>
      <div className={styles.search}><label className={styles.toolbarLabel} htmlFor="product-search">Ürünlerde ara</label><div><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg><input id="product-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ürün, kategori veya renk" /></div></div>
      <div className={styles.sort}><label className={styles.toolbarLabel} htmlFor="product-sort">Sırala</label><select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Öne çıkanlar</option><option value="name">Ürün adı</option></select></div>
      <div className={styles.categoryBar} aria-label="Kategori filtresi">{categories.map((item) => <button type="button" key={item} className={activeCategory === item ? styles.activeCategory : ""} aria-pressed={activeCategory === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </div>
    <div className={styles.resultSummary} aria-live="polite"><strong>{visibleProducts.length} ürün</strong><span>Ürünler</span></div>
    {visibleProducts.length > 0 ? <div className={styles.grid}>{visibleProducts.map((product) => <CatalogProductCard key={product.id} product={product} cardHref={product.href || '/urunler'} favorite={favorites.includes(product.id)} onToggleFavorite={() => toggleFavorite(product.id)} action={<><span>{money(product.price)}{stockText(product.stock) && <><br />{stockText(product.stock)}</>}</span>{product.href ? <span className={styles.inspect}>İncele <b aria-hidden="true">→</b></span> : <span>İncele →</span>}</>} />)}</div> : <div className={styles.empty}><span aria-hidden="true">⌕</span><h2>Aradığınız ürün bulunamadı.</h2><p>Arama ifadenizi değiştirin veya başka bir kategori seçin.</p><button type="button" onClick={() => { setCategory("Tümü"); setQuery(""); }}>Filtreleri temizle</button></div>}
  </section>;
}
