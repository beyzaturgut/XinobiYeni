"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import type { PatternTransform } from "./product-pattern-preview";
import { DEFAULT_CURVATURE_STRENGTH } from "./product-surface-warp";
import type { RenderingInputs } from "./accepted-surface-api";
import { loadPreviewGeometry, transferPreviewPlacements, type PlacementTransferHandle, type PreviewPlacements } from "../preview-placement-transfer";
import type { DesignPlacement } from "../../../lib/design-placement";

/** Starting placement of the uploaded image or pattern on a surface. */
export function defaultPatternTransform(inputs: Pick<RenderingInputs, "width" | "height">, placementMode: "pattern" | "artwork", fillMask: boolean): PatternTransform {
  return { x: inputs.width / 2, y: inputs.height * (fillMask ? .5 : .65), scale: fillMask ? 1 : placementMode === "artwork" ? 1 : 1.2, rotation: 0 };
}

/** Placement state shared by the editor workspace and the XINOBI U placement step: transforms, curvature,
 *  per-body adjustments, the saved-placement report and the colour-switch transfer. */
export function usePatternPlacement({ renderingInputs, placementMode, fillMask, artworkSrc, placementRef, onPlacementChange, initialPlacement }: { renderingInputs: RenderingInputs; placementMode: "pattern" | "artwork"; fillMask: boolean; artworkSrc?: string; placementRef?: Ref<PlacementTransferHandle>; onPlacementChange?: (value: DesignPlacement) => void; initialPlacement?: DesignPlacement }) {
  const restored = initialPlacement?.surfaceVersion === renderingInputs.surfaceVersion ? initialPlacement : undefined;
  const [patternTransform, setPatternTransform] = useState<PatternTransform>(restored ? { x: restored.x, y: restored.y, scale: restored.scale, rotation: restored.rotation } : defaultPatternTransform(renderingInputs, placementMode, fillMask));
  const [curvatureStrength, setCurvatureStrength] = useState(restored?.curvatureStrength ?? DEFAULT_CURVATURE_STRENGTH);
  const [artworkTransform, setArtworkTransform] = useState<PatternTransform>({ x: renderingInputs.width / 2, y: renderingInputs.height * .65, scale: 1, rotation: 0 });
  const [patternBodyAdjustments, setPatternBodyAdjustments] = useState<PreviewPlacements["bodyAdjustments"]>(restored?.bodyAdjustments);
  useEffect(() => {
    onPlacementChange?.({ sourceWidth: renderingInputs.width, sourceHeight: renderingInputs.height, surfaceVersion: renderingInputs.surfaceVersion, ...patternTransform, curvatureStrength, bodyAdjustments: patternBodyAdjustments, mode: placementMode, fillMask });
  }, [onPlacementChange, renderingInputs.width, renderingInputs.height, renderingInputs.surfaceVersion, patternTransform, curvatureStrength, patternBodyAdjustments, placementMode, fillMask]);
  const snapshot = useRef({ inputs: renderingInputs, pattern: patternTransform, artwork: artworkTransform, artworkSrc, bodyAdjustments: patternBodyAdjustments });
  useLayoutEffect(() => {
    snapshot.current = { inputs: renderingInputs, pattern: patternTransform, artwork: artworkTransform, artworkSrc, bodyAdjustments: patternBodyAdjustments };
  }, [renderingInputs, patternTransform, artworkTransform, artworkSrc, patternBodyAdjustments, curvatureStrength]);
  // A stable handle: it reads the latest placement from [snapshot] when a colour switch asks for it.
  const [transfer] = useState<PlacementTransferHandle>(() => ({
    async prepare(next) {
      const current = snapshot.current;
      try {
        // Sequential, bounded working-resolution analysis; cache only bounds.
        const from = await loadPreviewGeometry(current.inputs), to = await loadPreviewGeometry(next);
        let imageDimensions: { width: number; height: number } | undefined;
        if (current.artworkSrc) {
          const image = new Image(); image.src = current.artworkSrc;
          try { await image.decode(); imageDimensions = { width: image.naturalWidth, height: image.naturalHeight }; }
          finally { image.src = "data:,"; }
        }
        const mapped = transferPreviewPlacements(from, to, current, imageDimensions);
        if (snapshot.current !== current) return null;
        // Caller commits the placements and target surface in one React batch.
        return () => {
          if (snapshot.current !== current) return false;
          setPatternTransform(mapped.pattern); setArtworkTransform(mapped.artwork); setPatternBodyAdjustments(mapped.bodyAdjustments);
          return true;
        };
      } catch { return null; }
    },
  }));
  useImperativeHandle(placementRef, () => transfer, [transfer]);
  return { patternTransform, setPatternTransform, curvatureStrength, setCurvatureStrength, artworkTransform, setArtworkTransform, patternBodyAdjustments, transfer };
}
