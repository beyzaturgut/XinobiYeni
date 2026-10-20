import { useRef, useState } from 'react'
import type { Product } from '../../commerce'
import PromptBox from '../prompt-box/PromptBox'
import './catalog-photo-prompt.css'
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
    setError(''); setCopied('')
    try { await navigator.clipboard.writeText(prompt); setCopied(prompt) }
    catch { textarea.current?.closest('details')?.setAttribute('open', ''); textarea.current?.focus(); textarea.current?.select(); setError('Panoya yazılamadı. Metin seçildi; ⌘C veya Ctrl+C ile kopyalayabilirsin.') }
  }
  return <section className="catalog-photo-prompt" aria-label="XINOBI U katalog görseli promptu">
    <div className="catalog-photo-prompt-side">
    <h3>Katalog görseli promptu</h3>
    <details className="catalog-photo-prompt-options"><summary>Yüzey ve referans renk ayarları</summary>
    <p>Her yeni üründe güncel ürün bilgileri ve tüm renk varyantlarından hazırlanır. Önce Stok ve varyant bölümünde renkleri ve HEX kodlarını gir. Ana fotoğrafı promptla birlikte yapay zekaya ekle; çıktıları ilgili varyantlara yükle.</p>
    <label>Ortak kalıp için referans renk<select value={reference} onChange={e => setReferenceId(e.target.value)}>{product.variants.map(v => <option key={v.id} value={v.id}>{v.color || 'Renk girilmedi'} · {v.sku}</option>)}</select></label>
    <label>Kaplanacak yüzey<textarea rows={4} value={coating} onChange={e => setCoating(e.target.value)} /></label>
    <label>Korunacak parçalar<textarea rows={3} value={protectedParts} onChange={e => setProtectedParts(e.target.value)} /></label>
    {!ready && <p role="status">Promptu şimdi kopyalayabilirsin. Eksik ürün adı, varyant, renk veya HEX bilgileri metinde işaretlenir; görsel üretmeden önce bunları tamamla.</p>}
    </details>
    {copied === prompt && <p role="status">Prompt panoya kopyalandı. Ana ürün fotoğrafını da aynı mesaja ekle.</p>}
    {error && <p role="alert">{error}</p>}
    </div>
    <PromptBox title="Hazır prompt · 1333 × 2000 px" label="Hazır katalog görseli promptu" value={prompt} rows={5} textareaRef={textarea}
      copyLabel={copied === prompt ? 'Prompt kopyalandı' : 'Promptu kopyala'} onCopy={() => void copy()} />
  </section>
}
