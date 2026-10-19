import { useEffect, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'

type Entry = { id: string; occurredAt: string; actorId?: string | null; action: string; entityType: string; entityId: string; status: number; traceId?: string | null }
const areas: Record<string, string> = { catalog: 'Katalog', pricing: 'Fiyat', content: 'İçerik', media: 'Medya', orders: 'Siparişler', quotes: 'Teklifler', ai: 'AI', notifications: 'Bildirimler', admin: 'Yönetim' }
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
const result = (status: number) => status < 300 ? 'Başarılı' : status === 401 || status === 403 ? 'Yetkisiz' : status < 500 ? 'Reddedildi' : 'Hata'

/** Read-only audit trail (Faz03 03.06): every panel change attempt with actor, route and result; bodies are never stored. */
export default function AuditLog() {
  const [items, setItems] = useState<Entry[] | null>(null), [area, setArea] = useState(''), [error, setError] = useState(''), [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    commerceRequest<Entry[]>(commerceApi, `/audit?${new URLSearchParams({ limit: '200', ...(area && { entityType: area }) })}`)
      .then(value => { if (active) { setItems(value); setError('') } })
      .catch(e => { if (active) {setItems(null);setError(e instanceof Error ? e.message : 'Denetim kaydı yüklenemedi.')} })
    return () => { active = false }
  }, [area, reload])
  return <section aria-label="Denetim kaydı">
    <p className="panel-notice">Paneldeki her değişiklik denemesi (başarılı, reddedilen ve yetkisiz) kim, ne zaman, hangi kayıt ve sonuçla burada listelenir. İstek içeriği (fiyat, adres, mesaj) saklanmaz; kayıtlar düzenlenemez veya silinemez.</p>
    <div className="order-filters"><label>Alan<select value={area} onChange={event => setArea(event.target.value)}><option value="">Tümü</option>{Object.entries(areas).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button onClick={() => setReload(value => value + 1)}>Yenile</button></div>
    {error && <p role="alert">{error} <button onClick={()=>setReload(value=>value+1)}>Tekrar dene</button></p>}
    <div className="table-scroll"><table><caption>Son 200 kayıt</caption><thead><tr>{['Zaman', 'Kullanıcı', 'Alan', 'İşlem', 'Kayıt', 'Sonuç', 'İstek no'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead>
      <tbody>{items?.map(item => <tr key={item.id}><td>{date(item.occurredAt)}</td><td>{item.actorId ? item.actorId.slice(0, 8) : 'Oturumsuz'}</td><td>{areas[item.entityType] ?? item.entityType}</td><td><code>{item.action}</code></td><td>{item.entityId}</td><td><span className="order-state">{result(item.status)} · {item.status}</span></td><td><code>{item.traceId?.slice(0, 12)}</code></td></tr>)}</tbody></table></div>
    {items && items.length === 0 && <div className="empty-widget"><strong>Kayıt yok</strong><p>Panelde bir değişiklik yapıldığında burada görünür.</p></div>}
  </section>
}
