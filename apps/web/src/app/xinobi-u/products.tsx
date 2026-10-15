'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '../../lib/favorites';
import { useCommerce, commerceApi, mediaUrl } from '../../lib/commerce';
import CatalogProductCard, { type CatalogProductCardData } from '../../components/catalog-product-card';
import catalogStyles from '../urunler/catalog.module.css';
import styles from './studio.module.css';
import type { Product } from '../../../../../packages/commerce/client';

type PersonalizableCard = CatalogProductCardData & { href: string };

function isPersonalizable(product: Product) {
  return product.active && (product.personalizable ?? (product.category.includes('Çay') || product.category.includes('Kahve')));
}

function toCard(product: Product): PersonalizableCard {
  const firstVariant = product.variants[0];
  return {
    id: product.id,
    name: product.name,
    family: product.category,
    color: firstVariant?.color || 'Renk seçimi',
    swatch: firstVariant?.hex || '#777777',
    image: mediaUrl(product.originalImage || firstVariant?.image || '', commerceApi),
    colorCount: product.variants.length,
    href: `/xinobi-u/renk?product=${encodeURIComponent(product.id)}`,
  };
}

export default function PersonalizableProducts() {
  const { state, error } = useCommerce();
  const router = useRouter();
  const [favoriteError, setFavoriteError] = useState<string>();
  const products = useMemo(() => (state?.products.filter(isPersonalizable) || []).map(toCard), [state]);
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
      <p>Önce ürününü seç. Sonra rengini seçip Tarzını Keşfet sorularıyla tasarımını bul veya kendi görselini kullan.</p>
      <div className={styles.steps}><span>01 · Ürününüzü seçin</span><span>02 · Rengini seçin</span><span>03 · Tarzınızı keşfedin</span></div>
    </section>
    {(error || favorites.error || favoriteError) && <p className={styles.error} role="alert">{error || favorites.error || favoriteError}</p>}
    {!state ? <p role="status">Ürünler hazırlanıyor…</p> : products.length === 0 ? <p>Şu anda kişiselleştirmeye açık bir ürün bulunmuyor.</p> : <section className={catalogStyles.grid} aria-label="Kişiselleştirilebilir ürünler">
      {products.map(product => <CatalogProductCard
        key={product.id}
        product={product}
        cardHref={product.href}
        actionHref={product.href}
        favorite={favorites.ids.includes(product.id)}
        onToggleFavorite={() => void toggleFavorite(product.id)}
        action={<>XINOBI U ile kişiselleştir <b aria-hidden="true">→</b></>}
      />)}
    </section>}
  </main>;
}
