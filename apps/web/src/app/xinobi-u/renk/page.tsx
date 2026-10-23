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
import styles from './color.module.css';
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

const steps = ['Ürün', 'Renk ve yöntem', 'Tasarım', 'Onay'];

function ColorSelection() {
  const params = useSearchParams();
  const id = params.get('product') || '';
  const requestedVariant = params.get('variant') || '';
  const { state, error } = useCommerce();
  // The product page hands over its selected colour; otherwise the last choice for this product is restored.
  const [selectedId, setSelectedId] = useState(() => requestedVariant || (typeof window === 'undefined' ? '' : sessionStorage.getItem(`xinobi-u-selected-variant:${id}`) || ''));
  const [method, setMethod] = useState<Method>('ask');
  const [readinessRetry, setReadinessRetry] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const product = state?.products.find(item => item.id === id && isPersonalizable(item));
  const selected = product?.variants.find(variant => variant.id === selectedId);
  const readiness = usePreviewReadiness(product?.id || '', selected?.id || '', readinessRetry);

  if (!state) return <main className={studioStyles.main}><p role="status">{error || 'Ürün yükleniyor…'}</p></main>;
  if (!product) return <main className={studioStyles.main}><p>Bu ürün kişiselleştirmeye açık değil.</p><Link href="/xinobi-u">Ürünleri keşfet</Link></main>;

  const image = selected?.image || product.originalImage || product.variants.find(variant => variant.image)?.image;
  const canContinue = Boolean(selected && readiness === 'ready');
  const chosen = methods.find(item => item.id === method)!;
  const productHref = `/urunler/detay?id=${encodeURIComponent(product.id)}`;
  const identity = selected ? `product=${encodeURIComponent(product.id)}&variant=${encodeURIComponent(selected.id)}` : '';
  const continueHref = method === 'ask' ? `/xinobi-u/sorular?${identity}` : `/xinobi-u/kendi-gorselin?${identity}${method === 'pattern' ? '&mode=pattern' : ''}`;
  return <main className={styles.page}>
    <div className={styles.top}>
      <Link className={styles.back} href={productHref}><span aria-hidden="true">←</span> Ürüne dön</Link>
      <ol className={styles.steps} aria-label="Kişiselleştirme adımları">{steps.map((label, index) => <li key={label} aria-current={index === 1 ? 'step' : undefined} className={index === 0 ? styles.stepDone : index === 1 ? styles.stepCurrent : undefined}><span aria-hidden="true">{index === 0 ? <svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" /></svg> : index + 1}</span>{label}{index === 0 && <span className={styles.srOnly}> (tamamlandı)</span>}</li>)}</ol>
    </div>
    <div className={styles.layout}>
      <section className={styles.preview} aria-label="Önizleme">
        <div className={styles.stage}>
          {image && <Image src={mediaUrl(image, commerceApi)} alt={`${product.name}${selected ? ` · ${selected.color}` : ''} önizlemesi`} width={600} height={600} />}
          {selected && <span className={styles.badge}><i aria-hidden="true" style={{ background: selected.hex && /^#[a-fA-F0-9]{6}$/.test(selected.hex) ? selected.hex : undefined }} />{selected.color}</span>}
        </div>
        <div className={styles.productCard}>
          <div><p>Seçtiğin ürün</p><h2>{product.name}</h2></div>
          <Link href="/xinobi-u">Başka ürün seç <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <section className={styles.choices} aria-label="Seçimler">
        <p className={styles.kicker}>XINOBI U · Adım 2 / 4</p>
        <h1 className={styles.title}>Rengini ve tasarım yöntemini seç</h1>
        <p className={styles.lead}>Deseninin uygulanacağı ürün rengini seç, ardından tasarımını nasıl oluşturmak istediğini belirle.</p>
        <div className={styles.divider} />
        <fieldset className={styles.colors}>
          <legend>Renk: <strong>{selected?.color || 'seçin'}</strong></legend>
          <div>{product.variants.map(variant => <button type="button" key={variant.id} aria-label={`${variant.color} rengini seç`} aria-pressed={selected?.id === variant.id} onClick={() => { setSelectedId(variant.id); setReadinessRetry(0); sessionStorage.setItem(`xinobi-u-selected-variant:${product.id}`, variant.id); }}>
            <span className={variant.hex && /^#[a-fA-F0-9]{6}$/.test(variant.hex) ? undefined : styles.noHex} style={{ background: variant.hex && /^#[a-fA-F0-9]{6}$/.test(variant.hex) ? variant.hex : undefined }} aria-hidden="true" />
            <small>{variant.color}</small>
          </button>)}</div>
        </fieldset>
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
          {selected ? <p role="status" hidden={readiness === 'ready'} data-preview-readiness={readiness} data-product-reference={product.id} data-variant-reference={selected.id}>
            {readiness === 'loading' ? 'Kontrol ediliyor…' : readiness === 'ready' ? null : readiness === 'error' ? 'Bu renk şu anda kullanılamıyor. Tekrar deneyin.' : 'Bu renk için kişiselleştirme henüz kullanılamıyor.'}
          </p> : <p role="status">Devam etmek için önce ürün rengini seçin.</p>}
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondary} href={productHref}>Geri</Link>
          {canContinue ? <Link className={styles.primary} aria-disabled={navigating} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (navigating) { event.preventDefault(); return; }
            setNavigating(true);
            if (method === 'ask') sessionStorage.removeItem(sessionKey(product.id, selected!.id));
          }} href={continueHref}>{chosen.cta} →</Link> : readiness === 'error' && selected ? <button type="button" className={styles.primary} onClick={() => setReadinessRetry(value => value + 1)}>Tekrar dene</button> : <button type="button" className={styles.primary} disabled>{selected ? readiness === 'loading' ? 'Kontrol ediliyor…' : 'Bu renk için kişiselleştirme kullanılamıyor' : 'Önce rengini seç'}</button>}
        </div>
      </section>
    </div>
  </main>;
}

export default function Page() {
  return <><StudioHeader /><Suspense fallback={<main className={studioStyles.main}><p role="status">Renkler hazırlanıyor…</p></main>}><ColorSelection /></Suspense></>;
}
