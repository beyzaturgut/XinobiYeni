import type { Product } from '../../commerce'

export const defaultFinish = 'fine-textured soft satin metallic'

function slug(value: string) {
  return value.toLocaleLowerCase('tr-TR').replaceAll('ı', 'i').replaceAll('ş', 's').replaceAll('ğ', 'g').replaceAll('ü', 'u').replaceAll('ö', 'o').replaceAll('ç', 'c').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'urun'
}

// Colours come from the product's catalogue variants in their saved order; the first one becomes the MASTER.
export function buildCatalogPhotoPrompt(product: Product) {
  const colours = product.variants.map((v, i) => `${i + 1}. ${v.color.trim() || '[RENK EKSİK]'} - ${/^#[0-9a-f]{6}$/i.test(v.hex?.trim() ?? '') ? v.hex!.trim().toUpperCase() : '[GEÇERLİ HEX EKSİK]'}`)
  return `Edit the provided product photo and produce ONE output image for EACH color listed in COLORS. Number of outputs = number of colors.

WORKFLOW (mandatory)
1. Create a single MASTER image from the first color: background removed, canvas and placement finalized.
2. Generate every other color ONLY by recoloring this same MASTER. Never re-generate, redraw or re-place the product for each color.
3. All outputs must share identical canvas, product position, scale, outline, edges, lighting, highlights and shadows. Overlaid at (0,0), they must match exactly; only the body color differs.

SOURCE FIDELITY
Do NOT redraw, redesign, mirror, rotate or change the camera angle. Keep the exact shape, proportions, perspective, all parts, logos and text exactly as in the source.

BACKGROUND
Remove all background, props and environment, including anything visible through transparent parts and inside openings or gaps. Replace with pure solid white (#FFFFFF). Keep the transparent parts' own edges and reflections.
Clean product edges with 1–2 px natural anti-aliasing blending into white. No halo, no fringe, no grey or colored outline, no leftover background color. No shadow, no floor line, no reflection surface.

CANVAS
Exact output size: 1333 × 2000 pixels (width × height), portrait. Exactly 1333 × 2000, not approximately.
Product centered horizontally, total height about 1600 px, about 200 px empty space at top and bottom. If the product is too wide, reduce its height to fit and keep the aspect ratio. Do not crop, stretch or distort any part.

COLOR
Recolor ONLY the main customizable outer body, including any protruding parts that belong to it (spout, tip, edges, seams), so no area keeps the old color. Use the exact same recolor area in every output.
Finish: ${defaultFinish}.
Keep luminance, lighting direction, highlight and shadow placement from the source; change only hue and saturation. Do not shift the tone toward another hue, do not oversaturate, no chrome or mirror effect, no blown-out white areas, no flat paint look.

COLORS
${colours.join('\n') || '[RENK VARYANTI EKSİK]'}

DO NOT CHANGE
Transparent/glass parts, lids, knobs, handles, buttons, cables, bases, separate metal parts, logos and text. Do not add, remove, move or scale anything.

OUTPUT
One separate file per color, in the order listed.
Format: WebP (.webp), lossless. Not PNG, not JPEG, not lossy WebP.
Opaque white background, no transparency. Each file exactly 1333 × 2000 px.
File names:
${product.variants.map((v, i) => `${slug(product.name)}-${slug(v.color)}-${i + 1}-1333x2000.webp`).join('\n') || `${slug(product.name)}-[renk-adı]-[sıra]-1333x2000.webp`}`
}
