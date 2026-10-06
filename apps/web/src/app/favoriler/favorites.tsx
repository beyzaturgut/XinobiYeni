"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money } from "../../lib/commerce";
import styles from "./favorites.module.css";
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

type Favorite = { id: string; name: string; family: string; color: string; image: StaticImageData | string; price?: number; stock?: number; tall?: boolean; href?: string };
const fallbackProducts: Favorite[] = [
  { id: "tea-101-blue", name: "Çay Makinesi 101", family: "Çay makineleri", color: "Lacivert", image: teaBlue, tall: true, href: "/urunler/cay-makinesi-101" },
  { id: "tea-101-rose", name: "Çay Makinesi 101", family: "Çay makineleri", color: "Rose gold", image: teaRose, tall: true, href: "/urunler/cay-makinesi-101" },
  { id: "coffee-101-gold", name: "Kahve Makinesi 101", family: "Kahve makineleri", color: "Gold", image: coffeeGold },
  { id: "air-101", name: "Air Purifier 101", family: "Hava temizleyiciler", color: "Beyaz", image: airPurifier, tall: true },
  { id: "tea-101-silver", name: "Çay Makinesi 101", family: "Çay makineleri", color: "Gümüş gri", image: teaSilver, tall: true, href: "/urunler/cay-makinesi-101" },
  { id: "tea-101-red", name: "Çay Makinesi 101", family: "Çay makineleri", color: "Kırmızı", image: teaRed, tall: true, href: "/urunler/cay-makinesi-101" },
  { id: "coffee-101-red", name: "Kahve Makinesi 101", family: "Kahve makineleri", color: "Kırmızı", image: coffeeRed },
  { id: "coffee-102", name: "Kahve Makinesi 102", family: "Kahve makineleri", color: "Siyah", image: coffeeTwo },
  { id: "cooking", name: "Yemek Yapma Makinesi", family: "Pişirme teknolojileri", color: "Siyah", image: cookingMachine, tall: true },
  { id: "toast", name: "Tost Makinesi", family: "Pişirme teknolojileri", color: "Siyah", image: toastMaker },
];
const storageKey = "xinobi-demo-favorites";

export default function Favorites() {
  const { state, error, enabled } = useCommerce();
  const products: Favorite[] = state ? state.products.filter(product => product.active).map(product => ({ id: product.id, name: product.name, family: product.category, color: `${product.variants.length} renk`, image: mediaUrl(product.originalImage || product.variants[0]?.image || '', commerceApi), price: state.prices[product.variants[0]?.id], stock: product.variants.reduce((sum, variant)=>sum+variant.stock,0), href: `/urunler/detay?id=${encodeURIComponent(product.id)}` })) : enabled ? [] : fallbackProducts;
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setIds(JSON.parse(localStorage.getItem(storageKey) || "[]")); } catch { setIds([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const selected = products.filter((product) => ids?.some(id=>id===product.id || state?.products.find(item=>item.id===product.id)?.variants.some(variant=>variant.id===id)));
  function remove(id: string) { setIds((current) => { const next = (current || []).filter((item) => item !== id && !state?.products.find(product=>product.id===id)?.variants.some(variant=>variant.id===item)); localStorage.setItem(storageKey, JSON.stringify(next)); return next; }); }

  return <>
    {error && <p role="alert">{error}</p>}
    <section className={styles.hero}><p>Kişisel seçkiniz</p><h1>Favorilerim.</h1><div><span>Demo saklama</span><p>Bu liste yalnız bu tarayıcıda tutulur. Hesabınıza veya sunucuya kaydedilmez.</p></div></section>
    <section className={styles.content} aria-live="polite">
      {ids === null ? <div className={styles.loading}>Favorileriniz hazırlanıyor…</div> : selected.length ? <><div className={styles.summary}><strong>{selected.length} favori ürün</strong><button type="button" onClick={() => { localStorage.setItem(storageKey, "[]"); setIds([]); }}>Tümünü temizle</button></div><div className={styles.grid}>{selected.map((product) => <article key={product.id}>
        <div className={styles.media}>{product.image ? <Image className={product.tall ? styles.tall : ""} src={product.image} width={600} height={600} alt={`${product.name}, ${product.color}`} sizes="(max-width: 680px) 90vw, 32vw" /> : <span>Görsel yok</span>}<button type="button" onClick={() => remove(product.id)} aria-label={`${product.name} ${product.color} ürününü favorilerden çıkar`}>♥</button></div>
        <div className={styles.copy}><p>{product.family}</p><h2>{product.name}</h2><span>{product.color}</span><div><small>{money(product.price)} · {product.stock ? `${product.stock} adet stokta` : "Stokta yok"}</small>{product.href ? <Link href={product.href}>İncele →</Link> : <span>Detay hazırlanıyor</span>}</div></div>
      </article>)}</div></> : <div className={styles.empty}><span aria-hidden="true">♡</span><h2>Favori listeniz henüz boş.</h2><p>Beğendiğiniz ürünleri katalogdaki kalp düğmesiyle buraya ekleyin.</p><Link href="/urunler">Ürünleri keşfet →</Link></div>}
    </section>
  </>;
}
