"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type {DesignPlacement} from "../../../../lib/design-placement";
import PlacementStudio from "../../../xinobi-u/kendi-gorselin/placement-studio";
import SaveDesignButton from "../../../../components/save-design-button";
import LocalPatternPreview from "../../../../features/product-personalization/local-pattern-preview";
import { loadAcceptedSurface, type RenderingInputs } from "../../../../features/product-personalization/rendering/accepted-surface-api";
import styles from "./editor.module.css";
import { previewUnavailableMessage } from "../../../../features/product-personalization/variant-preview-readiness";
import type { Product, Variant } from "../../../../../../../packages/commerce/client";
import { loadCommerceState } from "../../../../lib/commerce";
import { useEmbeddedApp } from "../../../../lib/embedded-app";

function PreviewStatus({ error = false, children }: { error?: boolean; children: React.ReactNode }) {
  return <section className={styles.previewStatus} role={error ? "alert" : "status"}>
    <p className={styles.eyebrow}>Geliştirme önizlemesi</p><h1>{children}</h1>
    <p>Temsili görselleştirme; fiziksel baskı, DPI veya üretim onayı değildir.</p>
    <Link href="/urunler/cay-makinesi-101">Ürüne dön</Link>
  </section>;
}
function AcceptedSurfaceLoader({ variant, commerceProduct, patternSrc, unavailableMessage }: { variant: string; commerceProduct?: string; patternSrc?: string; unavailableMessage?: string }) {
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
  return <LocalPatternPreview inputs={state.inputs} initialPatternSrc={patternSrc ?? "/assets/personalization/sample-pattern.png"} />;
}
function AcceptedSurfaceRoute() {
  const query = useSearchParams();
  const variant = query.get("variant") ?? "blue";
  const commerceProduct = query.get("product") ?? undefined;
  // A changed reference starts a fresh load; an earlier bundle is never reused while loading.
  return <AcceptedSurfaceLoader key={commerceProduct+":"+variant} variant={variant} commerceProduct={commerceProduct} />;
}
function SelectionLink(){
  const query=useSearchParams(),product=query.get('product'),variant=query.get('variant');
  const href=product&&variant?'/xinobi-u/renk?'+new URLSearchParams({product,variant}):'/xinobi-u';
  return <Link href={href}>Ürün seçimine dön</Link>;
}
export function ProductSelectionLink(){
  return <Suspense fallback={<Link href="/xinobi-u">Ürün seçimine dön</Link>}><SelectionLink/></Suspense>;
}
function XinobiVariantPreview({ productId, sessionVariantId, patternSrc, unavailableMessage, designId }: { productId: string; sessionVariantId: string; patternSrc?: string; unavailableMessage?: string; designId?: string }) {
  // Active design colour is separate from immutable generation identity.
  // Persist only its catalog ID; restored IDs must pass accepted-surface checks.
  const [product,setProduct]=useState<Product>();
  const [prices,setPrices]=useState<Record<string,number>>({});
  const [placement,setPlacement]=useState<DesignPlacement>();
  const [previewCanvas,setPreviewCanvas]=useState<HTMLCanvasElement|null>(null);
  const [activeVariantId, setActiveVariantId] = useState(sessionVariantId);
  const activeVariantKey = `xinobi-u-active-variant:${productId}:${designId ?? sessionVariantId}`;
  const [variants, setVariants] = useState<Variant[]>([]);
  const [surfaces, setSurfaces] = useState<Record<string, RenderingInputs>>({});
  const [originalColor, setOriginalColor] = useState("");
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const router = useRouter();
  const embedded = useEmbeddedApp();
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
          setProduct(product);setPrices(catalog.prices);
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
  // The AI design's one upload control leaves for the own-image upload with the same product and the colour shown now;
  // the AI design itself stays reachable through history.
  const ownImageHref = '/xinobi-u/kendi-gorselin/?'+new URLSearchParams({product:productId,variant:activeVariantId,...(embedded?{mobile:'1'}:{})});
  if(product&&selected&&inputs)return <PlacementStudio product={product} variants={variants} surfaces={surfaces} active={selected} onActiveChange={id=>{setActiveVariantId(id);try{localStorage.setItem(activeVariantKey,id)}catch{}}} mode="pattern" cover={false} patternUrl={patternSrc??"/assets/personalization/sample-pattern.png"} source={{name:'AI tasarımı',type:'',size:0}} sourceDescription="AI ile oluşturuldu" canChange={Boolean(designId)} changeLabel="Görsel yükle" changeHref={ownImageHref} onChange={()=>router.push(ownImageHref)} price={prices[selected.id]} onDraftChange={setPlacement} onRendered={setPreviewCanvas} actions={designId?<SaveDesignButton stacked previewCanvas={previewCanvas} placement={placement?.surfaceVersion===inputs.surfaceVersion?placement:undefined} source={{sessionId:designId,productId,variantId:activeVariantId}}/>:null}/>;
  return error ? <PreviewStatus error>Önizleme yüklenemedi. <button type="button" onClick={()=>setRetry(value=>value+1)}>Tekrar dene</button></PreviewStatus>
    : originalColor ? <PreviewStatus>{unavailableMessage ?? previewUnavailableMessage}</PreviewStatus>
    : <PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>;
}
export default function AcceptedSurfaceEditor({ commerceProduct, commerceVariant, patternSrc, unavailableMessage, xinobiPreview = false, designId }: { commerceProduct?: string; commerceVariant?: string; patternSrc?: string; unavailableMessage?: string; xinobiPreview?: boolean; designId?: string } = {}) {
  if (xinobiPreview && commerceProduct && commerceVariant) return <XinobiVariantPreview key={commerceProduct+':'+commerceVariant+':'+(designId ?? '')} designId={designId} productId={commerceProduct} sessionVariantId={commerceVariant} patternSrc={patternSrc} unavailableMessage={unavailableMessage}/>;
  return <Suspense fallback={<PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>}>{commerceProduct && commerceVariant ? <AcceptedSurfaceLoader key={commerceProduct+":"+commerceVariant} commerceProduct={commerceProduct} variant={commerceVariant} patternSrc={patternSrc} unavailableMessage={unavailableMessage} /> : <AcceptedSurfaceRoute />}</Suspense>;
}
