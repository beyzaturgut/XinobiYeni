import { useEffect, useRef, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'
import type { components } from '../../../packages/clients/typescript/src/schema'
import OrderPlacement from './OrderPlacement'
import type { AdminFile } from './admin-request'
import './order-design-detail.css'

type DesignPlacement = components['schemas']['DesignPlacement']
export type OrderPersonalization = { designId: string; kind: 'ai' | 'upload'; name: string; imageUrl?: string | null; placement?: DesignPlacement | null; schemaVersion?: number | null; configurationId?: string | null; configurationRevision?: number | null; sourceSha256?: string | null; sku?: string | null; files?: components['schemas']['OrderDesignFiles'] | null }
export type OrderDesignLine = { productId: string; variantId: string; name: string; color: string; personalization?: OrderPersonalization | null }

/** Design files on order lines are served by the panel API with the staff session cookie. */
const designUrl = (path: string) => commerceApi.replace(/\/api\/v1\/local-commerce\/?$/, '') + path
const missing = 'Bu siparişte kaydedilmemiş'
const shown = (value: unknown) => value === null || value === undefined || value === '' ? missing : typeof value === 'boolean' ? (value ? 'Evet' : 'Hayır') : typeof value === 'number' ? value.toLocaleString('tr-TR', { maximumFractionDigits: 4 }) : String(value)

function Facts({ rows }: { rows: [string, unknown][] }) {
  return <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={shown(value) === missing ? 'order-design-missing' : undefined}>{shown(value)}</dd></div>)}</dl>
}

type DownloadState = { busy?: boolean; done?: string; error?: string; retry?: boolean }

const downloads = {
  pattern: { route: 'pattern', file: 'desen', idle: 'Ham deseni indir', busy: 'Ham desen indiriliyor…', done: 'Ham desen indirildi', missing: 'Bu sipariş satırının desen dosyası bulunamadı; indirilecek dosya yok.', forbidden: 'Ham deseni indirme yetkiniz yok.', failed: 'Ham desen şu anda indirilemedi.', what: 'ham desen dosyası' },
  source: { route: 'source', file: 'urun-kaynak', idle: 'Ürün kaynak görselini indir', busy: 'Ürün kaynak görseli indiriliyor…', done: 'Ürün kaynak görseli indirildi', missing: 'Bu sipariş satırının ürün kaynak görseli bulunamadı; indirilecek dosya yok.', forbidden: 'Ürün kaynak görselini indirme yetkiniz yok.', failed: 'Ürün kaynak görseli şu anda indirilemedi.', what: 'ürün kaynak görseli' },
  composition: { route: 'composition', file: 'giydirilmis-onizleme', idle: 'Giydirilmiş önizlemeyi indir', busy: 'Giydirilmiş önizleme indiriliyor…', done: 'Giydirilmiş önizleme indirildi', missing: 'Bu sipariş satırının giydirilmiş önizleme dosyası bulunamadı; indirilecek dosya yok.', forbidden: 'Giydirilmiş önizlemeyi indirme yetkiniz yok.', failed: 'Giydirilmiş önizleme şu anda indirilemedi.', what: 'giydirilmiş temsili önizleme' },
} as const

