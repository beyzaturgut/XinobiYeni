import { useEffect, useRef, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'
import {useAdminSession} from './AdminAccess'
import type {components} from '../../../packages/clients/typescript/src/schema'
type DesignPlacement=components['schemas']['DesignPlacement']
import { adminCall } from './admin-api'

/** Design images on order lines are served by the panel API with the staff session. */
const designUrl = (path: string) => commerceApi.replace(/\/api\/v1\/local-commerce\/?$/, '') + path
type Money = { amountMinor: number; currency: string }
type Line = { productId: string; variantId: string; name: string; color: string; quantity: number; unitPrice: Money; lineTotal: Money; personalization?: { designId: string; kind: 'ai' | 'upload'; name: string; imageUrl?: string | null; placement?: DesignPlacement | null; schemaVersion?:number|null;configurationId?:string|null;configurationRevision?:number|null;sourceSha256?:string|null;sku?:string|null } | null }
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

/** Order desk: customer orders with shipping, status changes and cancel/return decisions. Each change notifies the customer. */
export default function Orders({ requestedOrderId = '', onClearRequested, onBackToDesign }: { requestedOrderId?: string; onClearRequested?: () => void; onBackToDesign?: () => void }) {
  const permissions=useAdminSession()?.permissions??[]
  const canWrite=permissions.includes('orders.write'),canCancel=permissions.includes('orders.cancel')
  const writing=useRef(false)
  const orderVersion=useRef(0), optionsVersion=useRef(0), refreshButton=useRef<HTMLButtonElement>(null)
  const [items, setItems] = useState<StaffOrder[]>([]), [options, setOptions] = useState<Options | null>(null)
  const [designFilter,setDesignFilter]=useState('all')
  const [query, setQuery] = useState(''), [status, setStatus] = useState('Tümü'), [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState(commerceApi ? '' : 'Sipariş API adresi yapılandırılmadı.'), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(Boolean(commerceApi))
  const [optionsLoading, setOptionsLoading] = useState(Boolean(commerceApi)), [optionsError, setOptionsError] = useState(''), [optionsReload, setOptionsReload] = useState(0)
  const [carrier, setCarrier] = useState(''), [tracking, setTracking] = useState(''), [trackingUrl, setTrackingUrl] = useState(''), [note, setNote] = useState('')
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement | null>(null)
  const [direct, setDirect] = useState<{ id: string; data?: StaffOrder; error?: string } | null>(null), [directReload, setDirectReload] = useState(0)
  const directVersion = useRef(0)
  const canRead = permissions.includes('orders.read')
  useEffect(() => {
    if (!requestedOrderId || !canRead) return
    let active = true
    const version = ++directVersion.current
    dialog.current?.showModal()
    void adminCall<StaffOrder>(`/admin/orders/${encodeURIComponent(requestedOrderId)}`)
      .then(data => { if (active && version === directVersion.current) {
        if (data.order.id !== requestedOrderId.replaceAll('-', '').toLowerCase()) throw new Error('Sipariş yanıtı seçilen kayıtla eşleşmiyor.')
        setDirect({ id: requestedOrderId, data })
      } })
      .catch(problem => { if (active && version === directVersion.current) setDirect({ id: requestedOrderId, error: (problem as { status?: number })?.status === 404 ? 'Sipariş bulunamadı.' : problem instanceof Error ? problem.message : 'Sipariş detayı yüklenemedi.' }) })
    return () => { active = false }
  }, [requestedOrderId, directReload, canRead])
  function retryDirect() { directVersion.current++; setDirect(null); setDirectReload(value => value + 1) }
  const directLoading = Boolean(requestedOrderId && canRead && direct?.id !== requestedOrderId)
  const directError = direct?.id === requestedOrderId ? direct.error : ''
  useEffect(() => {
    if (!commerceApi) return
    let active = true
    const fetchOnce = () => {const request=++orderVersion.current;setLoading(true);setError('');return commerceRequest<StaffOrder[]>(commerceApi, '/orders')
      .then(value => { if (active&&request===orderVersion.current) { setItems(value); setError('') } })
      .catch(e => { if (active&&request===orderVersion.current) setError(e instanceof Error ? e.message : 'Siparişler yüklenemedi.') })
      .finally(() => { if (active&&request===orderVersion.current) setLoading(false) })}
    void fetchOnce()
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void fetchOnce() }, 15000)
    return () => { active = false; window.clearInterval(timer) }
  }, [reload])
  useEffect(() => {
    if (!commerceApi) return
    let active = true
    const request=++optionsVersion.current
    commerceRequest<Options>(commerceApi, '/order-options')
      .then(value => { if (active&&request===optionsVersion.current) {
        if (!Array.isArray(value.carriers) || value.carriers.length === 0) throw new Error('Kargo seçenekleri kullanılamıyor.')
        setOptions(value);setOptionsError('')
      } })
      .catch(e => { if (active&&request===optionsVersion.current) {setOptions(null);setOptionsError(e instanceof Error ? e.message : 'Sipariş seçenekleri yüklenemedi.')} })
      .finally(() => { if (active&&request===optionsVersion.current) setOptionsLoading(false) })
    return () => { active = false }
  }, [optionsReload])
  const load = () => {orderVersion.current++;setLoading(true);setError('');setReload(value => value + 1);if(requestedOrderId)retryDirect()}
  const retryOptions = () => {optionsVersion.current++;setOptions(null);setOptionsLoading(true);setOptionsError('');setOptionsReload(value => value + 1)}
  const ready = !loading && !error
  const actionsDisabled = busy || !ready || directLoading || Boolean(directError)
  const selected = requestedOrderId ? (canRead && direct?.id === requestedOrderId ? direct.data ?? null : null) : items.find(item => item.order.id === selectedId) ?? null
  const filtered = items.filter(({ order, customerName, customerEmail }) =>
    (designFilter==='all'||order.lines.some(line=>designFilter==='personalized'?Boolean(line.personalization):line.personalization?.kind===designFilter)) &&
    (status === 'Tümü' || (status === 'Açık talep' ? openRequests(order).length > 0 : statusText[order.status] === status)) &&
    `${order.number} ${customerName} ${customerEmail} ${order.lines.map(line => line.name).join(' ')}`.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')))
  async function act(route: string, body: unknown, done: string) {
    if (!selected || writing.current || !ready || (route === '/shipment' && (optionsLoading || optionsError || !options)) || !(route.startsWith('/requests/')?canCancel:canWrite)) return
    writing.current=true
    setBusy(true); setNotice('')
    try {
      await commerceRequest(commerceApi, `/orders/${encodeURIComponent(selected.order.id)}${route}`, 'POST', body)
      load(); setNotice(done + ' Bildirim kuyruğa alındı; teslim durumu bildirim kayıtlarından izlenir.'); setNote('')
    } catch (e) { setNotice(e instanceof Error ? e.message : 'İşlem yapılamadı.') }
    finally { writing.current=false;setBusy(false) }
  }
  function open(id: string, button: HTMLButtonElement) { onClearRequested?.(); trigger.current = button; setSelectedId(id); setNotice(''); setCarrier(''); setTracking(''); setTrackingUrl(''); setNote(''); dialog.current?.showModal() }
  function restoreFocus() { (trigger.current?.isConnected ? trigger.current : refreshButton.current)?.focus() }
  function close() { directVersion.current++; onClearRequested?.(); dialog.current?.close(); restoreFocus() }
  const order = selected?.order
  return <section aria-label="Sipariş listesi">
    <div className="order-filters"><label>Sipariş veya müşteri ara<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Sipariş no, müşteri, e-posta, ürün" /></label><label htmlFor="order-status">Durum<select id="order-status" value={status} onChange={event => setStatus(event.target.value)}>{['Tümü', 'Açık talep', ...Object.values(statusText)].map(item => <option key={item}>{item}</option>)}</select></label><label>Kişiselleştirme<select value={designFilter} onChange={e=>setDesignFilter(e.target.value)}>{[['all','Tümü'],['personalized','Kişiselleştirilmiş'],['ai','AI'],['upload','Yüklenen görsel']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button onClick={() => { setQuery(''); setStatus('Tümü');setDesignFilter('all') }}>Filtreleri temizle</button><button ref={refreshButton} onClick={load}>Yenile</button></div>
    {loading && <p role="status">Siparişler yükleniyor…</p>}
    {error && <p role="alert">{error} <button disabled={!commerceApi} onClick={load}>Siparişleri tekrar dene</button></p>}
    {optionsLoading && <p role="status">Sipariş seçenekleri yükleniyor…</p>}
    {optionsError && <p role="alert">Sipariş seçenekleri: {optionsError} <button onClick={retryOptions}>Seçenekleri tekrar dene</button></p>}
    {ready && <><p role="status">{filtered.length} sipariş · Bu ekran ödeme tahsilatı gerçekleştirmez.</p>
    <div className="table-scroll"><table><caption>Web ve mobil siparişleri</caption><thead><tr>{['Sipariş', 'Müşteri', 'Tarih', 'Durum', 'Talep', 'Tutar', 'İşlem'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
      <tbody>{filtered.map(({ order, customerName, customerEmail }) => <tr key={order.id}><th scope="row">{order.number}</th><td>{customerName}<br /><small>{customerEmail}</small></td><td>{date(order.createdAt)}</td><td><span className="order-state">{statusText[order.status] ?? order.status}</span></td><td>{openRequests(order).map(item => <span className="order-state" key={item.id}>{item.type === 'cancel' ? 'İptal' : 'İade'} · {requestText[item.status]}</span>)}</td><td>{money(order.total)}</td><td><button aria-label={`${order.number} detayını aç`} onClick={event => open(order.id, event.currentTarget)}>İncele</button></td></tr>)}</tbody></table></div>
    {filtered.length === 0 && <div className="empty-widget"><strong>{items.length ? 'Filtrelere uygun sipariş yok' : 'Henüz sipariş yok'}</strong><p>{items.length ? 'Aramayı veya durum seçimini değiştirin.' : 'Web veya mobilden verilen siparişler burada görünür.'}</p></div>}</>}
    <dialog ref={dialog} className="order-dialog" aria-labelledby="order-detail-title" onClose={restoreFocus} onCancel={event => { event.preventDefault(); close() }}>
      <header className="dialog-heading"><h2 id="order-detail-title">{order?.number ?? 'Sipariş'}</h2><button onClick={close} aria-label="Sipariş detayını kapat">×</button></header>
      {requestedOrderId && <div className="dialog-body">{directLoading && <p role="status">Sipariş detayı yükleniyor…</p>}{directError && <p role="alert">{directError} <button onClick={retryDirect}>Sipariş detayını tekrar dene</button></p>}{onBackToDesign && <button onClick={onBackToDesign}>Tasarım yönetimine dön</button>}</div>}
      {selected && order && <div className="dialog-body">
        {loading && <p role="status">Siparişler yükleniyor; işlemler geçici olarak kapalı.</p>}
        {optionsLoading && <p role="status">Sipariş seçenekleri yükleniyor…</p>}
        {error && <p role="alert">{error} <button onClick={load}>Siparişleri tekrar dene</button></p>}
        {optionsError && <p role="alert">Sipariş seçenekleri: {optionsError} <button onClick={retryOptions}>Seçenekleri tekrar dene</button></p>}
        <span className="order-state">{statusText[order.status] ?? order.status}</span>
        <dl><div><dt>Müşteri</dt><dd>{selected.customerName} · {selected.customerEmail} · {phone(selected.customerPhone)}</dd></div><div><dt>Teslimat</dt><dd>{order.address.fullName} · {phone(order.address.phone)} · {order.address.line}, {order.address.district}/{order.address.city}</dd></div><div><dt>Tutar</dt><dd>{money(order.total)}</dd></div>{order.shipment && <div><dt>Kargo</dt><dd>{order.shipment.carrier} · {order.shipment.trackingNumber}{order.shipment.deliveredAt ? ` · teslim ${date(order.shipment.deliveredAt)}` : ''}</dd></div>}</dl>
        <ul className="order-lines">{order.lines.map((line, index) => <li key={index}>{line.name} · {line.color} · {line.quantity} adet · {money(line.lineTotal)}{line.personalization && <div className="order-design">{line.personalization.imageUrl && <a href={designUrl(line.personalization.imageUrl)} target="_blank" rel="noreferrer"><img src={designUrl(line.personalization.imageUrl)} alt={`${line.personalization.name} tasarımı`} /></a>}{line.personalization.imageUrl&&<p><a href={designUrl(line.personalization.imageUrl)} target="_blank" rel="noreferrer">Ham tasarımı aç</a> · <a href={designUrl(line.personalization.imageUrl)+'?download=true'}>Ham tasarımı indir</a></p>}
          <details><summary>Kayıtlı yerleşim ayarları</summary><p>Ürün: {line.productId} · SKU: {line.personalization.sku??'Eski kayıtta yok'} · Varyant: {line.variantId} · Renk: {line.color}</p>{line.personalization.placement?<><p>Şema {line.personalization.schemaVersion} · Konfigürasyon {line.personalization.configurationId} · Revizyon {line.personalization.configurationRevision}</p><dl>{Object.entries(line.personalization.placement).map(([key,value])=><div key={key}><dt>{({sourceWidth:'Kaynak genişliği (px)',sourceHeight:'Kaynak yüksekliği (px)',surfaceVersion:'Yüzey sürümü',x:'Yatay konum (px)',y:'Dikey konum (px)',scale:'Ölçek katsayısı',rotation:'Döndürme (derece)',curvatureStrength:'Eğrilik (0–1)',mode:'Yerleşim modu',fillMask:'Maskeyi doldur',bodyAdjustments:'Gövde ayarları'} as Record<string,string>)[key]??key}</dt><dd>{typeof value==='object'?JSON.stringify(value):String(value)}</dd></div>)}</dl><p>Ham dosya SHA-256: {line.personalization.sourceSha256}</p><p>Bu değerler fiziksel baskı ölçüsü değildir. Birleşik mockup dosyası bu sipariş için saklanmadı.</p></>:<p>Bu eski siparişte yerleşim ayarları kaydedilmemiş; güncel tasarımdan tahmin edilmez.</p>}</details>
          <span>Kişiselleştirilmiş · {line.personalization.kind === 'ai' ? 'AI tasarımı' : 'Müşteri görseli'}: <strong>{line.personalization.name}</strong> · Temsilidir; üretim dosyası ayrıca kontrol edilir.</span></div>}</li>)}</ul>
        {order.requests?.map(request => <div className="quote-detail" key={request.id}><h3>{request.type === 'cancel' ? 'İptal talebi' : 'İade talebi'} · {requestText[request.status]}</h3><p>{request.reason}{request.description ? ` — ${request.description}` : ''}</p>{request.type === 'return' && <p>Ürünler: {request.lines.map(line => `${order.lines.find(item => item.variantId === line.variantId)?.name ?? line.variantId} × ${line.quantity}`).join(', ')}</p>}{request.resolution && <p>Not: {request.resolution}</p>}
          {request.status === 'requested' && <div className="dialog-actions"><button disabled={actionsDisabled||!canCancel} onClick={() => void act(`/requests/${request.id}`, { decision: 'approve', resolution: note || null }, request.type === 'cancel' ? 'Sipariş iptal edildi.' : 'İade onaylandı.')}>{request.type === 'cancel' ? 'İptali onayla' : 'İadeyi onayla'}</button><button disabled={actionsDisabled||!canCancel} onClick={() => void act(`/requests/${request.id}`, { decision: 'reject', resolution: note || null }, 'Talep reddedildi.')}>Reddet</button></div>}
          {request.status === 'approved' && <div className="dialog-actions"><button disabled={actionsDisabled||!canCancel} onClick={() => void act(`/requests/${request.id}`, { decision: 'complete', resolution: note || null }, 'İade tamamlandı.')}>Ürün depoya ulaştı · iadeyi tamamla</button></div>}
        </div>)}
        <label>Not (müşteriye iletilir, isteğe bağlı)<textarea rows={2} maxLength={500} value={note} onChange={event => setNote(event.target.value)} /></label>
        {(order.status === 'received' || order.status === 'preparing') && <form className="catalog-form" onSubmit={event => { event.preventDefault(); void act('/shipment', { carrier, trackingNumber: tracking, trackingUrl: trackingUrl || null }, 'Sipariş kargoya verildi.') }}>
          <h3>Kargoya ver</h3>
          <label>Kargo firması<select required value={carrier} onChange={event => setCarrier(event.target.value)}><option value="">Seç</option>{options?.carriers.map(item => <option key={item}>{item}</option>)}</select></label>
          <label>Takip numarası<input required value={tracking} onChange={event => setTracking(event.target.value)} maxLength={40} /></label>
          <label>Takip bağlantısı (isteğe bağlı, https://)<input type="url" value={trackingUrl} onChange={event => setTrackingUrl(event.target.value)} maxLength={500} /></label>
          <button disabled={actionsDisabled||!canWrite||optionsLoading||Boolean(optionsError)||!options}>Kargoya verildi olarak işaretle</button>
        </form>}
        <div className="dialog-actions">
          {order.status === 'received' && <button disabled={actionsDisabled||!canWrite} onClick={() => void act('/status', { status: 'preparing', note: note || null }, 'Sipariş hazırlanıyor.')}>Hazırlanmaya başla</button>}
          {order.status === 'shipped' && <button disabled={actionsDisabled||!canWrite} onClick={() => void act('/status', { status: 'delivered', note: note || null }, 'Sipariş teslim edildi.')}>Teslim edildi</button>}
          {(order.status === 'received' || order.status === 'preparing') && <button disabled={actionsDisabled||!canWrite||!canCancel} onClick={() => { if (window.confirm(`${order.number} iptal edilsin mi?`)) void act('/status', { status: 'cancelled', note: note || null }, 'Sipariş iptal edildi.') }}>Siparişi iptal et</button>}
        </div>
        {notice && <p role="status">{notice}</p>}
        <h3>Geçmiş</h3>
        <ol className="order-history">{(order.history ?? []).map((item, index) => <li key={index}>{date(item.at)} · {statusText[item.status] ?? item.status} · {item.actor === 'customer' ? 'Müşteri' : 'Panel'}{item.note ? ` · ${item.note}` : ''}</li>)}</ol>
      </div>}
    </dialog>
  </section>
}
