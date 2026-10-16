import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { commerceApi, mediaUrl } from '../../commerce'
import { paint } from './SurfaceMaskCorrection'
import type { MaskStroke } from './product-surfaces-api'
import './surface-masks.css'

// Admin masking for every product colour (/api/v1/local-commerce/surfaces): Roboflow by text or points, brush, approve.
type Status = 'none' | 'draft' | 'approved' | 'stale'
type Summary = { productId: string; productName: string; variantId: string; color: string; image: string; status: Status; draftUpdatedAt: string | null }
type Draft = { image: string; method: string; prompt: string | null; score: number | null; updatedAt: string }
type Color = { variantId: string; color: string; image: string; width: number; height: number }
type Detail = { productId: string; productName: string; variantId: string; color: string; image: string; width: number; height: number; status: Status; approvedMask: string | null; draft: Draft | null; provider: { configured: boolean; usedToday: number; dailyLimit: number }; colors: Color[] }
type Point = { x: number; y: number; keep: boolean }
type Tool = 'prompt' | 'points' | 'brush'

const root = `${commerceApi}/surfaces`
const asset = (path: string) => mediaUrl(path, commerceApi, 'http://127.0.0.1:3000')
const statusText: Record<Status, string> = { none: 'Maske yok', draft: 'Taslak', approved: 'Onaylı', stale: 'Eski fotoğraf' }
const methodText = (method: string) => method.replace('roboflow-guide', 'Roboflow (elle gösterilen bölge)').replace('roboflow-text', 'Roboflow (tarif)').replace('roboflow-points', 'Roboflow (noktalar)').replace('approved', 'Onaylı maske').replace(/^brush$/, 'Fırça').replace(/\+brush$/, ' + fırça')

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(root + path, { method, credentials: 'include', headers: body === undefined ? { 'X-Xinobi-Csrf': '1' } : { 'Content-Type': 'application/json', 'X-Xinobi-Csrf': '1' }, body: body === undefined ? undefined : JSON.stringify(body) })
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
  const [error, setError] = useState('')
  const refresh = useCallback(async () => { try { setItems(await request<Summary[]>('')); setError('') } catch (problem) { setError(problem instanceof Error ? problem.message : 'Liste yüklenemedi.') } }, [])
  useEffect(() => { void refresh() }, [refresh])
  const shown = items.filter(item => (filter === 'all' || item.status === filter) && (`${item.productName} ${item.color}`).toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')))
  const groups = shown.reduce<Record<string, Summary[]>>((all, item) => ({ ...all, [item.productId]: [...(all[item.productId] ?? []), item] }), {})
  const counts = items.reduce<Record<Status, number>>((all, item) => ({ ...all, [item.status]: all[item.status] + 1 }), { none: 0, draft: 0, approved: 0, stale: 0 })
  return <section className="surface-masks" aria-label="Ürün yüzey maskeleri">
    <aside className="surface-list">
      <p className="surface-intro">Bir referans renkte desen bölgesini kabaca boya, Roboflow ile sınırlarını bul ve aynı konumdaki renklere tek onayla uygula.</p>
      <label>Ürün veya renk ara<input value={query} onChange={event => setQuery(event.target.value)} /></label>
      <div className="surface-filters" role="group" aria-label="Durum filtresi">{(['all', 'none', 'draft', 'approved', 'stale'] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'all' ? `Tümü (${items.length})` : `${statusText[value]} (${counts[value]})`}</button>)}</div>
      {error && <p role="alert" className="surface-error">{error}</p>}
      {Object.entries(groups).map(([productId, variants]) => <div key={productId} className="surface-group"><strong>{variants[0].productName}</strong>
        {variants.map(item => <button key={item.variantId} className="surface-row" aria-current={selected?.variantId === item.variantId ? 'true' : undefined} onClick={() => setSelected({ productId, variantId: item.variantId })}>
          <img src={asset(item.image)} alt="" /><span>{item.color}</span><em data-status={item.status}>{statusText[item.status]}</em></button>)}
      </div>)}
    </aside>
    {selected ? <SurfaceEditor key={selected.variantId} productId={selected.productId} variantId={selected.variantId} onChanged={refresh} /> : <p className="surface-empty">Soldan bir ürün rengi seç.</p>}
  </section>
}

