import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { commerceApi, mediaUrl } from '../../commerce'
import { refreshAdminSession } from '../../admin-api'
import MaskPrompt from './MaskPrompt'
import './surface-masks.css'

// Admin masking for every product colour (/api/v1/local-commerce/surfaces): upload a WebP mask, check it, approve it for same-placement colours.
type Status = 'none' | 'draft' | 'approved' | 'stale'
type Summary = { productId: string; productName: string; variantId: string; color: string; image: string; status: Status; draftUpdatedAt: string | null }
type Draft = { image: string; method: string; updatedAt: string }
type Color = { variantId: string; color: string; image: string; width: number; height: number }
type Detail = { productId: string; productName: string; variantId: string; color: string; image: string; width: number; height: number; status: Status; approvedMask: string | null; draft: Draft | null; colors: Color[]; sourceSha256: string }

const root = `${commerceApi}/surfaces`
const asset = (path: string) => mediaUrl(path, commerceApi, 'http://127.0.0.1:3000')
const statusText: Record<Status, string> = { none: 'Maske yok', draft: 'Taslak', approved: 'Onaylı', stale: 'Eski fotoğraf' }
const methodText: Record<string, string> = { 'webp-alpha': 'WebP (şeffaflık)', 'webp-luminance': 'WebP (siyah-beyaz)', 'png-alpha': 'Şeffaflık', 'png-luminance': 'Siyah-beyaz', approved: 'Onaylı maske' }

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const send = () => fetch(root + path, { method, credentials: 'include', headers: body === undefined ? { 'X-Xinobi-Csrf': '1' } : { 'Content-Type': 'application/json', 'X-Xinobi-Csrf': '1' }, body: body === undefined ? undefined : JSON.stringify(body) })
  let response = await send()
  if (response.status === 401 && await refreshAdminSession()) response = await send()
  if (response.status === 401) throw new Error('Yönetici oturumun sona erdi. Paneli başka sekmede açıp yeniden giriş yap; ardından burada tekrar dene.')
  if (response.status === 403) throw new Error('Bu hesapla ürün yüzeyini değiştirme yetkin yok.')
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || `Yüzey servisi hata verdi (${response.status}).`)
  return payload as T
}

async function loadAlpha(url: string, width: number, height: number) {
  const image = new Image(); image.crossOrigin = url.includes('/surfaces/') ? 'use-credentials' : 'anonymous'; image.src = url; await image.decode()
  if (image.naturalWidth !== width || image.naturalHeight !== height) throw new Error('Maske fotoğrafla aynı boyutta değil.')
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  context.drawImage(image, 0, 0)
  return context.getImageData(0, 0, width, height)
}

export default function SurfaceMasks() {
  const [items, setItems] = useState<Summary[]>([]), [filter, setFilter] = useState<'all' | Status>('all'), [query, setQuery] = useState('')
  const [selected, setSelected] = useState<{ productId: string; variantId: string } | null>(null)
  const [error, setError] = useState(''), [sideSlot, setSideSlot] = useState<HTMLDivElement | null>(null)
  const refresh = useCallback(async () => { try { setItems(await request<Summary[]>('')); setError('') } catch (problem) { setError(problem instanceof Error ? problem.message : 'Liste yüklenemedi.') } }, [])
  useEffect(() => { void refresh() }, [refresh])
  const shown = items.filter(item => (filter === 'all' || item.status === filter) && (`${item.productName} ${item.color}`).toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')))
  const groups = shown.reduce<Record<string, Summary[]>>((all, item) => ({ ...all, [item.productId]: [...(all[item.productId] ?? []), item] }), {})
  const counts = items.reduce<Record<Status, number>>((all, item) => ({ ...all, [item.status]: all[item.status] + 1 }), { none: 0, draft: 0, approved: 0, stale: 0 })
  return <section className="surface-masks" aria-label="Ürün yüzey maskeleri">
    <div className="surface-side"><aside className="surface-list">
      <p className="surface-intro">Yalnız XINOBI U işaretli ürünler listelenir. Referans renkte WebP maske yükle; aynı tuvalde ve aynı konumda çekilmiş renklere tek onayla uygula.</p>
      <label>Ürün veya renk ara<input value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div className="surface-filters" role="group" aria-label="Durum filtresi">{(['all', 'none', 'draft', 'approved', 'stale'] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? `Tümü (${items.length})` : `${statusText[value]} (${counts[value]})`}</button>)}</div>
      {error && <p role="alert" className="surface-error">{error}</p>}
      {!error && shown.length === 0 && <p className="surface-empty">Listelenecek XINOBI U ürünü veya rengi yok.</p>}
      {Object.entries(groups).map(([productId, variants]) => <div key={productId} className="surface-group"><strong>{variants[0].productName}</strong>
        {variants.map(item => <button key={item.variantId} className="surface-row" aria-current={selected?.variantId === item.variantId ? 'true' : undefined} onClick={() => setSelected({ productId, variantId: item.variantId })}>
          <img src={asset(item.image)} alt="" /><span>{item.color}</span><em data-status={item.status}>{statusText[item.status]}</em></button>)}
      </div>)}
    </aside><div ref={setSideSlot} className="surface-side-tools" /></div>
    {selected ? <SurfaceEditor key={selected.variantId} productId={selected.productId} variantId={selected.variantId} onChanged={refresh} side={sideSlot} /> : <p className="surface-empty">Soldan bir ürün rengi seç.</p>}
  </section>
}

