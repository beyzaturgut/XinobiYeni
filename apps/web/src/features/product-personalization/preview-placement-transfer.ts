import type { RenderingInputs } from './rendering/accepted-surface-api';
import type { PatternTransform } from './rendering/product-pattern-preview';
import { separatedBodyPlacements, type BodyPlacementAdjustment, type BodySurfaceId } from './rendering/separated-body-placement';

type BodyId = 'upper-body' | 'lower-body';
export type PreviewBody = { id: BodyId; left: number; top: number; width: number; height: number };
export type PreviewGeometry = { width: number; height: number; bodies: PreviewBody[] };
export type PreviewPlacements = {
  pattern: PatternTransform;
  artwork: PatternTransform;
  bodyAdjustments?: Partial<Record<BodySurfaceId, BodyPlacementAdjustment>>;
};
export type PlacementTransferHandle = { prepare(next: RenderingInputs): Promise<null | (() => boolean)> };
const geometries = new Map<string, Promise<PreviewGeometry>>();

/** Working-resolution diagnostic copy; accepted pixels are never changed.
 * Only two significant, named bodies are eligible for automatic adaptation. */
export function loadPreviewGeometry(inputs: RenderingInputs): Promise<PreviewGeometry> {
  const key = JSON.stringify([inputs.mask.url, inputs.mask.sha256, inputs.width, inputs.height]);
  const existing = geometries.get(key); if (existing) return existing;
  const request = (async () => {
    const response = await fetch(inputs.mask.url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw Error('Mask unavailable');
    const blob = await response.blob();
    if (blob.size > 32 * 1024 * 1024 || blob.size < 24) throw Error('Invalid mask size');
    const bytes = await blob.arrayBuffer(), header = new DataView(bytes);
    if (header.getUint32(0) !== 0x89504e47 || header.getUint32(4) !== 0x0d0a1a0a ||
        header.getUint32(16) !== (inputs.assetWidth ?? inputs.width) || header.getUint32(20) !== (inputs.assetHeight ?? inputs.height)) throw Error('Mixed mask dimensions');
    const checksum = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map(value => value.toString(16).padStart(2, '0')).join('');
    if (checksum !== inputs.mask.sha256) throw Error('Mixed mask version');
    // Match the renderer's working coordinates. Thumbnail sampling can join
    // narrow transparent seams and would silently change body identity.
    const { width, height } = inputs;
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width * height > 16_000_000) throw Error('Geometry analysis exceeds safe working resolution');
    const bitmap = await createImageBitmap(blob, { resizeWidth: width, resizeHeight: height, resizeQuality: 'pixelated' });
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    try {
      const context = canvas.getContext('2d', { willReadFrequently: true }); if (!context) throw Error('Canvas unavailable');
      context.imageSmoothingEnabled = false; context.drawImage(bitmap, 0, 0);
      const regions = separatedBodyPlacements(context.getImageData(0, 0, width, height), 1, 1, false);
      if (regions.length !== 2 || regions[0].id !== 'upper-body' || regions[1].id !== 'lower-body') throw Error('Ambiguous bodies');
      return { width: inputs.width, height: inputs.height, bodies: regions.map(body => ({
        id: body.id as BodyId, left: body.left * inputs.width / width, top: body.top * inputs.height / height,
        width: (body.right - body.left + 1) * inputs.width / width, height: (body.bottom - body.top + 1) * inputs.height / height,
      })) };
    } finally { bitmap.close(); canvas.width = 0; canvas.height = 0; }
  })().catch(error => { geometries.delete(key); throw error; });
  geometries.set(key, request); return request;
}

const rounded = (value: number) => Number(value.toFixed(10));
function body(geometry: PreviewGeometry, id: BodyId) {
  const matches = geometry.bodies.filter(value => value.id === id);
  if (matches.length !== 1) throw Error('Missing body');
  const value = matches[0];
  if (![value.left, value.top, value.width, value.height].every(Number.isFinite) || value.width <= 0 || value.height <= 0) throw Error('Invalid body');
  return value;
}
function fit(upper: PreviewBody, image: {width: number; height: number}) {
  return Math.min(upper.width / image.width, upper.height / image.height) * .6;
}

/** Reinterpret placements on the same logical surface, not as photo registration.
 * Artwork preserves aspect ratio, relative body width and rotation. Pattern
 * offsets are normalised separately for each body; existing shared controls remain. */
export function transferPreviewPlacements(from: PreviewGeometry, to: PreviewGeometry, state: PreviewPlacements, image?: {width: number; height: number}): PreviewPlacements {
  if (![from.width, from.height, to.width, to.height].every(value => Number.isFinite(value) && value > 0)) throw Error('Invalid frame');
  const upper = body(from, 'upper-body'), targetUpper = body(to, 'upper-body');
  body(from, 'lower-body'); body(to, 'lower-body');
  const offsets = (['upper-body', 'lower-body'] as const).map(id => {
    const old = body(from, id), next = body(to, id), adjustment = state.bodyAdjustments?.[id];
    return { id, x: (state.pattern.x - from.width / 2 + (adjustment?.x ?? 0)) / old.width * next.width,
      y: (state.pattern.y - from.height * .65 + (adjustment?.y ?? 0)) / old.height * next.height };
  });
  const pattern = { ...state.pattern, x: rounded(to.width / 2 + offsets[0].x), y: rounded(to.height * .65 + offsets[0].y) };
  const bodyAdjustments: PreviewPlacements['bodyAdjustments'] = {};
  for (const offset of offsets) {
    const x = rounded(offset.x - offsets[0].x), y = rounded(offset.y - offsets[0].y);
    if (Math.abs(x) > 1e-8 || Math.abs(y) > 1e-8) bodyAdjustments[offset.id] = { x, y };
  }
  let artwork: PatternTransform = { ...state.artwork, x: to.width / 2, y: to.height * .65 };
  if (image) {
    if (![image.width, image.height].every(value => Number.isFinite(value) && value > 0)) throw Error('Invalid artwork');
    const center = { x: upper.left + upper.width / 2 + state.artwork.x - from.width / 2,
      y: upper.top + upper.height / 2 + state.artwork.y - from.height * .65 };
    // Avoid assigning a seam, outside placement, or overlapping bounds to a guessed body.
    const owners = from.bodies.filter(value => {
      const margin = 2;
      return center.x > value.left + margin && center.x < value.left + value.width - margin &&
        center.y > value.top + margin && center.y < value.top + value.height - margin;
    });
    if (owners.length !== 1) throw Error('Artwork centre is not inside one body');
    const owner = owners[0], next = body(to, owner.id);
    const u = (center.x - owner.left) / owner.width, v = (center.y - owner.top) / owner.height;
    artwork = { ...state.artwork,
      x: rounded(to.width / 2 + next.left + u * next.width - (targetUpper.left + targetUpper.width / 2)),
      y: rounded(to.height * .65 + next.top + v * next.height - (targetUpper.top + targetUpper.height / 2)),
      scale: rounded(state.artwork.scale * fit(upper, image) / fit(targetUpper, image) * next.width / owner.width) };
  }
  for (const [placement, frame] of [[pattern, to], [artwork, to]] as const) {
    if (![placement.x, placement.y, placement.scale, placement.rotation].every(Number.isFinite) ||
        placement.x < 0 || placement.x > frame.width || placement.y < 0 || placement.y > frame.height || placement.scale < .25 || placement.scale > 3) throw Error('Placement outside supported controls');
  }
  return { pattern, artwork, bodyAdjustments: Object.keys(bodyAdjustments).length ? bodyAdjustments : undefined };
}
