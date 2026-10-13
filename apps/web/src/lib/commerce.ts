'use client';
import { useEffect, useState } from 'react';
import { commerceRequest, localApi, type CommerceState } from '../../../../packages/commerce/client';
export { mediaUrl, money, productGallery } from '../../../../packages/commerce/client';
export const commerceApi = process.env.NEXT_PUBLIC_COMMERCE_API_URL || (process.env.NODE_ENV === 'development' ? localApi : '');
const snapshotUrl = process.env.NEXT_PUBLIC_COMMERCE_SNAPSHOT_URL || '';
const catalogUrl = process.env.NEXT_PUBLIC_CATALOG_URL || (process.env.NODE_ENV === 'development' || snapshotUrl ? '' : '/api/v1/catalog/storefront');
let pendingState: Promise<CommerceState> | undefined;
function loadCommerceState() {
  // Header and page hooks read the same endpoint. Share only an in-flight
  // request; each later refresh still reads the current catalog.
  pendingState ??= commerceRequest<CommerceState>(catalogUrl ? '' : commerceApi, catalogUrl || (commerceApi ? '/state' : snapshotUrl))
    .finally(() => { pendingState = undefined; });
  return pendingState;
}
export function useCommerce() {
  const [state, setState] = useState<CommerceState | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!catalogUrl && !commerceApi && !snapshotUrl) return;
    let active = true;
    const refresh = async () => {
      try {
        const data = await loadCommerceState();
        if (active) { setState(data); setError(''); }
      } catch { if (active) setError('Ürün ve içerik bağlantısı kurulamadı. Biraz sonra tekrar deneyin.'); }
    };
    void refresh();
    const timer = window.setInterval(refresh, 2000);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return { state, error, connected: Boolean(state), enabled: Boolean(catalogUrl || commerceApi || snapshotUrl) };
}

export function stockText(stock?: number) {
  if (stock === undefined || stock > 5) return '';
  return stock > 0 ? `Son ${stock} ürün` : 'Stokta yok';
}
