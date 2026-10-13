import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import styles from "../../urunler/cay-makinesi-101/editor/editor.module.css";
import MobilePreviewContent from "./mobile-preview-content";

export const metadata: Metadata = {
  title: "Mobil ürün önizlemesi | XINOBI U",
  description: "Onaylı XINOBI U ürün ve varyantları için müşteri desen önizlemesi.",
};

// This is the fallback shown when the route is opened without a session. A
// session preview never uses these identities: it resolves the product and
// variant returned by the server-owned session record.
const CM121_PRODUCT = "DEMO-499cf715-33cd-4144-8c40-2245181e8625";
const CM121_VARIANT = "DEMO-V-5a46bb98-c95c-42b9-9f12-e4286f628cca";

export default function MobilePreviewPage() {
  return (
    <div className={`${styles.page} ${styles.mobilePreviewPage}`}>
      <a className={styles.skipLink} href="#editor-workspace">
        Editör çalışma alanına geç
      </a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/xinobi-u" aria-label="XINOBI U ana sayfa">
          <Image src="/assets/brand/xinobi-logo-white.png" alt="Xinobi" width={385} height={333} priority />
        </Link>
        <div className={styles.documentTitle}>
          <span>XINOBI U</span>
          <strong>Ürün önizlemesi</strong>
          <small>Mobil uyumlu önizleme</small>
        </div>
        <div className={styles.headerActions}>
          <Link href="/xinobi-u">XINOBI U&apos;ya dön</Link>
          <button type="button" disabled>Sepete aktar</button>
        </div>
      </header>
      <main id="editor-workspace">
        <Suspense fallback={<section className={styles.previewStatus} aria-live="polite"><p>Önizleme hazırlanıyor…</p></section>}>
          <MobilePreviewContent
            demoProductId={CM121_PRODUCT}
            demoVariantId={CM121_VARIANT}
            demoPatternSrc="/assets/studio/japanese-wave-design.png"
          />
        </Suspense>
      </main>
    </div>
  );
}
