'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import type { MouseEvent } from 'react';
import { useCommerce, commerceApi, mediaUrl } from '../../../lib/commerce';
import { sessionKey } from '../../../lib/design-studio';
import { startingVariant, useAcceptedVariants } from '../../../features/product-personalization/accepted-variants';
import StudioHeader from '../studio-header';
import FlowSteps from '../flow-steps';
import studioStyles from '../studio.module.css';
import styles from '../flow.module.css';
import type { Product } from '../../../../../../packages/commerce/client';

function isPersonalizable(product: Product) {
  return product.active && product.personalizable === true;
}

type Method = 'ask' | 'image' | 'pattern';
const methods: { id: Method; title: string; description: string; cta: string }[] = [
  { id: 'ask', title: 'Sorularla tasarla', description: 'Birkaç soruyu yanıtla, sana özel tasarımı birlikte oluşturalım.', cta: 'Sorulara başla' },
  { id: 'image', title: 'Kendi görselini ekle', description: 'Dilediğin fotoğrafı ya da görseli yükleyerek ürününü kişiselleştir.', cta: 'Görsel yükle' },
  { id: 'pattern', title: 'Kendi desenini yükle', description: 'Desenin, ürünün onaylı kişiselleştirme alanının tamamına uygulanır.', cta: 'Desen yükle' },
];

function MethodIcon({ method }: { method: Method }) {
  if (method === 'ask') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5z" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5" /></svg>;
  if (method === 'image') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
}

// Step 2: how the design is made. The colour is chosen later, on the placement preview.
function MethodSelection() {
  const params = useSearchParams();
  const id = params.get('product') || '';
  const { state, error, retry: reloadCatalog } = useCommerce();
  // The product page hands over its selected colour; otherwise the last choice for this product is used.
  const [requested, setRequested] = useState(() => params.get('variant') || (typeof window === 'undefined' ? '' : sessionStorage.getItem(`xinobi-u-selected-variant:${id}`) || ''));
  const [method, setMethod] = useState<Method>('image');
  const [retry, setRetry] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const product = state?.products.find(item => item.id === id && isPersonalizable(item));
  const accepted = useAcceptedVariants(product, retry);

  if (error || !state) return <main className={studioStyles.main}>{error?<div role="alert"><p>{error}</p><button type="button" onClick={reloadCatalog}>Ürünü yeniden yükle</button></div>:<p role="status">Ürün yükleniyor…</p>}</main>;
  if (!product) return <main className={studioStyles.main}><p>Bu ürün kişiselleştirmeye açık değil.</p><Link href="/xinobi-u">Ürünleri keşfet</Link></main>;

  const start = accepted.status === 'ready' ? requested ? product.variants.find(variant=>variant.id===requested&&accepted.surfaces[variant.id]) : startingVariant(product, accepted.surfaces) : undefined;
  const shown = product.variants.find(variant => variant.id === requested) ?? product.variants[0];
  const image = shown?.image || product.originalImage || product.variants.find(variant => variant.image)?.image;
  const readiness = accepted.status === 'ready' ? start ? 'ready' : 'unavailable' : accepted.status;
  const chosen = methods.find(item => item.id === method)!;
  const productHref = `/urunler/detay?id=${encodeURIComponent(product.id)}`;
  const identity = start ? `product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(start.id)}` : '';
  const continueHref = method === 'ask' ? `/xinobi-u/sorular?${identity}` : `/xinobi-u/kendi-gorselin?${identity}${method === 'pattern' ? '&mode=pattern' : ''}`;
  return <main className={styles.page}>
    <FlowSteps current={1} backHref={productHref} backLabel="Ürüne dön" />
    <div className={styles.layout}>
      <section className={styles.preview} aria-label="Önizleme">
        <div className={styles.stage}>{image && <Image src={mediaUrl(image, commerceApi)} alt={`${product.name} önizlemesi`} width={600} height={600} />}</div>
        <div className={styles.productCard}>
          <div><p>Seçtiğin ürün</p><h2>{product.name}</h2></div>
          <Link href="/xinobi-u">Başka ürün seç <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <section className={styles.choices} aria-label="Seçimler">
        <p className={styles.kicker}>XINOBI U · Adım 2 / 4</p>
        <h1 className={styles.title}>Tasarımını nasıl oluşturmak istersin?</h1>
        <p className={styles.lead}>Bir yöntem seç. Ürün rengini ve yerleşimi bir sonraki adımda, önizleme üzerinde ayarlayabilirsin.</p>
        <div className={styles.divider} />
        <fieldset className={styles.methods}>
          <legend>Tasarım yöntemi</legend>
          <div>{methods.map(item => <label key={item.id} className={method === item.id ? styles.methodSelected : undefined}>
            <input type="radio" name="design-method" value={item.id} checked={method === item.id} onChange={() => setMethod(item.id)} />
            <span className={styles.methodIcon} aria-hidden="true"><MethodIcon method={item.id} /></span>
            <span className={styles.methodText}><strong>{item.title}{item.id === 'ask' && <em>Önerilen</em>}</strong><span>{item.description}</span></span>
            <span className={styles.radio} aria-hidden="true" />
          </label>)}</div>
        </fieldset>
        <div className={styles.status}>
          <p role="status" hidden={readiness === 'ready'} data-preview-readiness={readiness} data-product-reference={product.id} data-variant-reference={start?.id}>
            {readiness === 'loading' ? 'Kontrol ediliyor…' : readiness === 'ready' ? null : readiness === 'error' ? 'Kişiselleştirme şu anda doğrulanamıyor. Tekrar deneyin.' : requested?'Seçtiğin renk şu anda kişiselleştirilemiyor. Devam etmek için uygun bir renk seç.':'Bu ürün için kişiselleştirme henüz kullanılamıyor.'}
          </p>
          {readiness==='unavailable' && accepted.status==='ready' && product.variants.some(variant=>accepted.surfaces[variant.id]) && <fieldset><legend>Kişiselleştirilebilen renkler</legend>{product.variants.filter(variant=>accepted.surfaces[variant.id]).map(variant=><button type="button" key={variant.id} onClick={()=>setRequested(variant.id)}>{variant.color} rengini kullan</button>)}</fieldset>}
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href={productHref}>Geri</Link>
          {start ? <Link className={styles.primary} aria-disabled={navigating} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (navigating) { event.preventDefault(); return; }
            setNavigating(true);
            sessionStorage.setItem(`xinobi-u-selected-variant:${product.id}`, start.id);
            if (method === 'ask') sessionStorage.removeItem(sessionKey(product.id, start.id));
          }} href={continueHref}>{chosen.cta} →</Link> : readiness === 'error' ? <button type="button" className={styles.primary} onClick={() => setRetry(value => value + 1)}>Tekrar dene</button> : <button type="button" className={styles.primary} disabled>{readiness === 'loading' ? 'Kontrol ediliyor…' : 'Kişiselleştirme kullanılamıyor'}</button>}
        </div>
      </section>
    </div>
  </main>;
}

export default function Page() {
  return <><StudioHeader /><Suspense fallback={<main className={studioStyles.main}><p role="status">Yöntemler hazırlanıyor…</p></main>}><MethodSelection /></Suspense></>;
}
