import TableRegion from './TableRegion'
import { useEffect, useRef, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'
import { useAdminSession } from './AdminAccess'

type Item = { id: string; channel: string; recipient: string; kind: string; title: string; body: string; createdAt: string; status: string; attempts: number; lastError?: string | null; sentAt?: string | null }
type Response = { channels: { channel: string; configured: boolean }[]; items: Item[] }
const channelText: Record<string, string> = { email: 'E-posta', sms: 'SMS', push: 'Push', inapp: 'Uygulama içi' }
const statusText: Record<string, string> = { pending: 'Sırada', sent: 'Gönderildi', previewed: 'Önizleme (gönderilmedi)', failed: 'Başarısız', skipped: 'Atlandı' }
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
/** Recipients are personal data: show only enough to recognise them. */
const mask = (value: string) => value.includes('@') ? value.replace(/^(.).*(@.*)$/, '$1***$2') : value.startsWith('+') ? value.slice(0, 6) + '****' + value.slice(-2) : value.slice(0, 6) + '…'

/** Delivery log of customer notifications (order events) per channel, with retry for failed sends. */
export default function Notifications() {
  const canWrite=useAdminSession()?.permissions.includes('notifications.write')??false
  const requestVersion=useRef(0), writing=useRef(false)
  const [data, setData] = useState<Response | null>(null), [channel, setChannel] = useState(''), [status, setStatus] = useState(''), [error, setError] = useState(commerceApi?'':'Bildirim API adresi yapılandırılmadı.'), [notice, setNotice] = useState(''), [reload, setReload] = useState(0)
  const [loading,setLoading]=useState(Boolean(commerceApi)),[busy,setBusy]=useState('')
  useEffect(() => {
    if(!commerceApi)return
    let active = true
    const fetchOnce = () => {const request=++requestVersion.current;setLoading(true);return commerceRequest<Response>(commerceApi, `/notifications?${new URLSearchParams({ ...(channel && { channel }), ...(status && { status }) })}`)
      .then(value => { if (active&&request===requestVersion.current) { setData(value); setError('') } })
      .catch(e => { if (active&&request===requestVersion.current) {setData(null);setError(e instanceof Error ? e.message : 'Bildirimler yüklenemedi.')} })
      .finally(()=>{if(active&&request===requestVersion.current)setLoading(false)})}
    void fetchOnce()
    const timer = window.setInterval(() => {if(!writing.current)void fetchOnce()}, 10000)
    return () => { active = false; window.clearInterval(timer) }
  }, [channel, status, reload])
  function invalidate(){requestVersion.current++;setData(null);setLoading(Boolean(commerceApi));setError('');setNotice('')}
  const load = () => {invalidate();setReload(value => value + 1)}
  const ready=!loading&&!error&&data!==null
  async function retry(item:Item){
    if(!canWrite||writing.current||!ready||item.status!=='failed')return
    const version=requestVersion.current
    writing.current=true;setBusy(item.id);setNotice('')
    try{
      await commerceRequest(commerceApi, `/notifications/${encodeURIComponent(item.id)}/retry`, 'POST', {})
      const sameView=version===requestVersion.current
      load()
      if(sameView)setNotice('Yeniden kuyruğa alındı; teslim henüz doğrulanmadı.')
    }catch(e){
      if(version===requestVersion.current){requestVersion.current++;setData(null);setError(e instanceof Error?e.message:'Yeniden denenemedi.');setLoading(false)}
      else load()
    }finally{writing.current=false;setBusy('')}
  }
  return <section aria-label="Bildirim kayıtları">
    <div className="integration-status">{data?.channels.map(item => <span key={item.channel}><strong>{channelText[item.channel]}</strong> {item.configured ? 'yapılandırıldı' : 'yapılandırılmadı'}</span>)}</div>
    <p className="panel-notice">Sipariş, kargo, iptal ve iade olayları müşterinin uygulama içi kutusuna düşer; e-posta, SMS ve push sıraya alınıp en fazla 5 kez denenir. Geliştirme ortamında SMS ve push önizlemedir; example.com gibi test alan adlarına e-posta gönderilmez. Push için mobil uygulamaya Firebase projesi eklenmelidir.</p>
    <div className="order-filters"><label>Kanal<select value={channel} onChange={event => {invalidate();setChannel(event.target.value)}}><option value="">Tümü</option>{Object.entries(channelText).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Durum<select value={status} onChange={event => {invalidate();setStatus(event.target.value)}}><option value="">Tümü</option>{Object.entries(statusText).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button onClick={load}>Yenile</button></div>
    {error && <p role="alert">{error} <button disabled={!commerceApi} onClick={load}>Tekrar dene</button></p>}{loading&&<p role="status">Bildirimler yükleniyor…</p>}{notice && <p role="status">{notice}</p>}
    <TableRegion><table><caption>Son 300 bildirim</caption><thead><tr>{['Zaman', 'Kanal', 'Alıcı', 'Başlık', 'Durum', 'Deneme', 'Hata', 'İşlem'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
      <tbody>{data?.items.map(item => <tr key={item.id}><td>{date(item.createdAt)}</td><td>{channelText[item.channel] ?? item.channel}</td><td>{item.channel === 'email' || item.channel === 'sms' ? mask(item.recipient) : '—'}</td><td>{item.title}</td><td><span className="order-state">{statusText[item.status] ?? item.status}</span></td><td>{item.attempts}</td><td>{item.lastError ?? ''}</td><td>{item.status === 'failed' && <button disabled={!canWrite||!ready||Boolean(busy)} onClick={()=>void retry(item)}>{busy===item.id?'Kuyruğa alınıyor…':'Yeniden dene'}</button>}</td></tr>)}</tbody></table></TableRegion>
    {ready && data?.items.length === 0 && <div className="empty-widget"><strong>Kayıt yok</strong><p>Siparişlerde bir değişiklik olduğunda bildirimler burada görünür.</p></div>}
  </section>
}
