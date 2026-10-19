import { useEffect, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'

type Item = { id: string; channel: string; recipient: string; kind: string; title: string; body: string; createdAt: string; status: string; attempts: number; lastError?: string | null; sentAt?: string | null }
type Response = { channels: { channel: string; configured: boolean }[]; items: Item[] }
const channelText: Record<string, string> = { email: 'E-posta', sms: 'SMS', push: 'Push', inapp: 'Uygulama içi' }
const statusText: Record<string, string> = { pending: 'Sırada', sent: 'Gönderildi', previewed: 'Önizleme (gönderilmedi)', failed: 'Başarısız', skipped: 'Atlandı' }
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
/** Recipients are personal data: show only enough to recognise them. */
const mask = (value: string) => value.includes('@') ? value.replace(/^(.).*(@.*)$/, '$1***$2') : value.startsWith('+') ? value.slice(0, 6) + '****' + value.slice(-2) : value.slice(0, 6) + '…'

/** Delivery log of customer notifications (order events) per channel, with retry for failed sends. */
export default function Notifications() {
  const [data, setData] = useState<Response | null>(null), [channel, setChannel] = useState(''), [status, setStatus] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState(''), [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    let latest=0
    const fetchOnce = () => {const request=++latest;return commerceRequest<Response>(commerceApi, `/notifications?${new URLSearchParams({ ...(channel && { channel }), ...(status && { status }) })}`)
      .then(value => { if (active&&request===latest) { setData(value); setError('') } })
      .catch(e => { if (active&&request===latest) {setData(null);setError(e instanceof Error ? e.message : 'Bildirimler yüklenemedi.')} })}
    void fetchOnce()
    const timer = window.setInterval(() => void fetchOnce(), 10000)
    return () => { active = false; window.clearInterval(timer) }
  }, [channel, status, reload])
  const load = () => setReload(value => value + 1)
  return <section aria-label="Bildirim kayıtları">
    <div className="integration-status">{data?.channels.map(item => <span key={item.channel}><strong>{channelText[item.channel]}</strong> {item.configured ? 'yapılandırıldı' : 'yapılandırılmadı'}</span>)}</div>
    <p className="panel-notice">Sipariş, kargo, iptal ve iade olayları müşterinin uygulama içi kutusuna düşer; e-posta, SMS ve push sıraya alınıp en fazla 5 kez denenir. Geliştirme ortamında SMS ve push önizlemedir; example.com gibi test alan adlarına e-posta gönderilmez. Push için mobil uygulamaya Firebase projesi eklenmelidir.</p>
    <div className="order-filters"><label>Kanal<select value={channel} onChange={event => setChannel(event.target.value)}><option value="">Tümü</option>{Object.entries(channelText).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Durum<select value={status} onChange={event => setStatus(event.target.value)}><option value="">Tümü</option>{Object.entries(statusText).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button onClick={load}>Yenile</button></div>
    {error && <p role="alert">{error} <button onClick={load}>Tekrar dene</button></p>}{!data&&!error&&<p role="status">Bildirimler yükleniyor…</p>}{notice && <p role="status">{notice}</p>}
    <div className="table-scroll"><table><caption>Son 300 bildirim</caption><thead><tr>{['Zaman', 'Kanal', 'Alıcı', 'Başlık', 'Durum', 'Deneme', 'Hata', 'İşlem'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
      <tbody>{data?.items.map(item => <tr key={item.id}><td>{date(item.createdAt)}</td><td>{channelText[item.channel] ?? item.channel}</td><td>{item.channel === 'email' || item.channel === 'sms' ? mask(item.recipient) : '—'}</td><td>{item.title}</td><td><span className="order-state">{statusText[item.status] ?? item.status}</span></td><td>{item.attempts}</td><td>{item.lastError ?? ''}</td><td>{item.status === 'failed' && <button onClick={async () => { try { await commerceRequest(commerceApi, `/notifications/${item.id}/retry`, 'POST', {}); setNotice('Yeniden sıraya alındı.'); load() } catch (e) { setNotice(e instanceof Error ? e.message : 'Yeniden denenemedi.') } }}>Yeniden dene</button>}</td></tr>)}</tbody></table></div>
    {data && data.items.length === 0 && <div className="empty-widget"><strong>Kayıt yok</strong><p>Siparişlerde bir değişiklik olduğunda bildirimler burada görünür.</p></div>}
  </section>
}
