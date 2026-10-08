'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCommerce, commerceApi, mediaUrl, money, productGallery, stockText } from '../../../lib/commerce';
import AddToCart from '../../../components/add-to-cart';
import SiteHeader from '../../../components/site-header';
import styles from '../cay-makinesi-101/product.module.css';
export default function ProductDetail() {
  const { state, error } = useCommerce();
  const id = useSearchParams().get('id') || '';
  const [selectedId, setSelectedId] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const product = state?.products.find(item => item.id === id && item.active);
  const variant = product?.variants.find(item => item.id === selectedId) ?? product?.variants[0];
  if (!state) return <><SiteHeader /><p role="status">{error || 'Ürün yükleniyor…'}</p></>;
  if (!product || !variant) return <><SiteHeader /><main><p>Bu ürün şu anda yayında değil.</p><Link href="/urunler">Ürünlere dön</Link></main><footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/urunler">Tüm ürünler</Link></footer></>;
  // Choosing a colour shows its photo; the cover and extra photos stay one tap away in the strip.
  const images = productGallery(product, variant);
  const shown = images.find(item => item.src === activeImage) ?? images[0];
  const index = shown ? images.indexOf(shown) : -1;
  const step = (delta: number) => setActiveImage(images[(index + delta + images.length) % images.length].src);
  return <><SiteHeader /><main className={styles.detailPage}><section className={`${styles.productHero} ${styles.detailHero}`}>
    <div className={styles.gallery} role="region" aria-roledescription="galeri" aria-label={`${product.name} görselleri`}>
      <div className={styles.imageStage}>{shown ? <Image key={shown.src} src={mediaUrl(shown.src, commerceApi)} alt={`${product.name}, ${shown.label}`} width={700} height={700} /> : <p>Görsel yok</p>}
        {images.length > 1 && <><button type="button" className={`${styles.stageNav} ${styles.stagePrev}`} aria-label="Önceki görsel" onClick={() => step(-1)}>‹</button><button type="button" className={`${styles.stageNav} ${styles.stageNext}`} aria-label="Sonraki görsel" onClick={() => step(1)}>›</button><p className={styles.stageCount} aria-live="polite">{index + 1} / {images.length}</p></>}</div>
      {images.length > 1 && <ul className={styles.thumbs}>{images.map((item, position) => <li key={item.src}><button type="button" aria-label={`Görsel ${position + 1} / ${images.length}: ${item.label}`} aria-current={item === shown ? 'true' : undefined} onClick={() => setActiveImage(item.src)}><Image src={mediaUrl(item.src, commerceApi)} alt="" width={88} height={88} /></button></li>)}</ul>}
    </div>
    <div className={styles.productInfo}><Link className={styles.breadcrumb} href="/urunler">← Ürünler</Link><p className={styles.eyebrow}>{product.category}</p><h1>{product.name}</h1><p className={styles.detailSku}>SKU: {variant.sku}</p><p className={styles.lead}>{product.description}</p><div className={styles.pendingPrice}><strong>{money(state.prices[variant.id])}</strong>{stockText(variant.stock) && <p>{stockText(variant.stock)}</p>}</div>
    <fieldset className={styles.variants}><legend>Renk: {variant.color}</legend><div>{product.variants.map(item => <button type="button" key={item.id} aria-label={`${item.color} rengini seç`} className={variant.id === item.id ? styles.selectedVariant : ''} onClick={() => { setSelectedId(item.id); setActiveImage(item.image); }} aria-pressed={variant.id === item.id}><span style={{background: item.hex && /^#[a-fA-F0-9]{6}$/.test(item.hex) ? item.hex : undefined}} aria-hidden="true"/><small>{item.color}</small></button>)}</div></fieldset>
    <AddToCart productId={product.id} variantId={variant.id} stock={variant.stock} price={state.prices[variant.id]}/>
    {(product.personalizable ?? (product.category.includes('Çay') || product.category.includes('Kahve'))) && <div className={styles.actions}><Link href={`/xinobi-u/sorular?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(variant.id)}`}>XINOBI U ile kişiselleştir <span aria-hidden="true">→</span></Link></div>}
    </div>
  </section>{error && <p role="alert">{error}</p>}</main><footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/urunler">Tüm ürünler</Link></footer></>;
}
