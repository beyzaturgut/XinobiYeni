"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addFavorite, deleteFavorite, favoriteProductIds, useDemoCommerce } from "./demo-commerce";

const legacyStorageKey = "xinobi-demo-favorites";

export function useFavorites(productIds: string[]) {
  const { user, ready: accountReady } = useDemoCommerce();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const available = useMemo(() => new Set(productIds), [productIds]);

  const reload = useCallback(async () => {
    if (!user) { setIds([]); setLoading(false); return; }
    setLoading(true); setError(undefined);
    try {
      let legacy: unknown = [];
      try { legacy = JSON.parse(localStorage.getItem(legacyStorageKey) || "[]"); }
      catch { localStorage.removeItem(legacyStorageKey); }
      if (productIds.length > 0 && Array.isArray(legacy)) {
        for (const id of [...new Set(legacy.filter((value): value is string => typeof value === "string" && available.has(value)))])
          await addFavorite(id);
        localStorage.removeItem(legacyStorageKey);
      }
      setIds(await favoriteProductIds());
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Favoriler yüklenemedi."); }
    finally { setLoading(false); }
  }, [user, available, productIds.length]);

  useEffect(() => {
    if (!accountReady) return;
    const timer = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(timer);
  }, [accountReady, reload]);

  const toggle = useCallback(async (productId: string) => {
    if (!user) throw new Error("Favorilere eklemek için giriş yap.");
    setError(undefined);
    try {
      if (ids.includes(productId)) { await deleteFavorite(productId); setIds(current => current.filter(id => id !== productId)); }
      else { await addFavorite(productId); setIds(current => current.includes(productId) ? current : [...current, productId]); }
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Favori işlemi tamamlanamadı."; setError(message); throw cause; }
  }, [ids, user]);

  const clear = useCallback(async () => {
    if (!user) return;
    await Promise.all(ids.map(deleteFavorite));
    setIds([]);
  }, [ids, user]);

  return { ids, loading: loading || !accountReady, error, signedIn: Boolean(user), toggle, clear };
}
