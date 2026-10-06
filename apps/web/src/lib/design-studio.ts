'use client';
import { commerceApi } from './commerce';
import type { Product, Variant } from '../../../../packages/commerce/client';
export type Question = { id: string; axis: string; axisLabel: string; text: string; options: { id: string; label: string }[] };
export type Answer = { questionId: string; optionId: string };
export type DesignSession = { id: string; status: 'questionnaire' | 'queued' | 'running' | 'ready' | 'failed'; expiresAt: string; product: Product; variant: Variant; bankVersion: string; questions: Question[]; answers: Answer[]; imageUrl: string | null; errorCode: string | null; errorMessage: string | null };
export const designApi = commerceApi.replace(/\/local-commerce\/?$/, '/design-studio');
export async function designRequest<T>(route: string, method = 'GET', body?: unknown): Promise<T> {
  if (!designApi) throw new Error('Tasarım bağlantısı henüz hazır değil.');
  const response = await fetch(designApi + route, { method, cache: 'no-store', signal: AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || (response.status === 429 ? 'Çok sık işlem yapıldı. Biraz sonra tekrar deneyin.' : 'Tasarım bağlantısı kurulamadı. Tekrar deneyin.'));
  return payload;
}
export function studioAsset(source: string) { return `${designApi.replace(/\/api\/v1\/design-studio\/?$/, '')}${source}`; }
export function browserId() {
  const key = 'xinobi-u-browser';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID(); localStorage.setItem(key, id); return id;
}
export function sessionKey(product: string, variant: string) { return `xinobi-u-session:${product}:${variant}`; }
export function rememberSession(session: DesignSession) {
  sessionStorage.setItem(sessionKey(session.product.id, session.variant.id), session.id);
  sessionStorage.setItem('xinobi-u-selected-session', session.id);
}
