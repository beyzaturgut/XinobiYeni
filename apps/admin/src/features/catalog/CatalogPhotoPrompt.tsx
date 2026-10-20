import { useRef, useState } from 'react'
import type { Product } from '../../commerce'
import { buildCatalogPhotoPrompt, defaultCoating, defaultProtectedParts } from './catalog-photo-prompt'

export default function CatalogPhotoPrompt({ product }: { product: Product }) {
  const [referenceId, setReferenceId] = useState(product.variants[0]?.id ?? '')
  const [coating, setCoating] = useState(defaultCoating)
  const [protectedParts, setProtectedParts] = useState(defaultProtectedParts)
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')
  const textarea = useRef<HTMLTextAreaElement>(null)
  const reference = product.variants.some(v => v.id === referenceId) ? referenceId : product.variants[0]?.id ?? ''
  const prompt = buildCatalogPhotoPrompt(product, reference, coating, protectedParts)
  const ready = Boolean(product.name.trim() && product.variants.length && product.variants.every(v => v.color.trim() && /^#[0-9a-f]{6}$/i.test(v.hex ?? '')))
  async function copy() {
    setError('')
    try { await navigator.clipboard.writeText(prompt); setCopied(prompt) }
    catch { textarea.current?.closest('details')?.setAttribute('open', ''); textarea.current?.focus(); textarea.current?.select(); setError('Panoya yazılamadı. Metin seçildi; ⌘C veya Ctrl+C ile kopyalayabilirsin.') }
  }
  return <section aria-label="XINOBI U katalog görseli promptu" style={{ gridColumn: '1 / -1' }}>
    <h3>XINOBI U katalog görseli hazırlama promptu</h3>
    <p>Her yeni üründe güncel ürün bilgileri ve tüm renk varyantlarından hazırlanır. Önce Stok ve varyant bölümünde renkleri ve HEX kodlarını gir. Ana fotoğrafı promptla birlikte yapay zekaya ekle; çıktıları ilgili varyantlara yükle.</p>
    <label>Ortak kalıp için referans renk<select value={reference} onChange={e => setReferenceId(e.target.value)}>{product.variants.map(v => <option key={v.id} value={v.id}>{v.color || 'Renk girilmedi'} · {v.sku}</option>)}</select></label>
    <label>Kaplanacak yüzey<textarea rows={4} value={coating} onChange={e => setCoating(e.target.value)} /></label>
    <label>Korunacak parçalar<textarea rows={3} value={protectedParts} onChange={e => setProtectedParts(e.target.value)} /></label>
    {!ready && <p role="status">Promptu kopyalamak için ürün adı, en az bir varyant, her varyantın rengi ve geçerli #RRGGBB kodu gerekli.</p>}
    <details><summary>Güncel promptu göster · 1333 × 2000 px</summary><label>Hazır katalog görseli promptu<textarea ref={textarea} value={prompt} readOnly rows={18} style={{ width: '100%', boxSizing: 'border-box' }} /></label></details>
    <button type="button" disabled={!ready} onClick={() => void copy()}>{copied === prompt ? 'Prompt kopyalandı' : 'Katalog görseli promptunu kopyala'}</button>
    {error && <p role="alert">{error}</p>}
    <p>Prompt tek başına hizalamayı garanti etmez. Teslimde piksel kontrollerini iste; ardından maske önizlemesini her renkte kontrol et.</p>
  </section>
}
