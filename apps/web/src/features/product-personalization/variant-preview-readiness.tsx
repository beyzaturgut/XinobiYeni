"use client";

import { useEffect, useState } from "react";
import { loadAcceptedSurface } from "../../app/urunler/cay-makinesi-101/editor/accepted-surface-api";

export const previewUnavailableMessage = "Bu seçili ürün/varyant için geliştirme ürün önizlemesi kullanılamıyor.";

// Readiness is resolved from accepted rendering inputs, not catalog eligibility.
function Readiness({ product, variant, color }: { product: string; variant: string; color: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    loadAcceptedSurface(variant, controller.signal, product).then(inputs => {
      if (!controller.signal.aborted) setStatus(inputs ? "ready" : "unavailable");
    }).catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, [product, variant]);
  const message = status === "loading" ? "Geliştirme önizleme uygunluğu kontrol ediliyor…"
    : status === "ready" ? "Bu seçili varyant için geliştirme ürün önizlemesi hazır."
    : status === "error" ? "Geliştirme ürün önizlemesi şu anda doğrulanamıyor."
    : previewUnavailableMessage;
  return <p role="status" data-preview-readiness={status} data-product-reference={product} data-variant-reference={variant}>
    {color} · {message} {status === "unavailable" || status === "error" ? "Tarzını Keşfet sorularına devam edebilirsiniz." : ""}
  </p>;
}
export default function VariantPreviewReadiness(props: { product: string; variant: string; color: string }) {
  // Never retain the previous variant's readiness while its successor loads.
  return <Readiness key={props.product + ":" + props.variant} {...props} />;
}
