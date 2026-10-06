'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCommerce, commerceApi, mediaUrl, money } from '../../../lib/commerce';
import styles from '../cay-makinesi-101/product.module.css';
export default function ProductDetail() {
  const { state, error } = useCommerce();
  const id = useSearchParams().get('id') || '';
  const [selectedId, setSelectedId] = useState('');
  const product = state?.products.find(item => item.id === id && item.active);
  const variant = product?.variants.find(item => item.id === selectedId) ?? product?.variants[0];
  if (!state) return <p role="status">{error || 'Ürün yükleniyor…'}</p>;
  if (!product || !variant) return <main><p>Bu ürün şu anda yayında değil.</p><Link href="/urunler">Ürünlere dön</Link></main>;
  return <main><section className={styles.productHero}>
    <div className={styles.gallery}><div className={styles.imageStage}>{variant.image ? <Image src={mediaUrl(variant.image, commerceApi)} alt={`${product.name}, ${variant.color}`} width={700} height={700} /> : <p>Görsel yok</p>}</div></div>
    <div className={styles.productInfo}><Link href="/urunler">← Ürünler</Link><p className={styles.eyebrow}>{product.category}</p><h1>{product.name}</h1><p className={styles.lead}>{product.description}</p><div className={styles.pendingPrice}><strong>{money(state.prices[variant.id])}</strong><p>{variant.stock > 0 ? `${variant.stock} adet stokta` : 'Stokta yok'}</p></div>
    <fieldset className={styles.variants}><legend>Renk: {variant.color}</legend><div>{product.variants.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} aria-pressed={variant.id === item.id}>{item.color}</button>)}</div></fieldset>
    <p>SKU: {variant.sku}</p></div>
  </section>{error && <p role="alert">{error}</p>}</main>;
}
