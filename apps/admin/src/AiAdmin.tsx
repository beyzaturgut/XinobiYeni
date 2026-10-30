import TableRegion from './TableRegion'
import { useEffect, useRef, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'
import { useAdminSession } from './AdminAccess'

type Policy = { revision: number; systemPrompt: string; greeting: string; quickReplies: string[]; dailyAiLimit: number; maxMessagesPerConversation: number; model: string; temperature: number; whatsAppNumber?: string | null; inputCostPerMillionTokens?: number | null; outputCostPerMillionTokens?: number | null; reason: string; createdAt: string }
type Source = { id: string; title: string; body: string; keywords: string[]; status: 'draft' | 'approved' | 'archived'; validUntil?: string | null; version: number; updatedAt: string }
type Message = { id: string; role: string; text: string; productIds: string[]; at: string; source?: string | null }
type Conversation = { id: string; accountId?: string | null; channel: string; createdAt: string; updatedAt: string; messages: Message[]; leadSent: boolean; handedOff: boolean }
type Lead = { id: string; conversationId: string; name: string; email: string; phone?: string | null; topic: string; createdAt: string; status: 'new' | 'contacted' | 'closed'; note?: string | null }
type UsageDay = { day: string; feature: string; calls: number; failures: number; inputTokens: number; outputTokens: number; estimatedCost?: number | null }
type Usage = { days: UsageDay[]; aiCallsToday: number; dailyAiLimit: number; costRatesSet: boolean; note: string }
const tabs = ['Politika ve istem', 'Bilgi kaynakları', 'Konuşmalar', 'Talepler', 'Kullanım ve maliyet'] as const
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const sourceStatus = { draft: 'Taslak', approved: 'Onaylı · yanıtlarda kullanılır', archived: 'Arşiv' }
const leadStatus = { new: 'Yeni', contacted: 'İletişime geçildi', closed: 'Kapandı' }

/** Nobi and AI management: policy revisions, knowledge sources, conversations, leads, usage and estimated cost. */
export default function AiAdmin() {
  const canWrite = useAdminSession()?.permissions.includes('ai.write') ?? false
  const writing = useRef(false)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<typeof tabs[number]>('Politika ve istem'), [reload, setReload] = useState(0), [error, setError] = useState(''), [notice, setNotice] = useState(''), [actionError,setActionError] = useState('')
  const [policies, setPolicies] = useState<Policy[]>([]), [modelConfigured, setModelConfigured] = useState(false), [draft, setDraft] = useState<(Policy & { quick: string }) | null>(null)
  const [sources, setSources] = useState<Source[]>([]), [editing, setEditing] = useState<{ id?: string; title: string; body: string; keywords: string; validUntil: string } | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([]), [openConversation, setOpenConversation] = useState('')
  const [leads, setLeads] = useState<Lead[]>([]), [usage, setUsage] = useState<Usage | null>(null)
  const [usageFrom, setUsageFrom] = useState(''), [usageTo, setUsageTo] = useState('')
  const invalidUsageRange = Boolean(usageFrom && usageTo && usageFrom > usageTo)
  const usageRows = invalidUsageRange ? [] : (usage?.days ?? []).filter(row=>(!usageFrom || row.day >= usageFrom) && (!usageTo || row.day <= usageTo))
  const [loaded, setLoaded] = useState(''), [denied, setDenied] = useState(false)
  const requestVersion = useRef(0)
  const loading = loaded !== `${tab}:${reload}`, ready = !loading && !error
  useEffect(() => {
    let active = true
    const version = ++requestVersion.current
    const done = (run: () => void) => { if (active && version === requestVersion.current) { run(); setError(''); setDenied(false); setLoaded(`${tab}:${reload}`) } }
    const fail = (e: unknown) => { if (active && version === requestVersion.current) {setDenied([401,403].includes((e as {status?:number})?.status ?? 0));setError(e instanceof Error ? e.message : 'Yüklenemedi.');setLoaded(`${tab}:${reload}`)} }
    if (tab === 'Politika ve istem') commerceRequest<{ modelConfigured: boolean; items: Policy[] }>(commerceApi, '/assistant/policies').then(value => done(() => { setPolicies(value.items); setModelConfigured(value.modelConfigured) })).catch(fail)
    if (tab === 'Bilgi kaynakları') commerceRequest<Source[]>(commerceApi, '/assistant/knowledge').then(value => done(() => setSources(value))).catch(fail)
    if (tab === 'Konuşmalar') commerceRequest<Conversation[]>(commerceApi, '/assistant/conversations').then(value => done(() => setConversations(value))).catch(fail)
    if (tab === 'Talepler') commerceRequest<Lead[]>(commerceApi, '/assistant/leads').then(value => done(() => setLeads(value))).catch(fail)
    if (tab === 'Kullanım ve maliyet') commerceRequest<Usage>(commerceApi, '/assistant/usage').then(value => done(() => setUsage(value))).catch(fail)
    return () => { active = false }
  }, [tab, reload])
  async function post(route: string, body: unknown, method = 'POST', done = 'Kaydedildi.') {
    if (!ready || !canWrite || writing.current) return false
    if (route === '/assistant/policies' && draft?.revision !== policies.at(-1)?.revision) return false
    if (route.startsWith('/assistant/knowledge/') && editing?.id && route.endsWith(`/${editing.id}`) && !sources.some(source=>source.id===editing.id)) return false
    const version = requestVersion.current
    writing.current = true; setBusy(true)
    setNotice('');setActionError('')
    try { await commerceRequest(commerceApi, route, method, body); if(version!==requestVersion.current)return false; setReload(value => value + 1); setNotice(done); return true }
    catch (e) { if(version===requestVersion.current)setActionError(e instanceof Error ? e.message : 'Kaydedilemedi.'); return false }
    finally { writing.current = false; setBusy(false) }
  }
  const current = policies.at(-1)
  return <section aria-label="AI yönetimi">
    <div className="integration-status"><strong>Cloudflare Workers AI</strong><span>Metin modeli: {tab !== 'Politika ve istem' || !ready ? 'bu görünümde doğrulanmadı' : modelConfigured ? 'yapılandırıldı · başarılı sağlayıcı çağrısı ayrıca doğrulanmalı' : 'yapılandırılmadı · Nobi kural tabanlı yanıt verir'}</span><span>XINOBI U görsel üretimi: bu metin modeli yanıtıyla doğrulanmaz</span></div>
    <div className="catalog-tabs" role="group" aria-label="AI bölümleri">{tabs.map(item => <button key={item} aria-pressed={tab === item} onClick={() => { if(item!==tab){requestVersion.current++;setLoaded('');setTab(item)} setNotice('');setActionError('') }}>{item}</button>)}</div>
    {loading && <p role="status">AI yönetim verileri yükleniyor…</p>}
    {!loading && error && <p role="alert">{error}{!denied && <button onClick={()=>{requestVersion.current++;setLoaded('');setReload(value=>value+1)}}>Tekrar dene</button>}</p>}{actionError && <p role="alert">{actionError}</p>}{notice && <p role="status">{notice}</p>}
    {ready && <>
    {tab === 'Politika ve istem' && !current && <p>Politika kaydı yok.</p>}

    {tab === 'Politika ve istem' && current && <>
      <div className="quote-detail"><h2>Yürürlükteki politika · sürüm {current.revision}</h2>
        <dl><div><dt>Model</dt><dd>{current.model} · sıcaklık {current.temperature}</dd></div><div><dt>Günlük AI yanıt sınırı</dt><dd>{current.dailyAiLimit === 0 ? 'Kapalı (yalnız kural tabanlı)' : current.dailyAiLimit}</dd></div><div><dt>Konuşma başına mesaj</dt><dd>{current.maxMessagesPerConversation}</dd></div><div><dt>WhatsApp devri</dt><dd>{current.whatsAppNumber ? `+${current.whatsAppNumber}` : 'Tanımlı değil · iletişim formu gösterilir'}</dd></div><div><dt>Birim maliyet (1M token, TL)</dt><dd>{current.inputCostPerMillionTokens ?? '—'} girdi · {current.outputCostPerMillionTokens ?? '—'} çıktı</dd></div><div><dt>Karşılama</dt><dd>{current.greeting}</dd></div><div><dt>Hızlı yanıtlar</dt><dd>{current.quickReplies.join(' · ')}</dd></div></dl>
        <p className="ai-prompt">{current.systemPrompt}</p><p>Gerekçe: {current.reason}{current.revision > 1 ? ` · ${date(current.createdAt)}` : ''}</p>
        {!draft && <button disabled={!canWrite || busy} onClick={() => { if(canWrite)setDraft({ ...current, quick: current.quickReplies.join('\n'), reason: '' }) }}>Yeni sürüm hazırla</button>}
      </div>
      {canWrite && draft && <form className="catalog-form" onSubmit={async event => { event.preventDefault(); if (await post('/assistant/policies', { baseRevision: current.revision, systemPrompt: draft.systemPrompt, greeting: draft.greeting, quickReplies: draft.quick.split('\n'), dailyAiLimit: draft.dailyAiLimit, maxMessagesPerConversation: draft.maxMessagesPerConversation, model: draft.model, temperature: draft.temperature, whatsAppNumber: draft.whatsAppNumber || null, inputCostPerMillionTokens: draft.inputCostPerMillionTokens ?? null, outputCostPerMillionTokens: draft.outputCostPerMillionTokens ?? null, reason: draft.reason }, 'POST', 'Yeni politika sürümü yürürlükte.')) setDraft(null) }}>
        <h3>Sürüm {current.revision + 1} taslağı</h3>
        <label>Yönerge (sistem istemi)<textarea rows={12} maxLength={6000} value={draft.systemPrompt} onChange={e => setDraft({ ...draft, systemPrompt: e.target.value })} /></label>
        <label>Karşılama<input maxLength={200} value={draft.greeting} onChange={e => setDraft({ ...draft, greeting: e.target.value })} /></label>
        <label>Hızlı yanıtlar (her satır bir öneri, en fazla 6)<textarea rows={4} value={draft.quick} onChange={e => setDraft({ ...draft, quick: e.target.value })} /></label>
        <fieldset><label>Günlük AI yanıt sınırı<input type="number" min={0} max={5000} value={draft.dailyAiLimit} onChange={e => setDraft({ ...draft, dailyAiLimit: Number(e.target.value) })} /></label><label>Konuşma başına mesaj<input type="number" min={5} max={200} value={draft.maxMessagesPerConversation} onChange={e => setDraft({ ...draft, maxMessagesPerConversation: Number(e.target.value) })} /></label><label>Sıcaklık (0–1)<input type="number" step="0.1" min={0} max={1} value={draft.temperature} onChange={e => setDraft({ ...draft, temperature: Number(e.target.value) })} /></label></fieldset>
        <fieldset><label>Model<input value={draft.model} onChange={e => setDraft({ ...draft, model: e.target.value })} /></label><label>WhatsApp numarası (ülke koduyla)<input inputMode="tel" value={draft.whatsAppNumber ?? ''} onChange={e => setDraft({ ...draft, whatsAppNumber: e.target.value })} placeholder="905321234567" /></label><label>1M girdi token maliyeti (TL)<input type="number" step="0.01" min={0} value={draft.inputCostPerMillionTokens ?? ''} onChange={e => setDraft({ ...draft, inputCostPerMillionTokens: e.target.value === '' ? null : Number(e.target.value) })} /></label><label>1M çıktı token maliyeti (TL)<input type="number" step="0.01" min={0} value={draft.outputCostPerMillionTokens ?? ''} onChange={e => setDraft({ ...draft, outputCostPerMillionTokens: e.target.value === '' ? null : Number(e.target.value) })} /></label></fieldset>
        <label>Değişiklik gerekçesi<input required maxLength={300} value={draft.reason} onChange={e => setDraft({ ...draft, reason: e.target.value })} /></label>
        {draft.revision !== current.revision && <p role="alert">Politika sürümü değişti. Taslağınız korunuyor; güncel sürümle karşılaştırmadan yayımlanamaz.</p>}
        <div className="dialog-actions"><button type="submit" disabled={busy || draft.revision !== current.revision}>Yürürlüğe al</button><button type="button" disabled={busy} onClick={() => setDraft(null)}>Vazgeç</button></div>
      </form>}
      <h3>Sürüm geçmişi</h3><ol className="order-history">{[...policies].reverse().map(item => <li key={item.revision}>Sürüm {item.revision} · {item.reason}{item.revision > 1 ? ` · ${date(item.createdAt)}` : ''}</li>)}</ol>
    </>}

    {tab === 'Bilgi kaynakları' && <>
      <p className="panel-notice">Nobi yalnız onaylı ve geçerlilik tarihi geçmemiş kaynakları kullanır. Düzenlenen kaynak taslağa döner ve yeniden onay ister. Teslimat, iade, garanti, bakım gibi mağaza metinlerini buraya ekleyin.</p>
      {!editing && <button disabled={!canWrite || busy} onClick={() => { if(canWrite)setEditing({ title: '', body: '', keywords: '', validUntil: '' }) }}>+ Yeni kaynak</button>}
      {canWrite && editing && <form className="catalog-form" onSubmit={async event => { event.preventDefault(); if (await post(editing.id ? `/assistant/knowledge/${editing.id}` : '/assistant/knowledge', { title: editing.title, body: editing.body, keywords: editing.keywords.split(','), validUntil: editing.validUntil || null }, editing.id ? 'PUT' : 'POST', 'Kaynak taslak olarak kaydedildi; yayın için onaylayın.')) setEditing(null) }}>
        <label>Başlık<input required maxLength={120} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
        <label>Metin<textarea required rows={8} maxLength={4000} value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })} /></label>
        <label>Anahtar kelimeler (virgülle)<input value={editing.keywords} onChange={e => setEditing({ ...editing, keywords: e.target.value })} placeholder="garanti, servis, arıza" /></label>
        <label>Geçerlilik sonu (isteğe bağlı)<input type="date" value={editing.validUntil} onChange={e => setEditing({ ...editing, validUntil: e.target.value })} /></label>
        {editing.id && !sources.some(source=>source.id===editing.id) && <p role="alert">Düzenlenen kaynak güncel listede yok. Taslağınız korunuyor; kayıt işlemi kapalı.</p>}
        <div className="dialog-actions"><button type="submit" disabled={busy || Boolean(editing.id && !sources.some(source=>source.id===editing.id))}>Taslağı kaydet</button><button type="button" disabled={busy} onClick={() => setEditing(null)}>Vazgeç</button></div>
      </form>}
      <TableRegion><table><caption>{sources.length} kaynak</caption><thead><tr>{['Başlık', 'Durum', 'Sürüm', 'Geçerlilik', 'Güncelleme', 'İşlem'].map(item => <th scope="col" key={item}>{item}</th>)}</tr></thead>
        <tbody>{sources.map(source => <tr key={source.id}><th scope="row">{source.title}<br /><small>{source.keywords.join(', ')}</small></th><td><span className="order-state">{sourceStatus[source.status]}</span></td><td>v{source.version}</td><td>{source.validUntil ?? 'Süresiz'}</td><td>{date(source.updatedAt)}</td><td>
          {source.status !== 'approved' && <button disabled={!canWrite || busy} onClick={() => void post(`/assistant/knowledge/${source.id}/status`, { status: 'approved' }, 'POST', 'Kaynak onaylandı; Nobi yanıtlarında kullanılacak.')}>Onayla</button>}
          {source.status !== 'archived' && <button disabled={!canWrite || busy} onClick={() => void post(`/assistant/knowledge/${source.id}/status`, { status: 'archived' }, 'POST', 'Kaynak arşivlendi.')}>Arşivle</button>}
          <button disabled={!canWrite || busy} onClick={() => { if(canWrite)setEditing({ id: source.id, title: source.title, body: source.body, keywords: source.keywords.join(', '), validUntil: source.validUntil ?? '' }) }}>Düzenle</button>
        </td></tr>)}</tbody></table></TableRegion>
    </>}

    {tab === 'Konuşmalar' && <>
      <p className="panel-notice">Son 300 konuşma; 90 gün saklanır. Kart/kimlik numarası benzeri rakamlar ve e-postalar kayıtta maskelenir. Müşteriler cihaz kimliğiyle ayırt edilir, kişisel veri gösterilmez.</p>
      <TableRegion><table><caption>{conversations.length} konuşma</caption><thead><tr>{['Başlangıç', 'Kanal', 'Mesaj', 'AI / kural', 'Durum', ''].map(item => <th scope="col" key={item}>{item}</th>)}</tr></thead>
        <tbody>{conversations.map(item => <tr key={item.id}><td>{date(item.createdAt)}</td><td>{item.channel === 'mobile' ? 'Mobil' : 'Web'}{item.accountId ? ' · üye' : ''}</td><td>{item.messages.filter(message => message.role === 'user').length}</td><td>{item.messages.filter(message => message.source === 'ai').length} / {item.messages.filter(message => message.source === 'rules').length}</td><td>{item.leadSent && <span className="order-state">Talep</span>}{item.handedOff && <span className="order-state">Devir</span>}</td><td><button onClick={() => setOpenConversation(openConversation === item.id ? '' : item.id)}>{openConversation === item.id ? 'Kapat' : 'Oku'}</button></td></tr>)}</tbody></table></TableRegion>
      {conversations.filter(item => item.id === openConversation).map(item => <ul key={item.id} className="quote-messages">{item.messages.map(message => <li key={message.id} data-from={message.role === 'assistant' ? 'store' : 'customer'}><strong>{message.role === 'assistant' ? `Nobi (${message.source === 'ai' ? 'AI' : 'kural'})` : 'Müşteri'}</strong> · {date(message.at)}<p>{message.text}</p>{message.productIds.length > 0 && <small>Ürünler: {message.productIds.length}</small>}</li>)}</ul>)}
    </>}

    {tab === 'Talepler' && <TableRegion><table><caption>Nobi'den gelen iletişim talepleri (açık onaylı)</caption><thead><tr>{['Tarih', 'Ad', 'İletişim', 'Konu', 'Durum', 'İşlem'].map(item => <th scope="col" key={item}>{item}</th>)}</tr></thead>
      <tbody>{leads.map(lead => <tr key={lead.id}><td>{date(lead.createdAt)}</td><td>{lead.name}</td><td>{lead.email}{lead.phone ? <><br />{lead.phone}</> : null}</td><td>{lead.topic}{lead.note ? <><br /><small>Not: {lead.note}</small></> : null}</td><td><span className="order-state">{leadStatus[lead.status]}</span></td><td>
        {lead.status === 'new' && <button disabled={!canWrite || busy} onClick={() => { if(canWrite && !writing.current)void post(`/assistant/leads/${lead.id}/status`, { status: 'contacted', note: window.prompt('Not (isteğe bağlı)') || null }, 'POST', 'Talep güncellendi.') }}>İletişime geçildi</button>}
        {lead.status !== 'closed' && <button disabled={!canWrite || busy} onClick={() => void post(`/assistant/leads/${lead.id}/status`, { status: 'closed', note: null }, 'POST', 'Talep kapatıldı.')}>Kapat</button>}
      </td></tr>)}</tbody></table>{leads.length === 0 && <div className="empty-widget"><strong>Talep yok</strong></div>}</TableRegion>}

    {tab === 'Kullanım ve maliyet' && usage && <>
      <p>Bugünkü göstergeler tarih filtresinden bağımsızdır.</p>
      <div className="catalog-summary"><div><span>Bugün Nobi AI yanıtı</span><strong>{usage.aiCallsToday} / {usage.dailyAiLimit}</strong></div><div><span>Birim maliyet</span><strong>{usage.costRatesSet ? 'Tanımlı' : 'Girilmedi'}</strong></div></div>
      <p className="panel-notice">{usage.note}{!usage.costRatesSet && ' Tahmini maliyet için Politika sekmesinden 1M token birim fiyatlarını girin.'}</p>
      <p>API en yeni toplam 120 gün/özellik grubu kaydını sunar; her özellik için 120 gün garantisi yoktur. Tarih filtresi yalnız yüklenen kayıtları süzer; tüm geçmişi sorgulamaz. Günler UTC esaslıdır.</p>
      <div className="order-filters"><label>Başlangıç tarihi<input type="date" value={usageFrom} aria-invalid={invalidUsageRange} aria-describedby={invalidUsageRange?'usage-date-error':undefined} onChange={event=>setUsageFrom(event.target.value)} /></label><label>Bitiş tarihi<input type="date" value={usageTo} aria-invalid={invalidUsageRange} aria-describedby={invalidUsageRange?'usage-date-error':undefined} onChange={event=>setUsageTo(event.target.value)} /></label><button disabled={!usageFrom&&!usageTo} onClick={()=>{setUsageFrom('');setUsageTo('')}}>Tarihleri temizle</button></div>
      {invalidUsageRange && <p id="usage-date-error" role="alert">Başlangıç tarihi bitiş tarihinden sonra olamaz.</p>}
      {!invalidUsageRange && <>
      <TableRegion><table><caption>Günlük kullanım</caption><thead><tr>{['Gün', 'Özellik', 'Çağrı', 'Hata', 'Girdi token', 'Çıktı token', 'Tahmini maliyet'].map(item => <th scope="col" key={item}>{item}</th>)}</tr></thead>
        <tbody>{usageRows.map(day => <tr key={day.day + day.feature}><td>{new Date(day.day).toLocaleDateString('tr-TR')}</td><td>{day.feature === 'assistant' ? 'Nobi' : 'XINOBI U görsel'}</td><td>{day.calls}</td><td>{day.failures}</td><td>{day.inputTokens}</td><td>{day.outputTokens}</td><td>{day.estimatedCost == null ? '—' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 4 }).format(day.estimatedCost)}</td></tr>)}</tbody></table></TableRegion>
      {usage.days.length>0 && usageRows.length===0 && <p>Seçilen tarih aralığında kayıt yok.</p>}
      </>}
    </>}
    {tab === 'Bilgi kaynakları' && sources.length===0 && <p>Bilgi kaynağı yok.</p>}
    {tab === 'Konuşmalar' && conversations.length===0 && <p>Konuşma kaydı yok.</p>}
    {tab === 'Kullanım ve maliyet' && (!usage || usage.days.length===0) && <p>Kullanım kaydı yok.</p>}
    </>}
  </section>
}
