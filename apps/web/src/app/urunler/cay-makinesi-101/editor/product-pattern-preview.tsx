"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./editor.module.css";
import { deriveProductLighting, shadePattern } from "./product-lighting";
import { DEFAULT_CURVATURE_STRENGTH, deriveBodySurface, warpPattern } from "./product-surface-warp";

import { containArtwork } from "./artwork-placement";

// Tea Maker reference size; every other product passes its own photo size (the mask is aligned to it).
const DEFAULT_WIDTH = 1066;
const DEFAULT_HEIGHT = 1600;
/** Default pattern centre: middle of the width, 65% down - the lower body on the reference photo. */
export const defaultPatternCentre = (width: number, height: number) => ({ x: Math.round(width / 2), y: Math.round(height * .65) });

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
  placementMode?: "pattern" | "artwork";
  onArtworkMove?: (x: number, y: number) => void;
  patternTransform: PatternTransform;
  curvatureStrength?: number;
  alt: string;
  width?: number;
  height?: number;
};

async function loadImage(src: string) {
  const image = new window.Image();
  // Photos and masks may come from the commerce API origin in development; CORS keeps the canvas readable.
  if (!src.startsWith("blob:") && !src.startsWith("data:")) image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  return image;
}

async function loadAlignedImage(src: string, width: number, height: number) {
  const image = await loadImage(src);
  if (image.naturalWidth !== width || image.naturalHeight !== height) {
    throw new Error("Unexpected asset dimensions");
  }
  return image;
}

function validateMaskAlpha(mask: HTMLImageElement, width: number, height: number) {
  const buffer = document.createElement("canvas");
  buffer.width = width;
  buffer.height = height;
  const context = buffer.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(mask, 0, 0);
  const { data } = context.getImageData(0, 0, width, height);
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
  artwork: ReturnType<typeof containArtwork>;
  surface: ReturnType<typeof deriveBodySurface>;
};

