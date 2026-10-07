'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCommerce, commerceApi, mediaUrl } from '../../lib/commerce';
import styles from './studio.module.css';
export default function PersonalizableProducts() {
  const { state, error } = useCommerce();
  const products = state?.products.filter(product => product.active && (product.personalizable ?? (product.category.includes('Çay') || product.category.includes('Kahve')))) || [];
  return <main className={styles.main}><section className={styles.intro}><p className={styles.kicker}>XINOBI U · Sana özgü</p><h1>Bir ürün.<br />Binlerce olasılık.</h1><p>Ürününü seç. Beş kısa soruyla sana ait tasarımın izini bulalım.</p><div className={styles.steps}><span>01 · Ürününü seç</span><span>02 · Tarzını keşfet</span><span>03 · Ürününde dene</span></div></section>
  {error && <p className={styles.error} role="alert">{error}</p>}
  {!state ? <p role="status">Ürünler hazırlanıyor…</p> : products.length === 0 ? <p>Şu anda kişiselleştirmeye açık bir ürün bulunmuyor.</p> : <section className={styles.grid} aria-label="Kişiselleştirilebilir ürünler">{products.map(product => {
    const variant = product.variants.find(variant => variant.image);
    if (!variant) return null;
    return <Link className={styles.product} key={product.id} href={`/xinobi-u/renk?product=${encodeURIComponent(product.id)}`} aria-label={`${product.name} için tasarım oluştur`}><div className={styles.productImage}><Image src={mediaUrl(product.originalImage || variant.image, commerceApi)} alt={product.name} width={600} height={600} /></div><p>{product.category}</p><h2>{product.name}</h2><div className={styles.productBottom}><strong>Tasarımını keşfet ↗</strong></div></Link>
  })}</section>}</main>;
}
