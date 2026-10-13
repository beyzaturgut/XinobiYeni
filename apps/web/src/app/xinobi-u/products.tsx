'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCommerce, commerceApi, mediaUrl } from '../../lib/commerce';
import CatalogProductCard, { catalogFavoriteStorageKey, type CatalogProductCardData } from '../../components/catalog-product-card';
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const products = useMemo(() => (state?.products.filter(isPersonalizable) || []).map(toCard), [state]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setFavorites(JSON.parse(localStorage.getItem(catalogFavoriteStorageKey) || '[]')); } catch { setFavorites([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleFavorite(id: string) {
    setFavorites(current => {
      const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
      localStorage.setItem(catalogFavoriteStorageKey, JSON.stringify(next));
      return next;
    });
  }

  return <main className={styles.main}>
    <section className={styles.intro}>
      <p className={styles.kicker}>XINOBI U · Sana özel</p>
      <h1>Bir ürün.<br />Binlerce olasılık.</h1>
      <p>Önce ürününü seç. Sonra rengini seçip Tarzını Keşfet sorularıyla tasarımını bul veya kendi görselini kullan.</p>
      <div className={styles.steps}><span>01 · Ürününüzü seçin</span><span>02 · Rengini seçin</span><span>03 · Tarzınızı keşfedin</span></div>
    </section>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {!state ? <p role="status">Ürünler hazırlanıyor…</p> : products.length === 0 ? <p>Şu anda kişiselleştirmeye açık bir ürün bulunmuyor.</p> : <section className={catalogStyles.grid} aria-label="Kişiselleştirilebilir ürünler">
      {products.map(product => <CatalogProductCard
        key={product.id}
        product={product}
        cardHref={product.href}
        actionHref={product.href}
        favorite={favorites.includes(product.id)}
        onToggleFavorite={() => toggleFavorite(product.id)}
        action={<>XINOBI U ile kişiselleştir <b aria-hidden="true">→</b></>}
      />)}
    </section>}
  </main>;
}
