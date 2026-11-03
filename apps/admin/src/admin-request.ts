let refreshing: Promise<boolean> | undefined
let refreshVersion = 0

export function refreshStaffSession(api: string): Promise<boolean> {
  if (!api) return Promise.resolve(false)
  refreshing ??= fetch(api.replace(/\/local-commerce\/?$/, '') + '/auth/admin/refresh', {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Xinobi-Csrf': '1' },
    body: '{}', signal: AbortSignal.timeout(20000),
  }).then(response => { if (response.ok) refreshVersion++; return response.ok }).catch(() => false).finally(() => { refreshing = undefined })
  return refreshing
}

// Panel requests must never rotate or consume the customer's refresh cookie.
/** A downloaded file with the name the server gave it in Content-Disposition (empty when it sent none) and its integrity check (sha256/unrecorded). */
export type AdminFile = { blob: Blob; fileName: string; check: string }

export function fileNameOf(disposition: string | null): string {
  if (!disposition) return ''
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1]
  if (encoded) { try { return decodeURIComponent(encoded.trim()) } catch { /* fall back to the plain name */ } }
  return /filename="?([^";]+)"?/i.exec(disposition)?.[1]?.trim() ?? ''
}

export async function adminRequest<T>(api: string, path: string, method = 'GET', body?: unknown, responseKind: 'json' | 'blob' | 'file' = 'json'): Promise<T> {
  if (!api) throw new Error('Yönetim API adresi yapılandırılmadı.')
  const version = refreshVersion
  const send = () => fetch(api + path, {
    method, credentials: 'include', cache: 'no-store', signal: AbortSignal.timeout(20000),
    headers: { 'X-Xinobi-Csrf': '1', ...(body === undefined || body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  })
  let response: Response
  try {
    response = await send()
    if (response.status === 401 && !path.startsWith('/auth/')) {
      // A late 401 from an earlier request must reuse the completed rotation.
      if (version !== refreshVersion || await refreshStaffSession(api)) response = await send()
    }
  } catch { throw new Error('Yönetim servisine ulaşılamadı. Lütfen tekrar deneyin.') }
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('xinobi:admin-session-expired'))
    const problem = await response.json().catch(() => null)
    throw Object.assign(new Error(response.status === 401 ? 'Oturum doğrulanamadı. Yeniden giriş yapın.' : response.status === 403 ? 'Bu işlem için yetkiniz yok.' : problem?.message || problem?.title || `Yönetim servisi kullanılamıyor (${response.status}).`), { status: response.status, code: problem?.code })
  }
  if (responseKind === 'file') return { blob: await response.blob(), fileName: fileNameOf(response.headers.get('Content-Disposition')), check: response.headers.get('X-Xinobi-File-Check') ?? '' } as T
  return response.status === 204 ? undefined as T : responseKind === 'blob' ? await response.blob() as T : response.json()
}
