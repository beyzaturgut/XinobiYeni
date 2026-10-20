import { useEffect, useRef, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'
import {useAdminSession} from './AdminAccess'

type Money = { amountMinor: number; currency: string }
type Item = { productId: string; productName: string; quantity: number; unitPrice?: Money | null; lineTotal?: Money | null }
type Quote = { id: string; code: string; company: string; contactName: string; email: string; phone?: string | null; taxNumber?: string | null; items: Item[]; personalization: boolean; personalizationNote?: string | null; desiredDate?: string | null; purpose?: string | null; note?: string | null; status: string; createdAt: string; offer?: { total: Money; validUntil: string; note?: string | null } | null; messages: { from: string; text: string; at: string }[]; history: { status: string; at: string; actor: string; note?: string | null }[] }
const statusText: Record<string, string> = { received: 'Yeni', reviewing: 'İnceleniyor', offered: 'Teklif verildi', accepted: 'Kabul edildi', rejected: 'Reddedildi', closed: 'Kapandı' }
const tl = (money?: Money | null) => money ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: money.currency }).format(money.amountMinor / 100) : '—'
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const inTenDays = () => new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)

/** Corporate quote desk: review requests, answer, write an offer with unit prices and a validity date, close. The contact is e-mailed. */
export default function Quotes() {
  const canWrite=useAdminSession()?.permissions.includes('quotes.write')??false
  const writing=useRef(false)
  const [loaded,setLoaded]=useState('')
  const [items, setItems] = useState<Quote[]>([]), [status, setStatus] = useState(''), [selectedId, setSelectedId] = useState(''), [reload, setReload] = useState(0)
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false)
  const [prices, setPrices] = useState<Record<string, string>>({}), [validUntil, setValidUntil] = useState(inTenDays()), [offerNote, setOfferNote] = useState(''), [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    commerceRequest<Quote[]>(commerceApi, `/quotes${status ? `?status=${status}` : ''}`).then(value => { if (active) { setItems(value); setLoaded(`${status}:${reload}`); setError('') } }).catch(e => { if (active) {setItems([]);setLoaded(`${status}:${reload}`);setError(e instanceof Error ? e.message : 'Teklifler yüklenemedi.')} })
    return () => { active = false }
  }, [status, reload])
  const loading=loaded!==`${status}:${reload}`
  const currentError=loading?'':error
  const ready=!loading&&!currentError
  const visibleItems=ready?items:[]
  const quote = visibleItems.find(item => item.id === selectedId)
  async function act(route: string, body: unknown, done: string) {
    if (!quote || writing.current || !canWrite) return false
    writing.current=true
    setBusy(true); setNotice('')
    try { await commerceRequest(commerceApi, `/quotes/${encodeURIComponent(quote.id)}${route}`, 'POST', body); setReload(value => value + 1); setNotice(done);return true }
    catch (e) { setNotice(e instanceof Error ? e.message : 'İşlem yapılamadı.');return false }
    finally { writing.current=false;setBusy(false) }
  }
  function select(next: Quote) {
    setSelectedId(next.id); setNotice(''); setMessage(''); setOfferNote(next.offer?.note ?? ''); setValidUntil(next.offer?.validUntil ?? inTenDays())
    setPrices(Object.fromEntries(next.items.map(item => [item.productId, item.unitPrice ? (item.unitPrice.amountMinor / 100).toFixed(2) : ''])))
  }
  const priced = quote?.items.every(item => Number(prices[item.productId]?.replace(',', '.')) > 0)
  const open = canWrite && quote && ['received', 'reviewing', 'offered'].includes(quote.status)
  return <section aria-label="Kurumsal teklifler">
    <p className="panel-notice">Firmalar web veya mobil formdan talep gönderir; kod ve e-posta ile takip eder. Teklif ve mesaj bildirimleri kuyruğa alınır; teslim durumu bildirim kayıtlarından izlenir. Talep ödeme emri değildir; siparişe dönüşüm D07 kararını bekliyor.</p>
    <div className="order-filters"><label>Durum<select value={status} onChange={event => setStatus(event.target.value)}><option value="">Tümü</option>{Object.entries(statusText).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button onClick={() => setReload(value => value + 1)}>Yenile</button></div>
    {currentError && <p role="alert">{currentError} <button onClick={()=>setReload(value=>value+1)}>Tekrar dene</button></p>}
    {loading&&<p role="status">Teklifler yükleniyor…</p>}
    <div className="quote-desk">
      <div className="table-scroll"><table><caption>{ready?`${items.length} talep`:'Kurumsal teklif talepleri'}</caption><thead><tr>{['Kod', 'Firma', 'Ürünler', 'Tarih', 'Durum', 'Toplam', ''].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
        <tbody>{visibleItems.map(item => <tr key={item.id} aria-selected={item.id === selectedId}><th scope="row">{item.code}</th><td>{item.company}<br /><small>{item.contactName}</small></td><td>{item.items.map(line => `${line.productName} × ${line.quantity}`).join(', ')}</td><td>{date(item.createdAt)}</td><td><span className="order-state">{statusText[item.status]}</span>{item.messages.at(-1)?.from === 'customer' && <span className="order-state">Yeni mesaj</span>}</td><td>{tl(item.offer?.total)}</td><td><button disabled={busy} onClick={() => select(item)}>Aç</button></td></tr>)}</tbody></table></div>
      {ready&&items.length === 0 && <div className="empty-widget"><strong>Talep yok</strong><p>Web veya mobilden gelen kurumsal talepler burada görünür.</p></div>}
      {notice&&<p role="status">{notice}</p>}
      {quote && <article className="quote-detail">
        <h2>{quote.code} · {quote.company} <span className="order-state">{statusText[quote.status]}</span></h2>
        <dl><div><dt>Yetkili</dt><dd>{quote.contactName} · {quote.email}{quote.phone ? ` · ${quote.phone}` : ''}</dd></div><div><dt>Vergi no</dt><dd>{quote.taxNumber ?? '—'}</dd></div><div><dt>Kişiselleştirme</dt><dd>{quote.personalization ? quote.personalizationNote || 'İsteniyor' : 'Yok'}</dd></div><div><dt>Hedef tarih</dt><dd>{quote.desiredDate ?? '—'}</dd></div><div><dt>Amaç</dt><dd>{quote.purpose ?? '—'}</dd></div></dl>
        {quote.note && <p>Not: {quote.note}</p>}
        {open && <form className="catalog-form" onSubmit={event => { event.preventDefault(); if (priced) void act('/offer', { lines: quote.items.map(item => ({ productId: item.productId, unitPriceMinor: Math.round(Number(prices[item.productId].replace(',', '.')) * 100) })), validUntil, note: offerNote || null }, 'Teklif kaydedildi; bildirim kuyruğa alındı.') }}>
          <h3>{quote.offer ? 'Teklifi güncelle' : 'Teklif hazırla'}</h3>
          {quote.items.map(item => <label key={item.productId}>{item.productName} · {item.quantity} adet · birim fiyat (TL)<input inputMode="decimal" required value={prices[item.productId] ?? ''} onChange={event => setPrices(current => ({ ...current, [item.productId]: event.target.value }))} /></label>)}
          <p>Toplam: {priced ? tl({ amountMinor: quote.items.reduce((sum, item) => sum + Math.round(Number(prices[item.productId].replace(',', '.')) * 100) * item.quantity, 0), currency: 'TRY' }) : '—'}</p>
          <label>Geçerlilik tarihi<input type="date" required value={validUntil} onChange={event => setValidUntil(event.target.value)} /></label>
          <label>Teklif notu (KDV, kargo, termin)<textarea rows={3} maxLength={2000} value={offerNote} onChange={event => setOfferNote(event.target.value)} /></label>
          <button disabled={busy || !priced}>Teklifi gönder</button>
        </form>}
        <h3>Mesajlar</h3>
        <ul className="quote-messages">{quote.messages.map((item, index) => <li key={index} data-from={item.from}><strong>{item.from === 'store' ? 'Xinobi' : quote.contactName}</strong> · {date(item.at)}<p>{item.text}</p></li>)}</ul>
        {open && <form className="catalog-form" onSubmit={event => { event.preventDefault();const sent=message;if(sent.trim().length>=2)void act('/messages',{text:sent},'Mesaj kaydedildi; bildirim kuyruğa alındı.').then(ok=>{if(ok)setMessage(current=>current===sent?'':current)}) }}><label>Firmaya mesaj<textarea disabled={busy} rows={2} maxLength={2000} value={message} onChange={event => setMessage(event.target.value)} /></label><button disabled={busy || message.trim().length < 2}>Gönder</button></form>}
        <div className="dialog-actions">{quote.status === 'received' && <button disabled={busy || !canWrite} onClick={() => void act('/status', { status: 'reviewing' }, 'İncelemeye alındı.')}>İncelemeye al</button>}{quote.status !== 'closed' && <button disabled={busy || !canWrite} onClick={() => { if (window.confirm(`${quote.code} kapatılsın mı?`)) void act('/status', { status: 'closed' }, 'Talep kapatıldı.') }}>Talebi kapat</button>}</div>
        <h3>Geçmiş</h3><ol className="order-history">{quote.history.map((item, index) => <li key={index}>{date(item.at)} · {statusText[item.status] ?? item.status} · {item.actor === 'customer' ? 'Firma' : 'Panel'}{item.note ? ` · ${item.note}` : ''}</li>)}</ol>
      </article>}
    </div>
  </section>
}
