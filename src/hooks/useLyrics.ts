"use client";

import { useEffect, useState } from "react";
import type { Lyrics } from "@/lib/lyrics";

export type LyricsState =
  | { status: "loading" }
  | { status: "ready"; lyrics: Lyrics }
  | { status: "missing" }
  | { status: "error" };

/** Letras já buscadas nesta aba (reabrir o modal ou voltar a uma música é instantâneo). */
const cache = new Map<string, LyricsState>();

/** Busca a letra da faixa pela rota /api/lyrics. Erros de rede não ficam no cache. */
export function useLyrics(trackId: string | null): LyricsState {
  const [results, setResults] = useState<Record<string, LyricsState>>({});

  useEffect(() => {
    if (!trackId || cache.has(trackId)) return;
    let active = true;
    fetch(`/api/lyrics/${trackId}`)
      .then(async (res): Promise<LyricsState> => {
        if (res.ok) return { status: "ready", lyrics: (await res.json()) as Lyrics };
        return { status: res.status === 404 ? "missing" : "error" };
      })
      .catch((): LyricsState => ({ status: "error" }))
      .then((result) => {
        if (result.status !== "error") cache.set(trackId, result);
        if (active) setResults((prev) => ({ ...prev, [trackId]: result }));
      });
    return () => {
      active = false;
    };
  }, [trackId]);

  if (!trackId) return { status: "missing" };
  return cache.get(trackId) ?? results[trackId] ?? { status: "loading" };
}
