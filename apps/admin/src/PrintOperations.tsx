import AdminDialog from './AdminDialog'
import TableRegion from './TableRegion'
import { useEffect, useRef, useState } from 'react'
import { adminCall } from './admin-api'
import { commerceApi, commerceRequest } from './commerce'
import { useAdminSession } from './AdminAccess'
import type { components } from '../../../packages/clients/typescript/src/schema'

type DesignPage = components['schemas']['AdminDesignPage']
type Design = components['schemas']['AdminDesignDetails']
type OrderPage = components['schemas']['AdminDesignOrderPage']
const date = (value: string) => new Date(value).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
function message(problem: unknown) {
  const status = (problem as { status?: number })?.status
  if (status === 404) return 'Tasarım kaydı bulunamadı. Listeyi yenileyebilirsiniz.'
  if (status === 503) return 'Tasarım veri kaynağı şu anda kullanılamıyor. Bu durum kayıt olmadığı anlamına gelmez.'
  return problem instanceof Error ? problem.message : 'Tasarım kayıtları yüklenemedi.'
}

function DesignOrderReferences({ designId, onOpenOrder }: { designId: string; onOpenOrder?: (id: string) => void }) {
  const [data, setData] = useState<OrderPage | null>(null), [page, setPage] = useState(1), [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true), [error, setError] = useState('')
  const version = useRef(0)
  useEffect(() => {
    let active = true
    const request = ++version.current
    void adminCall<OrderPage>(`/admin/designs/${encodeURIComponent(designId)}/orders?page=${page}&pageSize=20`)
      .then(value => { if (active && request === version.current) setData(value) })
      .catch(problem => { if (active && request === version.current) {
        const status = (problem as { status?: number })?.status
        setData(null); setError(status === 404 ? 'İlişkili sipariş kaynağı bulunamadı.' : status === 503 ? 'İlişkili sipariş kaynağı şu anda kullanılamıyor.' : problem instanceof Error ? problem.message : 'İlişkili siparişler yüklenemedi.')
      } })
      .finally(() => { if (active && request === version.current) setLoading(false) })
    return () => { active = false }
  }, [designId, page, reload])
  function load(next = page) { version.current++; setData(null); setError(''); setLoading(true); setPage(next); setReload(value => value + 1) }
  return <section aria-label="İlişkili siparişler"><h3>İlişkili siparişler</h3>
    <button onClick={() => load()}>Siparişleri yenile</button>
    {loading && <p role="status">İlişkili siparişler yükleniyor…</p>}
    {error && <p role="alert">{error} <button onClick={() => load()}>Siparişleri tekrar dene</button></p>}
    {!loading && !error && data && <><p role="status">{data.total} ilişkili sipariş · Sayfa {data.totalPages ? data.page : 1}/{data.totalPages || 1}</p>
      {data.total === 0 ? <p>İlişkili sipariş bulunamadı.</p> : <><TableRegion><table><caption>Sipariş referansları · saat dilimi Europe/Istanbul</caption><thead><tr><th scope="col">Sipariş numarası</th><th scope="col">Tarih</th></tr></thead><tbody>{data.items?.map(order => <tr key={order.id}><th scope="row"><button disabled={!order.id || !onOpenOrder} onClick={() => order.id && onOpenOrder?.(order.id)} aria-label={`${order.number} sipariş detayını aç`}>{order.number}</button></th><td>{date(order.createdAt!)}</td></tr>)}</tbody></table></TableRegion>
        {!data.items?.length && <p>Bu sayfada kayıt yok. Önceki sayfaya dönebilirsiniz.</p>}
        </>}
      <div className="periods" aria-label="İlişkili sipariş sayfaları"><button disabled={data.page! <= 1} onClick={() => load(page - 1)}>Önceki sipariş sayfası</button><button disabled={!data.totalPages || data.page! >= data.totalPages} onClick={() => load(page + 1)}>Sonraki sipariş sayfası</button></div>
    </>}
  </section>
}

