import { useState } from 'react'

type Source = Readonly<{ productId: string; variantId: string; sha256: string; width: number; height: number }>
const productId = 'DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6'
const variantId = 'DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1'
const checksum = 'f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935'

export default function LocalMaskEditor({ source }: { source: Source }) {
  const [open, setOpen] = useState(false)
  if (!import.meta.env.DEV || !['127.0.0.1', 'localhost'].includes(window.location.hostname)) return null
  const matches = source.productId === productId && source.variantId === variantId && source.sha256 === checksum && source.width === 3543 && source.height === 5315
  if (!matches) return null
  const query = new URLSearchParams({ productId: source.productId, variantId: source.variantId, sha256: source.sha256, width: String(source.width), height: String(source.height) })
  return <section aria-label="Yerel maske düzenleme">
    <p>Yerel düzeltme yalnızca yeni, onay bekleyen sürüm kaydeder. Katalog veya kişiselleştirme önizlemesine otomatik uygulanmaz.</p>
    <button type="button" onClick={() => setOpen(value => !value)}>{open ? 'Maske editörünü kapat' : 'Yerel maske editörünü aç'}</button>
    {open && <>
      <p>Editör bağlanamazsa D: projesinde <code>MASK_EDITOR_PORT=3046 ile yerel editör sunucusu</code> komutunu çalıştırın. Ürün değiştirmeden veya editörü kapatmadan önce düzeltmenizi kaydedin.</p>
      <iframe title="Seçili varyantın yerel maske editörü" src={'http://127.0.0.1:3046/?' + query} className="surface-local-editor" referrerPolicy="no-referrer" />
    </>}
  </section>
}
