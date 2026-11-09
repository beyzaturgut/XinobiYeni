"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {useProductSurface,surfaceSavePending} from "../../../../features/product-personalization/single-source";
import PlacementStudio from "../../../xinobi-u/kendi-gorselin/placement-studio";
import LocalPatternPreview from "../../../../features/product-personalization/local-pattern-preview";
import { loadAcceptedSurface, type RenderingInputs } from "../../../../features/product-personalization/rendering/accepted-surface-api";
import styles from "./editor.module.css";
import { previewUnavailableMessage } from "../../../../features/product-personalization/variant-preview-readiness";
import type { Product } from "../../../../../../../packages/commerce/client";
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
function XinobiVariantPreview({productId,patternSrc,designId}:{productId:string;sessionVariantId:string;patternSrc?:string;unavailableMessage?:string;designId?:string}){
 const [product,setProduct]=useState<Product>();
 const [catalogError,setCatalogError]=useState(false);
 const [retry,setRetry]=useState(0);
 const surface=useProductSurface(productId,retry);
 const router=useRouter(); const embedded=useEmbeddedApp();
 useEffect(()=>{let active=true;loadCommerceState().then(catalog=>{
  const value=catalog.products.find(item=>item.id===productId&&item.active&&item.personalizable===true);
  if(!value)throw Error('Product unavailable');if(active){setProduct(value);setCatalogError(false)}
 }).catch(()=>{if(active)setCatalogError(true)});return()=>{active=false}},[productId,retry]);
 const href='/xinobi-u/kendi-gorselin/?'+new URLSearchParams({product:productId,...(embedded?{mobile:'1'}:{})});
 if(surface.status==='error'||catalogError)return <PreviewStatus error>Önizleme yüklenemedi. <button type="button" onClick={()=>setRetry(value=>value+1)}>Tekrar dene</button></PreviewStatus>;
 if(surface.status==='unavailable')return <PreviewStatus>{previewUnavailableMessage}</PreviewStatus>;
 if(!product||!surface.inputs)return <PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>;
 const inputs=surface.inputs,selected={id:inputs.surfaceId,color:''};
 return <PlacementStudio key={inputs.surfaceId} singleSource product={product} variants={[]} surfaces={{[selected.id]:inputs}} active={selected} onActiveChange={()=>{}}
  mode="pattern" cover={false} patternUrl={patternSrc??"/assets/personalization/sample-pattern.png"} source={{name:'AI tasarımı',type:'',size:0}}
  sourceDescription="AI ile oluşturuldu" canChange={Boolean(designId)} changeLabel="Görsel yükle" changeHref={href} onChange={()=>router.push(href)}
  actions={<p role="status">{surfaceSavePending}</p>}/>;
}
export default function AcceptedSurfaceEditor({ commerceProduct, commerceVariant, patternSrc, unavailableMessage, xinobiPreview = false, designId }: { commerceProduct?: string; commerceVariant?: string; patternSrc?: string; unavailableMessage?: string; xinobiPreview?: boolean; designId?: string } = {}) {
  if (xinobiPreview && commerceProduct && commerceVariant) return <XinobiVariantPreview key={commerceProduct+':'+commerceVariant+':'+(designId ?? '')} designId={designId} productId={commerceProduct} sessionVariantId={commerceVariant} patternSrc={patternSrc} unavailableMessage={unavailableMessage}/>;
  return <Suspense fallback={<PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>}>{commerceProduct && commerceVariant ? <AcceptedSurfaceLoader key={commerceProduct+":"+commerceVariant} commerceProduct={commerceProduct} variant={commerceVariant} patternSrc={patternSrc} unavailableMessage={unavailableMessage} /> : <AcceptedSurfaceRoute />}</Suspense>;
}
