'use client';
import { useEffect, useState } from 'react';
import { commerceRequest, localApi, type CommerceState } from '../../../../packages/commerce/client';
export { mediaUrl, money } from '../../../../packages/commerce/client';
export const commerceApi = process.env.NEXT_PUBLIC_COMMERCE_API_URL || (process.env.NODE_ENV === 'development' ? localApi : '');
const snapshotUrl = process.env.NEXT_PUBLIC_COMMERCE_SNAPSHOT_URL || '';
export function useCommerce() {
  const [state, setState] = useState<CommerceState | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!commerceApi && !snapshotUrl) return;
    let active = true;
    const refresh = async () => {
      try {
        const data = await commerceRequest<CommerceState>(commerceApi, commerceApi ? '/state' : snapshotUrl);
        if (active) { setState(data); setError(''); }
      } catch { if (active) setError('Ürün ve içerik bağlantısı kurulamadı. Local API’nin çalıştığını kontrol edin.'); }
    };
    void refresh();
    const timer = window.setInterval(refresh, 2000);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return { state, error, connected: Boolean(state), enabled: Boolean(commerceApi || snapshotUrl) };
}

export function stockText(stock?: number) {
  if (stock === undefined || stock > 5) return '';
  return stock > 0 ? `Son ${stock} ürün` : 'Stokta yok';
}
