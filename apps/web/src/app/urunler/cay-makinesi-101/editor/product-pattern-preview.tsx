"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./editor.module.css";
import { deriveProductLighting, shadePattern } from "./product-lighting";
import { DEFAULT_CURVATURE_STRENGTH, deriveBodySurface, warpPattern } from "./product-surface-warp";

const SOURCE_WIDTH = 1066;
const SOURCE_HEIGHT = 1600;

export type PatternTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

type ProductPatternPreviewProps = {
  productSrc: string;
  designableMaskSrc: string;
  brandingOverlaySrc?: string;
  patternSrc: string;
  patternTransform: PatternTransform;
  curvatureStrength?: number;
  alt: string;
};

async function loadImage(src: string) {
  const image = new window.Image();
  image.src = src;
  await image.decode();
  return image;
}

async function loadAlignedImage(src: string) {
  const image = await loadImage(src);
  if (image.naturalWidth !== SOURCE_WIDTH || image.naturalHeight !== SOURCE_HEIGHT) {
    throw new Error("Unexpected asset dimensions");
  }
  return image;
}

function validateMaskAlpha(mask: HTMLImageElement) {
  const buffer = document.createElement("canvas");
  buffer.width = SOURCE_WIDTH;
  buffer.height = SOURCE_HEIGHT;
  const context = buffer.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(mask, 0, 0);
  const { data } = context.getImageData(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
  let hasTransparentPixel = false;
  let hasDesignablePixel = false;
  for (let index = 3; index < data.length; index += 4) {
    hasTransparentPixel ||= data[index] === 0;
    hasDesignablePixel ||= data[index] > 0;
    if (hasTransparentPixel && hasDesignablePixel) return;
  }
  throw new Error("Mask has no usable alpha region");
}

type RenderAssets = {
  product: HTMLImageElement;
  mask: HTMLImageElement;
  pattern: HTMLImageElement;
  branding?: HTMLImageElement;
  patternBuffer: HTMLCanvasElement;
  lighting: ReturnType<typeof deriveProductLighting>;
  surface: ReturnType<typeof deriveBodySurface>;
};

export default function ProductPatternPreview({ productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc, patternTransform, curvatureStrength = DEFAULT_CURVATURE_STRENGTH, alt }: ProductPatternPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assetKey = JSON.stringify([productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc]);
  const [result, setResult] = useState<{ assetKey: string; status: "ready" | "error"; assets?: RenderAssets } | null>(null);
  const { x, y, scale, rotation } = patternTransform;
  const validTransform = [x, y, scale, rotation, curvatureStrength].every(Number.isFinite) && scale > 0 && curvatureStrength >= 0 && curvatureStrength <= 1;
  const status = !validTransform ? "error" : result?.assetKey === assetKey ? result.status : "loading";

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const [product, mask, pattern, branding] = await Promise.all([
          loadAlignedImage(productSrc),
          loadAlignedImage(designableMaskSrc),
          loadImage(patternSrc),
          brandingOverlaySrc ? loadAlignedImage(brandingOverlaySrc) : undefined,
        ]);
        validateMaskAlpha(mask);
        if (cancelled) return;
        const patternBuffer = document.createElement("canvas");
        patternBuffer.width = SOURCE_WIDTH;
        patternBuffer.height = SOURCE_HEIGHT;
        const buffer = patternBuffer.getContext("2d", { willReadFrequently: true });
        if (!canvasRef.current?.getContext("2d") || !buffer) throw new Error("Canvas unavailable");
        const readPixels = (image: HTMLImageElement) => {
          buffer.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
          buffer.drawImage(image, 0, 0);
          return buffer.getImageData(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
        };
        const maskPixels = readPixels(mask);
        const lighting = deriveProductLighting(readPixels(product), maskPixels, branding ? readPixels(branding) : undefined);
        const surface = deriveBodySurface(maskPixels);
        setResult({ assetKey, status: "ready", assets: { product, mask, pattern, branding, patternBuffer, lighting, surface } });
      } catch {
        if (!cancelled) setResult({ assetKey, status: "error" });
      }
    }
    void render();
    return () => { cancelled = true; };
  }, [productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc, assetKey]);

  useLayoutEffect(() => {
    if (status !== "ready" || !result?.assets) return;
    const { product, mask, pattern, branding, patternBuffer, lighting, surface } = result.assets;
    const buffer = patternBuffer.getContext("2d")!;
    const context = canvasRef.current!.getContext("2d")!;
    buffer.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
    buffer.save();
    buffer.translate(x, y);
    buffer.rotate(rotation * Math.PI / 180);
    buffer.scale(scale, scale);
    buffer.drawImage(pattern, -pattern.naturalWidth / 2, -pattern.naturalHeight / 2);
    buffer.restore();
    const patternPixels = buffer.getImageData(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
    warpPattern(patternPixels, surface, curvatureStrength);
    shadePattern(patternPixels, lighting);
    buffer.putImageData(patternPixels, 0, 0);
    // The mask stays in source coordinates; only the pattern is transformed.
    buffer.save();
    buffer.globalCompositeOperation = "destination-in";
    buffer.drawImage(mask, 0, 0);
    buffer.restore();
    context.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
    context.drawImage(product, 0, 0);
    context.drawImage(patternBuffer, 0, 0);
    if (branding) context.drawImage(branding, 0, 0);
  }, [result, status, x, y, scale, rotation, curvatureStrength]);

  return <div className={styles.productPreview} aria-busy={status === "loading"}>
    <canvas ref={canvasRef} width={SOURCE_WIDTH} height={SOURCE_HEIGHT} role="img" aria-label={alt} hidden={status !== "ready"} />
    {status !== "ready" && <div className={styles.previewMessage} role={status === "error" ? "alert" : "status"}>
      <p>{status === "error" ? "Ürün önizlemesi yüklenemedi. Lütfen sayfayı yenileyin." : "Ürün önizlemesi hazırlanıyor…"}</p>
    </div>}
  </div>;
}
