import type { components } from '../../../packages/clients/typescript/src/schema'

type DesignPlacement = components['schemas']['DesignPlacement']
type BodyPlacement = components['schemas']['BodyPlacement']
type OrderDesignFiles = components['schemas']['OrderDesignFiles']
/** The placement schema the editor writes today; other versions are shown unread rather than guessed. */
const supportedSchemas = [1, 2]
const notSaved = 'Kaydedilmemiş'
const number = (value: number, digits = 2) => {
  const shown = value.toLocaleString('tr-TR', { maximumFractionDigits: digits })
  return value !== 0 && (shown === '0' || shown === '-0') ? value.toLocaleString('tr-TR', { maximumSignificantDigits: 12 }) : shown
}
const percent = (value: number, of: number) => `%${(value / of * 100).toLocaleString('tr-TR', { maximumFractionDigits: 1 })}`
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const bodyNames: Record<string, string> = { 'upper-body': 'Üst gövde', 'lower-body': 'Alt gövde' }

type Row = { label: string; value?: string; note?: string }
function Rows({ rows }: { rows: Row[] }) {
  return <dl>{rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd className={row.value === undefined ? 'order-design-missing' : undefined}>
    {row.value ?? notSaved}{row.note && <small className="order-placement-note">{row.note}</small>}</dd></div>)}</dl>
}

/** A saved value with its own unit; a missing value stays "Kaydedilmemiş", never zero. */
const px = (value: unknown, of?: number, axis?: string): Pick<Row, 'value' | 'note'> => finite(value)
  ? { value: `${number(value)} px`, note: of && of > 0 && axis ? `Tuval ${axis} ${percent(value, of)} (gösterim için; kayıtlı değer piksel)` : undefined } : {}

function placementRows(p: DesignPlacement): Row[] {
  const canvas = finite(p.sourceWidth) && finite(p.sourceHeight) && p.sourceWidth > 0 && p.sourceHeight > 0
  return [
    { label: 'Kaynak tuval', ...(canvas ? { value: `${number(p.sourceWidth, 0)} × ${number(p.sourceHeight, 0)} px`, note: 'Editörün yerleşimi kaydettiği ürün fotoğrafı ölçüsü' } : {}) },
    { label: 'Yatay konum (desen merkezi)', ...px(p.x, canvas ? p.sourceWidth : undefined, 'genişliğinin soldan') },
    { label: 'Dikey konum (desen merkezi)', ...px(p.y, canvas ? p.sourceHeight : undefined, 'yüksekliğinin üstten') },
    { label: 'Ölçek', ...(finite(p.scale) ? { value: `${number(p.scale, 4)} kat`, note: 'Desenin editördeki temel boyutuna göre' } : {}) },
    { label: 'Döndürme', ...(finite(p.rotation) ? { value: `${number(p.rotation)}°`, note: p.rotation === 0 ? 'Döndürülmemiş' : p.rotation > 0 ? 'Saat yönünde' : 'Saat yönünün tersine' } : {}) },
    { label: 'Yerleşim modu', ...(p.mode === 'pattern' ? { value: 'Desen', note: 'Desen ürün yüzeyine yayılır' } : p.mode === 'artwork' ? { value: 'Tek görsel', note: 'Görsel tek parça yerleştirilir' } : p.mode ? { value: p.mode, note: 'Bu ekranda tanınmayan mod; kayıttaki haliyle gösterilir' } : {}) },
    { label: 'Maske alanını doldurma', ...(typeof p.fillMask === 'boolean' ? { value: p.fillMask ? 'Açık' : 'Kapalı' } : {}) },
    { label: 'Yüzey kavisi', ...(finite(p.curvatureStrength) ? { value: number(p.curvatureStrength, 2), note: '0 = kavis uygulanmaz, 1 = en güçlü kavis' } : {}) },
    { label: 'Yüzey sürümü (maske özeti)', ...(p.surfaceVersion ? { value: p.surfaceVersion } : {}) },
  ]
}

function bodyRows(name: string, body: BodyPlacement): Row[] {
  const rotation = body.rotation
  return [
    { label: 'Bölge', value: bodyNames[name] ?? name, note: bodyNames[name] ? undefined : 'Bu ekranda tanınmayan bölge adı' },
    { label: 'Ek yatay kaydırma', ...(finite(body.x) ? { value: `${number(body.x)} px` } : { note: 'Ek kaydırma uygulanmadı' }) },
    { label: 'Ek dikey kaydırma', ...(finite(body.y) ? { value: `${number(body.y)} px` } : { note: 'Ek kaydırma uygulanmadı' }) },
    { label: 'Ek ölçek', ...(finite(body.scale) ? { value: `${number(body.scale, 4)} kat`, note: 'Ana ölçekle çarpılır' } : { note: 'Ana ölçek aynen uygulanır' }) },
    { label: 'Ek döndürme', ...(finite(rotation) ? { value: `${number(rotation)}°`, note: 'Ana döndürmeye eklenir' } : { note: 'Ana döndürme aynen uygulanır' }) },
  ]
}

