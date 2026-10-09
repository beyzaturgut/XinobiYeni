"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money, stockText } from "../../lib/commerce";
import { clearCompare, maxCompare, toggleCompare, useCompare } from "../../lib/compare";
import styles from "./search.module.css";
import teaMaker from "../../../public/assets/products/tea-maker-101-blue.webp";
import coffeeMaker from "../../../public/assets/products/coffee-maker-101-gold.webp";
import airPurifier from "../../../public/assets/products/air-purifier-101.webp";
import cookingMachine from "../../../public/assets/products/cooking-machine.webp";
import toastMaker from "../../../public/assets/products/toast-maker.webp";

type Item = { id: string; name: string; family: string; description: string; image: StaticImageData | string; price?: number; stock?: number; tall?: boolean; features: [string, string, string]; href?: string };
const fallbackItems: Item[] = [
  { id: "tea", name: "Çay Makinesi 101", family: "Çay makineleri", description: "Modern çay ritüeli için dengeli form.", image: teaMaker, tall: true, features: ["Çay hazırlama", "4 demo renk", "Studio uyumlu"], href: "/urunler/cay-makinesi-101" },
  { id: "coffee", name: "Kahve Makinesi 101", family: "Kahve makineleri", description: "İki fincanı aynı anda hazırlayan kompakt tasarım.", image: coffeeMaker, features: ["Kahve hazırlama", "2 demo renk", "Studio planlanıyor"] },
  { id: "air", name: "Air Purifier 101", family: "Hava temizleyiciler", description: "Yaşam alanlarına uyumlu sade hava yaklaşımı.", image: airPurifier, tall: true, features: ["Hava kategorisi", "Beyaz", "Detay hazırlanıyor"] },
  { id: "cooking", name: "Yemek Yapma Makinesi", family: "Pişirme teknolojileri", description: "Tek merkezde çok adımlı mutfak deneyimi.", image: cookingMachine, tall: true, features: ["Pişirme", "Siyah", "Detay hazırlanıyor"] },
  { id: "toast", name: "Tost Makinesi", family: "Pişirme teknolojileri", description: "Günlük kullanıma uygun yalın masaüstü formu.", image: toastMaker, features: ["Tost hazırlama", "Siyah", "Detay hazırlanıyor"] },
];

export default function SearchCompare() {
  const { state, error, enabled } = useCommerce();
  const items: Item[] = useMemo(() => state ? state.products.filter(product => product.active).map(product => ({ id: product.id, name: product.name, family: product.category, description: product.description, image: mediaUrl(product.originalImage || product.variants[0]?.image || '', commerceApi), price: state.prices[product.variants[0]?.id], stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0), features: [product.category, `${product.variants.length} renk`, product.description], href: product.id === 'DEMO-P101' ? '/urunler/cay-makinesi-101' : `/urunler/detay?id=${encodeURIComponent(product.id)}` })) : enabled ? [] : fallbackItems, [state, enabled]);
  const [query, setQuery] = useState("");
  // The comparison list is shared with product cards, the tray and /karsilastir.
  const selected = useCompare();
  const normalized = query.trim().toLocaleLowerCase("tr-TR");
  const results = useMemo(() => items.filter((item) => `${item.name} ${item.family} ${item.description}`.toLocaleLowerCase("tr-TR").includes(normalized)), [normalized, items]);
  const compared = selected.map((id) => items.find((item) => item.id === id)).filter((item): item is Item => Boolean(item));

  const toggle = (id: string) => { toggleCompare(id); };

  return <>
    {error && <p role="alert">{error}</p>}
    <section className={styles.searchHero} aria-labelledby="search-title">
      <p>Ürün keşfi</p><h1 id="search-title">Aradığınızı daha sakin bulun.</h1>
      <label htmlFor="global-product-search">Ürün, kategori veya özellik ara</label>
      <div className={styles.searchBox}><span aria-hidden="true">⌕</span><input id="global-product-search" type="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); }} placeholder="Örneğin: çay, kahve veya pişirme" /><kbd>ESC</kbd></div>
      <div className={styles.quickLinks}><span>Hızlı aramalar</span>{["Çay", "Kahve", "Pişirme"].map((term) => <button type="button" key={term} onClick={() => setQuery(term)}>{term}</button>)}</div>
    </section>

    <section className={styles.results} aria-labelledby="results-title">
      <div className={styles.sectionHeader}><div><p>Arama sonuçları</p><h2 id="results-title">{query ? `“${query}” için ${results.length} sonuç` : `${results.length} demo ürün`}</h2></div><span>Karşılaştırmak için en fazla {maxCompare} ürün seçin.</span></div>
      {results.length ? <div className={styles.resultGrid}>{results.map((item) => { const active = selected.includes(item.id); const full = selected.length === maxCompare && !active; return <article key={item.id}>
        <div className={styles.productMedia}>{item.image ? <Image className={item.tall ? styles.tall : ""} src={item.image} width={600} height={600} alt={item.name} sizes="(max-width: 680px) 88vw, 25vw" /> : <span>Görsel yok</span>}</div>
        <div className={styles.productCopy}><p>{item.family}</p><h3>{item.name}</h3><span>{item.description}</span><div><button type="button" aria-pressed={active} disabled={full} onClick={() => toggle(item.id)}>{active ? "Karşılaştırmadan çıkar" : full ? `En fazla ${maxCompare} ürün` : "Karşılaştır"}</button>{item.href ? <Link href={item.href}>İncele →</Link> : <span>Detay hazırlanıyor</span>}</div></div>
      </article>; })}</div> : <div className={styles.empty}><span aria-hidden="true">⌕</span><h2>Bu ifadeyle eşleşen ürün yok.</h2><p>Başka bir ürün adı veya kategori deneyin.</p><button type="button" onClick={() => setQuery("")}>Aramayı temizle</button></div>}
    </section>

    <section className={styles.compare} aria-labelledby="compare-title">
      <div className={styles.sectionHeader}><div><p>Yan yana bakın</p><h2 id="compare-title">Ürün karşılaştırma</h2></div><div><Link href="/karsilastir">Ayrıntılı karşılaştırma →</Link> <button type="button" onClick={clearCompare} disabled={!selected.length}>Tümünü temizle</button></div></div>
      {compared.length ? <div className={styles.compareTable} role="region" aria-label="Seçilen ürünlerin karşılaştırması" tabIndex={0}><table><thead><tr><th>Özellik</th>{compared.map((item) => <th key={item.id}>{item.name}<button type="button" onClick={() => toggle(item.id)} aria-label={`${item.name} ürününü karşılaştırmadan çıkar`}>×</button></th>)}</tr></thead><tbody>{[0,1,2].map((index) => <tr key={index}><th>{["Kullanım", "Renk / seçenek", "Kişiselleştirme"][index]}</th>{compared.map((item) => <td key={item.id}>{item.features[index]}</td>)}</tr>)}<tr><th>Fiyat ve stok</th>{compared.map((item) => <td key={item.id}><span className={styles.waiting}>{[money(item.price), stockText(item.stock)].filter(Boolean).join(' · ')}</span></td>)}</tr></tbody></table></div> : <div className={styles.compareEmpty}>Karşılaştırma tablosu için yukarıdan en az bir ürün seçin.</div>}
    </section>
  </>;
}