export default function ProductPatternPreview({ productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc, placementMode = "pattern", onArtworkMove, patternTransform, curvatureStrength = DEFAULT_CURVATURE_STRENGTH, alt, width: SOURCE_WIDTH = DEFAULT_WIDTH, height: SOURCE_HEIGHT = DEFAULT_HEIGHT }: ProductPatternPreviewProps) {
  const centre = defaultPatternCentre(SOURCE_WIDTH, SOURCE_HEIGHT);
  const drag = useRef<{pointerId:number; startX:number; startY:number; x:number; y:number} | null>(null);
  const [cursor,setCursor] = useState<"auto" | "grab" | "grabbing">("auto");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const assetKey = JSON.stringify([productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc, placementMode, SOURCE_WIDTH, SOURCE_HEIGHT]);
  const [result, setResult] = useState<{ assetKey: string; status: "ready" | "error"; assets?: RenderAssets } | null>(null);
  const { x, y, scale, rotation } = patternTransform;
  const validTransform = [x, y, scale, rotation, curvatureStrength].every(Number.isFinite) && scale > 0 && curvatureStrength >= 0 && curvatureStrength <= 1;
  const status = !validTransform ? "error" : result?.assetKey === assetKey ? result.status : "loading";

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const [product, mask, pattern, branding] = await Promise.all([
          loadAlignedImage(productSrc, SOURCE_WIDTH, SOURCE_HEIGHT),
          loadAlignedImage(designableMaskSrc, SOURCE_WIDTH, SOURCE_HEIGHT),
          loadImage(patternSrc),
          brandingOverlaySrc ? loadAlignedImage(brandingOverlaySrc, SOURCE_WIDTH, SOURCE_HEIGHT) : undefined,
        ]);
        validateMaskAlpha(mask, SOURCE_WIDTH, SOURCE_HEIGHT);
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
        const artwork = placementMode === "artwork" ? containArtwork(maskPixels, pattern.naturalWidth, pattern.naturalHeight) : {...centre,width:pattern.naturalWidth,height:pattern.naturalHeight};
        setResult({ assetKey, status: "ready", assets: { product, mask, pattern, branding, patternBuffer, lighting, surface, artwork } });
      } catch {
        if (!cancelled) setResult({ assetKey, status: "error" });
      }
    }
    void render();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- centre derives from the size, which is part of assetKey
  }, [productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc, assetKey, placementMode, SOURCE_WIDTH, SOURCE_HEIGHT]);

  useLayoutEffect(() => {
    if (status !== "ready" || !result?.assets) return;
    const { product, mask, pattern, branding, patternBuffer, lighting, surface, artwork } = result.assets;
    const buffer = patternBuffer.getContext("2d")!;
    const context = canvasRef.current!.getContext("2d")!;
    buffer.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
    buffer.save();
    buffer.translate(placementMode === "artwork" ? artwork.x + x - centre.x : x, placementMode === "artwork" ? artwork.y + y - centre.y : y);
    buffer.rotate(rotation * Math.PI / 180);
    buffer.scale(scale, scale);
    if (placementMode === "artwork") buffer.drawImage(pattern, -artwork.width / 2, -artwork.height / 2, artwork.width, artwork.height);
    else buffer.drawImage(pattern, -pattern.naturalWidth / 2, -pattern.naturalHeight / 2);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- centre and size follow the loaded assets
  }, [result, status, x, y, scale, rotation, curvatureStrength, placementMode]);

  // Hit the rendered, warped and mask-clipped artwork alpha, not the whole product.
  const draggable = placementMode === "artwork" && !!onArtworkMove && status === "ready";
  function sourcePoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect=event.currentTarget.getBoundingClientRect();
    return {x:(event.clientX-rect.left)*SOURCE_WIDTH/rect.width,y:(event.clientY-rect.top)*SOURCE_HEIGHT/rect.height};
  }
  function hit(point:{x:number;y:number}) {
    if(!draggable || !result?.assets || point.x<0 || point.y<0 || point.x>=SOURCE_WIDTH || point.y>=SOURCE_HEIGHT)return false;
    return result.assets.patternBuffer.getContext("2d")!.getImageData(Math.floor(point.x),Math.floor(point.y),1,1).data[3]>32;
  }
  function endDrag(event: React.PointerEvent<HTMLCanvasElement>) {
    if(drag.current?.pointerId!==event.pointerId)return;
    drag.current=null;setCursor(hit(sourcePoint(event))?"grab":"auto");
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return <div className={styles.productPreview} aria-busy={status === "loading"}>
    <canvas ref={canvasRef} width={SOURCE_WIDTH} height={SOURCE_HEIGHT} role="img" aria-label={alt} hidden={status !== "ready"}
      style={draggable ? {touchAction:"none",cursor} : undefined}
      onPointerDown={event=>{
        if(event.button!==0 || !event.isPrimary || !hit(sourcePoint(event)))return;
        const point=sourcePoint(event);drag.current={pointerId:event.pointerId,startX:point.x,startY:point.y,x,y};
        event.currentTarget.setPointerCapture(event.pointerId);setCursor("grabbing");event.preventDefault();
      }}
      onPointerMove={event=>{
        const point=sourcePoint(event),active=drag.current;
        if(active && active.pointerId===event.pointerId && draggable){
          onArtworkMove!(Math.max(0,Math.min(SOURCE_WIDTH,active.x+point.x-active.startX)),Math.max(0,Math.min(SOURCE_HEIGHT,active.y+point.y-active.startY)));
        }else if(draggable)setCursor(hit(point)?"grab":"auto");
      }}
      onPointerUp={endDrag} onPointerCancel={endDrag}
      onLostPointerCapture={()=>{drag.current=null;setCursor("auto")}}
      onPointerLeave={()=>{if(!drag.current)setCursor("auto")}}
    />
    {status !== "ready" && <div className={styles.previewMessage} role={status === "error" ? "alert" : "status"}>
      <p>{status === "error" ? "Ürün önizlemesi yüklenemedi. Lütfen sayfayı yenileyin." : "Ürün önizlemesi hazırlanıyor…"}</p>
    </div>}
  </div>;
}