export default function PrintOperations({ onOpenOrder }: { onOpenOrder?: (id: string) => void }) {
  const permissions = useAdminSession()?.permissions ?? []
  const canReadOrders = permissions.includes('print.read') && permissions.includes('orders.read')
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
  return <section aria-label="Tasarımlar ve sipariş bağlantıları">
    <p className="panel-notice">Müşterilerin kaydettiği tasarımlar burada listelenir. Bir siparişe ait desen, kayıtlı yerleşim ve görseller ilgili siparişin “Sipariş tasarım detayı” alanında gösterilir.</p>
    <div className="order-filters"><label>Bu sayfada tasarım ara<input disabled={!ready} value={query} onChange={event => setQuery(event.target.value)} /></label><button disabled={!ready || !query} onClick={() => setQuery('')}>Aramayı temizle</button><button onClick={() => load()}>Yenile</button></div>
    {loading && <p role="status">Tasarım kayıtları yükleniyor…</p>}
    {error && <p role="alert">{error} <button onClick={() => load()}>Tekrar dene</button></p>}
    {ready && <><p role="status">{data.total} tasarım · Sayfa {data.totalPages ? data.page : 1}/{data.totalPages || 1} · Saat dilimi: Europe/Istanbul</p>
      <TableRegion><table><caption>Kayıtlı tasarım bilgileri · en yeni kayıt önce</caption><thead><tr>{['Tasarım', 'Tür', 'Ürün / varyant', 'Renk', 'Kayıt zamanı', 'İşlem'].map(title => <th scope="col" key={title}>{title}</th>)}</tr></thead><tbody>{rows.map(item => <tr key={item.id}><th scope="row">{item.id}</th><td>{item.kind}</td><td>{item.productName}<br /><small>{item.productId} · {item.variantId || '—'}</small></td><td>{item.color || '—'}</td><td>{date(item.createdAt!)}</td><td><button onClick={event => { trigger.current = event.currentTarget; dialog.current?.showModal(); void readDetail(item.id!) }}>İncele</button></td></tr>)}</tbody></table></TableRegion>
      {!rows.length && <p role="status">{query ? 'Bu sayfada aramaya uygun tasarım yok.' : data.total === 0 ? 'Henüz kayıtlı tasarım yok.' : 'Bu sayfada tasarım yok. Önceki sayfaya dönebilirsiniz.'}</p>}
      <div className="periods" aria-label="Tasarım sayfaları"><button disabled={data.page <= 1} onClick={() => load(page - 1)}>← Önceki</button><button disabled={!data.totalPages || data.page! >= data.totalPages} onClick={() => load(page + 1)}>Sonraki →</button></div></>}
    <AdminDialog ref={dialog} aria-labelledby="design-detail-title" onCancel={event => { event.preventDefault(); close() }} onClose={() => trigger.current?.focus()}><header className="dialog-heading"><h2 id="design-detail-title">Tasarım bilgileri</h2><button aria-label="Tasarım detayını kapat" onClick={close}>×</button></header><div className="dialog-body">
      {detailLoading && <p role="status">Tasarım detayı yükleniyor…</p>}{detailError && <p role="alert">{detailError} <button onClick={() => void readDetail(selectedId)}>Tekrar dene</button></p>}
      {detail && <><dl>{[['Tasarım', detail.id], ['Tür', detail.kind], ['Ürün kimliği', detail.productId], ['Ürün', detail.productName], ['Varyant', detail.variantId], ['Renk', detail.color], ['Kayıt zamanı (Europe/Istanbul)', date(detail.createdAt!)], ['Dosya türü', detail.mime]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
        <section aria-label="Kayıtlı tasarım görseli"><p>Kaydedilen desen görselidir; ürün mockup'ı veya baskı uygunluğu onayı değildir.</p>
          {imageLoading && <p role="status">Tasarım görseli yükleniyor…</p>}
          {imageError && <p role="alert">{imageError} <button onClick={() => { setImageUrl(''); setImageError(''); setImageLoading(true); setImageReload(value => value + 1) }}>Görseli tekrar dene</button></p>}
          {imageUrl && <img src={imageUrl} alt={`${detail.productName} için kaydedilen tasarım`} style={{ maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain' }} onLoad={() => setImageLoading(false)} onError={() => { setImageUrl(''); setImageLoading(false); setImageError('Tasarım görseli görüntülenemedi.') }} />}
        </section>{canReadOrders && detail.id && <DesignOrderReferences key={detail.id} designId={detail.id} onOpenOrder={onOpenOrder} />}</>}<button onClick={close}>Kapat</button>
    </div></AdminDialog>
  </section>
}