/** The editor placement saved with this order line; read-only, no physical size, DPI or print suitability. */
export default function OrderPlacement({ orderNumber, index, placement, schemaVersion, configurationId, configurationRevision, sourceSha256, files, surfaceBinding, productId, variantId }: {
  orderNumber: string; index: number; placement?: DesignPlacement | null; schemaVersion?: number | null; configurationId?: string | null
  configurationRevision?: number | null; sourceSha256?: string | null; files?: OrderDesignFiles | null; surfaceBinding?: components['schemas']['SingleSourceBinding'] | null; productId?: string; variantId?: string }) {
  if (!placement) return <p className="order-design-missing">Bu eski siparişte yerleşim ayarları kaydedilmemiş; güncel tasarımdan tahmin edilmez.</p>
  const owner = `${orderNumber} · ${index + 1}. satır · ${configurationId ? `konfigürasyon ${configurationId}` : 'konfigürasyon kaydedilmemiş'} · ${finite(configurationRevision) ? `revizyon ${configurationRevision}` : 'revizyon kaydedilmemiş'}`
  const pattern = files?.pattern?.sha256
  const binding = !sourceSha256 || !pattern
    ? <p className="order-design-missing">Desen dosyası ile yerleşim revizyonunun eşleşmesi doğrulanamıyor: bu siparişte {sourceSha256 ? 'dosya özeti' : 'yerleşimin desen özeti'} kaydedilmemiş.</p>
    : pattern === sourceSha256 ? <p role="status">Siparişe kopyalanan desen dosyası bu yerleşim revizyonunun deseniyle aynı (SHA-256 eşleşiyor).</p>
    : <p role="alert">Siparişteki desen dosyası bu yerleşim revizyonunun deseniyle eşleşmiyor. Değerleri bu desene uygulanmış gibi kullanmayın.</p>
  if (finite(schemaVersion) && !supportedSchemas.includes(schemaVersion)) return <>
    <p className="order-placement-owner">{owner}</p>
    <p className="order-design-missing">Bu yerleşim {schemaVersion}. şema sürümüyle kaydedilmiş; bu ekran 1 ve 2. sürümleri yorumlar. Kayıt değiştirilmedi; değerler yorumlanmadan aşağıda gösterilir.</p>
    <pre className="order-placement-raw">{JSON.stringify(placement, null, 2)}</pre>
  </>
  if (schemaVersion === 2 && (!surfaceBinding || surfaceBinding.productId !== productId || surfaceBinding.fulfillmentVariantId !== variantId
    || !Number.isInteger(surfaceBinding.profileRevision) || surfaceBinding.profileRevision < 1 || !Number.isInteger(surfaceBinding.sourceRevision) || surfaceBinding.sourceRevision < 1
    || !Number.isInteger(surfaceBinding.width) || surfaceBinding.width < 1 || !Number.isInteger(surfaceBinding.height) || surfaceBinding.height < 1
    || !new RegExp(`^source-${surfaceBinding.sourceRevision}-mask-[a-f0-9]{32}$`).test(surfaceBinding.surfaceId??'')
    || !/^[a-f0-9]{64}$/.test(surfaceBinding.productSourceSha256??'') || !/^[a-f0-9]{64}$/.test(surfaceBinding.maskSha256??'')
    || !/^[a-f0-9]{32}$/.test(configurationId??'') || !Number.isInteger(configurationRevision) || (configurationRevision??0)<1
    || surfaceBinding.width !== placement.sourceWidth || surfaceBinding.height !== placement.sourceHeight || surfaceBinding.maskSha256 !== placement.surfaceVersion))
    return <><p className="order-placement-owner">{owner}</p><p role="alert">Tek kaynak yüzeyi ile kayıtlı yerleşim eşleşmesi doğrulanamıyor. Sipariş değiştirilmedi; değerler yorumlanmadan gösteriliyor.</p><pre className="order-placement-raw">{JSON.stringify({placement,surfaceBinding},null,2)}</pre></>
  const bodies = Object.entries(placement.bodyAdjustments ?? {})
  return <>
    <p className="order-placement-owner">{owner}</p>
    <p>Müşterinin editörde kaydettiği değerlerdir. Konumlar ürün fotoğrafının sol üst köşesine göre editör tuvali pikselidir; fiziksel ölçü (mm/DPI) değildir.</p>
    {!finite(schemaVersion) && <p className="order-design-missing">Şema sürümü bu siparişte kaydedilmemiş; değerler mevcut şemaya göre okunuyor.</p>}
    {schemaVersion === 2 && surfaceBinding && <>
      <h5>Siparişte kayıtlı tek kaynak yüzeyi</h5>
      <Rows rows={[
        {label:'Yüzey kimliği',value:surfaceBinding.surfaceId}, {label:'Ürün kaynağı sürümü',value:String(surfaceBinding.sourceRevision)},
        {label:'Kişiselleştirme profili sürümü',value:String(surfaceBinding.profileRevision)},
        {label:'Ürün fotoğrafı özeti (SHA-256)',value:surfaceBinding.productSourceSha256},
        {label:'Maske özeti (SHA-256)',value:surfaceBinding.maskSha256},
      ]}/>
      {files?.productSource ? files.productSource.sha256 === surfaceBinding.productSourceSha256
        ? <p role="status">Siparişteki ürün fotoğrafı bu yüzey kaydıyla aynı (SHA-256 eşleşiyor).</p>
        : <p role="alert">Siparişteki ürün fotoğrafı bu yüzey kaydıyla eşleşmiyor.</p>
        : <p className="order-design-missing">Ürün fotoğrafı dosya özeti bu siparişte yok; dosya bağı doğrulanamıyor.</p>}
    </>}
    <Rows rows={placementRows(placement)} />
    <h5>Gövde / bölge ayarları</h5>
    {bodies.length ? bodies.map(([name, body]) => <Rows key={name} rows={bodyRows(name, body??{})} />)
      : <p>Bölgeye özel ayar kaydedilmemiş; ana yerleşim tüm yüzeye uygulanır.</p>}
    {binding}
  </>
}
