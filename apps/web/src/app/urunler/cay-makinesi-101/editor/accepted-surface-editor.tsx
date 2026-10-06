"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import EditorWorkspace from "./editor-workspace";
import { loadAcceptedSurface, type RenderingInputs } from "./accepted-surface-api";
import styles from "./editor.module.css";

function PreviewStatus({ error = false, children }: { error?: boolean; children: React.ReactNode }) {
  return <section className={styles.previewStatus} role={error ? "alert" : "status"}>
    <p className={styles.eyebrow}>Geliştirme önizlemesi</p><h1>{children}</h1>
    <p>Temsili görselleştirme; fiziksel baskı, DPI veya üretim onayı değildir.</p>
    <Link href="/urunler/cay-makinesi-101">Ürüne dön</Link>
  </section>;
}
function AcceptedSurfaceLoader({ variant }: { variant: string }) {
  const [state, setState] = useState<{ variant: string; inputs?: RenderingInputs | null; error?: boolean }>({ variant });
  useEffect(() => {
    const controller = new AbortController();
    loadAcceptedSurface(variant, controller.signal).then(inputs => {
      if (!controller.signal.aborted) setState({ variant, inputs });
    }).catch(() => { if (!controller.signal.aborted) setState({ variant, error: true }); });
    return () => controller.abort();
  }, [variant]);
  if (state.variant !== variant || (state.inputs === undefined && !state.error))
    return <PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>;
  if (state.error) return <PreviewStatus error>Önizleme yüklenemedi.</PreviewStatus>;
  if (!state.inputs) return <PreviewStatus>Bu renk için geliştirme önizlemesi kullanılamıyor.</PreviewStatus>;
  return <EditorWorkspace renderingInputs={state.inputs} />;
}
function AcceptedSurfaceRoute() {
  const variant = useSearchParams().get("variant") ?? "blue";
  // A changed reference starts a fresh load; an earlier bundle is never reused while loading.
  return <AcceptedSurfaceLoader key={variant} variant={variant} />;
}
function ReferenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  const variant = useSearchParams().get("variant") ?? "blue";
  return <Link href={`${href}?variant=${encodeURIComponent(variant)}`}>{children}</Link>;
}
export function DevelopmentReferenceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Suspense fallback={<Link href="/urunler/cay-makinesi-101">{children}</Link>}><ReferenceLink href={href}>{children}</ReferenceLink></Suspense>;
}
export default function AcceptedSurfaceEditor() {
  return <Suspense fallback={<PreviewStatus>Ürün önizlemesi yükleniyor…</PreviewStatus>}><AcceptedSurfaceRoute /></Suspense>;
}
