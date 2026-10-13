"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LocalPatternPreview from "../../../../features/product-personalization/local-pattern-preview";
import { loadAcceptedSurface, type RenderingInputs } from "./accepted-surface-api";
import styles from "./editor.module.css";
import { previewUnavailableMessage } from "../../../../features/product-personalization/variant-preview-readiness";

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
function ReferenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  const query = useSearchParams();
  const variant = query.get("variant") ?? "blue";
  const commerceProduct = query.get("product") ?? undefined;
  return <Link href={href+"?variant="+encodeURIComponent(variant)+(commerceProduct ? "&product="+encodeURIComponent(commerceProduct) : "")}>{children}</Link>;
}
export function DevelopmentReferenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Suspense fallback={<Link href="/urunler/cay-makinesi-101">{children}</Link>}><ReferenceLink href={href}>{children}</ReferenceLink></Suspense>;
}
export default function AcceptedSurfaceEditor({ commerceProduct, commerceVariant, patternSrc, unavailableMessage }: { commerceProduct?: string; commerceVariant?: string; patternSrc?: string; unavailableMessage?: string } = {}) {
  return <Suspense fallback={<PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>}>{commerceProduct && commerceVariant ? <AcceptedSurfaceLoader key={commerceProduct+":"+commerceVariant} commerceProduct={commerceProduct} variant={commerceVariant} patternSrc={patternSrc} unavailableMessage={unavailableMessage} /> : <AcceptedSurfaceRoute />}</Suspense>;
}
