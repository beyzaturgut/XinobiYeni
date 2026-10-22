"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useFavorites } from "../../lib/favorites";
import { useMemo, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money, stockText } from "../../lib/commerce";
import CompareToggle from "../../components/compare-toggle";
import styles from "./catalog.module.css";
import CatalogProductCard, { type CatalogProductCardData } from "../../components/catalog-product-card";


type Category = string;
type Product = CatalogProductCardData & { category: Exclude<Category, "Tümü">; price?: number; stock?: number; order: number; href?: string };

const fallbackCategories: Category[] = ["Tümü", "Çay", "Kahve", "Hava", "Pişirme"];

const categoryLabel = (name: string) => ({'Çay makineleri':'Çay', 'Kahve makineleri':'Kahve', 'Hava temizleme':'Hava', 'Pişirme teknolojileri':'Pişirme'} as Record<string, string>)[name] || name;
export default function Catalog() {
  const { state, error } = useCommerce();
  const products: Product[] = useMemo(() => state ? state.products.filter(product => product.active).map((product, order) => ({ id: product.id, name: product.name, category: categoryLabel(product.category), family: product.category, color: product.variants.map(variant=>variant.color).join(', '), swatch: product.variants[0]?.hex || '#777777', image: mediaUrl(product.originalImage || product.variants[0]?.image || '', commerceApi), order, colorCount: product.variants.length, price: state.prices[product.variants[0]?.id], stock: product.variants.reduce((sum,variant)=>sum+variant.stock,0), href: `/urunler/detay?id=${encodeURIComponent(product.id)}` })) : [], [state]);
  const categories = state ? ["Tümü", ...new Set((state.categories ?? state.products.map(product => product.category)).map(categoryLabel))] : fallbackCategories;
  const params=useSearchParams();
  const category=categoryLabel(params.get("category")||"Tümü");
  function setCategory(value:string){const next=new URLSearchParams(params.toString());if(value==="Tümü")next.delete("category");else next.set("category",value);router.push("/urunler"+(next.size?"?"+next.toString():""),{scroll:false})}
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const router = useRouter();
  const productIds = useMemo(() => products.map(product => product.id), [products]);
  const favorites = useFavorites(productIds);
  const [favoriteError, setFavoriteError] = useState<string>();

  async function toggleFavorite(id: string) {
    setFavoriteError(undefined);
    try { await favorites.toggle(id); }
    catch (cause) {
      if (!favorites.signedIn) { router.push("/hesap"); return; }
      setFavoriteError(cause instanceof Error ? cause.message : "Favori işlemi tamamlanamadı.");
    }
  }

  const activeCategory = categories.includes(category) ? category : 'Tümü';
  const visibleProducts = (() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const filtered = products.filter((product) => (activeCategory === "Tümü" || product.category === activeCategory) && (!normalizedQuery || `${product.name} ${product.family} ${product.color}`.toLocaleLowerCase("tr-TR").includes(normalizedQuery)));
    return [...filtered].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "tr") || a.color.localeCompare(b.color, "tr") : a.order - b.order);
  })();

  return <section id="catalog" className={styles.catalog} aria-label="Ürün kataloğu">
    {(error || favorites.error || favoriteError) && <p role="alert">{error || favorites.error || favoriteError}</p>}
    <div className={styles.toolbar}>
      <div className={styles.search}><label className={styles.toolbarLabel} htmlFor="product-search">Ürünlerde ara</label><div><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg><input id="product-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ürün, kategori veya renk" /></div></div>
      <div className={styles.sort}><label className={styles.toolbarLabel} htmlFor="product-sort">Sırala</label><select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Öne çıkanlar</option><option value="name">Ürün adı</option></select></div>
      <div className={styles.categoryBar} aria-label="Kategori filtresi">{categories.map((item) => <button type="button" key={item} className={activeCategory === item ? styles.activeCategory : ""} aria-pressed={activeCategory === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </div>
    <div className={styles.resultSummary} aria-live="polite"><strong>{visibleProducts.length} ürün</strong><span>Ürünler</span></div>
    {visibleProducts.length > 0 ? <div className={styles.grid}>{visibleProducts.map((product) => <CatalogProductCard key={product.id} product={product} cardHref={product.href || '/urunler'} favorite={favorites.ids.includes(product.id)} onToggleFavorite={() => void toggleFavorite(product.id)} footerExtra={state ? <div className={styles.compareButton}><CompareToggle productId={product.id} name={product.name} compact /></div> : undefined} action={<><span>{money(product.price)}{stockText(product.stock) && <><br />{stockText(product.stock)}</>}</span>{product.href ? <span className={styles.inspect}>İncele <b aria-hidden="true">→</b></span> : <span>İncele →</span>}</>} />)}</div> : <div className={styles.empty}><span aria-hidden="true">⌕</span><h2>Aradığınız ürün bulunamadı.</h2><p>Arama ifadenizi değiştirin veya başka bir kategori seçin.</p><button type="button" onClick={() => { setCategory("Tümü"); setQuery(""); }}>Filtreleri temizle</button></div>}
  </section>;
}
