// Temporary development read seam; future Catalog/Asset resolver can supply these rendering inputs.
export type RenderingMedia = { url: string; sha256: string };
export type RenderingInputs = {
  surfaceVersion: string; sourceMediaVersion: string; width: number; height: number;
  source: RenderingMedia; mask: RenderingMedia; brandingRequired: boolean; branding: RenderingMedia | null;
};
export const surfaceRoot = "/api/v1/dev/product-surfaces/cay-makinesi-101";
const checksum = /^[a-f0-9]{64}$/;
function media(value: unknown): value is RenderingMedia {
  if (!value || typeof value !== "object") return false;
  const item = value as RenderingMedia;
  // Same-origin static assets only; no remote provider or arbitrary asset URL.
  return typeof item.url === "string" && /^\/assets\/[a-zA-Z0-9/_-]+\.(png|webp)\?v=[a-f0-9]{64}$/.test(item.url)
    && typeof item.sha256 === "string" && checksum.test(item.sha256) && item.url.endsWith(`?v=${item.sha256}`);
}
export async function loadAcceptedSurface(variantReference: string, signal: AbortSignal): Promise<RenderingInputs | null> {
  const response = await fetch(`${surfaceRoot}/${encodeURIComponent(variantReference)}/rendering-inputs`, { signal, cache: "no-store" });
  if (response.status === 404) return null; // Development endpoint is gated off.
  if (!response.ok) throw new Error("Preview unavailable");
  const value = await response.json();
  if (value.scope !== "development-preview" || value.productReference !== "cay-makinesi-101" || value.variantReference !== variantReference)
    throw new Error("Invalid preview bundle");
  if (value.previewAvailable === false && value.inputs === null) return null;
  const input = value.inputs as RenderingInputs | undefined;
  if (value.previewAvailable !== true || variantReference !== "blue" || !input || input.width !== 1066 || input.height !== 1600
    || !checksum.test(input.surfaceVersion) || typeof input.sourceMediaVersion !== "string" || !input.sourceMediaVersion
    || !media(input.source) || !media(input.mask) || typeof input.brandingRequired !== "boolean"
    || (input.branding !== null && !media(input.branding)) || (input.brandingRequired && !input.branding))
    throw new Error("Invalid preview inputs");
  return input;
}
