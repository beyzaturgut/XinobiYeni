import { useCallback, useEffect, useRef, useState } from 'react'
import { ReviewError, reviewRequest, type MaskStroke, type Point, type ReviewState } from './product-surfaces-api'
import { SurfaceReviewPreview } from './SurfaceReviewPreview'
import { SurfaceMaskCorrection } from './SurfaceMaskCorrection'
import './product-surfaces.css'

export default function ProductSurfaceReview() {
  const [state, setState] = useState<ReviewState | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const [ready, setReady] = useState(false)
  const [correcting, setCorrecting] = useState(false)
  const [intent, setIntent] = useState<Point['intent']>('keep')
  const [points, setPoints] = useState<Point[]>([])
  const [notice, setNotice] = useState('')
  const [viewRaw, setViewRaw] = useState(false)
  const [localCorrection, setLocalCorrection] = useState(false)
  const [strokes, setStrokes] = useState<MaskStroke[]>([])
  const [strokeParent, setStrokeParent] = useState<string | null>(null)
  const [strokeState, setStrokeState] = useState<ReviewState | null>(null)
  const onReady = useCallback((value: boolean) => setReady(value), [])
  useEffect(() => {
    let cancelled = false
    reviewRequest('/review').then(value => { if (!cancelled) setState(value) }).catch(() => { if (!cancelled) setError('İnceleme yüklenemedi. API geliştirme opt-in ayarını ve bağlantıyı kontrol edin.') })
    return () => { cancelled = true }
  }, [])
  async function mutate(path: string, body: object, regenerate = false, manual = false) {
    if (!state || busyRef.current) return
    busyRef.current = true; setBusy(true); setError(''); setNotice('')
    try {
      setState(await reviewRequest(path, { sessionId: state.sessionId, expectedStateVersion: state.stateVersion, ...body }))
      setViewRaw(false)
      if (regenerate) { setPoints([]); setCorrecting(false) }
      if (manual) { setStrokes([]); setLocalCorrection(false); setStrokeParent(null) }
      setNotice(regenerate || manual ? 'Yeni aday inceleme bekliyor.' : 'İnceleme kararı kaydedildi (yalnız geliştirme oturumu).')
    } catch (failure) {
      // Provider failure also advances state version. Refresh without discarding unsent points.
      if (failure instanceof ReviewError) {
        try { setState(await reviewRequest('/review')) }
        catch { setReady(false) }
      }
      setError(failure instanceof ReviewError ? failure.message : 'Bağlantı kurulamadı. Noktalarınız korunuyor; yeniden deneyebilirsiniz.')
    } finally { busyRef.current = false; setBusy(false) }
  }
  if (!state) return <section className="surface-panel" aria-busy={!error}><p role={error ? 'alert' : 'status'}>{error || 'Yüzey incelemesi yükleniyor…'}</p>{error && <button onClick={() => window.location.reload()}>Yeniden yükle</button>}</section>
  const candidate = state.candidate
  const pending = candidate?.status === 'pending'
  const blocked = busy || !!state.operationInProgress
  const strokeParentChanged = localCorrection && strokeParent !== candidate?.candidateId
  const previewState = viewRaw && state.rawCandidate ? { ...state, candidate: state.rawCandidate } : state
  return <section className="surface-panel" aria-busy={busy}>
    <div className="panel-heading"><div><p>ÜRÜN / MEDYA ONBOARDING</p><h2>Çay Makinesi 101 · Lacivert</h2></div><span className="state">{!candidate ? 'Henüz aday yok' : candidate.status === 'pending' ? 'İnceleme bekliyor' : candidate.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}</span></div>
    <div className="surface-description"><p>{state.providerLabel || 'Yerel test sağlayıcısı — düzeltme noktaları kaydedilir; maske AI ile yeniden hesaplanmaz.'}</p><p>Onay: Bu ürün görselindeki kişiselleştirme önizlemesi için kullanılabilir yüzey maskesi. Fiziksel baskı alanı, DPI, üretim veya D04 onayı değildir.</p><small>Yalnız geliştirme · Bellekte kayıt · API yeniden başlatılırsa geçmiş silinir · Üretim kimlik doğrulaması yok.</small></div>
    {state.rawCandidate && <div className="surface-description">
      <p data-testid="refinement-target">{state.correction ? 'Karar hedefi: Yerel düzeltilmiş aday — insan onayı bekler.' : state.derivation ? `Karar hedefi: Düzenlenmiş aday${pending ? ' — insan onayı bekler.' : '.'}` : 'Ham sağlayıcı adayı inceleniyor.'}</p>
      {state.derivation && <><p>{state.derivation.holesFilled} kapalı bölge dolduruldu · {state.derivation.pixelsFilled.toLocaleString('tr-TR')} piksel</p>
        <div className="surface-actions surface-comparison" role="group" aria-label="Maske karşılaştırması"><button disabled={blocked || localCorrection} aria-pressed={viewRaw} onClick={() => setViewRaw(true)}>Ham</button><button disabled={blocked || localCorrection} aria-pressed={!viewRaw} onClick={() => setViewRaw(false)}>Düzenlenmiş</button></div>
        {viewRaw && <p>Ham maske yalnız karşılaştırma için gösteriliyor. Karar vermek için Düzenlenmiş görünümüne dönün; onay hedefi değişmez.</p>}</>}
    </div>}
    {!localCorrection && <SurfaceReviewPreview key={previewState.candidate?.maskUrl || state.sourceUrl} state={previewState} points={points} intent={intent} correcting={correcting && !blocked && !viewRaw} onPoint={point => setPoints(current => current.length < 100 ? [...current, point] : current)} onReady={onReady} />}
    {localCorrection && candidate && <>
      {strokeParentChanged && <p role="alert">Aday değişti. Düzeltmeler korunuyor; farklı adaya gönderilmez. Düzeltmeleri bırakarak güncel adayı inceleyin.</p>}
      <SurfaceMaskCorrection key={strokeParent!} state={strokeState!} strokes={strokes} onStrokes={setStrokes} disabled={blocked || strokeParentChanged} allowDiscard={!blocked}
        onDiscard={() => { setStrokes([]); setLocalCorrection(false); setStrokeParent(null) }}
        onCreate={() => { if (!strokeParentChanged) void mutate(`/revisions/${candidate.revisionId}/candidates/${candidate.candidateId}/correct`, { operations: strokes }, false, true) }} />
    </>}
    <div className="surface-controls">
      {candidate && <><p data-testid="candidate-id">Aday: {candidate.candidateId}</p><small>Revizyon: {candidate.revisionId} · {candidate.mode === 'manualcorrection' ? 'Yerel düzeltilmiş aday' : candidate.mode === 'refinement' ? 'Düzenlenmiş aday' : candidate.mode === 'automatic' ? 'Otomatik aday' : 'Nokta istemi adayı'} · {state.revisionCount} revizyon</small></>}
      {state.correction && <p>Yerel insan düzeltmesi · {state.correction.operations.length} işlem · Yeni aday ayrıca inceleme bekler.</p>}
      {state.activeApproval && <p>Aktif onay: {state.activeApproval.candidateId}</p>}
      {correcting && <fieldset disabled={blocked}><legend>Düzeltme noktaları</legend><div className="surface-actions"><button aria-pressed={intent === 'keep'} onClick={() => setIntent('keep')}>Koru (+)</button><button aria-pressed={intent === 'exclude'} onClick={() => setIntent('exclude')}>Hariç tut (-)</button></div>
        <p aria-live="polite">Koru: {points.filter(p => p.intent === 'keep').length} · Hariç tut: {points.filter(p => p.intent === 'exclude').length}</p>
        <div className="surface-actions"><button disabled={!points.length} onClick={() => setPoints(current => current.slice(0, -1))}>Son noktayı kaldır</button><button disabled={!points.length} onClick={() => setPoints([])}>Noktaları temizle</button><button onClick={() => { setPoints([]); setCorrecting(false) }}>Düzeltmeyi iptal et</button></div>
        <p>Görsele tıklayın; noktalar yalnız “Adayı yeniden oluştur” ile gönderilir.</p>
      </fieldset>}
      <div className="surface-actions">
        {state.operationInProgress && <button onClick={() => void reviewRequest('/review').then(setState).catch(() => setError('Güncel inceleme yüklenemedi.'))}>Güncel durumu yükle</button>}
        {!candidate && <button disabled={blocked || !ready} onClick={() => void mutate('/revisions', { mode: 'automatic' }, true)}>Aday oluştur</button>}
        <button disabled={blocked || !ready || correcting || localCorrection || viewRaw || !pending} onClick={() => candidate && void mutate(`/revisions/${candidate.revisionId}/candidates/${candidate.candidateId}/review`, { outcome: 'approve' })}>Onayla</button>
        <button disabled={blocked || !ready || correcting || localCorrection || viewRaw || !pending} onClick={() => candidate && void mutate(`/revisions/${candidate.revisionId}/candidates/${candidate.candidateId}/review`, { outcome: 'reject' })}>Reddet</button>
        {state.refinementAvailable && candidate && <button disabled={blocked || !ready || correcting || localCorrection} onClick={() => void mutate(`/revisions/${candidate.revisionId}/candidates/${candidate.candidateId}/refine`, {}, true)}>Kapalı bölgeyi düzenle</button>}
        {candidate && !correcting && !localCorrection && !state.rawCandidate && <button disabled={blocked || !ready} onClick={() => setCorrecting(true)}>Düzelt</button>}
        {candidate && !correcting && !localCorrection && <button disabled={blocked || !ready || viewRaw} onClick={() => { setStrokeParent(candidate.candidateId); setStrokeState(state); setLocalCorrection(true) }}>Yerel maske düzelt</button>}
        {candidate && correcting && <button disabled={blocked || !ready || !points.length} onClick={() => void mutate('/revisions', { mode: 'interactive', previousRevisionId: candidate.revisionId, previousCandidateId: candidate.candidateId, points }, true)}>Adayı yeniden oluştur</button>}
      </div>
      {busy && <p role="status">İşlem sürüyor…</p>}{error && <p role="alert">{error}</p>}<p aria-live="polite">{notice}</p>
    </div>
  </section>
}
