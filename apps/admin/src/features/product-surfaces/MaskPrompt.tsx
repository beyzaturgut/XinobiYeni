import { useRef, useState } from 'react'
import PromptBox from '../prompt-box/PromptBox'
import { buildMaskPrompt, defaultMaskTarget, type MaskPromptSource } from './mask-prompt'

export default function MaskPrompt({ source, disabled }: { source: MaskPromptSource; disabled: boolean }) {
  const [target, setTarget] = useState(defaultMaskTarget), [copiedText, setCopiedText] = useState(''), [copyError, setCopyError] = useState('')
  const textarea = useRef<HTMLTextAreaElement>(null)
  const prompt = buildMaskPrompt(source, target)
  async function copy() {
    setCopyError(''); setCopiedText('')
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedText(prompt)
    } catch {
      textarea.current?.closest('details')?.setAttribute('open', '')
      textarea.current?.focus(); textarea.current?.select()
      setCopyError('Tarayıcı panoya yazmaya izin vermedi. Metin seçildi; ⌘C veya Ctrl+C ile kopyalayabilirsin.')
    }
  }
  return <section className="surface-panel mask-prompt" aria-label="Yapay zeka için maskeleme promptu">
    <h3>Maskeleme promptu</h3>
    <label>Maskelenecek yüzey açıklaması<textarea rows={3} maxLength={1200} value={target} disabled={disabled} onChange={event => { setTarget(event.target.value); setCopyError('') }} /></label>
    <PromptBox title={`Hazır prompt · ${source.width}×${source.height} px`} label="Hazır maskeleme promptu" value={prompt} rows={8} textareaRef={textarea}
      copyLabel={copiedText === prompt ? 'Prompt kopyalandı' : 'Promptu kopyala'} disabled={disabled} onCopy={() => void copy()} />
    {copiedText === prompt && <p role="status" className="surface-hint">Prompt panoya kopyalandı. Kaynak görseli de aynı mesaja ekle.</p>}
    {copyError && <p role="alert" className="surface-hint">{copyError}</p>}
  </section>
}
