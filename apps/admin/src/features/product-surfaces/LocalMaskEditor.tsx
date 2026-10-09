import { useRef, useState } from 'react'

type Source = Readonly<{ productId: string; variantId: string; sha256: string; width: number; height: number }>
const productId = 'DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6'
const variantId = 'DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1'
const checksum = 'f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935'

export default function LocalMaskEditor({ source }: { source: Source }) {
  const [open, setOpen] = useState(false)
  const sent = useRef(false)
  const [attempt, setAttempt] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  async function generate() {
    if (sent.current || !window.confirm('Ürün fotoğrafı Roboflow’a gönderilecek ve kredi kullanılabilir. Tek denemeyi onaylıyor musunuz?')) return
    sent.current = true
    const id = crypto.randomUUID(); setAttempt(id); setMessage('Maske oluşturuluyor… Otomatik tekrar yapılmaz.')
    try {
      const response = await fetch('/api/v1/admin/dev/cm101-candidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attemptId: id, productId: source.productId, variantId: source.variantId, sha256: source.sha256, target: 'lower kettle body', acknowledgeCredits: true }) })
      const result = await response.json()
      setMessage(response.ok ? 'Yeni REAL Roboflow adayı onay bekliyor: ' + result.directory : 'İstek tamamlanamadı. Tekrar gönderilmedi; deneme kaydı korunuyor.')
    } catch { setMessage('Sonuç belirsiz. Tekrar gönderilmedi; deneme kaydı korunuyor.') }
  }
  if (!import.meta.env.DEV || !['127.0.0.1', 'localhost'].includes(window.location.hostname)) return null
  const matches = source.productId === productId && source.variantId === variantId && source.sha256 === checksum && source.width === 3543 && source.height === 5315
  if (!matches) return <p>Bu varyant için kaynakla eşleşen yerel maske adayı yok. Başka ürünün maskesi kullanılmadı.</p>
  const query = new URLSearchParams({ productId: source.productId, variantId: source.variantId, sha256: source.sha256, width: String(source.width), height: String(source.height) })
  return <section aria-label="Yerel maske düzenleme">
    <button type="button" disabled={!!attempt} onClick={generate}>Yeni maske oluştur</button>
    <p role="status">{message}</p>
    <p>Yerel düzeltme yalnızca yeni, onay bekleyen sürüm kaydeder. Katalog veya kişiselleştirme önizlemesine otomatik uygulanmaz.</p>
    <button type="button" onClick={() => setOpen(value => !value)}>{open ? 'Maske editörünü kapat' : 'Yerel maske editörünü aç'}</button>
    {open && <>
      <p>Editör bağlanamazsa D: projesinde <code>MASK_EDITOR_PORT=3046 ile yerel editör sunucusu</code> komutunu çalıştırın. Ürün değiştirmeden veya editörü kapatmadan önce düzeltmenizi kaydedin.</p>
      <iframe title="Seçili varyantın yerel maske editörü" src={'http://127.0.0.1:3046/?' + query} className="surface-local-editor" referrerPolicy="no-referrer" />
    </>}
  </section>
}
