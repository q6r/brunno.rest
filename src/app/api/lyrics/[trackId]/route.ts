import { isSpotifyTrackId } from "@/lib/discord/activity";
import { normalizeLyrics } from "@/lib/lyrics";

const UPSTREAM = "https://api.cee.bio/spotify/lyrics";
/** Letra não muda: cacheia um dia no servidor e na CDN. */
const DAY = 86_400;
const CACHE_HEADERS = { "Cache-Control": `public, s-maxage=${DAY}, stale-while-revalidate=${DAY * 7}` };

/**
 * Proxy da letra na API do cee.bio. Passa pelo servidor do Next para não depender do
 * CORS da API (que hoje só reflete a origem) e para cachear; devolve o formato já
 * normalizado (`Lyrics`). 404 quando a música não tem letra.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  if (!isSpotifyTrackId(trackId)) return Response.json({ error: "invalid_track" }, { status: 400 });

  const res = await fetch(`${UPSTREAM}/${trackId}`, { next: { revalidate: DAY } }).catch(() => null);
  if (res?.status === 404) return Response.json({ error: "not_found" }, { status: 404, headers: CACHE_HEADERS });
  if (!res?.ok) return Response.json({ error: "upstream" }, { status: 502 });

  const body = (await res.json().catch(() => null)) as { data?: Parameters<typeof normalizeLyrics>[0] } | null;
  const lyrics = normalizeLyrics(body?.data);
  if (!lyrics) return Response.json({ error: "not_found" }, { status: 404, headers: CACHE_HEADERS });

  return Response.json(lyrics, { headers: CACHE_HEADERS });
}
