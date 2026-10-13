"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money, stockText } from "../../lib/commerce";
import styles from "./favorites.module.css";

type Favorite = { id: string; name: string; family: string; color: string; image: StaticImageData | string; price?: number; stock?: number; tall?: boolean; href?: string };
const storageKey = "xinobi-demo-favorites";

export default function Favorites() {
  const { state, error } = useCommerce();
  const products: Favorite[] = state ? state.products.filter(product => product.active).map(product => ({ id: product.id, name: product.name, family: product.category, color: `${product.variants.length} renk`, image: mediaUrl(product.originalImage || product.variants[0]?.image || '', commerceApi), price: state.prices[product.variants[0]?.id], stock: product.variants.reduce((sum, variant)=>sum+variant.stock,0), href: `/urunler/detay?id=${encodeURIComponent(product.id)}` })) : [];
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
        <div className={styles.copy}><p>{product.family}</p><h2>{product.name}</h2><span>{product.color}</span><div><small>{[money(product.price), stockText(product.stock)].filter(Boolean).join(' · ')}</small>{product.href ? <Link href={product.href}>İncele →</Link> : <span>Detay hazırlanıyor</span>}</div></div>
      </article>)}</div></> : <div className={styles.empty}><span aria-hidden="true">♡</span><h2>Favori listeniz henüz boş.</h2><p>Beğendiğiniz ürünleri katalogdaki kalp düğmesiyle buraya ekleyin.</p><Link href="/urunler">Ürünleri keşfet →</Link></div>}
    </section>
  </>;
}
