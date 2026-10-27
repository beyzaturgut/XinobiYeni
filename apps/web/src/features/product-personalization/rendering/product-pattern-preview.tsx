"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./product-pattern-preview.module.css";
import { deriveProductLighting, shadePattern } from "./product-lighting";
import { DEFAULT_CURVATURE_STRENGTH, deriveBodySurface, warpPattern } from "./product-surface-warp";

import { applySurfaceInk } from "./surface-ink";
import { containArtwork } from "./artwork-placement";
import { separatedBodyPlacements, type BodyPlacementAdjustment, type BodySurfaceId } from "./separated-body-placement";




export type PatternTransform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

type ProductPatternPreviewProps = {
  errorFallback?: React.ReactNode;
  surfaceTreatment?: "legacy" | "metallic-ink";
  surfaceInkExposureStops?: number;
  onRendered?: (canvas: HTMLCanvasElement) => void;
  sourceWidth?: number;
  sourceHeight?: number;
  assetWidth?: number;
  assetHeight?: number;
  productSrc: string;
  designableMaskSrc: string;
  brandingOverlaySrc?: string;
  patternSrc: string;
  placementMode?: "pattern" | "artwork";
  fillMask?: boolean;
  /** A single artwork overlay uses the existing mask/warp, without repainting the product. */
  transparentProduct?: boolean;
  children?: React.ReactNode;
  onArtworkMove?: (x: number, y: number) => void;
  patternTransform: PatternTransform;
  /** Optional offsets composed over the existing shared controls. x/y add pixels, scale multiplies, rotation adds degrees. */
  bodyPlacementAdjustments?: Partial<Record<BodySurfaceId, BodyPlacementAdjustment>>;
  curvatureStrength?: number;
  alt: string;
};

async function loadImage(src: string) {
  const image = new window.Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  return image;
}

async function loadAlignedPreviewImage(src: string, ASSET_WIDTH: number, ASSET_HEIGHT: number, previewWidth: number, previewHeight: number, smooth: boolean) {
  const image = await loadImage(src);
  if (image.naturalWidth !== ASSET_WIDTH || image.naturalHeight !== ASSET_HEIGHT) {
    throw new Error("Unexpected asset dimensions");
  }
  const preview = document.createElement("canvas");
  preview.width = previewWidth;
  preview.height = previewHeight;
  const context = preview.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.imageSmoothingEnabled = smooth;
  context.drawImage(image, 0, 0, previewWidth, previewHeight);
  image.src = "data:,";
  return preview;
}