/** <c>side</c>: the slot under the product list that holds the source download and the mask prompt. */
function SurfaceEditor({ productId, variantId, onChanged, side }: { productId: string; variantId: string; onChanged: () => void; side: HTMLElement | null }) {
  const path = `/${encodeURIComponent(productId)}/${encodeURIComponent(variantId)}`
  const [detail, setDetail] = useState<Detail | null>(null), [busy, setBusy] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [base, setBase] = useState<ImageData | null>(null), [showing, setShowing] = useState<'draft' | 'approved'>('draft')
  const canvas = useRef<HTMLCanvasElement>(null)
  const [webpMode, setWebpMode] = useState('alpha'), [webpFile, setWebpFile] = useState<File | null>(null)
  const [patternPreview, setPatternPreview] = useState(false), [previewColor, setPreviewColor] = useState(variantId)
  const [colors, setColors] = useState<string[]>([variantId]), [samePlacement, setSamePlacement] = useState(false)

  const busyRef = useRef(false)
  const run = useCallback(async (label: string, action: () => Promise<Detail>, done?: string) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(label); setError(''); setNotice(''); setShowing('draft')
    try { setDetail(await action()); setSamePlacement(false); if (done) setNotice(done); onChanged() }
    catch (problem) { setError(problem instanceof Error ? problem.message : 'İşlem tamamlanamadı.') }
    finally { busyRef.current = false; setBusy('') }
  }, [onChanged])
  useEffect(() => { void run('Yükleniyor…', () => request<Detail>(path)) }, [path, run])

  // The mask on show: the draft when there is one (or the admin chose it), otherwise the approved mask.
  const view = detail?.draft && (showing === 'draft' || !detail.approvedMask) ? 'draft' : detail?.approvedMask ? 'approved' : null
  const maskUrl = !detail || !view ? null : view === 'draft' ? `${root}${path}/draft.webp?v=${encodeURIComponent(detail.draft!.updatedAt)}` : asset(detail.approvedMask!)
  useEffect(() => {
    let cancelled = false
    if (!detail) return
    if (!maskUrl) { setBase(new ImageData(detail.width, detail.height)); return }
    loadAlpha(maskUrl, detail.width, detail.height).then(data => { if (!cancelled) setBase(data) }).catch(() => { if (!cancelled) setError('Maske yüklenemedi.') })
    return () => { cancelled = true }
  }, [maskUrl, detail])

  // Pink (or sample pattern) overlay of the mask; the photo itself is never altered.
  const overlay = useMemo(() => {
    if (!base || !detail) return null
    const data = new Uint8ClampedArray(base.data)
    for (let i = 0; i < data.length; i += 4) { const tile = Math.max(8, Math.round(detail.width / 24))
      const light = (Math.floor((i / 4 % detail.width) / tile) + Math.floor(Math.floor(i / 4 / detail.width) / tile)) % 2 === 0
      data[i] = patternPreview ? light ? 250 : 30 : 220; data[i + 1] = patternPreview ? light ? 200 : 90 : 40; data[i + 2] = patternPreview ? light ? 90 : 160 : 130; data[i + 3] = Math.round(data[i + 3] * (patternPreview ? .85 : .5)) }
    return new ImageData(data, detail.width, detail.height)
  }, [base, detail, patternPreview])
  useEffect(() => { if (overlay && canvas.current) canvas.current.getContext('2d')!.putImageData(overlay, 0, 0) }, [overlay])

  async function downloadSource() {
    if (!detail || busyRef.current) return
    busyRef.current = true; setBusy('Kaynak fotoğraf indiriliyor…'); setError('')
    try {
      const response = await fetch(asset(detail.image), { credentials: 'include' })
      if (!response.ok) throw new Error('Kaynak fotoğraf indirilemedi.')
      const blob = await response.blob()
      if (await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()).then(hash => Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('')) !== detail.sourceSha256)
        throw new Error('Kaynak fotoğraf değişti; ürünü yeniden seçin.')
      const url = URL.createObjectURL(blob), link = document.createElement('a')
      const extension = blob.type.includes('webp') ? 'webp' : blob.type.includes('png') ? 'png' : 'jpg'
      link.href = url; link.download = `maske-kaynagi-${detail.width}x${detail.height}.${extension}`; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
      setNotice('Panelde kullanılan kaynak fotoğraf indirildi. Maskeyi bu tuval üzerinde, kırpmadan ve ürünü taşımadan hazırlayın.')
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Kaynak fotoğraf indirilemedi.') }
    finally { busyRef.current = false; setBusy('') }
  }

  if (!detail) return <div className="surface-editor"><p role="status">{busy || error}</p></div>
  const previewed = detail.colors.find(color => color.variantId === previewColor)
  return <div className="surface-editor">
    <header><div><h2>{detail.productName}</h2><p>{detail.color} · {detail.width}×{detail.height} px · <em data-status={detail.status}>{statusText[detail.status]}</em></p></div>
      {detail.draft && detail.approvedMask && <div className="surface-toggle" role="group" aria-label="Gösterilen maske"><button aria-pressed={view === 'draft'} onClick={() => setShowing('draft')}>Taslak</button><button aria-pressed={view === 'approved'} onClick={() => setShowing('approved')}>Onaylı</button></div>}</header>
    {side && createPortal(<>
      <button type="button" className="surface-source-download" disabled={!!busy} onClick={() => void downloadSource()}>Maskeleme için kaynak fotoğrafı indir</button>
      <MaskPrompt key={detail.sourceSha256} source={{ productName: detail.productName, color: detail.color, productId, variantId, width: detail.width, height: detail.height, sourceSha256: detail.sourceSha256 }} disabled={!!busy} />
    </>, side)}
    {detail.status === 'stale' && <p className="surface-warning">Bu rengin fotoğrafı onaydan sonra değişti; eski maske vitrinde kullanılmıyor. Yeni fotoğraf için maskeyi yeniden hazırla.</p>}
    {previewColor !== variantId && <p role="status">Ortak maskeyi {previewed?.color} fotoğrafında inceliyorsun. Maske kenarları bu renkte de ürünle örtüşmeli.</p>}
    <div className="surface-workspace">
      <div className="surface-stage">
        <img src={asset(previewed?.image ?? detail.image)} alt={`${detail.productName}, ${previewed?.color ?? detail.color}`} draggable={false} />
        <canvas ref={canvas} width={detail.width} height={detail.height} aria-hidden="true" />
        {busy && <div className="surface-busy" role="status">{busy}</div>}
      </div>
      <div className="surface-tools">
        <div className="surface-panel">
          <h3>WebP maske yükle</h3><p>Fotoğrafla aynı boyutta ({detail.width}×{detail.height}) WebP seç. Şeffaf maskede dolu alanlar, siyah-beyaz maskede beyaz alanlar desen alır.</p>
          <label>Maske WebP dosyası<input type="file" accept="image/webp,.webp" disabled={!!busy} onChange={event => setWebpFile(event.target.files?.[0] ?? null)} /></label>
          <label>WebP maske türü<select value={webpMode} disabled={!!busy} onChange={event => setWebpMode(event.target.value)}><option value="alpha">Şeffaf WebP — dolu alanları kullan</option><option value="luminance">Siyah-beyaz — beyaz alanları kullan</option></select></label>
          <button className="primary" disabled={!!busy || !webpFile} onClick={() => void run('WebP yükleniyor…', async () => {
            if (!/\.webp$/i.test(webpFile!.name) || (webpFile!.type && webpFile!.type !== 'image/webp')) throw new Error('Yalnız WebP maske dosyası yükleyebilirsin.')
            if (webpFile!.size > 8 * 1024 * 1024) throw new Error('WebP en fazla 8 MB olabilir.')
            const webpBase64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = () => reject(new Error('Dosya okunamadı.')); reader.readAsDataURL(webpFile!) })
            return request<Detail>(`${path}/mask`, 'POST', { image: detail.image, sourceSha256: detail.sourceSha256, webpBase64, mode: webpMode })
          }, 'WebP taslağı hazır. Ürün üzerinde kontrol edip renklerde onaylayabilirsin.')}>WebP maskeyi taslağa yükle</button>
        </div>
        <div className="surface-panel">
          <label><input type="checkbox" checked={patternPreview} onChange={event => setPatternPreview(event.target.checked)} />Maske içinde örnek desen göster</label>
          <label>Önizleme rengi<select value={previewColor} disabled={!!busy} onChange={event => setPreviewColor(event.target.value)}>{detail.colors.filter(color => color.width === detail.width && color.height === detail.height).map(color => <option key={color.variantId} value={color.variantId}>{color.color}</option>)}</select></label>
          <p>Örnek desen yalnızca maskenin kapladığı alanı gösterir. Fiziksel baskı çıktısı değildir.</p>
          <h3>Ortak maske uygulanacak renkler</h3>
          <p>Her rengi Önizleme renginden açıp kontrol et. Yalnız referansla aynı boyutta ve aynı konumda çekilmiş renkler seçilebilir. Seçilen renklerin mevcut maskeleri güncellenir.</p>
          {detail.colors.map(color => {
            const compatible = color.width === detail.width && color.height === detail.height
            return <label key={color.variantId}><input type="checkbox" checked={colors.includes(color.variantId)} disabled={!!busy || color.variantId === variantId || !compatible} onChange={event => setColors(current => event.target.checked ? [...current, color.variantId] : current.filter(id => id !== color.variantId))} />
              <img src={asset(color.image)} alt="" width={48} height={64} style={{ objectFit: 'contain' }} />{color.color}{!compatible && ' · Görsel boyutu farklı / okunamadı'}</label>
          })}
          <label><input type="checkbox" checked={samePlacement} disabled={!!busy} onChange={event => setSamePlacement(event.target.checked)} />Seçtiğim her rengi kontrol ettim; ürün aynı konumda, maske kenarları ile logo/kulp alanları doğru.</label>
          <button className="approve" disabled={!!busy || !detail.draft || !samePlacement} onClick={() => run('Renklere uygulanıyor…', () => request<Detail>(`${path}/approval/colors`, 'POST', { colors: detail.colors.filter(color => colors.includes(color.variantId)), samePlacementConfirmed: samePlacement, expectedDraftUpdatedAt: detail.draft!.updatedAt }), 'Ortak maske seçilen renklerde onaylandı.')}>Seçilen renklerde onayla</button>
        </div>
        {detail.draft && <a className="surface-mask-download" href={`${root}${path}/draft.webp?v=${encodeURIComponent(detail.draft.updatedAt)}`} download="surface-mask.webp" target="_blank" rel="noreferrer">Taslak WebP maskeyi aç / indir</a>}
        {detail.draft && <dl className="surface-facts"><dt>Taslak</dt><dd>{methodText[detail.draft.method] ?? detail.draft.method}</dd></dl>}
        {error && <p role="alert" className="surface-error">{error}</p>}
        {notice && <p role="status" className="surface-ok">{notice}</p>}
        <div className="surface-decisions">
          <button className="approve" disabled={!!busy || !detail.draft} onClick={() => run('Onaylanıyor…', () => request<Detail>(`${path}/approval`, 'POST'), 'Maske onaylandı. Müşteri tasarımı bu renkte yalnız bu bölgeye uygulanır.')}>Taslağı onayla</button>
          {detail.draft && <button disabled={!!busy} onClick={() => run('Siliniyor…', () => request<Detail>(`${path}/draft`, 'DELETE'), 'Taslak silindi.')}>Taslağı sil</button>}
          {(detail.status === 'approved' || detail.status === 'stale') && <button className="danger" disabled={!!busy} onClick={() => { if (window.confirm('Onaylı maske kaldırılsın mı? Vitrin bu renkte genel önizlemeye döner.')) void run('Kaldırılıyor…', () => request<Detail>(`${path}/approval`, 'DELETE'), 'Onay kaldırıldı.') }}>Onayı kaldır</button>}
        </div>
      </div>
    </div>
  </div>
}
