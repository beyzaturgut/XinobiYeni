import { useEffect, useRef, useState } from 'react'
import { adminCall } from './admin-api'
import { commerceApi, commerceRequest } from './commerce'
import type { components } from '../../../packages/clients/typescript/src/schema'

type DesignPage = components['schemas']['AdminDesignPage']
type Design = components['schemas']['AdminDesignDetails']
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
function message(problem: unknown) {
  const status = (problem as { status?: number })?.status
  if (status === 404) return 'Tasarım kaydı bulunamadı. Listeyi yenileyebilirsiniz.'
  if (status === 503) return 'Tasarım veri kaynağı şu anda kullanılamıyor. Bu durum kayıt olmadığı anlamına gelmez.'
  return problem instanceof Error ? problem.message : 'Tasarım kayıtları yüklenemedi.'
}

export default function PrintOperations(_props: { notes: Record<string, string>; onNote: (id: string, note: string) => void }) {
  const [data, setData] = useState<DesignPage | null>(null), [page, setPage] = useState(1), [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(''), [detail, setDetail] = useState<Design | null>(null)
  const [detailLoading, setDetailLoading] = useState(false), [detailError, setDetailError] = useState('')
  const [imageUrl, setImageUrl] = useState(''), [imageLoading, setImageLoading] = useState(false), [imageError, setImageError] = useState(''), [imageReload, setImageReload] = useState(0)
  const listVersion = useRef(0), detailVersion = useRef({ value: 0 }), dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    const version = ++listVersion.current
    const detailGuard = detailVersion.current
    let active = true
    adminCall<DesignPage>(`/admin/designs?page=${page}&pageSize=20`)
      .then(value => { if (active && version === listVersion.current) { setData(value); setError('') } })
      .catch(problem => { if (active && version === listVersion.current) { setData(null); setError(message(problem)) } })
      .finally(() => { if (active && version === listVersion.current) setLoading(false) })
    return () => { active = false; detailGuard.value++ }
  }, [page, reload])
  useEffect(() => {
    if (!detail?.id) return
    let active = true, url = ''
    void commerceRequest<Blob>(commerceApi.replace(/\/local-commerce\/?$/, ''), `/admin/designs/${encodeURIComponent(detail.id)}/image`, 'GET', undefined, 'blob')
      .then(blob => { if (active) { url = URL.createObjectURL(blob); setImageUrl(url) } })
      .catch(problem => { if (active) { setImageError(message(problem)); setImageLoading(false) } })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [detail?.id, imageReload])
  function close() { detailVersion.current.value++; dialog.current?.close(); setSelectedId(''); setDetail(null); setDetailError(''); setDetailLoading(false); setImageUrl(''); setImageError(''); setImageLoading(false); trigger.current?.focus() }
  function load(next = page) { listVersion.current++; close(); setLoading(true); setData(null); setError(''); setQuery(''); setPage(next); setReload(value => value + 1) }
  async function readDetail(id: string) {
    const version = ++detailVersion.current.value
    setSelectedId(id); setDetail(null); setDetailError(''); setDetailLoading(true); setImageUrl(''); setImageError(''); setImageLoading(true)
    try { const value = await adminCall<Design>(`/admin/designs/${encodeURIComponent(id)}`); if (version === detailVersion.current.value) setDetail(value) }
    catch (problem) { if (version === detailVersion.current.value) { setDetailError(message(problem)); setImageLoading(false) } }
    finally { if (version === detailVersion.current.value) setDetailLoading(false) }
  }
  const ready = !loading && !error && data !== null
  const rows = ready ? (data.items ?? []).filter(item => [item.id, item.kind, item.productId, item.productName, item.variantId, item.color].join(' ').toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'))) : []
  return <section aria-label="Tasarım ve baskı operasyonları">
    <p className="panel-notice">Kayıtlı tasarımların yalnız temel bilgileri gösterilir. Baskı üretimi, sürüm, onay ve indirme işlemleri kullanıma açık değildir; D04/T-04 kararları bekleniyor.</p>
    <div className="order-filters"><label>Bu sayfada tasarım ara<input disabled={!ready} value={query} onChange={event => setQuery(event.target.value)} /></label><button disabled={!ready || !query} onClick={() => setQuery('')}>Aramayı temizle</button><button onClick={() => load()}>Yenile</button></div>
    {loading && <p role="status">Tasarım kayıtları yükleniyor…</p>}
    {error && <p role="alert">{error} <button onClick={() => load()}>Tekrar dene</button></p>}
    {ready && <><p role="status">{data.total} tasarım · Sayfa {data.totalPages ? data.page : 1}/{data.totalPages || 1} · Saat dilimi: Europe/Istanbul</p>
      <div className="table-scroll"><table><caption>Kayıtlı tasarım bilgileri · en yeni kayıt önce</caption><thead><tr>{['Tasarım', 'Tür', 'Ürün / varyant', 'Renk', 'Kayıt zamanı', 'İşlem'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>{rows.map(item => <tr key={item.id}><th scope="row">{item.id}</th><td>{item.kind}</td><td>{item.productName}<br /><small>{item.productId} · {item.variantId || '—'}</small></td><td>{item.color || '—'}</td><td>{date(item.createdAt!)}</td><td><button onClick={event => { trigger.current = event.currentTarget; dialog.current?.showModal(); void readDetail(item.id!) }}>İncele</button></td></tr>)}</tbody></table></div>
      {!rows.length && <p role="status">{query ? 'Bu sayfada aramaya uygun tasarım yok.' : data.total === 0 ? 'Henüz kayıtlı tasarım yok.' : 'Bu sayfada tasarım yok. Önceki sayfaya dönebilirsiniz.'}</p>}
      <div className="periods" aria-label="Tasarım sayfaları"><button disabled={data.page <= 1} onClick={() => load(page - 1)}>← Önceki</button><button disabled={!data.totalPages || data.page! >= data.totalPages} onClick={() => load(page + 1)}>Sonraki →</button></div></>}
    <dialog ref={dialog} aria-labelledby="design-detail-title" onCancel={event => { event.preventDefault(); close() }} onClose={() => trigger.current?.focus()}><header className="dialog-heading"><h2 id="design-detail-title">Tasarım bilgileri</h2><button aria-label="Tasarım detayını kapat" onClick={close}>×</button></header><div className="dialog-body">
      {detailLoading && <p role="status">Tasarım detayı yükleniyor…</p>}{detailError && <p role="alert">{detailError} <button onClick={() => void readDetail(selectedId)}>Tekrar dene</button></p>}
      {detail && <><dl>{[['Tasarım', detail.id], ['Tür', detail.kind], ['Ürün kimliği', detail.productId], ['Ürün', detail.productName], ['Varyant', detail.variantId], ['Renk', detail.color], ['Kayıt zamanı (Europe/Istanbul)', date(detail.createdAt!)], ['Dosya türü', detail.mime]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
        <section aria-label="Kayıtlı tasarım görseli"><p>Kaydedilen desen görselidir; ürün mockup'ı veya baskı uygunluğu onayı değildir.</p>
          {imageLoading && <p role="status">Tasarım görseli yükleniyor…</p>}
          {imageError && <p role="alert">{imageError} <button onClick={() => { setImageUrl(''); setImageError(''); setImageLoading(true); setImageReload(value => value + 1) }}>Görseli tekrar dene</button></p>}
          {imageUrl && <img src={imageUrl} alt={`${detail.productName} için kaydedilen tasarım`} style={{ maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain' }} onLoad={() => setImageLoading(false)} onError={() => { setImageUrl(''); setImageLoading(false); setImageError('Tasarım görseli görüntülenemedi.') }} />}
        </section></>}<button onClick={close}>Kapat</button>
    </div></dialog>
  </section>
}
