"use client";

import { useEffect, useState } from "react";
import { clearCachedAcceptedSurface, loadCachedAcceptedSurface, type RenderingInputs } from "../../app/urunler/cay-makinesi-101/editor/accepted-surface-api";
import type { Product } from "../../../../../packages/commerce/client";

export type AcceptedVariants = { status: "loading" | "ready" | "error"; surfaces: Record<string, RenderingInputs> };

/** Accepted rendering inputs of every colour of [product]. A colour without its own accepted surface is left out;
 *  another colour's mask is never borrowed. */
export function useAcceptedVariants(product: Product | undefined, retryToken = 0): AcceptedVariants {
  const variantIds = product?.variants.map(variant => variant.id).join("|") ?? "";
  const productId = product?.id ?? "";
  const requestKey = `${productId}:${variantIds}:${retryToken}`;
  const [state, setState] = useState<AcceptedVariants & { key: string }>({ key: "", status: "loading", surfaces: {} });
  useEffect(() => {
    if (!productId) return;
    let active = true;
    const ids = variantIds ? variantIds.split("|") : [];
    if (retryToken > 0) ids.forEach(id => clearCachedAcceptedSurface(productId, id));
    Promise.all(ids.map(async id => [id, await loadCachedAcceptedSurface(productId, id)] as const)).then(results => {
      if (active) setState({ key: requestKey, status: "ready", surfaces: Object.fromEntries(results.filter((entry): entry is readonly [string, RenderingInputs] => entry[1] !== null)) });
    }).catch(() => { if (active) setState({ key: requestKey, status: "error", surfaces: {} }); });
    return () => { active = false; };
  }, [requestKey, productId, variantIds, retryToken]);
  return state.key === requestKey ? state : { status: "loading", surfaces: {} };
}

/** The colour a personalisation starts with: the requested one when it has an accepted surface, otherwise the first that has. */
export function startingVariant(product: Product, surfaces: Record<string, RenderingInputs>, requested?: string | null) {
  return product.variants.find(variant => variant.id === requested && surfaces[variant.id]) ?? product.variants.find(variant => surfaces[variant.id]);
}
