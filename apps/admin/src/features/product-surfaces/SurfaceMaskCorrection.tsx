import { useEffect, useMemo, useRef, useState } from 'react'
import { correctionGeometry, correctionToSource } from './source-coordinates'
import type { MaskStroke, ReviewState } from './product-surfaces-api'

// Local preview only. Authoritative PNG always comes back from the backend as a new candidate.
export function paint(data: Uint8ClampedArray, w: number, h: number, strokes: MaskStroke[]) {
  let visits = 0
  for (const stroke of strokes) for (let i = 0; i < Math.max(1, stroke.points.length - 1); i++) {
    const a = stroke.points[i], b = stroke.points[Math.min(i + 1, stroke.points.length - 1)]
    const vx = b.x - a.x, vy = b.y - a.y, length2 = vx * vx + vy * vy, r = stroke.radius
    visits += (Math.min(w - 1, Math.ceil(Math.max(a.x, b.x) + r)) - Math.max(0, Math.floor(Math.min(a.x, b.x) - r)) + 1) *
      (Math.min(h - 1, Math.ceil(Math.max(a.y, b.y) + r)) - Math.max(0, Math.floor(Math.min(a.y, b.y) - r)) + 1)
    if (visits > 25_000_000) throw new Error('preview work limit')
    for (let y = Math.max(0, Math.floor(Math.min(a.y, b.y) - r)); y <= Math.min(h - 1, Math.ceil(Math.max(a.y, b.y) + r)); y++)
      for (let x = Math.max(0, Math.floor(Math.min(a.x, b.x) - r)); x <= Math.min(w - 1, Math.ceil(Math.max(a.x, b.x) + r)); x++) {
        const px = x + .5, py = y + .5
        const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / length2))
        if ((px - a.x - t * vx) ** 2 + (py - a.y - t * vy) ** 2 <= r * r)
          data[(y * w + x) * 4 + 3] = stroke.operation === 'add' ? 255 : 0
      }
  }
}

