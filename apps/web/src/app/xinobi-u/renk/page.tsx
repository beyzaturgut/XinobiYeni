'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import type { MouseEvent } from 'react';
import { useCommerce } from '../../../lib/commerce';
import { useProductSurface } from '../../../features/product-personalization/single-source';
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

// Keep the historical /renk URL as a method-selection entry; it no longer selects a colour.
function MethodSelection() {
  const params=useSearchParams();
  return <MethodForProduct key={params.get('product')||''} id={params.get('product')||''}/>;
}
function MethodForProduct({id}:{id:string}) {
  const { state, error, retry: reloadCatalog } = useCommerce();
  const [method, setMethod] = useState<Method>('image');
  const [retry, setRetry] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const product = state?.products.find(item => item.id === id && isPersonalizable(item));
  const accepted = useProductSurface(product?.id||'', retry);

  if (error || !state) return <main className={studioStyles.main}>{error?<div role="alert"><p>{error}</p><button type="button" onClick={reloadCatalog}>Ürünü yeniden yükle</button></div>:<p role="status">Ürün yükleniyor…</p>}</main>;
  if (!product) return <main className={studioStyles.main}><p>Bu ürün kişiselleştirmeye açık değil.</p><Link href="/xinobi-u">Ürünleri keşfet</Link></main>;

  const image=accepted.inputs?.source.url;
  const readiness=accepted.status;
  const chosen = methods.find(item => item.id === method)!;
  const productHref = `/urunler/detay?id=${encodeURIComponent(product.id)}`;
  const identity = `product=${encodeURIComponent(product.id)}`;
  const continueHref = method === 'ask' ? `/xinobi-u/sorular?${identity}` : `/xinobi-u/kendi-gorselin?${identity}${method === 'pattern' ? '&mode=pattern' : ''}`;
  return <main className={styles.page}>
    <FlowSteps current={1} backHref={productHref} backLabel="Ürüne dön" />
    <div className={styles.layout}>
      <section className={styles.preview} aria-label="Önizleme">
        <div className={styles.stage}>{image && <Image src={image} alt={`${product.name} önizlemesi`} width={600} height={600} />}</div>
        <div className={styles.productCard}>
          <div><p>Seçtiğin ürün</p><h2>{product.name}</h2></div>
          <Link href="/xinobi-u">Başka ürün seç <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <section className={styles.choices} aria-label="Seçimler">
        <p className={styles.kicker}>XINOBI U · Adım 2 / 4</p>
        <h1 className={styles.title}>Tasarımını nasıl oluşturmak istersin?</h1>
        <p className={styles.lead}>Bir yöntem seç. Yerleşimini ürünün onaylı tek fotoğrafı üzerinde ayarlayabilirsin.</p>
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
          <p role="status" hidden={readiness === 'ready'} data-preview-readiness={readiness} data-product-reference={product.id}>
            {readiness === 'loading' ? 'Kontrol ediliyor…' : readiness === 'ready' ? null : readiness === 'error' ? 'Kişiselleştirme şu anda doğrulanamıyor. Tekrar deneyin.' : 'Bu ürünün onaylı kişiselleştirme yüzeyi henüz hazır değil.'}
          </p>

        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href={productHref}>Geri</Link>
          {readiness==='ready' ? <Link className={styles.primary} aria-disabled={navigating} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (navigating) { event.preventDefault(); return; }
            setNavigating(true);
          }} href={continueHref}>{chosen.cta} →</Link> : readiness === 'error' ? <button type="button" className={styles.primary} onClick={() => setRetry(value => value + 1)}>Tekrar dene</button> : <button type="button" className={styles.primary} disabled>{readiness === 'loading' ? 'Kontrol ediliyor…' : 'Kişiselleştirme kullanılamıyor'}</button>}
        </div>
      </section>
    </div>
  </main>;
}

export default function Page() {
  return <><StudioHeader /><Suspense fallback={<main className={studioStyles.main}><p role="status">Yöntemler hazırlanıyor…</p></main>}><MethodSelection /></Suspense></>;
}
