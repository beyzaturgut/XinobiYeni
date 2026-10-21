'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import type { MouseEvent } from 'react';
import { useCommerce, commerceApi, mediaUrl } from '../../../lib/commerce';
import { sessionKey } from '../../../lib/design-studio';
import { usePreviewReadiness } from '../../../features/product-personalization/variant-preview-readiness';
import StudioHeader from '../studio-header';
import studioStyles from '../studio.module.css';
import detailStyles from '../../urunler/cay-makinesi-101/product.module.css';
import type { Product } from '../../../../../../packages/commerce/client';

function isPersonalizable(product: Product) {
  return product.active && product.personalizable === true;
}

function ColorSelection() {
  const id = useSearchParams().get('product') || '';
  const { state, error } = useCommerce();
  const [selectedId, setSelectedId] = useState(() => typeof window === 'undefined' ? '' : sessionStorage.getItem(`xinobi-u-selected-variant:${id}`) || '');
  const [readinessRetry, setReadinessRetry] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const product = state?.products.find(item => item.id === id && isPersonalizable(item));
  const selected = product?.variants.find(variant => variant.id === selectedId);
  const readiness = usePreviewReadiness(product?.id || '', selected?.id || '', readinessRetry);

  if (!state) return <main className={studioStyles.main}><p role="status">{error || 'Ürün yükleniyor…'}</p></main>;
  if (!product) return <main className={studioStyles.main}><p>Bu ürün kişiselleştirmeye açık değil.</p><Link href="/xinobi-u">Ürünleri keşfet</Link></main>;

  const image = selected?.image || product.originalImage || product.variants.find(variant => variant.image)?.image;
  const canContinue = Boolean(selected && readiness === 'ready');
  return <main className={studioStyles.main}>
    <div className={studioStyles.questionLayout}>
      <aside className={studioStyles.selection}>
        <div className={studioStyles.selectionImage}>{image && <Image src={mediaUrl(image, commerceApi)} alt={`${product.name}${selected ? ` · ${selected.color}` : ''}`} width={600} height={600} />}</div>
        <p className={studioStyles.kicker}>Seçtiğin ürün</p>
        <h2>{product.name}</h2>
        <Link href="/xinobi-u">Başka ürün seç →</Link>
      </aside>
      <section className={studioStyles.questionPanel}>
        <Link href="/xinobi-u">← Ürünler</Link>
        <p className={studioStyles.kicker}>02 · Rengini seç</p>
        <h1>{product.name}</h1>
        <p>Deseninin uygulanacağı ürün rengini seç.</p>
        <fieldset className={detailStyles.variants}>
          <legend>Renk: <strong>{selected?.color || 'seçin'}</strong></legend>
          <div>{product.variants.map(variant => <button type="button" key={variant.id} aria-label={`${variant.color} rengini seç`} className={selected?.id === variant.id ? detailStyles.selectedVariant : ''} onClick={() => { setSelectedId(variant.id); setReadinessRetry(0); sessionStorage.setItem(`xinobi-u-selected-variant:${product.id}`, variant.id); }} aria-pressed={selected?.id === variant.id}>
            <span style={{ background: variant.hex && /^#[a-fA-F0-9]{6}$/.test(variant.hex) ? variant.hex : undefined }} aria-hidden="true" />
            <small>{variant.color}</small>
          </button>)}</div>
        </fieldset>
        <div className={studioStyles.colorSelectionActions}>
        {selected ? <p role="status" hidden={readiness === 'ready'} data-preview-readiness={readiness} data-product-reference={product.id} data-variant-reference={selected.id}>
          {readiness === 'loading' ? 'Kontrol ediliyor…' : readiness === 'ready' ? null : readiness === 'error' ? 'Bu renk şu anda kullanılamıyor. Tekrar deneyin.' : 'Bu renk için kişiselleştirme henüz kullanılamıyor.'}
        </p> : <p role="status">Ankete geçmek için önce ürün rengini seçin.</p>}
        {canContinue ? <Link className={studioStyles.primary} aria-disabled={navigating} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (navigating) { event.preventDefault(); return; }
          setNavigating(true);
          sessionStorage.removeItem(sessionKey(product.id, selected!.id));
        }} href={`/xinobi-u/sorular?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(selected!.id)}`}>Sorulara başla →</Link> : readiness === 'error' && selected ? <button className={studioStyles.secondary} onClick={() => setReadinessRetry(value => value + 1)}>Tekrar dene</button> : <button className={studioStyles.primary} disabled>{selected ? readiness === 'loading' ? 'Kontrol ediliyor…' : 'Bu renk için kişiselleştirme kullanılamıyor' : 'Önce rengini seç'}</button>}
        {canContinue && <div className={studioStyles.entryActions}><Link className={studioStyles.secondary} href={`/xinobi-u/kendi-gorselin?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(selected!.id)}`}>Kendi görselinizi ekleyin</Link><p>Dilediğiniz fotoğrafı veya görseli yükleyerek ürününüzü kişiselleştirin.</p><Link className={studioStyles.secondary} href={`/xinobi-u/kendi-gorselin?product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(selected!.id)}&mode=pattern`}>Kendi deseninizi yükleyin</Link><p>Deseninizi ürünün onaylı kişiselleştirme alanının tamamına uygulayın.</p></div>}
        </div>
      </section>
    </div>
  </main>;
}

export default function Page() {
  return <><StudioHeader /><Suspense fallback={<main className={studioStyles.main}><p role="status">Renkler hazırlanıyor…</p></main>}><ColorSelection /></Suspense></>;
}
