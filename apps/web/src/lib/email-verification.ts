'use client';

export type VerificationChallenge = {id: string; email: string; expiresAt: string};
const api = process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5003/api/v1/email-verification' : '');

async function request<T>(path: string, body: unknown): Promise<T> {
  if (!api) throw new Error('E-posta doğrulama servisi henüz kullanıma açılmadı.');
  let response: Response;
  try {
    response = await fetch(api + path, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body), signal: AbortSignal.timeout(25000), cache: 'no-store',
    });
  } catch { throw new Error('E-posta doğrulama servisine ulaşılamadı. Lütfen tekrar dene.'); }
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || (response.status === 429 ? 'Çok fazla deneme yaptın. Bir dakika sonra tekrar dene.' : 'E-posta doğrulanamadı. Lütfen tekrar dene.'));
  }
  return response.json();
}
export function startEmailVerification(email: string) {
  return request<VerificationChallenge>('/start', {email});
}
export function confirmEmailVerification(id: string, email: string, code: string) {
  return request<{verified: boolean}>('/confirm', {id, email, code});
}