/** Downloads one of the order line's own copies from the staff API (resolved on the server by order and line), one request at a time. */
function FileDownload({ kind, orderId, orderNumber, index, name }: { kind: keyof typeof downloads; orderId: string; orderNumber: string; index: number; name: string }) {
  const text = downloads[kind], [state, setState] = useState<DownloadState>({}), running = useRef(false)
  async function download() {
    if (running.current) return
    running.current = true; setState({ busy: true })
    try {
      const file = await commerceRequest<AdminFile>(commerceApi.replace(/\/local-commerce\/?$/, ''), `/admin/orders/${encodeURIComponent(orderId)}/lines/${index}/${text.route}`, 'GET', undefined, 'file')
      const url = URL.createObjectURL(file.blob), link = document.createElement('a')
      // Without a readable server name, keep the same pattern with the type's real extension.
      const extension = ({ 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' } as Record<string, string>)[file.blob.type] ?? ''
      const fileName = file.fileName || `xinobi-${orderNumber.replace(/[^A-Za-z0-9-]+/g, '-')}-satir-${index + 1}-${text.file}${extension}`
      link.href = url; link.download = fileName; document.body.append(link); link.click(); link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setState({ done: fileName })
    } catch (problem) {
      const status = (problem as { status?: number })?.status, code = (problem as { code?: string })?.code
      setState(status === 404 ? { error: code?.endsWith('_not_recorded') && problem instanceof Error ? problem.message : text.missing }
        : status === 403 ? { error: text.forbidden }
        : status === 401 ? { error: 'Oturum doğrulanamadı. Yeniden giriş yapın.' }
        : { retry: true, error: `${text.failed} ${problem instanceof Error ? problem.message : ''}`.trim() })
    } finally { running.current = false }
  }
  const described = `${orderId}-${index}-${kind}-download-state`
  return <div className="order-design-download">
    {!state.error || state.retry ? <button type="button" disabled={state.busy} aria-describedby={described} onClick={() => void download()}>
      {state.busy ? text.busy : state.retry ? 'İndirmeyi tekrar dene' : text.idle}</button> : null}
    <span id={described} className="admin-sr-only">{`${name} ${text.what}`}</span>
    {state.busy && <p role="status">{text.busy}</p>}
    {state.done && <p role="status">{text.done}: {state.done}</p>}
    {state.error && <p role="alert">{state.error}</p>}
  </div>
}

/** The saved raw pattern of one order line: preview and download only once the file is confirmed to exist. */
function RawPattern({ path, name, orderId, orderNumber, index }: { path?: string | null; name: string; orderId: string; orderNumber: string; index: number }) {
  const [state, setState] = useState<{ path: string; url?: string; error?: string; retry?: boolean }>(), [reload, setReload] = useState(0)
  useEffect(() => {
    if (!path) return
    let active = true, url = ''
    void commerceRequest<Blob>(designUrl(''), path, 'GET', undefined, 'blob')
      .then(blob => { if (active) { url = URL.createObjectURL(blob); setState({ path, url }) } })
      .catch(problem => { if (active) { const status = (problem as { status?: number })?.status
        setState({ path, retry: status !== 404 && status !== 403, error: status === 404 ? 'Desen dosyası bu sipariş satırında bulunamadı. İndirme kapalı.' : status === 403 ? 'Desen dosyasını görme yetkiniz yok.' : status === 401 ? 'Oturum doğrulanamadı. Yeniden giriş yapın.' : `Desen dosyası şu anda alınamadı. ${problem instanceof Error ? problem.message : ''}`.trim() }) } })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [path, reload])
  if (!path) return <p className="order-design-missing">Bu sipariş satırında desen dosyası kaydı yok. İndirme kapalı.</p>
  const current = state?.path === path ? state : undefined
  const retry = () => { setState(undefined); setReload(value => value + 1) }
  if (!current) return <p role="status">Desen dosyası yükleniyor…</p>
  if (current.error) return <p role="alert">{current.error}{current.retry && <> <button type="button" onClick={retry}>Deseni tekrar dene</button></>}</p>
  return <>
    <img src={current.url} alt={`${name} ham deseni`} onError={() => setState({ path, retry: true, error: 'Desen dosyası görüntülenemedi. İndirme kapalı.' })} />
    <p className="order-design-actions"><a href={designUrl(path)} target="_blank" rel="noreferrer">Ham deseni yeni sekmede aç</a></p>
    <FileDownload kind="pattern" orderId={orderId} orderNumber={orderNumber} index={index} name={name} />
  </>
}

/** Shows the order's own composition from the staff API; the same file the download button returns, never the raw pattern. */
function CompositionView({ orderId, index, name, revision }: { orderId: string; index: number; name: string; revision?: number | null }) {
  const [state, setState] = useState<{ url?: string; error?: string; retry?: boolean }>(), [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true, url = ''
    void commerceRequest<AdminFile>(commerceApi.replace(/\/local-commerce\/?$/, ''), `/admin/orders/${encodeURIComponent(orderId)}/lines/${index}/composition`, 'GET', undefined, 'file')
      .then(file => { if (active) { url = URL.createObjectURL(file.blob); setState({ url }) } })
      .catch(problem => { if (active) { const status = (problem as { status?: number })?.status
        setState(status === 404 ? { error: problem instanceof Error ? problem.message : 'Giydirilmiş önizleme dosyası bulunamadı.' }
          : status === 403 ? { error: 'Giydirilmiş önizlemeyi görme yetkiniz yok.' }
          : status === 401 ? { error: 'Oturum doğrulanamadı. Yeniden giriş yapın.' }
          : { retry: true, error: `Giydirilmiş önizleme şu anda alınamadı. ${problem instanceof Error ? problem.message : ''}`.trim() }) } })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [orderId, index, reload])
  if (!state) return <p role="status">Giydirilmiş önizleme yükleniyor…</p>
  if (state.error) return <p role="alert">{state.error}{state.retry && <> <button type="button" onClick={() => { setState(undefined); setReload(value => value + 1) }}>Önizlemeyi tekrar dene</button></>}</p>
  return <figure className="order-design-figure">
    <img src={state.url} alt={`${name} için giydirilmiş temsili önizleme${revision ? `, revizyon ${revision}` : ''}`} onError={() => setState({ retry: true, error: 'Giydirilmiş önizleme görüntülenemedi.' })} />
    <figcaption>Temsilidir: sipariş anındaki {revision ? `${revision}. revizyon ` : ''}yerleşimin dijital önizlemesi. Baskıya hazır dosya değildir.</figcaption>
  </figure>
}

/** Order-line design detail: product, design, saved editor placement and three separate images. Read-only; no production actions. */
export default function OrderDesignDetail({ orderId, orderNumber, line, index }: { orderId: string; orderNumber: string; line: OrderDesignLine; index: number }) {
  const design = line.personalization
  if (!design) return null
  const id = `order-design-${index}`
  return <section className="order-design-detail" aria-labelledby={id}>
    <h3 id={id}>Sipariş tasarım detayı · {index + 1}. satır</h3>
    <p className="order-design-note">Müşterinin sipariş anında kaydettiği bilgilerdir. Fiziksel baskı ölçüsü, baskıya uygunluk veya üretim onayı içermez.</p>
    <section aria-label="Sipariş ve ürün bilgileri"><h4>Sipariş ve ürün</h4>
      <Facts rows={[['Sipariş numarası', orderNumber], ['Ürün', `${line.name} (${line.productId})`], ['SKU', design.sku], ['Varyant', line.variantId], ['Renk', line.color], ['Tasarım adı', design.name], ['Tasarım kimliği', design.designId], ['Tasarım türü', design.kind === 'ai' ? 'AI tasarımı' : 'Müşteri görseli'], ['Konfigürasyon', design.configurationId], ['Konfigürasyon revizyonu', design.configurationRevision], ['Kayıt şeması', design.schemaVersion]]} />
    </section>
    <section aria-label="Kayıtlı yerleşim"><h4>Kayıtlı yerleşim</h4>
      <OrderPlacement orderNumber={orderNumber} index={index} placement={design.placement} schemaVersion={design.schemaVersion} configurationId={design.configurationId}
        configurationRevision={design.configurationRevision} sourceSha256={design.sourceSha256} files={design.files} />
      <Facts rows={[['Yerleşimin desen özeti (SHA-256)', design.sourceSha256]]} />
    </section>
    <section aria-label="Tasarım görselleri"><h4>Görseller</h4>
      <div className="order-design-files">
        <article aria-labelledby={`${id}-raw`}><h5 id={`${id}-raw`}>Ham desen</h5><p>Müşterinin yüklediği veya AI ile üretilen özgün dosya; ürün üstüne giydirilmemiştir.</p><RawPattern path={design.imageUrl} name={design.name} orderId={orderId} orderNumber={orderNumber} index={index} /></article>
        <article aria-labelledby={`${id}-source`}><h5 id={`${id}-source`}>Ürün kaynak görseli</h5><p>Editörde maskelemenin uygulandığı ürün ve renk fotoğrafı; desen uygulanmamıştır, maske dosyası değildir.</p>
          {design.files?.productSource
            ? <><p>Sipariş anında kopyalandı ({design.files.productSource.mime}, {Math.ceil(design.files.productSource.bytes / 1024).toLocaleString('tr-TR')} KB).</p><FileDownload kind="source" orderId={orderId} orderNumber={orderNumber} index={index} name={design.name} /></>
            : <p className="order-design-missing">{design.placement ? 'Bu sipariş, ürün kaynak görseli kopyası saklanmadan önce verilmiş.' : 'Bu sipariş satırında kayıtlı yerleşim olmadığı için ürün kaynak görseli kopyası yok.'} Güncel katalog fotoğrafı veya başka renk görseli yerine kullanılmaz. İndirme kullanılamıyor.</p>}</article>
        <article aria-labelledby={`${id}-preview`}><h5 id={`${id}-preview`}>Giydirilmiş önizleme</h5><p>Desenin kayıtlı yerleşimle ürün üstündeki temsili görünümü.</p>
          {design.files?.composition
            ? <><CompositionView orderId={orderId} index={index} name={design.name} revision={design.configurationRevision} /><FileDownload kind="composition" orderId={orderId} orderNumber={orderNumber} index={index} name={design.name} /></>
            : <p className="order-design-missing">{!design.placement ? 'Bu sipariş satırında kayıtlı yerleşim olmadığı için giydirilmiş önizleme yok.' : !design.files ? 'Bu sipariş, giydirilmiş önizleme kopyası saklanmadan önce verilmiş.' : 'Bu yerleşim revizyonu için sipariş anında giydirilmiş önizleme yüklenmemişti.'} Güncel tasarımla yeniden oluşturulmaz; ham desen onun yerine gösterilmez. İndirme kullanılamıyor.</p>}</article>
      </div>
    </section>
  </section>
}
