export type PreviewRect = { left: number; top: number; width: number; height: number }
export function imageGeometry(w: number, h: number, rect: PreviewRect) {
  if (![w, h, rect.left, rect.top, rect.width, rect.height].every(Number.isFinite) || w <= 0 || h <= 0 || rect.width <= 0 || rect.height <= 0) return null
  const scale = Math.min(rect.width / w, rect.height / h)
  return { scale, width: w * scale, height: h * scale, x: (rect.width - w * scale) / 2, y: (rect.height - h * scale) / 2 }
}
export function clickToSource(clientX: number, clientY: number, w: number, h: number, rect: PreviewRect) {
  const g = imageGeometry(w, h, rect)
  if (!g || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return null
  // Compare in display space first to keep the half-open right/bottom edge exact.
  if (clientX < rect.left + g.x || clientX >= rect.left + g.x + g.width || clientY < rect.top + g.y || clientY >= rect.top + g.y + g.height) return null
  const dx = clientX - rect.left - g.x, dy = clientY - rect.top - g.y
  if (dx < 0 || dx >= g.width || dy < 0 || dy >= g.height) return null
  return { x: dx / g.scale, y: dy / g.scale }
}

// Zoom/pan applies to the source-image rectangle, never DPR. Reuse half-open contain bounds.
export function correctionGeometry(w: number, h: number, rect: PreviewRect, zoom: number, pan: { x: number; y: number }) {
  const g = imageGeometry(w, h, rect)
  if (!g || !Number.isFinite(zoom) || zoom < 1 || !Number.isFinite(pan.x) || !Number.isFinite(pan.y)) return null
  const scale = g.scale * zoom
  return { scale, width: w * scale, height: h * scale, x: (rect.width - w * scale) / 2 + pan.x, y: (rect.height - h * scale) / 2 + pan.y }
}
export function correctionToSource(clientX: number, clientY: number, w: number, h: number, rect: PreviewRect, zoom: number, pan: { x: number; y: number }) {
  const g = correctionGeometry(w, h, rect, zoom, pan)
  if (!g || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return null
  const x = (clientX - rect.left - g.x) / g.scale, y = (clientY - rect.top - g.y) / g.scale
  return x >= 0 && y >= 0 && x < w && y < h ? { x, y } : null
}
