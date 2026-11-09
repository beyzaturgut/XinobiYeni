'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCommerce, commerceApi, mediaUrl, money, productGallery, stockText } from '../../../lib/commerce';
import { useFavorites } from '../../../lib/favorites';
import { maxCompare, toggleCompare, useCompare } from '../../../lib/compare';
import AddToCart from '../../../components/add-to-cart';
import SiteHeader from '../../../components/site-header';
import ProductReviews from './product-reviews';
import { usePreviewReadiness } from '../../../features/product-personalization/variant-preview-readiness';
import { productJsonLd, siteUrl } from '../../../lib/seo';
import styles from './detail.module.css';

const validHex = (hex?: string | null) => Boolean(hex && /^#[a-fA-F0-9]{6}$/.test(hex));
const Footer = () => <footer className={styles.footer}><span>© 2026 Xinobi</span><Link href="/urunler">Tüm ürünler</Link></footer>;

export default function ProductDetail() {
  const { state, error, retry } = useCommerce();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') || '';
  const selectedId = params.get('variant') || '';
  const [activeImage, setActiveImage] = useState<{product:string;variant:string;src:string}>();
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [openSection, setOpenSection] = useState(-1);
  const [favoriteError, setFavoriteError] = useState('');
  const favoriteIds = useMemo(() => id ? [id] : [], [id]);
  const favorites = useFavorites(favoriteIds);
  const compared = useCompare();
  const product = state?.products.find(item => item.id === id && item.active);
  const variant = selectedId ? product?.variants.find(item => item.id === selectedId) : product?.variants[0];
  const readiness = usePreviewReadiness(product?.personalizable === true ? product.id : '', product?.personalizable === true ? variant?.id || '' : '');
  if (error || !state) return <><SiteHeader /><main className={styles.page}>{error?<div role="alert"><h1>Ürün şu anda yüklenemiyor.</h1><p>{error}</p><button type="button" onClick={retry}>Ürünü yeniden yükle</button></div>:<p role="status">Ürün yükleniyor…</p>}</main><Footer /></>;
  if (product && selectedId && !variant) return <><SiteHeader /><main className={styles.page}><h1>Bu renk şu anda kullanılamıyor.</h1><Link href={`/urunler/detay?id=${encodeURIComponent(product.id)}`}>Ürünün mevcut renklerini gör</Link></main><Footer /></>;
  if (!product || !variant) return <><SiteHeader /><main className={styles.page}><p>Bu ürün şu anda yayında değil.</p><Link href="/urunler">Ürünlere dön</Link></main><Footer /></>;
  // Choosing a colour shows its photo; the cover and extra photos stay one tap away in the strip.
  const images = productGallery(product, variant);
  const selectedImage = activeImage?.product === product.id && activeImage.variant === variant.id ? activeImage.src : selectedId ? variant.image : '';
  const shown = images.find(item => item.src === selectedImage) ?? images[0];
  const chooseImage = (src:string) => setActiveImage({product:product.id,variant:variant.id,src});
  const shownFailed = Boolean(shown && failedImages.includes(shown.src));
  const price = Number.isSafeInteger(state.prices[variant.id]) && state.prices[variant.id] > 0 ? state.prices[variant.id] : undefined;
  const index = shown ? images.indexOf(shown) : -1;
  const step = (delta: number) => chooseImage(images[(index + delta + images.length) % images.length].src);
  // The strip lists the product's own photos only; colour photos are reached through the colour swatches.
  const thumbs = images.filter(item => !item.colour);
  // Every colour and gallery photo is loaded up front and stacked in a fixed order (it must not depend on the selected colour,
  // or the browser re-inserts the photos and the previous one flashes); switching only changes which one is on top.
  const stage = [...new Set([product.originalImage, ...product.variants.map(item => item.image), ...(product.gallery ?? [])].filter((src): src is string => Boolean(src)))];
  // Structured data for the selected colour; relative media becomes absolute on the public domain only.
  const photo = variant.image || product.originalImage;
  const photoUrl = photo ? mediaUrl(photo, commerceApi) : undefined;
  const structuredImage = photoUrl && (/^https?:\/\//.test(photoUrl) ? photoUrl : siteUrl ? siteUrl + photoUrl : undefined);
  const favorite = favorites.ids.includes(product.id);
  const inCompare = compared.includes(product.id);
  const compareFull = !inCompare && compared.length >= maxCompare;
  async function toggleFavorite() {
    setFavoriteError('');
    try { await favorites.toggle(product!.id); }
    catch (cause) {
      if (!favorites.signedIn) { router.push('/hesap'); return; }
      setFavoriteError(cause instanceof Error ? cause.message : 'Favori işlemi tamamlanamadı.');
    }
  }
  const sections: { title: string; body: ReactNode }[] = [
    ...(product.description ? [{ title: 'Ürün açıklaması', body: <p>{product.description}</p> }] : []),
    ...((product.specs?.length ?? 0) > 0 ? [{ title: 'Teknik özellikler', body: <dl className={styles.specs}>{product.specs!.map(spec => <div key={spec.name}><dt>{spec.name}</dt><dd>{spec.value}</dd></div>)}</dl> }] : []),
    { title: 'Teslimat ve iade', body: <p>Teslimat süresi ve iade koşulları sipariş adımında, mesafeli satış belgeleriyle birlikte gösterilir. <Link href="/yasal#belgeler">Yasal merkez →</Link></p> },
  ];
  const stockLabel = variant.stock > 0 ? stockText(variant.stock) || 'Stokta' : 'Stokta yok';
  return <><SiteHeader /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd(product, variant, structuredImage, price) }} /><main className={styles.page}>
    <nav className={styles.breadcrumb} aria-label="Sayfa yolu"><Link href="/urunler">Ürünler</Link><span aria-hidden="true">/</span><Link href={`/urunler?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span></nav>
    <div className={styles.layout}>
      <section className={styles.gallery} role="region" aria-roledescription="galeri" aria-label={`${product.name} görselleri`}>
        <div className={styles.stage}>{shown && !shownFailed ? stage.map(src => <Image key={src} className={src === shown.src ? styles.stageShown : styles.stageHidden} style={src === shown.src ? { opacity: 1, zIndex: 2 } : { opacity: 0, zIndex: 1, pointerEvents: 'none' }} src={mediaUrl(src, commerceApi)} alt={src === shown.src ? `${product.name}, ${shown.label}` : ''} aria-hidden={src === shown.src ? undefined : true} loading="eager" width={700} height={700} onError={()=>setFailedImages(current=>current.includes(src)?current:[...current,src])} />) : <p role="status">{shownFailed?'Bu görsel şu anda yüklenemiyor.':'Görsel yok'}</p>}
          {images.length > 1 && <div className={styles.stageBar}><p className={styles.counter} aria-live="polite">{index + 1} / {images.length}</p><div><button type="button" aria-label="Önceki görsel" onClick={() => step(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></button><button type="button" aria-label="Sonraki görsel" onClick={() => step(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg></button></div></div>}
        </div>
        {images.length > 1 && thumbs.length > 0 && <ul className={styles.thumbs}>{thumbs.map(item => <li key={item.src}><button type="button" aria-label={`${item.label} göster`} aria-current={item === shown ? 'true' : undefined} onClick={() => chooseImage(item.src)}><Image src={mediaUrl(item.src, commerceApi)} alt="" width={88} height={88} /></button></li>)}</ul>}
      </section>
      <section className={styles.info} aria-label="Ürün bilgileri">
        <p className={styles.eyebrow}>{product.category}</p>
        <h1 className={styles.title}>{product.name}</h1>
        <div className={styles.meta}><span>SKU: {variant.sku}</span><span><i className={variant.stock > 0 ? styles.inStock : styles.outOfStock} aria-hidden="true" />{stockLabel}</span></div>
        <p className={styles.price}>{money(price)}</p>
        <div className={styles.divider} />
        <fieldset className={styles.colors}><legend>Renk: <strong>{variant.color}</strong></legend><div>{product.variants.map(item => <button type="button" key={item.id} title={item.color} aria-label={`${item.color} rengini seç`} aria-pressed={variant.id === item.id} className={validHex(item.hex) ? undefined : styles.noHex} style={validHex(item.hex) ? { background: item.hex! } : undefined} onClick={() => { const next=new URLSearchParams(params.toString());next.set('variant',item.id);window.history.pushState(null,'',window.location.pathname+'?'+next+window.location.hash); }} />)}</div></fieldset>
        <AddToCart key={`${product.id}:${variant.id}:${variant.stock}:${price}`} productId={product.id} variantId={variant.id} stock={variant.stock} price={price} />
        <div className={styles.secondaryActions}>
          <button type="button" aria-pressed={favorite} disabled={favorites.loading} onClick={() => void toggleFavorite()}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>{favorite ? 'Favorilerde' : 'Favorilere ekle'}</button>
          <button type="button" aria-pressed={inCompare} disabled={compareFull} title={compareFull ? `En fazla ${maxCompare} ürün karşılaştırılabilir` : undefined} aria-label={inCompare ? `${product.name} ürününü karşılaştırmadan çıkar` : compareFull ? `Karşılaştırma dolu (en fazla ${maxCompare} ürün)` : `${product.name} ürününü karşılaştırmaya ekle`} onClick={() => toggleCompare(product.id)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16M16 4v16M4 8h8M12 16h8" /></svg>{inCompare ? 'Karşılaştırmada' : 'Karşılaştır'}</button>
        </div>
        {(favoriteError || favorites.error) && <p className={styles.error} role="alert">{favoriteError || favorites.error}</p>}
        {product.personalizable === true && <div className={styles.personalize}><div><p className={styles.personalizeKicker}>XINOBI U</p><p className={styles.personalizeTitle}>Kendine özel tasarla</p><p>Ürünün onaylı fotoğrafı üzerinde kendi görselini, desenini ya da sana özel AI tasarımını dene.</p><p role="status" data-preview-readiness={readiness}>{readiness==='loading'?'Ürünün kişiselleştirme yüzeyi kontrol ediliyor…':readiness==='ready'?'Ürünün kişiselleştirme önizlemesi hazır.':readiness==='error'?'Ürünün kişiselleştirme yüzeyi şu anda doğrulanamıyor.':'Bu ürünün onaylı kişiselleştirme yüzeyi henüz hazır değil.'}</p></div><Link aria-label="XINOBI U ile kişiselleştir" href={`/xinobi-u/renk?product=${encodeURIComponent(product.id)}`}>Kişiselleştir <span aria-hidden="true">→</span></Link></div>}
        <div className={styles.accordion}>{sections.map((section, i) => <div key={section.title}><h2><button type="button" id={`detail-section-${i}`} aria-expanded={openSection === i} aria-controls={`detail-panel-${i}`} onClick={() => setOpenSection(open => open === i ? -1 : i)}>{section.title}<span aria-hidden="true">{openSection === i ? '−' : '+'}</span></button></h2><div id={`detail-panel-${i}`} role="region" aria-labelledby={`detail-section-${i}`} hidden={openSection !== i}>{section.body}</div></div>)}</div>
      </section>
    </div>
    <div className={styles.below}><ProductReviews key={product.id} productId={product.id} productName={product.name} /></div>
    {error && <p role="alert">{error}</p>}
  </main><Footer /></>;
}
