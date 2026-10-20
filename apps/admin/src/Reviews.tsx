import { useEffect, useRef, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'
import {useAdminSession} from './AdminAccess'

type Review = { id: string; productId: string; authorName: string; rating: number; title?: string | null; body: string; color?: string | null; createdAt: string; status: 'pending' | 'approved' | 'rejected'; moderationNote?: string | null; storeReply?: string | null }
const statusText = { pending: 'Onay bekliyor', approved: 'Yayında', rejected: 'Reddedildi' } as const
const stars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

/** Review moderation: only approved reviews are public; the customer is notified of the decision. */
export default function Reviews({ productName }: { productName: (id: string) => string }) {
  const canWrite=useAdminSession()?.permissions.includes('content.write')??false
  const writing=useRef(false)
  const [loaded,setLoaded]=useState('')
  const [items, setItems] = useState<Review[]>([]), [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | ''>('pending'), [error, setError] = useState(''), [reload, setReload] = useState(0)
  const [notes, setNotes] = useState<Record<string, { note: string; reply: string }>>({}), [busy, setBusy] = useState('')
  useEffect(() => {
    let active = true
    commerceRequest<Review[]>(commerceApi, `/reviews${status ? `?status=${status}` : ''}`).then(value => { if (active) { setItems(value);setLoaded(`${status}:${reload}`); setError('') } }).catch(e => { if (active) {setItems([]);setLoaded(`${status}:${reload}`);setError(e instanceof Error ? e.message : 'Değerlendirmeler yüklenemedi.')} })
    return () => { active = false }
  }, [status, reload])
  async function moderate(review: Review, decision: 'approved' | 'rejected') {
    if(writing.current||!canWrite||error||loaded!==`${status}:${reload}`)return
    writing.current=true
    setBusy(review.id)
    try { await commerceRequest(commerceApi, `/reviews/${review.id}/moderation`, 'POST', { status: decision, note: notes[review.id]?.note || null, reply: notes[review.id]?.reply ?? review.storeReply ?? null }); setReload(value => value + 1) }
    catch (e) { setError(e instanceof Error ? e.message : 'İşlem yapılamadı.') }
    finally { writing.current=false;setBusy('') }
  }
  return <section aria-label="Ürün değerlendirmeleri">
    <p className="panel-notice">Yalnız ürünü teslim almış müşteriler değerlendirme yazabilir. Onaylananlar ürün sayfasında “Ayşe Y.” biçiminde yayınlanır; müşteri kararı bildirimle öğrenir. Kişisel veri, hakaret veya ürünle ilgisiz içerik varsa reddedin.</p>
    <div className="order-filters"><label>Durum<select value={status} onChange={event => setStatus(event.target.value as typeof status)}><option value="pending">Onay bekleyenler</option><option value="approved">Yayında</option><option value="rejected">Reddedilenler</option><option value="">Tümü</option></select></label></div>
    <button onClick={()=>setReload(value=>value+1)}>Yenile</button>
    {error && <p role="alert">{error} <button onClick={()=>setReload(value=>value+1)}>Tekrar dene</button></p>}
    {loaded!==`${status}:${reload}`&&!error&&<p role="status">Değerlendirmeler yükleniyor…</p>}
    {loaded===`${status}:${reload}`&&items.length === 0 && !error && <div className="empty-widget"><strong>Bu durumda değerlendirme yok</strong></div>}
    <div className="review-list">{(loaded===`${status}:${reload}`&&!error?items:[]).map(review => <article key={review.id} className="quote-detail">
      <h3>{productName(review.productId)} · <span aria-label={`5 üzerinden ${review.rating}`}>{stars(review.rating)}</span></h3>
      <p><strong>{review.title}</strong></p><p>{review.body}</p>
      <p className="muted">{review.authorName} · {review.color} · {new Date(review.createdAt).toLocaleString('tr-TR')} · <span className="order-state">{statusText[review.status]}</span></p>
      {review.storeReply && <p>Mağaza yanıtı: {review.storeReply}</p>}{review.moderationNote && <p>Not: {review.moderationNote}</p>}
      <label>Mağaza yanıtı (yayınlanır, isteğe bağlı)<textarea rows={2} maxLength={1000} value={notes[review.id]?.reply ?? review.storeReply ?? ''} onChange={event => setNotes(current => ({ ...current, [review.id]: { note: current[review.id]?.note ?? '', reply: event.target.value } }))} /></label>
      <label>Ret nedeni (müşteriye iletilir)<input maxLength={300} value={notes[review.id]?.note ?? ''} onChange={event => setNotes(current => ({ ...current, [review.id]: { reply: current[review.id]?.reply ?? review.storeReply ?? '', note: event.target.value } }))} /></label>
      <div className="dialog-actions"><button disabled={!canWrite||Boolean(busy)} onClick={() => void moderate(review, 'approved')}>{review.status === 'approved' ? 'Yanıtı güncelle' : 'Onayla ve yayınla'}</button>{review.status !== 'rejected' && <button disabled={!canWrite||Boolean(busy)} onClick={() => void moderate(review, 'rejected')}>Reddet</button>}</div>
    </article>)}</div>
  </section>
}