function validateMaskAlpha(mask: CanvasImageSource, SOURCE_WIDTH: number, SOURCE_HEIGHT: number) {
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

type BodyPlacement = ReturnType<typeof separatedBodyPlacements>[number] & { clipPath: Path2D };
type RenderAssets = {
  sourcePixels?: ImageData;
  product: HTMLCanvasElement;
  mask: HTMLCanvasElement;
  pattern: HTMLImageElement;
  branding?: HTMLCanvasElement;
  patternBuffer: HTMLCanvasElement;
  lighting: ReturnType<typeof deriveProductLighting>;
  artwork: ReturnType<typeof containArtwork>;
  bodies: BodyPlacement[];
  surface: ReturnType<typeof deriveBodySurface>;
};

export default function ProductPatternPreview({ errorFallback, onRendered, surfaceTreatment = "legacy", surfaceInkExposureStops, sourceWidth = 1066, sourceHeight = 1600, assetWidth = sourceWidth, assetHeight = sourceHeight, productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc, placementMode = "pattern", fillMask = false, transparentProduct = false, children, onArtworkMove, patternTransform, bodyPlacementAdjustments, curvatureStrength = DEFAULT_CURVATURE_STRENGTH, alt }: ProductPatternPreviewProps) {
  const SOURCE_WIDTH = sourceWidth, SOURCE_HEIGHT = sourceHeight;
  const ASSET_WIDTH = assetWidth, ASSET_HEIGHT = assetHeight;
  const dimensionsValid = Number.isInteger(sourceWidth) && Number.isInteger(sourceHeight) && sourceWidth > 0 && sourceHeight > 0 && sourceWidth <= 6000 && sourceHeight <= 6000 && sourceWidth * sourceHeight <= 20000000;
  const centerX = sourceWidth / 2, centerY = sourceHeight * (fillMask ? .5 : .65);
  const drag = useRef<{pointerId:number; startX:number; startY:number; x:number; y:number} | null>(null);
  const [cursor,setCursor] = useState<"auto" | "grab" | "grabbing">("auto");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectiveSurfaceInkExposureStops = placementMode === "pattern" ? surfaceInkExposureStops : undefined;
  const assetKey = JSON.stringify([productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc, placementMode, sourceWidth, sourceHeight, assetWidth, assetHeight, surfaceTreatment, effectiveSurfaceInkExposureStops]);
  const [result, setResult] = useState<{ assetKey: string; status: "ready" | "error"; assets?: RenderAssets } | null>(null);
  const { x, y, scale, rotation } = patternTransform;
  const validBodyAdjustments = Object.values(bodyPlacementAdjustments ?? {}).every((adjustment) => !adjustment || [adjustment.x ?? 0, adjustment.y ?? 0, adjustment.scale ?? 1, adjustment.rotation ?? 0].every(Number.isFinite) && (adjustment.scale ?? 1) > 0);
  const validTransform = dimensionsValid && [x, y, scale, rotation, curvatureStrength].every(Number.isFinite) && scale > 0 && curvatureStrength >= 0 && curvatureStrength <= 1 && validBodyAdjustments;
  const status = !validTransform ? "error" : result?.assetKey === assetKey ? result.status : "loading";

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        // Decode the original assets one at a time and retain only aligned preview-sized
        // canvases. Large accepted catalog images can otherwise keep three 25+ MP
        // bitmaps alive together and exhaust browser image-decoder memory.
        const product = await loadAlignedPreviewImage(productSrc, ASSET_WIDTH, ASSET_HEIGHT, SOURCE_WIDTH, SOURCE_HEIGHT, true);
        const mask = await loadAlignedPreviewImage(designableMaskSrc, ASSET_WIDTH, ASSET_HEIGHT, SOURCE_WIDTH, SOURCE_HEIGHT, false);
        const pattern = await loadImage(patternSrc);
        const branding = brandingOverlaySrc ? await loadAlignedPreviewImage(brandingOverlaySrc, ASSET_WIDTH, ASSET_HEIGHT, SOURCE_WIDTH, SOURCE_HEIGHT, true) : undefined;
        validateMaskAlpha(mask, SOURCE_WIDTH, SOURCE_HEIGHT);
        if (cancelled) return;
        const patternBuffer = document.createElement("canvas");
        patternBuffer.width = SOURCE_WIDTH;
        patternBuffer.height = SOURCE_HEIGHT;
        const buffer = patternBuffer.getContext("2d", { willReadFrequently: true });
        if (!canvasRef.current?.getContext("2d") || !buffer) throw new Error("Canvas unavailable");
        const readPixels = (image: CanvasImageSource, smooth = true) => {
          buffer.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
          buffer.imageSmoothingEnabled = smooth;
          buffer.drawImage(image, 0, 0);
          return buffer.getImageData(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
        };
        const maskPixels = readPixels(mask, false);
        const sourcePixels = readPixels(product);
        const lighting = deriveProductLighting(sourcePixels, maskPixels, branding ? readPixels(branding) : undefined);
        const surface = deriveBodySurface(maskPixels, surfaceTreatment === "metallic-ink");
        const bodies: BodyPlacement[] = (surfaceTreatment === "metallic-ink" ? separatedBodyPlacements(maskPixels, pattern.naturalWidth, pattern.naturalHeight, placementMode === "artwork") : []).map(body => { const clipPath = new Path2D(); for (const run of body.runs) clipPath.rect(run.start, run.y, run.end - run.start + 1, 1); return { ...body, clipPath }; });
        const artwork = bodies.length ? bodies[0] : placementMode === "artwork" ? containArtwork(maskPixels, pattern.naturalWidth, pattern.naturalHeight, surfaceTreatment === "metallic-ink" ? 0.6 : 0.8) : {x:centerX,y:centerY,width:pattern.naturalWidth,height:pattern.naturalHeight};
        setResult({ assetKey, status: "ready", assets: { sourcePixels: surfaceTreatment === "metallic-ink" ? sourcePixels : undefined, product, mask, pattern, branding, patternBuffer, lighting, surface, artwork, bodies } });
      } catch {
        if (!cancelled) setResult({ assetKey, status: "error" });
      }
    }
    void render();
    return () => { cancelled = true; };
  }, [productSrc, designableMaskSrc, brandingOverlaySrc, patternSrc, assetKey, placementMode, SOURCE_WIDTH, SOURCE_HEIGHT, ASSET_WIDTH, ASSET_HEIGHT, centerX, centerY, dimensionsValid, surfaceTreatment]);

  useLayoutEffect(() => {
    if (status !== "ready" || !result?.assets) return;
    const { sourcePixels, product, mask, pattern, branding, patternBuffer, lighting, surface, artwork, bodies } = result.assets;
    const buffer = patternBuffer.getContext("2d")!;
    const context = canvasRef.current!.getContext("2d")!;
    buffer.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
    const warpEachBodyBeforeMask = placementMode === "pattern" && surfaceTreatment === "metallic-ink" && bodies.length > 1;
    if (warpEachBodyBeforeMask) {
      // Keep source pattern pixels available to the horizontal warp. Clip each
      // warped body layer afterwards, then retain the accepted full mask clip below.
      context.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
      const sharedPatternScale = Math.max(...bodies.map(body => Math.max(body.width / pattern.naturalWidth, body.height / pattern.naturalHeight)));
      for (const body of bodies) {
        buffer.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
        const adjustment=bodyPlacementAdjustments?.[body.id];
        buffer.save();
        if(adjustment){
          buffer.translate(body.x+x-centerX+(adjustment.x??0),body.y+y-centerY+(adjustment.y??0));
          buffer.rotate((rotation+(adjustment.rotation??0))*Math.PI/180);
          buffer.scale(scale*(adjustment.scale??1),scale*(adjustment.scale??1));
        }else{
          buffer.translate(body.x+x-centerX,body.y+y-centerY);
          buffer.rotate(rotation*Math.PI/180);
          buffer.scale(scale,scale);
        }
        buffer.drawImage(pattern,-pattern.naturalWidth*sharedPatternScale/2,-pattern.naturalHeight*sharedPatternScale/2,pattern.naturalWidth*sharedPatternScale,pattern.naturalHeight*sharedPatternScale);
        buffer.restore();
        const bodyPixels=buffer.getImageData(0,0,SOURCE_WIDTH,SOURCE_HEIGHT);
        warpPattern(bodyPixels,surface,curvatureStrength);
        if(sourcePixels)applySurfaceInk(bodyPixels,sourcePixels,lighting,effectiveSurfaceInkExposureStops);
        buffer.putImageData(bodyPixels,0,0);
        buffer.save();
        buffer.globalCompositeOperation="destination-in";
        buffer.fillStyle="#fff";
        buffer.fill(body.clipPath);
        buffer.restore();
        context.drawImage(patternBuffer,0,0);
      }
      buffer.clearRect(0,0,SOURCE_WIDTH,SOURCE_HEIGHT);
      buffer.drawImage(canvasRef.current!,0,0);
    } else if (placementMode === "pattern" && bodies.length) {
      // Pattern mode uses one common natural-image scale, sized to cover the
      // largest component. Artwork instead uses the single movable rectangle below.
      const sharedPatternScale = placementMode === "pattern" && bodies.length > 1
        ? Math.max(...bodies.map(body => Math.max(body.width / pattern.naturalWidth, body.height / pattern.naturalHeight)))
        : null;
      for (const body of bodies) {
        buffer.save();
        // Each body has its own centre and fit. Shared controls apply the same
        // source-coordinate movement, scale and rotation to both placements.
        buffer.clip(body.clipPath);
        const adjustment=bodyPlacementAdjustments?.[body.id];
        if(adjustment){
          buffer.translate(body.x+x-centerX+(adjustment.x??0),body.y+y-centerY+(adjustment.y??0));
          buffer.rotate((rotation+(adjustment.rotation??0))*Math.PI/180);
          const bodyScale=scale*(adjustment.scale??1);
          buffer.scale(bodyScale,bodyScale);
        }else{
          buffer.translate(body.x+x-centerX,body.y+y-centerY);
          buffer.rotate(rotation*Math.PI/180);
          buffer.scale(scale,scale);
        }
        const drawWidth = sharedPatternScale === null ? body.width : pattern.naturalWidth * sharedPatternScale;
        const drawHeight = sharedPatternScale === null ? body.height : pattern.naturalHeight * sharedPatternScale;
        buffer.drawImage(pattern,-drawWidth/2,-drawHeight/2,drawWidth,drawHeight);
        buffer.restore();
      }
    } else {
    buffer.save();
    buffer.translate(placementMode === "artwork" ? artwork.x + x - centerX : x, placementMode === "artwork" ? artwork.y + y - centerY : y);
    buffer.rotate(rotation * Math.PI / 180);
    buffer.scale(scale, scale);
    if (placementMode === "artwork") buffer.drawImage(pattern, -artwork.width / 2, -artwork.height / 2, artwork.width, artwork.height);
    else { const ratio = fillMask ? Math.max(SOURCE_WIDTH / pattern.naturalWidth, SOURCE_HEIGHT / pattern.naturalHeight) : SOURCE_WIDTH / 1066; buffer.drawImage(pattern, -pattern.naturalWidth * ratio / 2, -pattern.naturalHeight * ratio / 2, pattern.naturalWidth * ratio, pattern.naturalHeight * ratio); }
    buffer.restore();
    }
    if(!warpEachBodyBeforeMask){
      const patternPixels = buffer.getImageData(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
      warpPattern(patternPixels, surface, curvatureStrength);
      if (surfaceTreatment === "metallic-ink" && sourcePixels) applySurfaceInk(patternPixels, sourcePixels, lighting, effectiveSurfaceInkExposureStops);
      else shadePattern(patternPixels, lighting);
      buffer.putImageData(patternPixels, 0, 0);
    }
    // The mask stays in source coordinates; only the pattern is transformed.
    buffer.save();
    buffer.globalCompositeOperation = "destination-in";
    buffer.drawImage(mask, 0, 0);
    buffer.restore();
    context.clearRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
    if (!transparentProduct) context.drawImage(product, 0, 0);
    context.drawImage(patternBuffer, 0, 0);
    // The base preview already restores branding. An overlay must not blend its
    // antialiased logo pixels a second time; artwork remains inside the mask.
    if (branding && !transparentProduct) context.drawImage(branding, 0, 0);
    onRendered?.(canvasRef.current!);
  }, [result, status, x, y, scale, rotation, bodyPlacementAdjustments, curvatureStrength, placementMode, fillMask, transparentProduct, SOURCE_WIDTH, SOURCE_HEIGHT, centerX, centerY, surfaceTreatment, effectiveSurfaceInkExposureStops, onRendered]);

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
  if (status === "error" && errorFallback) return <>{errorFallback}</>;
  return <div className={styles.productPreview} style={{aspectRatio:SOURCE_WIDTH+"/"+SOURCE_HEIGHT, "--source-aspect":String(SOURCE_WIDTH/SOURCE_HEIGHT)} as React.CSSProperties} aria-busy={status === "loading"}>
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
      <p>{status === "error" ? "Ürün görselleri doğrulanamadı veya tarayıcıda işlenemedi. Sayfayı yenileyip yeniden deneyin." : "Ürün önizlemesi hazırlanıyor…"}</p>
    </div>}
    {status === "ready" && children}
  </div>;
}
