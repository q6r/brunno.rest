/** Linha da letra; `time` (ms desde o início da faixa) só existe quando é sincronizada. */
export type LyricLine = { time: number | null; text: string };

export type Lyrics = {
  synced: boolean;
  provider: string | null;
  lines: LyricLine[];
};

/** O que a API do cee.bio devolve em `data` (formato das letras do Spotify). */
type UpstreamLyrics = {
  syncType?: string;
  provider?: string;
  plainLyrics?: string;
  lines?: { startTimeMs?: string; words?: string }[];
};

/** Normaliza a resposta de /spotify/lyrics/:id. Sem nenhuma linha com texto, devolve null. */
export function normalizeLyrics(data: UpstreamLyrics | null | undefined): Lyrics | null {
  if (!data) return null;
  const synced = data.syncType === "LINE_SYNCED" || data.syncType === "SYLLABLE_SYNCED";

  let lines: LyricLine[] = (data.lines ?? []).map((line) => ({
    time: synced ? Number(line.startTimeMs) || 0 : null,
    text: (line.words ?? "").trim(),
  }));
  if (lines.length === 0 && data.plainLyrics) {
    lines = data.plainLyrics.split(/\r?\n/).map((text) => ({ time: null, text: text.trim() }));
  }
  if (!lines.some((line) => line.text)) return null;

  return { synced: synced && lines.every((line) => line.time !== null), provider: data.provider || null, lines };
}

/** Índice da linha que está tocando: a última que já começou (com uma pequena antecipação). */
export function currentLineIndex(lines: LyricLine[], positionMs: number, leadMs = 250) {
  let index = -1;
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].time ?? Infinity) <= positionMs + leadMs) index = i;
    else break;
  }
  return index;
}
