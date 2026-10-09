import { useEffect, useRef, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'

/** Design images on order lines are served by the panel API with the staff session. */
const designUrl = (path: string) => commerceApi.replace(/\/api\/v1\/local-commerce\/?$/, '') + path
type Money = { amountMinor: number; currency: string }
type Line = { productId: string; variantId: string; name: string; color: string; quantity: number; unitPrice: Money; lineTotal: Money; personalization?: { designId: string; kind: 'ai' | 'upload'; name: string; imageUrl?: string | null } | null }
type Address = { title: string; fullName: string; phone: string; city: string; district: string; line: string; postalCode?: string | null }
type Shipment = { carrier: string; trackingNumber: string; trackingUrl?: string | null; shippedAt: string; deliveredAt?: string | null }
type OrderEvent = { status: string; at: string; actor: string; note?: string | null }
type OrderRequest = { id: string; type: 'cancel' | 'return'; status: string; reason: string; description?: string | null; lines: { variantId: string; quantity: number }[]; createdAt: string; resolution?: string | null }
type Order = { id: string; number: string; createdAt: string; status: string; address: Address; lines: Line[]; total: Money; shipment?: Shipment | null; history?: OrderEvent[] | null; requests?: OrderRequest[] | null }
type StaffOrder = { order: Order; accountId: string; customerName: string; customerEmail: string; customerPhone?: string | null }
type Options = { carriers: string[]; returnWindowDays: number }

const statusText: Record<string, string> = { received: 'Yeni', preparing: 'Hazırlanıyor', shipped: 'Kargoda', delivered: 'Teslim edildi', cancelled: 'İptal edildi', returned: 'İade edildi' }
const requestText: Record<string, string> = { requested: 'Bekliyor', approved: 'Onaylandı', rejected: 'Reddedildi', completed: 'Tamamlandı' }
const money = (value: Money) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: value.currency }).format(value.amountMinor / 100)
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const phone = (value?: string | null) => value?.startsWith('+90') ? `0${value.slice(3, 6)} ${value.slice(6, 9)} ${value.slice(9, 11)} ${value.slice(11)}` : value ?? '—'
const openRequests = (order: Order) => order.requests?.filter(item => item.status === 'requested' || item.status === 'approved') ?? []

