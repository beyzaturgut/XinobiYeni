import { useEffect, useRef, useState } from 'react'
import { clickToSource, imageGeometry } from './source-coordinates'
import type { Point, ReviewState } from './product-surfaces-api'

export function SurfaceReviewPreview({ state, points, intent, correcting, onPoint, onReady }: {
  state: ReviewState; points: Point[]; intent: Point['intent']; correcting: boolean; onPoint: (p: Point) => void; onReady: (ready: boolean) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [assetState, setAssetState] = useState<'loading' | 'ready' | 'error'>('loading')
  const maskUrl = state.candidate?.maskUrl
  useEffect(() => {
    const element = ref.current!
    const observer = new ResizeObserver(() => setSize({ width: element.clientWidth, height: element.clientHeight }))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    let cancelled = false
    onReady(false)

    async function load() {
      try {
        const images = await Promise.all([state.sourceUrl, ...(maskUrl ? [maskUrl] : [])].map(async url => {
          const image = new Image(); image.src = url; await image.decode(); return image
        }))
        if (images.some(image => image.naturalWidth !== state.source.width || image.naturalHeight !== state.source.height)) throw new Error('dimensions')
        if (!CSS.supports('mask-image', 'url("test.png")') && !CSS.supports('-webkit-mask-image', 'url("test.png")')) throw new Error('mask support')
        if (!cancelled) { setAssetState('ready'); onReady(true) }
      } catch { if (!cancelled) { setAssetState('error'); onReady(false) } }
    }
    void load()
    return () => { cancelled = true }
  }, [state.sourceUrl, maskUrl, state.source.width, state.source.height, onReady])
  const geometry = imageGeometry(state.source.width, state.source.height, { left: 0, top: 0, ...size })
  return <div ref={ref} className="surface-preview" data-testid="surface-preview" aria-busy={assetState === 'loading'}
    onClick={event => {
      if (!correcting || assetState !== 'ready') return
      const rect = ref.current!.getBoundingClientRect()
      const point = clickToSource(event.clientX, event.clientY, state.source.width, state.source.height, rect)
      if (point) onPoint({ ...point, intent })
    }}>
    {assetState !== 'ready' && <p role={assetState === 'error' ? 'alert' : 'status'}>{assetState === 'error' ? 'Görsel veya maske görüntülenemedi. Sayfayı yeniden yükleyin.' : 'Görseller yükleniyor…'}</p>}
    {geometry && assetState === 'ready' && <div className="surface-image-rect" style={{ left: geometry.x, top: geometry.y, width: geometry.width, height: geometry.height }}>
      <img src={state.sourceUrl} alt="Çay Makinesi 101 lacivert yüzey incelemesi" draggable={false} />
      {state.candidate && <div className="surface-mask" data-testid="surface-mask" style={{ maskImage: `url("${state.candidate.maskUrl}")`, WebkitMaskImage: `url("${state.candidate.maskUrl}")` }} />}
      {points.map((point, index) => <span key={index} className={`surface-point ${point.intent}`} data-testid="surface-point" data-x={point.x} data-y={point.y}
        style={{ left: point.x * geometry.scale, top: point.y * geometry.scale }} aria-label={`${point.intent === 'keep' ? 'Koru' : 'Hariç tut'} noktası ${index + 1}`}>{point.intent === 'keep' ? '+' : '−'}</span>)}
    </div>}
  </div>
}