export function SurfaceMaskCorrection({ state, strokes, onStrokes, disabled, allowDiscard, onCreate, onDiscard }: {
  state: ReviewState; strokes: MaskStroke[]; onStrokes: (value: MaskStroke[]) => void; disabled: boolean;
  allowDiscard: boolean; onCreate: () => void; onDiscard: () => void
}) {
  const viewport = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null)
  const [base, setBase] = useState<ImageData | null>(null)
  const active = useRef<MaskStroke | null>(null)
  const dragging = useRef<{ id: number; x: number; y: number; pan: { x: number; y: number } } | null>(null)
  const [draft, setDraft] = useState<MaskStroke | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [tool, setTool] = useState<'add' | 'remove' | 'pan'>('add')
  const [radius, setRadius] = useState(4), [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [loaded, setLoaded] = useState(false), [error, setError] = useState('')
  const source = state.source, maskUrl = state.candidate!.maskUrl
  useEffect(() => {
    const el = viewport.current!
    const observer = new ResizeObserver(() => setSize({ width: el.clientWidth, height: el.clientHeight }))
    observer.observe(el); return () => observer.disconnect()
  }, [])
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const images = await Promise.all([state.sourceUrl, maskUrl].map(async url => { const img = new Image(); img.src = url; await img.decode(); return img }))
        if (images.some(img => img.naturalWidth !== source.width || img.naturalHeight !== source.height)) throw new Error('dimensions')
        const buffer = document.createElement('canvas'); buffer.width = source.width; buffer.height = source.height
        const ctx = buffer.getContext('2d', { willReadFrequently: true })!
        ctx.drawImage(images[1], 0, 0); const pixels = ctx.getImageData(0, 0, source.width, source.height)
        if (!cancelled) { setBase(pixels); setLoaded(true) }
      } catch { if (!cancelled) setError('Düzeltme görseli yüklenemedi.') }
    }
    void load(); return () => { cancelled = true }
  }, [maskUrl, state.sourceUrl, source.width, source.height])
  const preview = useMemo(() => {
    if (!base) return null
    const data = new Uint8ClampedArray(base.data)
    try { paint(data, source.width, source.height, [...strokes, ...(draft ? [draft] : [])]) }
    catch { return { pixels: null, error: 'Düzeltme önizleme sınırı aşıldı. Son işlemi geri alın veya düzeltmeleri temizleyin.' } }
    // Pink alpha overlay; no source photograph pixels are changed.
    for (let i = 0; i < data.length; i += 4) { data[i] = 220; data[i + 1] = 55; data[i + 2] = 135; data[i + 3] = Math.round(data[i + 3] * .45) }
    return { pixels: new ImageData(data, source.width, source.height), error: '' }
  }, [base, strokes, draft, source.width, source.height])
  useEffect(() => {
    if (preview?.pixels && canvas.current) canvas.current.getContext('2d')!.putImageData(preview.pixels, 0, 0)
  }, [preview, size.width, size.height])
  const previewError = preview?.error || error
  const g = correctionGeometry(source.width, source.height, { left: 0, top: 0, ...size }, zoom, pan)
  const total = strokes.reduce((n, s) => n + s.points.length, 0)
  const locked = disabled || drawing
  function point(x: number, y: number) {
    return correctionToSource(x, y, source.width, source.height, viewport.current!.getBoundingClientRect(), zoom, pan)
  }
  function finishSegment() {
    const stroke = active.current
    if (stroke) onStrokes([...strokes, stroke])
    active.current = null; setDraft(null)
  }
  return <div className="surface-local-correction">
    <fieldset disabled={locked} className="surface-correction-tools"><legend>Yerel maske düzeltmesi</legend>
      <p>Ekle/Sil yalnız yerel önizlemeyi değiştirir. Yeni aday oluşturmak ayrı işlemdir; AI çağrısı yapılmaz.</p>
      <div className="surface-actions" role="group" aria-label="Fırça araçları">
        <button aria-pressed={tool === 'add'} onClick={() => setTool('add')}>Ekle</button>
        <button aria-pressed={tool === 'remove'} onClick={() => setTool('remove')}>Sil</button>
        <button aria-pressed={tool === 'pan'} onClick={() => setTool('pan')}>Gezin</button>
        <label>Fırça yarıçapı <select aria-label="Fırça yarıçapı" value={radius} onChange={e => setRadius(Number(e.target.value))}>{[2, 4, 8, 16].map(r => <option key={r} value={r}>{r} px</option>)}</select></label>
      </div>
      <div className="surface-actions"><label>Yakınlaştır <input aria-label="Yakınlaştır" type="range" min="1" max="8" step=".5" value={zoom} onChange={e => setZoom(Number(e.target.value))} /></label><span>{zoom}×</span>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>Görünümü sıfırla</button>
        <button disabled={!strokes.length} onClick={() => onStrokes(strokes.slice(0, -1))}>Geri al</button>
        <button disabled={!strokes.length} onClick={() => onStrokes([])}>Kaydedilmemiş düzeltmeleri temizle</button>
      </div>
    </fieldset>
    <div ref={viewport} className={`surface-preview surface-correction-viewport ${tool === 'pan' ? 'panning' : ''}`} data-testid="mask-correction-viewport"
      onPointerDown={e => {
        if (disabled || !loaded || e.button !== 0) return
        if (tool === 'pan' && zoom > 1) { dragging.current = { id: e.pointerId, x: e.clientX, y: e.clientY, pan }; setDrawing(true); e.currentTarget.setPointerCapture(e.pointerId); return }
        if (tool === 'pan' || strokes.length >= 100 || total >= 5000) return
        const p = point(e.clientX, e.clientY); if (!p) return
        active.current = { operation: tool, radius, points: [p] }; setDraft(active.current); setDrawing(true)
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={e => {
        const p = point(e.clientX, e.clientY)
        setCursor(p ? { x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top } : null)
        if (dragging.current?.id === e.pointerId) { const d = dragging.current; setPan({ x: d.pan.x + e.clientX - d.x, y: d.pan.y + e.clientY - d.y }); return }
        if (!active.current) return
        // Stop the segment on exit: no clamping, no bridge across exterior/re-entry.
        if (!p) { finishSegment(); return }
        const s = active.current
        if (s.points.length >= 2000 || total + s.points.length >= 5000) return
        active.current = { ...s, points: [...s.points, p] }; setDraft(active.current)
      }}
      onPointerUp={e => { finishSegment(); setDrawing(false); dragging.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId) }}
      onPointerCancel={() => { finishSegment(); setDrawing(false); dragging.current = null }}
      onPointerLeave={() => setCursor(null)}>
      {!loaded && <p role={error ? 'alert' : 'status'}>{error || 'Düzeltme görseli yükleniyor…'}</p>}
      {g && loaded && <div className="surface-image-rect" style={{ left: g.x, top: g.y, width: g.width, height: g.height }}>
        <img src={state.sourceUrl} alt="Yerel düzeltme için ürün görseli" draggable={false} />
        <canvas ref={canvas} width={source.width} height={source.height} data-testid="mask-correction-canvas" aria-label="Kaydedilmemiş maske düzeltmesi önizlemesi" />
      </div>}
      {cursor && g && tool !== 'pan' && <span className={`surface-brush-cursor ${tool}`} style={{ left: cursor.x, top: cursor.y, width: radius * g.scale * 2, height: radius * g.scale * 2 }} />}
    </div>
    <div className="surface-controls"><p aria-live="polite" data-testid="stroke-count">{strokes.length} kaydedilmemiş işlem · {total} kaynak noktası</p>
      {loaded && previewError && <p role="alert">{previewError}</p>}
      <div className="surface-actions"><button disabled={locked || !loaded || !!previewError || !strokes.length} onClick={onCreate}>Yeni düzeltilmiş aday oluştur</button><button disabled={!allowDiscard || drawing} onClick={onDiscard}>Düzeltmeleri bırak ve çık</button></div>
      <small>Onay hedefi mevcut adaydır; kaydedilmemiş düzeltmeler varken karar verilemez. Yeni aday ayrıca insan onayı bekler.</small>
    </div>
  </div>
}
