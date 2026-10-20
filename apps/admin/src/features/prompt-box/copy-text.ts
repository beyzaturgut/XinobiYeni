/**
 * Copies a prompt. The async clipboard needs a secure context (HTTPS or localhost); the live IP site is plain HTTP, so
 * otherwise the prompt's own textarea is selected and copied with the legacy command, which also works there.
 * Returns false when neither worked; the text then stays selected for ⌘C / Ctrl+C.
 */
export async function copyPromptText(text: string, textarea: HTMLTextAreaElement | null): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard) {
    try { await navigator.clipboard.writeText(text); return true } catch { /* Fall back to the selection below. */ }
  }
  if (!textarea) return false
  textarea.closest('details')?.setAttribute('open', '')
  textarea.focus(); textarea.select(); textarea.setSelectionRange(0, textarea.value.length)
  try { return document.execCommand('copy') } catch { return false }
}
