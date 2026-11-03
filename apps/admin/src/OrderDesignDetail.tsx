import { useEffect, useState } from 'react'
import { commerceApi, commerceRequest } from './commerce'
import type { components } from '../../../packages/clients/typescript/src/schema'
import OrderPlacement from './OrderPlacement'
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

/** The saved raw pattern of one order line: preview and download only once the file is confirmed to exist. */
function RawPattern({ path, name }: { path?: string | null; name: string }) {
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
    <p className="order-design-actions"><a href={designUrl(path)} target="_blank" rel="noreferrer">Ham deseni yeni sekmede aç</a><a href={designUrl(path) + '?download=true'}>Ham deseni indir</a></p>
  </>
}

/** Order-line design detail: product, design, saved editor placement and three separate images. Read-only; no production actions. */
export default function OrderDesignDetail({ orderNumber, line, index }: { orderNumber: string; line: OrderDesignLine; index: number }) {
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
        <article aria-labelledby={`${id}-raw`}><h5 id={`${id}-raw`}>Ham desen</h5><p>Müşterinin yüklediği veya AI ile üretilen özgün dosya; ürün üstüne giydirilmemiştir.</p><RawPattern path={design.imageUrl} name={design.name} /></article>
        <article aria-labelledby={`${id}-source`}><h5 id={`${id}-source`}>Ürün kaynak görseli</h5><p>Editörde maskelemenin uygulandığı ürün ve renk fotoğrafı.</p><p className="order-design-missing">{design.files?.productSource ? 'Bu siparişe bağlı kaynak görsel kopyası saklandı; panelde görüntüleme ve indirme henüz hazır değil.' : 'Bu siparişte ürün kaynak görseli kopyası yok. Güncel katalog fotoğrafı bu siparişin kaynağı sayılmaz.'} İndirme hazır değil.</p></article>
        <article aria-labelledby={`${id}-preview`}><h5 id={`${id}-preview`}>Giydirilmiş önizleme</h5><p>Desenin kayıtlı yerleşimle ürün üstündeki temsili görünümü.</p><p className="order-design-missing">{design.files?.composition ? 'Bu siparişe bağlı giydirilmiş önizleme saklandı; panelde görüntüleme henüz hazır değil.' : 'Bu sipariş için giydirilmiş önizleme kaydı yok.'} Ham desen onun yerine gösterilmez. İndirme hazır değil.</p></article>
      </div>
    </section>
  </section>
}
