"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money, stockText } from "../../lib/commerce";
import CompareToggle from "../../components/compare-toggle";
import styles from "./catalog.module.css";


type Category = string;
type Product = { id: string; name: string; category: Exclude<Category, "Tümü">; family: string; color: string; swatch: string; image: StaticImageData | string; price?: number; stock?: number; tall?: boolean; order: number; href?: string; colorCount?: number };

const fallbackCategories: Category[] = ["Tümü", "Çay", "Kahve", "Hava", "Pişirme"];
const favoriteStorageKey = "xinobi-demo-favorites";

const categoryLabel = (name: string) => ({'Çay makineleri':'Çay', 'Kahve makineleri':'Kahve', 'Hava temizleme':'Hava', 'Pişirme teknolojileri':'Pişirme'} as Record<string, string>)[name] || name;
export default function Catalog() {
  const { state, error } = useCommerce();
  const products: Product[] = useMemo(() => state ? state.products.filter(product => product.active).map((product, order) => ({ id: product.id, name: product.name, category: categoryLabel(product.category), family: product.category, color: product.variants.map(variant=>variant.color).join(', '), swatch: product.variants[0]?.hex || '#777777', image: mediaUrl(product.originalImage || product.variants[0]?.image || '', commerceApi), order, colorCount: product.variants.length, price: state.prices[product.variants[0]?.id], stock: product.variants.reduce((sum,variant)=>sum+variant.stock,0), href: `/urunler/detay?id=${encodeURIComponent(product.id)}` })) : [], [state]);
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
    {visibleProducts.length > 0 ? <div className={styles.grid}>{visibleProducts.map((product) => <article className={styles.card} key={product.id}>
      <Link className={styles.cardLink} href={product.href || '/urunler'}><div className={styles.media}>{(product.colorCount || 0)>1 && <span className={styles.multiColorBadge}>◉ {product.colorCount} renk</span>}<span className={styles.demoBadge}>Xinobi</span>{product.image ? <Image className={product.tall ? styles.tallImage : ""} src={product.image} width={600} height={600} alt={`${product.name}, ${product.color}`} sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 32vw" /> : <span>Görsel yok</span>}</div>

      <div className={styles.cardBody}><p>{product.family}</p><h2>{product.name}</h2><div className={styles.variant}><span style={{ backgroundColor: product.swatch }} /><span>{(product.colorCount || 0)>1 ? `${product.colorCount} renk seçeneği` : product.color}</span></div><div className={styles.cardFooter}><span>{money(product.price)}{stockText(product.stock) && <><br />{stockText(product.stock)}</>}</span>{product.href ? <span className={styles.inspect}>İncele <b aria-hidden="true">→</b></span> : <span>İncele →</span>}</div></div></Link>
      {state && <div className={styles.compareButton}><CompareToggle productId={product.id} name={product.name} compact /></div>}
      <button type="button" className={styles.favoriteButton} aria-label={`${product.name} ${product.color} ürününü ${favorites.includes(product.id) ? "favorilerden çıkar" : "favorilere ekle"}`} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><span aria-hidden="true">{favorites.includes(product.id) ? "♥" : "♡"}</span></button>
    </article>)}</div> : <div className={styles.empty}><span aria-hidden="true">⌕</span><h2>Aradığınız ürün bulunamadı.</h2><p>Arama ifadenizi değiştirin veya başka bir kategori seçin.</p><button type="button" onClick={() => { setCategory("Tümü"); setQuery(""); }}>Filtreleri temizle</button></div>}
  </section>;
}
