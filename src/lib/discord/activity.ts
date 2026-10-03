import type { DiscordPresence, PresenceStatus, RawActivity } from "./socket";

export type ActivityKind = "playing" | "streaming" | "listening" | "watching" | "competing";

/** Atividade já normalizada e com a imagem validada. */
export type Activity = {
  /** Muda quando a atividade muda (outra música, outro jogo). */
  key: string;
  kind: ActivityKind;
  name: string;
  details: string | null;
  state: string | null;
  largeText: string | null;
  image: string | null;
  /** Ícone pequeno no canto da capa (ex.: o VS Code) e o texto dele. */
  smallImage: string | null;
  smallText: string | null;
  /** Início e fim em ms (epoch). */
  start: number | null;
  end: number | null;
  /** ID da faixa no Spotify (o syncId da presence): abre a letra e o link da música. */
  trackId: string | null;
};

// Tipo 4 (status personalizado) fica de fora: não é atividade para o card.
const KINDS: Record<number, ActivityKind> = {
  0: "playing",
  1: "streaming",
  2: "listening",
  3: "watching",
  5: "competing",
};

export const KIND_LABEL: Record<ActivityKind, string> = {
  playing: "Playing",
  streaming: "Streaming",
  listening: "Listening to",
  watching: "Watching",
  competing: "Competing in",
};

export const STATUS_LABEL: Record<PresenceStatus, string> = {
  online: "Online",
  idle: "Ausente",
  dnd: "Não perturbe",
  offline: "Offline",
};

/**
 * A imagem da atividade é controlada por quem cria o Rich Presence: sem filtro, qualquer
 * URL viraria um request de cada visitante (IP logger). Como no cee, só passa Spotify e
 * as CDNs do Discord.
 */
export function safeActivityImage(raw: unknown, applicationId?: string | null): string | null {
  if (typeof raw !== "string" || !raw) return null;
  if (raw.startsWith("spotify:")) {
    const hash = raw.slice("spotify:".length);
    return /^[A-Za-z0-9]{1,256}$/.test(hash) ? `https://i.scdn.co/image/${hash}` : null;
  }
  if (raw.startsWith("mp:")) {
    const path = raw.slice("mp:".length);
    return /^[\w./%-]+$/.test(path) ? `https://media.discordapp.net/${path}` : null;
  }
  if (/^\d{17,20}$/.test(raw) && applicationId && /^\d{17,20}$/.test(applicationId)) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${raw}.png`;
  }
  const allowed = /^https:\/\/(cdn\.discordapp\.com|media\.discordapp\.net|i\.scdn\.co)\//i;
  return allowed.test(raw) && !raw.includes('"') && !raw.includes("<") ? raw : null;
}

/**
 * Tira caracteres invisíveis e de controle (o vscord, por exemplo, preenche campos
 * vazios com zero-width space) e espaços sobrando. Texto que sobra vazio vira null.
 */
export function cleanText(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.replace(/[\p{Cc}\p{Cf}]/gu, "").replace(/\s+/g, " ").trim();
  return text || null;
}

/** IDs do Spotify têm 22 caracteres base62; qualquer outra coisa é descartada. */
export const isSpotifyTrackId = (id: unknown): id is string => typeof id === "string" && /^[A-Za-z0-9]{22}$/.test(id);

const spotifyTrackId = (activity: RawActivity) =>
  activity.name === "Spotify" && isSpotifyTrackId(activity.syncId) ? activity.syncId : null;

/** A atividade do card: música primeiro (o card nasceu para o Spotify), senão a primeira. */
export function pickActivity(presence: DiscordPresence | null): Activity | null {
  const list = (presence?.activities ?? []).filter((activity) => activity && activity.type in KINDS);
  const raw = list.find((activity) => activity.type === 2) ?? list[0];
  if (!raw) return null;

  const details = cleanText(raw.details);
  const state = cleanText(raw.state);

  return {
    key: [raw.type, raw.name, details, state].join("|"),
    kind: KINDS[raw.type],
    name: cleanText(raw.name) ?? raw.name,
    details,
    state,
    largeText: cleanText(raw.assets?.largeText),
    image: safeActivityImage(raw.assets?.largeImageURL ?? raw.assets?.largeImageUrl, raw.applicationId),
    smallImage: safeActivityImage(raw.assets?.smallImageURL ?? raw.assets?.smallImageUrl, raw.applicationId),
    smallText: cleanText(raw.assets?.smallText),
    start: raw.startTimestamp ?? raw.timestamps?.start ?? null,
    end: raw.endTimestamp ?? raw.timestamps?.end ?? null,
    trackId: spotifyTrackId(raw),
  };
}
