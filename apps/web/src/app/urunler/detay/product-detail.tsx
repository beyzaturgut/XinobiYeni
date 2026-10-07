'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCommerce, commerceApi, mediaUrl, money, stockText } from '../../../lib/commerce';
import SiteHeader from '../../../components/site-header';
import styles from '../cay-makinesi-101/product.module.css';
export default function ProductDetail() {
  const { state, error } = useCommerce();
  const id = useSearchParams().get('id') || '';
  const [selectedId, setSelectedId] = useState('');
  const product = state?.products.find(item => item.id === id && item.active);
  const variant = product?.variants.find(item => item.id === selectedId) ?? product?.variants[0];
  if (!state) return <><SiteHeader /><p role="status">{error || 'Ürün yükleniyor…'}</p></>;
  if (!product || !variant) return <><SiteHeader /><main><p>Bu ürün şu anda yayında değil.</p><Link href="/urunler">Ürünlere dön</Link></main><footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/urunler">Tüm ürünler</Link></footer></>;
  const image = !selectedId && product.originalImage ? product.originalImage : variant.image;
  return <><SiteHeader /><main className={styles.detailPage}><section className={`${styles.productHero} ${styles.detailHero}`}>
    <div className={styles.gallery}><div className={styles.imageStage}>{image ? <Image src={mediaUrl(image, commerceApi)} alt={`${product.name}, ${variant.color}`} width={700} height={700} /> : <p>Görsel yok</p>}</div></div>
    <div className={styles.productInfo}><Link className={styles.breadcrumb} href="/urunler">← Ürünler</Link><p className={styles.eyebrow}>{product.category}</p><h1>{product.name}</h1><p className={styles.detailSku}>SKU: {variant.sku}</p><p className={styles.lead}>{product.description}</p><div className={styles.pendingPrice}><strong>{money(state.prices[variant.id])}</strong>{stockText(variant.stock) && <p>{stockText(variant.stock)}</p>}</div>
    <fieldset className={styles.variants}><legend>Renk: {variant.color}</legend><div>{product.variants.map(item => <button type="button" key={item.id} aria-label={`${item.color} rengini seç`} className={variant.id === item.id ? styles.selectedVariant : ''} onClick={() => setSelectedId(item.id)} aria-pressed={variant.id === item.id}><span style={{background: item.hex && /^#[a-fA-F0-9]{6}$/.test(item.hex) ? item.hex : undefined}} aria-hidden="true"/><small>{item.color}</small></button>)}</div></fieldset>
    {(product.personalizable ?? (product.category.includes('Çay') || product.category.includes('Kahve'))) && <div className={styles.actions}><Link href={`/xinobi-u/sorular?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(variant.id)}`}>XINOBI U ile kişiselleştir <span aria-hidden="true">→</span></Link></div>}
    </div>
  </section>{error && <p role="alert">{error}</p>}</main><footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/urunler">Tüm ürünler</Link></footer></>;
}
