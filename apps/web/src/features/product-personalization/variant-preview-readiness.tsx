"use client";

import { useEffect, useState } from "react";
import { clearCachedAcceptedSurface, loadCachedAcceptedSurface } from "../../app/urunler/cay-makinesi-101/editor/accepted-surface-api";

export const previewUnavailableMessage = "Bu seçili ürün/varyant için geliştirme ürün önizlemesi kullanılamıyor.";
export type PreviewReadinessStatus = "loading" | "ready" | "unavailable" | "error";

// Readiness is resolved from accepted rendering inputs, not catalog eligibility.
export function usePreviewReadiness(product: string, variant: string, retryToken = 0): PreviewReadinessStatus {
  const key = `${product}:${variant}`;
  const requestKey = `${key}:${retryToken}`;
  const [state, setState] = useState<{ key: string; status: PreviewReadinessStatus }>({ key: "", status: "loading" });
  useEffect(() => {
    if (!product || !variant) {
      return;
    }
    if (retryToken > 0) clearCachedAcceptedSurface(product, variant);
    let active = true;
    loadCachedAcceptedSurface(product, variant).then(inputs => {
      if (active) setState({ key: requestKey, status: inputs ? "ready" : "unavailable" });
    }).catch(() => { if (active) setState({ key: requestKey, status: "error" }); });
    // The shared request intentionally continues after a route change; a
    // later questionnaire mount can reuse its result without a second fetch.
    return () => { active = false; };
  }, [requestKey, product, variant, retryToken]);
  if (!product || !variant) return "unavailable";
  return state.key === requestKey ? state.status : "loading";
}

export function PreviewReadinessMessage({ product, variant, color, status }: { product: string; variant: string; color: string; status: PreviewReadinessStatus }) {
  const message = status === "loading" ? "Geliştirme önizleme uygunluğu kontrol ediliyor…"
    : status === "ready" ? "Bu seçili varyant için geliştirme ürün önizlemesi hazır."
    : status === "error" ? "Geliştirme ürün önizlemesi şu anda doğrulanamıyor."
    : previewUnavailableMessage;
  return <p role="status" data-preview-readiness={status} data-product-reference={product} data-variant-reference={variant}>
    {color} · {message} {status === "unavailable" ? "Bu renk desteklenmiyor." : status === "error" ? "Tekrar deneyin." : ""}
  </p>;
}

export default function VariantPreviewReadiness(props: { product: string; variant: string; color: string }) {
  // Never retain the previous variant's readiness while its successor loads.
  return <PreviewReadinessMessage key={props.product + ":" + props.variant} {...props} status={usePreviewReadiness(props.product, props.variant)} />;
}
