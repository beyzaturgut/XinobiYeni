'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { commerceApi } from '../../../lib/commerce';
import type { DesignSession } from '../../../lib/design-studio';
import AcceptedSurfaceEditor from '../../urunler/cay-makinesi-101/editor/accepted-surface-editor';
import styles from '../../urunler/cay-makinesi-101/editor/editor.module.css';
import flow from '../flow.module.css';
import placement from '../kendi-gorselin/own-image.module.css';

const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/;
const SESSION_IMAGE = /^\/api\/v1\/xinobi-u\/sessions\/[A-Za-z0-9_-]{1,128}\/image$/;
const xinobiUApi = (process.env.NEXT_PUBLIC_XINOBI_U_API_URL || commerceApi.replace(/\/local-commerce\/?$/, '/xinobi-u')).replace(/\/+$/, '');

type MobilePreviewContentProps = {
  demoProductId: string;
  demoVariantId: string;
  demoPatternSrc: string;
};

type LoadState = 'loading' | 'ready' | 'error';
type ResolvedSession = { sessionId: string; productId: string; variantId: string; patternSrc: string };
const ENTITY_ID = /^[A-Za-z0-9_-]{1,160}$/;

/**
 * Resolves only a server-owned, ready design session. Product and variant
 * identities come from that response; URL product/variant parameters are not
 * used to select a surface.
 */
export default function MobilePreviewContent({ demoProductId, demoVariantId, demoPatternSrc }: MobilePreviewContentProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<LoadState>('loading');
  const [resolved, setResolved] = useState<ResolvedSession | null>(null);
  const [failedAttempt, setFailedAttempt] = useState<number | null>(null);
  const [failedSessionId, setFailedSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const validationMessage = !sessionId
    ? ''
    : !xinobiUApi
      ? 'AI bağlantısı henüz yapılandırılmamış.'
      : !SESSION_ID.test(sessionId)
        ? 'AI oturum kimliği geçersiz.'
        : '';

  useEffect(() => {
    let active = true;

    if (!sessionId || validationMessage || !xinobiUApi) return () => { active = false; };

    fetch(`${xinobiUApi}/sessions/${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('session_unavailable');
        return response.json() as Promise<DesignSession>;
      })
      .then((session) => {
        const productId = session.product?.id;
        const variantId = session.variant?.id;
        if (typeof productId !== 'string' || !ENTITY_ID.test(productId) || typeof variantId !== 'string' || !ENTITY_ID.test(variantId)) {
          throw new Error('unsupported_product');
        }
        if (session.status !== 'ready' || !session.imageUrl) {
          throw new Error('not_ready');
        }
        const imageUrl = new URL(session.imageUrl, window.location.origin);
        const expectedImagePath = `/api/v1/xinobi-u/sessions/${encodeURIComponent(sessionId)}/image`;
        const configuredOrigin = new URL(xinobiUApi, window.location.origin).origin;
        if (!SESSION_IMAGE.test(imageUrl.pathname) || imageUrl.pathname !== expectedImagePath || (xinobiUApi.startsWith('http') && imageUrl.origin !== configuredOrigin)) {
          throw new Error('invalid_image');
        }
        if (active) {
          // Keep the local development path same-origin. A configured API
          // origin is used directly and must provide the existing CORS media
          // contract used by the shared renderer.
          const imagePath = expectedImagePath;
          setResolved({ sessionId, productId, variantId, patternSrc: xinobiUApi.startsWith('/') ? imagePath : imageUrl.toString() });
          setState('ready');
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        const code = error instanceof Error ? error.message : '';
        setMessage(code === 'unsupported_product'
          ? 'Bu AI tasarımı için geçerli bir ürün/varyant eşleşmesi bulunmuyor.'
          : code === 'not_ready'
            ? 'AI görseli henüz hazır değil. Tekrar deneyin.'
            : 'AI görseli alınamadı. Tekrar deneyin.');
        setFailedAttempt(retry);
        setFailedSessionId(sessionId);
        setState('error');
      });

    return () => { active = false; };
  }, [retry, sessionId, validationMessage]);

  if (!sessionId) {
    return <AcceptedSurfaceEditor xinobiPreview commerceProduct={demoProductId} commerceVariant={demoVariantId} patternSrc={demoPatternSrc} />;
  }

  if (validationMessage) {
    return (
      <section className={styles.previewStatus} aria-live="polite">
        <h1>Önizleme kullanılamıyor</h1>
        <p>{validationMessage}</p>
      </section>
    );
  }

  if (state === 'ready' && resolved?.sessionId === sessionId) {
    // Same frame and heading as the own-image placement step, so both XINOBI U methods end on one screen.
    return (
      <div className={flow.page}>
      <div className={placement.placementHead}><div><p className={flow.kicker}>XINOBI U · AI tasarımı</p><h1 className={`${flow.title} ${placement.placementTitle}`}>Tasarımını yerleştir</h1></div></div>
      <AcceptedSurfaceEditor xinobiPreview designId={resolved.sessionId}
        commerceProduct={resolved.productId}
        commerceVariant={resolved.variantId}
        patternSrc={resolved.patternSrc}
        unavailableMessage="Bu ürün/varyant için onaylı mobil önizleme desteği bulunmuyor. Başka bir ürünün maskesi kullanılmaz."
      />
      </div>
    );
  }

  const failed = state === 'error' && failedAttempt === retry && failedSessionId === sessionId;

  return (
    <section className={styles.previewStatus} aria-live="polite">
      <h1>{failed ? 'Önizleme kullanılamıyor' : 'AI görseli yükleniyor'}</h1>
      <p>{failed ? message : 'Hazır tasarım ve onaylı ürün yüzeyleri doğrulanıyor.'}</p>
      {failed && (
        <button type="button" onClick={() => setRetry((value) => value + 1)}>
          Tekrar dene
        </button>
      )}
    </section>
  );
}
