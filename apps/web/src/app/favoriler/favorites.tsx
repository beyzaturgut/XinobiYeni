"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCommerce, commerceApi, mediaUrl, money, stockText } from "../../lib/commerce";
import { useFavorites } from "../../lib/favorites";
import styles from "./favorites.module.css";

type Favorite = { id: string; name: string; family: string; color: string; image: StaticImageData | string; price?: number; stock?: number; tall?: boolean; href?: string };


export default function Favorites() {
  const { state, error } = useCommerce();
  const products: Favorite[] = useMemo(() => state ? state.products.filter(product => product.active).map(product => ({ id: product.id, name: product.name, family: product.category, color: `${product.variants.length} renk`, image: mediaUrl(product.originalImage || product.variants[0]?.image || '', commerceApi), price: state.prices[product.variants[0]?.id], stock: product.variants.reduce((sum, variant)=>sum+variant.stock,0), href: `/urunler/detay?id=${encodeURIComponent(product.id)}` })) : [], [state]);
  const productIds = useMemo(() => products.map(product => product.id), [products]);
  const favorites = useFavorites(productIds);
  const [actionError, setActionError] = useState<string>();
  const selected = products.filter((product) => favorites.ids.includes(product.id));
  async function remove(id: string) { setActionError(undefined); try { await favorites.toggle(id); } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Favori çıkarılamadı."); } }

  return <>
    {(error || favorites.error || actionError) && <p role="alert">{error || favorites.error || actionError}</p>}
    <section className={styles.hero}><p>Kişisel seçkiniz</p><h1>Favorilerim.</h1><div><span>Hesabınıza özel</span><p>Favorileriniz hesabınıza güvenle kaydedilir ve giriş yaptığınız cihazlarda görünür.</p></div></section>
    <section className={styles.content} aria-live="polite">
      {favorites.loading ? <div className={styles.loading}>Favorileriniz hazırlanıyor…</div> : !favorites.signedIn ? <div className={styles.empty}><span aria-hidden="true">♡</span><h2>Favorilerinizi görmek için giriş yapın.</h2><p>Listeniz hesabınıza bağlı olarak güvenle saklanır.</p><Link href="/hesap">Giriş yap →</Link></div> : selected.length ? <><div className={styles.summary}><strong>{selected.length} favori ürün</strong><button type="button" onClick={() => void favorites.clear().catch(cause => setActionError(cause instanceof Error ? cause.message : "Favoriler temizlenemedi."))}>Tümünü temizle</button></div><div className={styles.grid}>{selected.map((product) => <article key={product.id}>
        <div className={styles.media}>{product.image ? <Image className={product.tall ? styles.tall : ""} src={product.image} width={600} height={600} alt={`${product.name}, ${product.color}`} sizes="(max-width: 680px) 90vw, 32vw" /> : <span>Görsel yok</span>}<button type="button" onClick={() => remove(product.id)} aria-label={`${product.name} ${product.color} ürününü favorilerden çıkar`}>♥</button></div>
        <div className={styles.copy}><p>{product.family}</p><h2>{product.name}</h2><span>{product.color}</span><div><small>{[money(product.price), stockText(product.stock)].filter(Boolean).join(' · ')}</small>{product.href ? <Link href={product.href}>İncele →</Link> : <span>Detay hazırlanıyor</span>}</div></div>
      </article>)}</div></> : <div className={styles.empty}><span aria-hidden="true">♡</span><h2>Favori listeniz henüz boş.</h2><p>Beğendiğiniz ürünleri katalogdaki kalp düğmesiyle buraya ekleyin.</p><Link href="/urunler">Ürünleri keşfet →</Link></div>}
    </section>
  </>;
}
