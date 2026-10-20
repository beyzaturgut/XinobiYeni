import type { Ref } from 'react'
import './prompt-box.css'

/** Read-only prompt card: a collapsible monospace text box above a full-width copy button. */
export default function PromptBox({ title, label, value, rows, copyLabel, disabled, textareaRef, onCopy }: {
  title: string; label: string; value: string; rows: number; copyLabel: string; disabled?: boolean
  textareaRef: Ref<HTMLTextAreaElement>; onCopy: () => void
}) {
  return <div className="prompt-box">
    <details open>
      <summary>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="prompt-box-icon"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
        <span>{title}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="prompt-box-chevron"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
      <label className="prompt-box-text"><span className="prompt-box-label">{label}</span><textarea ref={textareaRef} value={value} readOnly rows={rows} spellCheck={false} /></label>
    </details>
    <button type="button" className="prompt-box-copy" disabled={disabled} onClick={onCopy}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="prompt-box-icon"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></svg>
      {copyLabel}
    </button>
  </div>
}
