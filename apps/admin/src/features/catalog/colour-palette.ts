import type { Product } from '../../catalog-data'

/** One colour name used in the catalogue and the HEX code most of its variants carry. */
export type KnownColour = { name: string; hex: string; uses: number }

const validHex = (hex: string | undefined) => /^#[0-9a-f]{6}$/i.test(hex?.trim() ?? '')
/** "Metalik  Gümüş" and "metalik gümüş" are the same colour. */
export const colourKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR')

/** Colours already in the catalogue, so a new variant with the same colour name reuses its HEX code. */
export function knownColours(products: Product[]): Map<string, KnownColour> {
  const counts = new Map<string, Map<string, { name: string; uses: number }>>()
  for (const variant of products.flatMap(product => product.variants)) {
    if (!variant.color.trim() || !validHex(variant.hex)) continue
    const key = colourKey(variant.color), hex = variant.hex!.trim().toUpperCase()
    const byHex = counts.get(key) ?? new Map<string, { name: string; uses: number }>()
    const entry = byHex.get(hex) ?? { name: variant.color.trim(), uses: 0 }
    entry.uses++
    byHex.set(hex, entry); counts.set(key, byHex)
  }
  const result = new Map<string, KnownColour>()
  for (const [key, byHex] of counts) {
    // The same name with different codes: the most used code wins.
    const [hex, best] = [...byHex].sort((a, b) => b[1].uses - a[1].uses || a[0].localeCompare(b[0]))[0]
    result.set(key, { name: best.name, hex, uses: [...byHex.values()].reduce((sum, item) => sum + item.uses, 0) })
  }
  return result
}

/**
 * The HEX code after the colour name changes: a known colour fills it when it is empty or was filled from the
 * previous colour name; a code the admin typed is kept.
 */
export function hexForColour(previousColour: string, currentHex: string | undefined, nextColour: string, palette: Map<string, KnownColour>) {
  const known = palette.get(colourKey(nextColour))
  if (!known) return currentHex
  const hex = currentHex?.trim().toUpperCase() ?? ''
  const fromPrevious = palette.get(colourKey(previousColour))?.hex
  return !hex || hex === fromPrevious ? known.hex : currentHex
}