/** Order desk: every customer's demo order with shipping, status changes and cancel/return decisions. Each change notifies the customer. */
export default function Orders() {
  const [items, setItems] = useState<StaffOrder[]>([]), [options, setOptions] = useState<Options | null>(null)
  const [query, setQuery] = useState(''), [status, setStatus] = useState('Tümü'), [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState(commerceApi ? '' : 'Sipariş API adresi yapılandırılmadı.'), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [reload, setReload] = useState(0)
  const [carrier, setCarrier] = useState(''), [tracking, setTracking] = useState(''), [trackingUrl, setTrackingUrl] = useState(''), [note, setNote] = useState('')
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    if (!commerceApi) return
    let active = true
    const fetchOnce = () => commerceRequest<StaffOrder[]>(commerceApi, '/orders')
      .then(value => { if (active) { setItems(value); setError('') } })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : 'Siparişler yüklenemedi.') })
    void fetchOnce()
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void fetchOnce() }, 15000)
    return () => { active = false; window.clearInterval(timer) }
  }, [reload])
  useEffect(() => { if (commerceApi) commerceRequest<Options>(commerceApi, '/order-options').then(setOptions).catch(() => {}) }, [])
  const load = () => setReload(value => value + 1)
  const selected = items.find(item => item.order.id === selectedId) ?? null
  const filtered = items.filter(({ order, customerName, customerEmail }) =>
    (status === 'Tümü' || (status === 'Açık talep' ? openRequests(order).length > 0 : statusText[order.status] === status)) &&
    `${order.number} ${customerName} ${customerEmail} ${order.lines.map(line => line.name).join(' ')}`.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')))
  async function act(route: string, body: unknown, done: string) {
    if (!selected || busy) return
    setBusy(true); setNotice('')
    try {
      await commerceRequest(commerceApi, `/orders/${encodeURIComponent(selected.order.id)}${route}`, 'POST', body)
      load(); setNotice(done + ' Müşteriye bildirim gönderildi.'); setNote('')
    } catch (e) { setNotice(e instanceof Error ? e.message : 'İşlem yapılamadı.') }
    finally { setBusy(false) }
  }
  function open(id: string, button: HTMLButtonElement) { trigger.current = button; setSelectedId(id); setNotice(''); setCarrier(''); setTracking(''); setTrackingUrl(''); setNote(''); dialog.current?.showModal() }
  function close() { dialog.current?.close(); trigger.current?.focus() }
  const order = selected?.order
  return <section aria-label="Sipariş listesi">
    <div className="order-filters"><label>Sipariş veya müşteri ara<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Sipariş no, müşteri, e-posta, ürün" /></label><label htmlFor="order-status">Durum<select id="order-status" value={status} onChange={event => setStatus(event.target.value)}>{['Tümü', 'Açık talep', ...Object.values(statusText)].map(item => <option key={item}>{item}</option>)}</select></label><button onClick={() => { setQuery(''); setStatus('Tümü') }}>Filtreleri temizle</button><button onClick={load}>Yenile</button></div>
    {error && <p role="alert">{error}</p>}
    <p role="status">{filtered.length} sipariş · Demo siparişlerde ödeme alınmaz; kargo ve iade adımları müşteriye bildirilir.</p>
    <div className="table-scroll"><table><caption>Web ve mobil siparişleri</caption><thead><tr>{['Sipariş', 'Müşteri', 'Tarih', 'Durum', 'Talep', 'Tutar', 'İşlem'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
      <tbody>{filtered.map(({ order, customerName, customerEmail }) => <tr key={order.id}><th scope="row">{order.number}</th><td>{customerName}<br /><small>{customerEmail}</small></td><td>{date(order.createdAt)}</td><td><span className="order-state">{statusText[order.status] ?? order.status}</span></td><td>{openRequests(order).map(item => <span className="order-state" key={item.id}>{item.type === 'cancel' ? 'İptal' : 'İade'} · {requestText[item.status]}</span>)}</td><td>{money(order.total)}</td><td><button aria-label={`${order.number} detayını aç`} onClick={event => open(order.id, event.currentTarget)}>İncele</button></td></tr>)}</tbody></table></div>
    {filtered.length === 0 && !error && <div className="empty-widget"><strong>{items.length ? 'Filtrelere uygun sipariş yok' : 'Henüz sipariş yok'}</strong><p>{items.length ? 'Aramayı veya durum seçimini değiştirin.' : 'Web veya mobilden verilen siparişler burada görünür.'}</p></div>}
    <dialog ref={dialog} className="order-dialog" aria-labelledby="order-detail-title" onClose={() => trigger.current?.focus()} onCancel={event => { event.preventDefault(); close() }}>
      <header className="dialog-heading"><h2 id="order-detail-title">{order?.number ?? 'Sipariş'}</h2><button onClick={close} aria-label="Sipariş detayını kapat">×</button></header>
      {selected && order && <div className="dialog-body">
        <span className="order-state">{statusText[order.status] ?? order.status}</span>
        <dl><div><dt>Müşteri</dt><dd>{selected.customerName} · {selected.customerEmail} · {phone(selected.customerPhone)}</dd></div><div><dt>Teslimat</dt><dd>{order.address.fullName} · {phone(order.address.phone)} · {order.address.line}, {order.address.district}/{order.address.city}</dd></div><div><dt>Tutar</dt><dd>{money(order.total)}</dd></div>{order.shipment && <div><dt>Kargo</dt><dd>{order.shipment.carrier} · {order.shipment.trackingNumber}{order.shipment.deliveredAt ? ` · teslim ${date(order.shipment.deliveredAt)}` : ''}</dd></div>}</dl>
        <ul className="order-lines">{order.lines.map((line, index) => <li key={index}>{line.name} · {line.color} · {line.quantity} adet · {money(line.lineTotal)}{line.personalization && <div className="order-design">{line.personalization.imageUrl && <a href={designUrl(line.personalization.imageUrl)} target="_blank" rel="noreferrer"><img src={designUrl(line.personalization.imageUrl)} alt={`${line.personalization.name} tasarımı`} /></a>}<span>Kişiselleştirilmiş · {line.personalization.kind === 'ai' ? 'AI tasarımı' : 'Müşteri görseli'}: <strong>{line.personalization.name}</strong> · Temsilidir; üretim dosyası ayrıca kontrol edilir.</span></div>}</li>)}</ul>
        {order.requests?.map(request => <div className="quote-detail" key={request.id}><h3>{request.type === 'cancel' ? 'İptal talebi' : 'İade talebi'} · {requestText[request.status]}</h3><p>{request.reason}{request.description ? ` — ${request.description}` : ''}</p>{request.type === 'return' && <p>Ürünler: {request.lines.map(line => `${order.lines.find(item => item.variantId === line.variantId)?.name ?? line.variantId} × ${line.quantity}`).join(', ')}</p>}{request.resolution && <p>Not: {request.resolution}</p>}
          {request.status === 'requested' && <div className="dialog-actions"><button disabled={busy} onClick={() => void act(`/requests/${request.id}`, { decision: 'approve', resolution: note || null }, request.type === 'cancel' ? 'Sipariş iptal edildi.' : 'İade onaylandı.')}>{request.type === 'cancel' ? 'İptali onayla' : 'İadeyi onayla'}</button><button disabled={busy} onClick={() => void act(`/requests/${request.id}`, { decision: 'reject', resolution: note || null }, 'Talep reddedildi.')}>Reddet</button></div>}
          {request.status === 'approved' && <div className="dialog-actions"><button disabled={busy} onClick={() => void act(`/requests/${request.id}`, { decision: 'complete', resolution: note || null }, 'İade tamamlandı.')}>Ürün depoya ulaştı · iadeyi tamamla</button></div>}
        </div>)}
        <label>Not (müşteriye iletilir, isteğe bağlı)<textarea rows={2} maxLength={500} value={note} onChange={event => setNote(event.target.value)} /></label>
        {(order.status === 'received' || order.status === 'preparing') && <form className="catalog-form" onSubmit={event => { event.preventDefault(); void act('/shipment', { carrier, trackingNumber: tracking, trackingUrl: trackingUrl || null }, 'Sipariş kargoya verildi.') }}>
          <h3>Kargoya ver</h3>
          <label>Kargo firması<select required value={carrier} onChange={event => setCarrier(event.target.value)}><option value="">Seç</option>{options?.carriers.map(item => <option key={item}>{item}</option>)}</select></label>
          <label>Takip numarası<input required value={tracking} onChange={event => setTracking(event.target.value)} maxLength={40} /></label>
          <label>Takip bağlantısı (isteğe bağlı, https://)<input type="url" value={trackingUrl} onChange={event => setTrackingUrl(event.target.value)} maxLength={500} /></label>
          <button disabled={busy}>Kargoya verildi olarak işaretle</button>
        </form>}
        <div className="dialog-actions">
          {order.status === 'received' && <button disabled={busy} onClick={() => void act('/status', { status: 'preparing', note: note || null }, 'Sipariş hazırlanıyor.')}>Hazırlanmaya başla</button>}
          {order.status === 'shipped' && <button disabled={busy} onClick={() => void act('/status', { status: 'delivered', note: note || null }, 'Sipariş teslim edildi.')}>Teslim edildi</button>}
          {(order.status === 'received' || order.status === 'preparing') && <button disabled={busy} onClick={() => { if (window.confirm(`${order.number} iptal edilsin mi?`)) void act('/status', { status: 'cancelled', note: note || null }, 'Sipariş iptal edildi.') }}>Siparişi iptal et</button>}
        </div>
        {notice && <p role="status">{notice}</p>}
        <h3>Geçmiş</h3>
        <ol className="order-history">{(order.history ?? []).map((item, index) => <li key={index}>{date(item.at)} · {statusText[item.status] ?? item.status} · {item.actor === 'customer' ? 'Müşteri' : 'Panel'}{item.note ? ` · ${item.note}` : ''}</li>)}</ol>
      </div>}
    </dialog>
  </section>
}
