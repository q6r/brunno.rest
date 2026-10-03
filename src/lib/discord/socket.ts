/**
 * Gateway de presence do Discord da API do cee.bio: WebSocket singleton com ref-count.
 * Portado do cee (runtime/src/lib/socket.ts).
 *
 * Protocolo (servidor em Rust):
 *  - URL: wss://api.cee.bio/ws/discord-activities (ou NEXT_PUBLIC_DISCORD_SOCKET_URL)
 *  - C → S: { op: "subscribe" | "unsubscribe", userId }
 *  - S → C: { type: "user_activity_update", userId, presence }; a primeira chega logo
 *    depois do subscribe, então não precisa de snapshot HTTP.
 *
 * Singleton: vários componentes ouvindo o mesmo userId dividem 1 conexão por aba.
 */

const SOCKET_URL = process.env.NEXT_PUBLIC_DISCORD_SOCKET_URL ?? "wss://api.cee.bio/ws/discord-activities";

export type PresenceStatus = "online" | "idle" | "dnd" | "offline";

/** Atividade como o servidor manda (campos do discord.js; aceita também o formato antigo do runtime). */
export type RawActivity = {
  type: number;
  name: string;
  url?: string | null;
  details?: string | null;
  state?: string | null;
  applicationId?: string | null;
  syncId?: string | null;
  startTimestamp?: number | null;
  endTimestamp?: number | null;
  timestamps?: { start?: number; end?: number } | null;
  assets?: {
    largeText?: string | null;
    largeImageURL?: string | null;
    largeImageUrl?: string | null;
    smallText?: string | null;
    smallImageURL?: string | null;
    smallImageUrl?: string | null;
  } | null;
};

export type DiscordPresence = {
  status: PresenceStatus;
  activities: RawActivity[];
  customStatus?: unknown;
  clientStatus?: Record<string, string>;
};

export type SocketStatus = "connecting" | "open" | "closed" | "error";

type ActivityData = { userId: string; presence: DiscordPresence | null };
type ActivityHandler = (data: ActivityData) => void;
type StatusHandler = (status: SocketStatus) => void;

let ws: WebSocket | null = null;
let reconnectAttempt = 0;
let manuallyClosed = false;
let currentStatus: SocketStatus = "closed";

// userId → quantos handlers estão ouvindo
const subscriptions = new Map<string, number>();
// userId → handlers
const handlers = new Map<string, Set<ActivityHandler>>();
// Última presence de cada userId, para quem se inscrever depois receber na hora
const lastSeen = new Map<string, DiscordPresence>();
const statusHandlers = new Set<StatusHandler>();

let disconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function setStatus(status: SocketStatus) {
  if (status === currentStatus) return;
  currentStatus = status;
  statusHandlers.forEach((handler) => {
    try {
      handler(status);
    } catch {
      /* noop */
    }
  });
}

function sendIfOpen(payload: object) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

function ensureSocket() {
  if (typeof WebSocket === "undefined") return; // SSR
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }

  manuallyClosed = false;
  setStatus("connecting");
  const socket = new WebSocket(SOCKET_URL);
  ws = socket;

  socket.onopen = () => {
    reconnectAttempt = 0;
    setStatus("open");
    // Reinscreve em tudo (primeira conexão ou reconexão)
    for (const userId of subscriptions.keys()) sendIfOpen({ op: "subscribe", userId });
  };

  socket.onmessage = (event) => {
    let msg: { type?: string; userId?: string; presence?: DiscordPresence } | null = null;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }
    if (msg?.type !== "user_activity_update" || !msg.userId) return; // ack, erro etc.
    const userId = String(msg.userId);
    if (msg.presence) lastSeen.set(userId, msg.presence);
    const data: ActivityData = { userId, presence: msg.presence ?? null };
    handlers.get(userId)?.forEach((handler) => {
      try {
        handler(data);
      } catch {
        /* noop */
      }
    });
  };

  socket.onerror = () => setStatus("error");

  socket.onclose = () => {
    ws = null;
    setStatus("closed");
    if (manuallyClosed || subscriptions.size === 0) return;
    // Backoff exponencial: 1s, 2s, 4s… até 30s
    const delay = Math.min(30_000, 1000 * 2 ** reconnectAttempt);
    reconnectAttempt++;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      ensureSocket();
    }, delay);
  };
}

/** Escuta a presence de um userId. Devolve o unsubscribe (para o cleanup do useEffect). */
export function subscribeDiscordActivity(userId: string, handler: ActivityHandler): () => void {
  if (!userId) return () => {};

  let set = handlers.get(userId);
  if (!set) {
    set = new Set();
    handlers.set(userId, set);
  }
  set.add(handler);

  const count = (subscriptions.get(userId) ?? 0) + 1;
  subscriptions.set(userId, count);

  ensureSocket();
  if (count === 1) sendIfOpen({ op: "subscribe", userId });

  const cached = lastSeen.get(userId);
  if (cached) queueMicrotask(() => handler({ userId, presence: cached }));

  return () => {
    const handlerSet = handlers.get(userId);
    if (handlerSet) {
      handlerSet.delete(handler);
      if (handlerSet.size === 0) handlers.delete(userId);
    }
    const remaining = (subscriptions.get(userId) ?? 1) - 1;
    if (remaining <= 0) {
      subscriptions.delete(userId);
      sendIfOpen({ op: "unsubscribe", userId });
    } else {
      subscriptions.set(userId, remaining);
    }
    // Sem ninguém ouvindo, fecha depois de 30s (reaproveita se alguém voltar antes)
    if (subscriptions.size === 0 && ws && !disconnectTimer) {
      disconnectTimer = setTimeout(() => {
        if (subscriptions.size === 0 && ws) {
          manuallyClosed = true;
          ws.close();
          ws = null;
        }
        disconnectTimer = null;
      }, 30_000);
    }
  };
}

/** Escuta o estado da conexão (connecting/open/closed/error). */
export function subscribeSocketStatus(handler: StatusHandler): () => void {
  statusHandlers.add(handler);
  queueMicrotask(() => handler(currentStatus));
  return () => {
    statusHandlers.delete(handler);
  };
}

export const getCurrentSocketStatus = () => currentStatus;
