import { useRef, useState } from 'react'
import type { Product } from '../../commerce'
import PromptBox from '../prompt-box/PromptBox'
import { copyPromptText } from '../prompt-box/copy-text'
import './catalog-photo-prompt.css'
import { buildCatalogPhotoPrompt } from './catalog-photo-prompt'

export default function CatalogPhotoPrompt({ product }: { product: Product }) {
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')
  const textarea = useRef<HTMLTextAreaElement>(null)
  const prompt = buildCatalogPhotoPrompt(product)
  const ready = Boolean(product.variants.length && product.variants.every(v => v.color.trim() && /^#[0-9a-f]{6}$/i.test(v.hex?.trim() ?? '')))
  async function copy() {
    setError(''); setCopied('')
    if (await copyPromptText(prompt, textarea.current)) setCopied(prompt)
    else setError('Panoya yazılamadı. Metin seçildi; ⌘C veya Ctrl+C ile kopyalayabilirsin.')
  }
  return <section className="catalog-photo-prompt" aria-label="XINOBI U katalog görseli promptu">
    <h3>Katalog görseli promptu</h3>
    {!ready && <p role="status">Renkler ürünün varyantlarından alınır. Eksik renk adı veya HEX kodu metinde işaretlenir; görsel üretmeden önce Stok ve varyant bölümünde tamamla.</p>}
    {copied === prompt && <p role="status">Prompt panoya kopyalandı. Ana ürün fotoğrafını da aynı mesaja ekle.</p>}
    {error && <p role="alert">{error}</p>}
    <PromptBox title="Hazır prompt · 1333 × 2000 px" label="Hazır katalog görseli promptu" value={prompt} rows={8} textareaRef={textarea}
      copyLabel={copied === prompt ? 'Prompt kopyalandı' : 'Promptu kopyala'} onCopy={() => void copy()} />
  </section>
}
