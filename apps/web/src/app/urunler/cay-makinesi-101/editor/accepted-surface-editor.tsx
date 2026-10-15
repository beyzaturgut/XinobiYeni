"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import EditorWorkspace from "./editor-workspace";
import type {DesignPlacement} from "../../../../lib/design-placement";
import LocalPatternPreview from "../../../../features/product-personalization/local-pattern-preview";
import { loadAcceptedSurface, type RenderingInputs } from "./accepted-surface-api";
import styles from "./editor.module.css";
import { previewUnavailableMessage } from "../../../../features/product-personalization/variant-preview-readiness";
import type { Variant } from "../../../../../../../packages/commerce/client";
import { loadCommerceState } from "../../../../lib/commerce";
import detailStyles from "../product.module.css";
import type { PlacementTransferHandle } from "../../../../features/product-personalization/preview-placement-transfer";

function PreviewStatus({ error = false, children }: { error?: boolean; children: React.ReactNode }) {
  return <section className={styles.previewStatus} role={error ? "alert" : "status"}>
    <p className={styles.eyebrow}>Geliştirme önizlemesi</p><h1>{children}</h1>
    <p>Temsili görselleştirme; fiziksel baskı, DPI veya üretim onayı değildir.</p>
    <Link href="/urunler/cay-makinesi-101">Ürüne dön</Link>
  </section>;
}
type SavedPlacementProps={placementMode?:"pattern"|"artwork";initialPlacement?:DesignPlacement;onPlacementChange?:(value:DesignPlacement)=>void};
function AcceptedSurfaceLoader({ variant, commerceProduct, patternSrc, unavailableMessage, xinobiPreview = false, ...saved }: { variant: string; commerceProduct?: string; patternSrc?: string; unavailableMessage?: string; xinobiPreview?: boolean } & SavedPlacementProps) {
  const [state, setState] = useState<{ variant: string; inputs?: RenderingInputs | null; error?: boolean }>({ variant });
  useEffect(() => {
    const controller = new AbortController();
    loadAcceptedSurface(variant, controller.signal, commerceProduct).then(inputs => {
      if (!controller.signal.aborted) setState({ variant, inputs });
    }).catch(() => { if (!controller.signal.aborted) setState({ variant, error: true }); });
    return () => controller.abort();
  }, [variant, commerceProduct]);
  if (state.variant !== variant || (state.inputs === undefined && !state.error))
    return <PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>;
  if (state.error) return <PreviewStatus error>Önizleme yüklenemedi. Ürün görselleri doğrulanamadı veya tarayıcıda işlenemedi. Sayfayı yenileyip yeniden deneyin.</PreviewStatus>;
  if (!state.inputs) return <PreviewStatus>{unavailableMessage ?? previewUnavailableMessage}</PreviewStatus>;
  if(saved.onPlacementChange)return <EditorWorkspace renderingInputs={state.inputs} patternSrc={patternSrc} {...saved}/>;
  return <LocalPatternPreview inputs={state.inputs} initialPatternSrc={patternSrc ?? "/assets/personalization/sample-pattern.png"} xinobiPreview={xinobiPreview} />;
}
function AcceptedSurfaceRoute() {
  const query = useSearchParams();
  const variant = query.get("variant") ?? "blue";
  const commerceProduct = query.get("product") ?? undefined;
  // A changed reference starts a fresh load; an earlier bundle is never reused while loading.
  return <AcceptedSurfaceLoader key={commerceProduct+":"+variant} variant={variant} commerceProduct={commerceProduct} />;
}
function ReferenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  const query = useSearchParams();
  const variant = query.get("variant") ?? "blue";
  const commerceProduct = query.get("product") ?? undefined;
  return <Link href={href+"?variant="+encodeURIComponent(variant)+(commerceProduct ? "&product="+encodeURIComponent(commerceProduct) : "")}>{children}</Link>;
}
export function DevelopmentReferenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Suspense fallback={<Link href="/urunler/cay-makinesi-101">{children}</Link>}><ReferenceLink href={href}>{children}</ReferenceLink></Suspense>;
}
function XinobiVariantPreview({ productId, sessionVariantId, patternSrc, unavailableMessage, designId }: { productId: string; sessionVariantId: string; patternSrc?: string; unavailableMessage?: string; designId?: string }) {
  // Active design colour is separate from immutable generation identity.
  // Persist only its catalog ID; restored IDs must pass accepted-surface checks.
  const [activeVariantId, setActiveVariantId] = useState(sessionVariantId);
  const activeVariantKey = `xinobi-u-active-variant:${productId}:${designId ?? sessionVariantId}`;
  const [variants, setVariants] = useState<Variant[]>([]);
  const [surfaces, setSurfaces] = useState<Record<string, RenderingInputs>>({});
  const [placementWarning, setPlacementWarning] = useState("");
  const [originalColor, setOriginalColor] = useState("");
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [switching, setSwitching] = useState(false);
  const placementRef = useRef<PlacementTransferHandle>(null);
  const transferGeneration = useRef(0);
  useEffect(() => () => { transferGeneration.current++; }, []);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      try {
        const catalog = await loadCommerceState();
        const product = catalog.products.find(item => item.id === productId);
        if (!product || !product.variants.some(item => item.id === sessionVariantId)) throw new Error('Invalid session catalog identity');
        const supported = await Promise.all(product.variants.map(async variant => {
          const inputs = await loadAcceptedSurface(variant.id, controller.signal, productId);
          return inputs ? { variant, inputs } : null;
        }));
        if (active) {
          const accepted = supported.filter((value): value is {variant: Variant; inputs: RenderingInputs} => value !== null);
          let saved: string | null = null;
          try { saved = localStorage.getItem(activeVariantKey); } catch { /* Storage can be unavailable. */ }
          setActiveVariantId(accepted.some(value => value.variant.id === saved) ? saved! : sessionVariantId);
          setVariants(accepted.map(value => value.variant));
          setSurfaces(Object.fromEntries(accepted.map(value => [value.variant.id, value.inputs])));
          setOriginalColor(product.variants.find(item=>item.id===sessionVariantId)!.color);
          setError(false);
        }
      } catch { if (active) setError(true); }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [productId, sessionVariantId, retry, activeVariantKey]);
  const selected = variants.find(variant => variant.id === activeVariantId);
  const inputs = surfaces[activeVariantId];
  async function selectPreviewVariant(variantId: string) {
    const next = surfaces[variantId];
    if (!next || !inputs || switching || variantId === activeVariantId) return;
    const ticket = ++transferGeneration.current;
    setSwitching(true);
    setPlacementWarning("");
    const commit = await placementRef.current?.prepare(next);
    if (ticket !== transferGeneration.current) return;
    if (commit && commit()) {
      setActiveVariantId(variantId);
      try { localStorage.setItem(activeVariantKey, variantId); } catch { /* Keep the in-memory selection. */ }
      setPlacementWarning("Yerleşim bu renge uyarlandı; görselin konumu biraz değişebilir.");
    } else {
      setPlacementWarning("Güvenli yerleşim aktarımı yapılamadı. Görseli tek bir gövdenin içine taşıyıp yeniden deneyin; mevcut önizleme korundu.");
    }
    setSwitching(false);
  }
  return <>
    <section className={styles.previewVariants} aria-label="Önizleme rengi" data-session-variant={sessionVariantId} data-preview-variant={activeVariantId} data-active-variant={activeVariantId}>
      <fieldset className={detailStyles.variants}>
        <legend>Önizleme rengi: <strong>{selected?.color || originalColor}</strong></legend>
        <div>{variants.map(variant=><button type="button" key={variant.id} disabled={switching} className={activeVariantId===variant.id?detailStyles.selectedVariant:''} aria-label={`${variant.color} önizle`} aria-pressed={activeVariantId===variant.id} onClick={()=>void selectPreviewVariant(variant.id)}>
          <span style={{background:variant.hex&&/^#[a-fA-F0-9]{6}$/.test(variant.hex)?variant.hex:undefined}} aria-hidden="true"/><small>{variant.color}</small>
        </button>)}</div>
      </fieldset>
      {error && <p role="alert">Diğer renkler yüklenemedi. <button type="button" onClick={()=>setRetry(value=>value+1)}>Tekrar dene</button></p>}
      {placementWarning && <p role="status">{placementWarning}</p>}
      {switching && <p role="status">Renk hazırlanıyor…</p>}
    </section>
    {/* Keep this subtree mounted: its object URL and both placement states belong
        to the design, while only the validated surface bundle changes. */}
    {inputs ? <LocalPatternPreview inputs={inputs} initialPatternSrc={patternSrc ?? "/assets/personalization/sample-pattern.png"} xinobiPreview placementRef={placementRef} />
      : error ? <PreviewStatus error>Önizleme yüklenemedi. Yeniden deneyin.</PreviewStatus>
      : variants.length ? <PreviewStatus>{unavailableMessage ?? previewUnavailableMessage}</PreviewStatus>
      : originalColor ? <PreviewStatus>{unavailableMessage ?? previewUnavailableMessage}</PreviewStatus>
      : <PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>}
  </>;
}
export default function AcceptedSurfaceEditor({ commerceProduct, commerceVariant, patternSrc, unavailableMessage, xinobiPreview = false, designId, ...saved }: { commerceProduct?: string; commerceVariant?: string; patternSrc?: string; unavailableMessage?: string; xinobiPreview?: boolean; designId?: string } & SavedPlacementProps = {}) {
  if (xinobiPreview && commerceProduct && commerceVariant) return <XinobiVariantPreview key={commerceProduct+':'+commerceVariant+':'+(designId ?? '')} designId={designId} productId={commerceProduct} sessionVariantId={commerceVariant} patternSrc={patternSrc} unavailableMessage={unavailableMessage}/>;
  return <Suspense fallback={<PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>}>{commerceProduct && commerceVariant ? <AcceptedSurfaceLoader key={commerceProduct+":"+commerceVariant} commerceProduct={commerceProduct} variant={commerceVariant} patternSrc={patternSrc} unavailableMessage={unavailableMessage} xinobiPreview={xinobiPreview} {...saved} /> : <AcceptedSurfaceRoute />}</Suspense>;
}
