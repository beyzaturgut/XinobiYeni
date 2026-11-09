'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '../../lib/favorites';
import { useCommerce } from '../../lib/commerce';
import CatalogProductCard, { type CatalogProductCardData } from '../../components/catalog-product-card';
import catalogStyles from '../urunler/catalog.module.css';
import styles from './studio.module.css';
import {useProductSurface} from '../../features/product-personalization/single-source';
import type { Product } from '../../../../../packages/commerce/client';

type PersonalizableCard = CatalogProductCardData & { href: string };

function isPersonalizable(product: Product) {
  // Only products the admin marked "XINOBI U ile kişiselleştirilebilir"; no category fallback.
  return product.active && product.personalizable === true;
}

function toCard(product: Product,image: string): PersonalizableCard {
  return {
    id: product.id,
    name: product.name,
    family: product.category,
    color: '',
    hideColors:true,
    swatch: '',
    image,

    href: `/xinobi-u/renk?product=${encodeURIComponent(product.id)}`,
  };
}

function PersonalizableItem({product,favorite,onToggleFavorite}:{product:Product;favorite:boolean;onToggleFavorite:()=>void}){
 const [retry,setRetry]=useState(0),surface=useProductSurface(product.id,retry);
 const card=toCard(product,surface.inputs?.source.url||'');
 return <CatalogProductCard product={card} cardHref={card.href} actionHref={card.href} favorite={favorite} onToggleFavorite={onToggleFavorite}
  action={<>XINOBI U ile kişiselleştir <b aria-hidden="true">→</b></>}
  footerExtra={surface.status!=='ready'?<div role={surface.status==='error'?'alert':'status'}><p>{surface.status==='loading'?'Ürün yüzeyi kontrol ediliyor…':surface.status==='error'?'Ürün yüzeyi yüklenemedi.':'Onaylı kişiselleştirme yüzeyi henüz hazır değil.'}</p>{surface.status==='error'&&<button type="button" onClick={()=>setRetry(value=>value+1)}>Tekrar dene</button>}</div>:undefined}/>;
}
export default function PersonalizableProducts() {
  const { state, error } = useCommerce();
  const router = useRouter();
  const [favoriteError, setFavoriteError] = useState<string>();
  const products = useMemo(() => (state?.products.filter(isPersonalizable) || []), [state]);
  const productIds = useMemo(() => products.map(product => product.id), [products]);
  const favorites = useFavorites(productIds);

  async function toggleFavorite(id: string) {
    setFavoriteError(undefined);
    try { await favorites.toggle(id); }
    catch (cause) {
      if (!favorites.signedIn) { router.push('/hesap'); return; }
      setFavoriteError(cause instanceof Error ? cause.message : 'Favori işlemi tamamlanamadı.');
    }
  }

  return <main className={styles.main}>
    <section className={styles.intro}>
      <p className={styles.kicker}>XINOBI U · Sana özel</p>
      <h1>Bir ürün.<br />Binlerce olasılık.</h1>
      <p>Önce ürününü seç. Sonra tasarım yöntemini seç; yerleşimini önizleme üzerinde ayarla.</p>
      <div className={styles.steps}><span>01 · Ürününü seç</span><span>02 · Yöntemini seç</span><span>03 · Yükle</span><span>04 · Önizle ve yerleştir</span></div>
    </section>
    {(error || favorites.error || favoriteError) && <p className={styles.error} role="alert">{error || favorites.error || favoriteError}</p>}
    {!state ? <p role="status">Ürünler hazırlanıyor…</p> : products.length === 0 ? <p>Şu anda kişiselleştirmeye açık bir ürün bulunmuyor.</p> : <section className={catalogStyles.grid} aria-label="Kişiselleştirilebilir ürünler">
      {products.map(product=><PersonalizableItem key={product.id} product={product} favorite={favorites.ids.includes(product.id)} onToggleFavorite={()=>void toggleFavorite(product.id)}/>)}
    </section>}
  </main>;
}
