import SiteHeader from "../../../../components/site-header";
import type { Metadata } from "next";
import { Suspense } from "react";
import SavedDesignPreview from "./saved-design-preview";

export const metadata: Metadata = { title: "Tasarım önizleme | Xinobi", description: "Kayıtlı tasarımını ürün üzerinde gör." };

export default function SavedDesignPreviewPage() {
  return <><SiteHeader /><Suspense fallback={<p role="status">Yükleniyor…</p>}><SavedDesignPreview /></Suspense></>;
}