function SurfaceEditor({ productId, variantId, onChanged }: { productId: string; variantId: string; onChanged: () => void }) {
  const path = `/${encodeURIComponent(productId)}/${encodeURIComponent(variantId)}`
  const [detail, setDetail] = useState<Detail | null>(null), [busy, setBusy] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [tool, setTool] = useState<Tool>('brush'), [prompt, setPrompt] = useState('lower kettle body')
  const [points, setPoints] = useState<Point[]>([]), [keep, setKeep] = useState(true)
  const [strokes, setStrokes] = useState<MaskStroke[]>([]), [erase, setErase] = useState(false), [radius, setRadius] = useState(24)
  const [base, setBase] = useState<ImageData | null>(null), [showing, setShowing] = useState<'draft' | 'approved'>('draft')
  const canvas = useRef<HTMLCanvasElement>(null), stage = useRef<HTMLImageElement>(null)
  const [patternPreview, setPatternPreview] = useState(false), [previewColor, setPreviewColor] = useState(variantId)
  const [colors, setColors] = useState<string[]>([variantId]), [samePlacement, setSamePlacement] = useState(false)
  const [active, setActive] = useState<MaskStroke | null>(null)

  const busyRef = useRef(false)
  const run = useCallback(async (label: string, action: () => Promise<Detail>, done?: string) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(label); setError(''); setNotice(''); setShowing('draft')
    try { const next = await action(); setDetail(next); setStrokes([]); setPoints([]); setSamePlacement(false); if (done) setNotice(done); onChanged() }
    catch (problem) { setError(problem instanceof Error ? problem.message : 'İşlem tamamlanamadı.') }
    finally { busyRef.current = false; setBusy('') }
  }, [onChanged])
  useEffect(() => { void run('Yükleniyor…', () => request<Detail>(path)) }, [path, run])

  // The mask on show: the draft when there is one (or the admin chose it), otherwise the approved mask.
  const view = detail?.draft && (showing === 'draft' || !detail.approvedMask) ? 'draft' : detail?.approvedMask ? 'approved' : null
  const maskUrl = !detail || !view ? null : view === 'draft' ? `${root}${path}/draft.png?v=${encodeURIComponent(detail.draft!.updatedAt)}` : asset(detail.approvedMask!)
  useEffect(() => {
    let cancelled = false
    if (!detail) return
    if (!maskUrl) { setBase(new ImageData(detail.width, detail.height)); return }
    loadAlpha(maskUrl, detail.width, detail.height).then(data => { if (!cancelled) setBase(data) }).catch(() => { if (!cancelled) setError('Maske yüklenemedi.') })
    return () => { cancelled = true }
  }, [maskUrl, detail])

  // Pink overlay of the mask plus pending brush strokes; the photo itself is never altered.
  const overlay = useMemo(() => {
    if (!base || !detail) return null
    const data = new Uint8ClampedArray(base.data)
    try { paint(data, detail.width, detail.height, [...strokes, ...(active ? [active] : [])]) } catch { return null }
    for (let i = 0; i < data.length; i += 4) { const tile = Math.max(8, Math.round(detail.width / 24))
      const light = (Math.floor((i / 4 % detail.width) / tile) + Math.floor(Math.floor(i / 4 / detail.width) / tile)) % 2 === 0
      data[i] = patternPreview ? light ? 250 : 30 : 220; data[i + 1] = patternPreview ? light ? 200 : 90 : 40; data[i + 2] = patternPreview ? light ? 90 : 160 : 130; data[i + 3] = Math.round(data[i + 3] * (patternPreview ? .85 : .5)) }
    return new ImageData(data, detail.width, detail.height)
  }, [base, detail, strokes, active, patternPreview])
  useEffect(() => { if (overlay && canvas.current) canvas.current.getContext('2d')!.putImageData(overlay, 0, 0) }, [overlay])

  function source(event: ReactPointerEvent) {
    const rect = stage.current!.getBoundingClientRect()
    return { x: Math.max(0, Math.min(detail!.width - .01, (event.clientX - rect.left) * detail!.width / rect.width)), y: Math.max(0, Math.min(detail!.height - .01, (event.clientY - rect.top) * detail!.height / rect.height)) }
  }
  function down(event: ReactPointerEvent) {
    if (!detail || busy || previewColor !== variantId) return
    const point = source(event)
    if (tool === 'points') { if (points.length < 20) setPoints(current => [...current, { ...point, keep: event.altKey ? !keep : keep }]); return }
    if (tool !== 'brush') return
    event.currentTarget.setPointerCapture(event.pointerId)
    setActive({ operation: erase ? 'remove' : 'add', radius, points: [point] })
  }
  function move(event: ReactPointerEvent) {
    if (!active || active.points.length >= 2000) return
    const point = source(event), last = active.points[active.points.length - 1]
    if (Math.hypot(point.x - last.x, point.y - last.y) < Math.max(2, radius / 3)) return
    setActive({ ...active, points: [...active.points, point] })
  }
  function up() {
    if (active && strokes.length < 100) setStrokes(current => [...current, active])
    setActive(null)
  }

  if (!detail) return <div className="surface-editor"><p role="status">{busy || error}</p></div>
  const quota = `${detail.provider.usedToday}/${detail.provider.dailyLimit}`
  const canBrush = strokes.length > 0 && !busy
  const basis = view === 'draft' ? 'draft' : view === 'approved' ? 'approved' : 'empty'
  return <div className="surface-editor">
    <header><div><h2>{detail.productName}</h2><p>{detail.color} · {detail.width}×{detail.height} px · <em data-status={detail.status}>{statusText[detail.status]}</em></p></div>
      {detail.draft && detail.approvedMask && <div className="surface-toggle" role="group" aria-label="Gösterilen maske"><button aria-pressed={view === 'draft'} onClick={() => setShowing('draft')}>Taslak</button><button aria-pressed={view === 'approved'} onClick={() => setShowing('approved')}>Onaylı</button></div>}</header>
    {detail.status === 'stale' && <p className="surface-warning">Bu rengin fotoğrafı onaydan sonra değişti; eski maske vitrinde kullanılmıyor. Yeni fotoğraf için maskeyi yeniden hazırla.</p>}
    {previewColor !== variantId && <p role="status">Ortak maskeyi seçilen renkte inceliyorsun. Boyamak için referans rengine dön.</p>}
    <div className="surface-workspace">
      <div className={`surface-stage tool-${tool}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <img ref={stage} src={asset(detail.colors.find(color => color.variantId === previewColor)?.image ?? detail.image)} alt={`${detail.productName}, ${detail.colors.find(color => color.variantId === previewColor)?.color ?? detail.color}`} draggable={false} />
        <canvas ref={canvas} width={detail.width} height={detail.height} aria-hidden="true" />
        {points.map((point, index) => <span key={index} className={point.keep ? 'point keep' : 'point exclude'} style={{ left: `${point.x / detail.width * 100}%`, top: `${point.y / detail.height * 100}%` }} aria-hidden="true">{point.keep ? '+' : '−'}</span>)}
        {busy && <div className="surface-busy" role="status">{busy}</div>}
      </div>
      <div className="surface-tools">
        <div className="surface-tabs" role="tablist">{([['prompt', 'Roboflow tarifi'], ['points', 'Noktalar'], ['brush', 'Fırça']] as const).map(([value, label]) => <button key={value} role="tab" aria-selected={tool === value} onClick={() => setTool(value)}>{label}</button>)}</div>
        {tool === 'prompt' && <div className="surface-panel"><label>Ne seçilsin? (İngilizce)<input value={prompt} maxLength={120} onChange={event => setPrompt(event.target.value)} placeholder="lower kettle body" /></label>
          <p className="surface-hint">Örn. “lower kettle body”, “kettle body without handle”. Sonuç taslak olur; onaylamadan vitrine çıkmaz.</p>
          <button className="primary" disabled={!!busy || !detail.provider.configured || !prompt.trim()} onClick={() => run('Roboflow çalışıyor…', () => request<Detail>(`${path}/segment`, 'POST', { prompt }), 'Roboflow taslağı hazır. Gerekirse noktalar ya da fırçayla düzelt.')}>Roboflow ile bul</button></div>}
        {tool === 'points' && <div className="surface-panel"><div className="surface-toggle" role="group" aria-label="Nokta türü"><button aria-pressed={keep} onClick={() => setKeep(true)}>+ Dahil</button><button aria-pressed={!keep} onClick={() => setKeep(false)}>− Hariç</button></div>
          <p className="surface-hint">Fotoğrafta desenin olacağı yere “Dahil”, olmayacağı yere (kulp, kapak, logo) “Hariç” nokta koy. Alt tuşu türü tersine çevirir. {points.length}/20 nokta.</p>
          <div className="surface-row-actions"><button className="primary" disabled={!!busy || !detail.provider.configured || points.length === 0} onClick={() => run('Roboflow çalışıyor…', () => request<Detail>(`${path}/segment`, 'POST', { points }), 'Noktalara göre taslak hazır.')}>Noktalarla bul</button><button disabled={!points.length} onClick={() => setPoints([])}>Noktaları temizle</button></div></div>}
        {tool === 'brush' && <div className="surface-panel"><div className="surface-toggle" role="group" aria-label="Fırça"><button aria-pressed={!erase} onClick={() => setErase(false)}>Ekle</button><button aria-pressed={erase} onClick={() => setErase(true)}>Sil</button></div>
          <label>Fırça boyutu: {radius} px<input type="range" min={1} max={32} value={radius} onChange={event => setRadius(Number(event.target.value))} /></label>
          <p className="surface-hint">{basis === 'empty' ? 'Desen uygulanacak bölgenin içini kabaca boya. Küçük kenar taşmalarını Roboflow sonucu üzerinde inceleyeceğiz.' : `Düzeltmeler ${basis === 'draft' ? 'taslağa' : 'onaylı maskeden yeni bir taslağa'} uygulanır.`} {strokes.length}/100 çizgi.</p>
          <div className="surface-row-actions"><button className="primary" disabled={!canBrush} onClick={() => run('Uygulanıyor…', () => request<Detail>(`${path}/strokes`, 'POST', { strokes, base: basis }), 'Fırça düzeltmeleri taslağa uygulandı.')}>Düzeltmeleri uygula</button><button disabled={!strokes.length} onClick={() => setStrokes(current => current.slice(0, -1))}>Son çizgiyi geri al</button></div></div>}
        <div className="surface-panel">
          <h3>Elle göster → Roboflow ile sınırları bul</h3>
          <p>Önce fırça çizgilerini uygula. Roboflow çizimin içinden alınan işaretlerle ürün fotoğrafındaki bölgeyi yeniden çıkarır. Kaba fırça sınırı son maskeyi kesmez; sonucu inceleyip gerekirse düzelt.</p>
          <button className="primary" disabled={!!busy || !!active || strokes.length > 0 || !detail.draft || !detail.provider.configured} onClick={() => {
            if (window.confirm('Ürün fotoğrafı ve boyanan bölgenin iç işaretleri Roboflow’a gönderilecek; kredi kullanılabilir. Sınırları bulalım mı?'))
              void run('Roboflow sınırları buluyor…', () => request<Detail>(`${path}/segment`, 'POST', { useDraftGuide: true, expectedDraftUpdatedAt: detail.draft!.updatedAt }), 'Roboflow taslağı hazır. Kenarları, kulpu ve logoyu kontrol et; ardından renkleri seçip onayla.')
          }}>Boyadığım bölgeyi Roboflow ile bul</button>
        </div>
        <div className="surface-panel">
          <label><input type="checkbox" checked={patternPreview} onChange={event => setPatternPreview(event.target.checked)} />Maske içinde örnek desen göster</label>
          <label>Önizleme rengi<select value={previewColor} disabled={!!busy || !!active || strokes.length > 0} onChange={event => setPreviewColor(event.target.value)}>{detail.colors.filter(color => color.width === detail.width && color.height === detail.height).map(color => <option key={color.variantId} value={color.variantId}>{color.color}</option>)}</select></label>
          <p>Örnek desen yalnızca maskenin kapladığı alanı gösterir. Fiziksel baskı çıktısı değildir.</p>
          <h3>Ortak maske uygulanacak renkler</h3>
          <p>Fotoğraflarda ürün aynı ölçekte, açıda ve konumda olmalı. Aynı piksel boyutu tek başına hizalama garantisi değildir. Mevcut renk maskeleri seçiminizle güncellenir.</p>
          {detail.colors.map(color => {
            const compatible = color.width === detail.width && color.height === detail.height
            return <label key={color.variantId}><input type="checkbox" checked={colors.includes(color.variantId)} disabled={!!busy || color.variantId === variantId || !compatible} onChange={event => setColors(current => event.target.checked ? [...current, color.variantId] : current.filter(id => id !== color.variantId))} />
              <img src={asset(color.image)} alt="" width={48} height={64} style={{ objectFit: 'contain' }} />{color.color}{!compatible && ' · Görsel boyutu farklı / okunamadı'}</label>
          })}
          <label><input type="checkbox" checked={samePlacement} disabled={!!busy} onChange={event => setSamePlacement(event.target.checked)} />Seçtiğim fotoğrafların aynı konumda olduğunu ve maske kenarları ile logo/kulp alanlarını kontrol ettim.</label>
          <button className="approve" disabled={!!busy || !!active || !detail.draft || strokes.length > 0 || !samePlacement} onClick={() => run('Renklere uygulanıyor…', () => request<Detail>(`${path}/approval/colors`, 'POST', { colors: detail.colors.filter(color => colors.includes(color.variantId)), samePlacementConfirmed: samePlacement, expectedDraftUpdatedAt: detail.draft!.updatedAt }), 'Ortak maske seçilen renklerde onaylandı. Her renk aynı bölgeye desen uygular.')}>Seçilen renklerde onayla</button>
        </div>
        <dl className="surface-facts">
          {detail.draft && <><dt>Taslak</dt><dd>{methodText(detail.draft.method)}{detail.draft.prompt ? ` · “${detail.draft.prompt}”` : ''}{detail.draft.score != null ? ` · skor ${detail.draft.score.toFixed(2)}` : ''}</dd></>}
          <dt>Roboflow</dt><dd>{detail.provider.configured ? `Bugün ${quota} çağrı` : 'Anahtar tanımlı değil; fırçayla çizebilirsin.'}</dd>
        </dl>
        {error && <p role="alert" className="surface-error">{error}</p>}
        {notice && <p role="status" className="surface-ok">{notice}</p>}
        <div className="surface-decisions">
          <button className="approve" disabled={!!busy || !detail.draft || strokes.length > 0} onClick={() => run('Onaylanıyor…', () => request<Detail>(`${path}/approval`, 'POST'), 'Maske onaylandı. Müşteri tasarımı bu renkte yalnız bu bölgeye uygulanır.')}>Taslağı onayla</button>
          {detail.draft && <button disabled={!!busy} onClick={() => run('Siliniyor…', () => request<Detail>(`${path}/draft`, 'DELETE'), 'Taslak silindi.')}>Taslağı sil</button>}
          {(detail.status === 'approved' || detail.status === 'stale') && <button className="danger" disabled={!!busy} onClick={() => { if (window.confirm('Onaylı maske kaldırılsın mı? Vitrin bu renkte genel önizlemeye döner.')) void run('Kaldırılıyor…', () => request<Detail>(`${path}/approval`, 'DELETE'), 'Onay kaldırıldı.') }}>Onayı kaldır</button>}
        </div>
        {strokes.length > 0 && <p className="surface-hint">Onaylamadan önce bekleyen fırça çizgilerini uygula ya da geri al.</p>}
      </div>
    </div>
  </div>
}
