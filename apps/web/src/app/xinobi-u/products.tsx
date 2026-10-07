'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCommerce, commerceApi, mediaUrl } from '../../lib/commerce';
import { sessionKey } from '../../lib/design-studio';
import styles from './studio.module.css';
import VariantPreviewReadiness from '../../features/product-personalization/variant-preview-readiness';
export default function PersonalizableProducts() {
  const { state, error } = useCommerce();
  const products = state?.products.filter(product => product.active && (product.personalizable ?? (product.category.includes('Çay') || product.category.includes('Kahve')))) || [];
  return <main className={styles.main}><section className={styles.intro}><p className={styles.kicker}>XINOBI U · Sana özgü</p><h1>Bir ürün.<br />Binlerce olasılık.</h1><p>Ürününü seç. Tarzını Keşfet sorularıyla tasarımını bul veya kendi hazır görselini kullan.</p><div className={styles.steps}><span>01 · Ürününü seç</span><span>02 · Tarzını keşfet</span><span>03 · Ürününde dene</span></div></section>
  {error && <p className={styles.error} role="alert">{error}</p>}
  {!state ? <p role="status">Ürünler hazırlanıyor…</p> : products.length === 0 ? <p>Şu anda kişiselleştirmeye açık bir ürün bulunmuyor.</p> : <section className={styles.grid} aria-label="Kişiselleştirilebilir ürünler">{products.map(product => {
    const variant = product.variants.find(variant => variant.image);
    if (!variant) return null;
    return <article className={styles.product} key={product.id}><Link onClick={() => sessionStorage.removeItem(sessionKey(product.id, variant.id))} href={`/xinobi-u/sorular?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(variant.id)}`} aria-label={`${product.name} için tasarım oluştur`}><div className={styles.productImage}><Image src={mediaUrl(product.originalImage || variant.image, commerceApi)} alt={product.name} width={600} height={600} /></div><p>{product.category}</p><h2>{product.name}</h2></Link><VariantPreviewReadiness product={product.id} variant={variant.id} color={variant.color} /><div className={styles.entryActions}><Link href={`/xinobi-u/sorular?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(variant.id)}`} onClick={() => sessionStorage.removeItem(sessionKey(product.id, variant.id))}>Tarzını Keşfet ↗</Link><Link href={`/xinobi-u/kendi-gorselin?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(variant.id)}`}>Kendi görselini kullan →</Link></div><p>İstediğiniz görseli ekleyebilirsiniz. Görsel ekleme adımı henüz hazır değil.</p></article>
  })}</section>}</main>;
}
