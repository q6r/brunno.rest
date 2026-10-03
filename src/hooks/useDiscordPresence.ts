"use client";

import { useEffect, useState } from "react";
import {
  getCurrentSocketStatus,
  subscribeDiscordActivity,
  subscribeSocketStatus,
  type DiscordPresence,
  type SocketStatus,
} from "@/lib/discord/socket";

/**
 * Presence ao vivo de um usuário do Discord pelo WebSocket do cee.bio.
 * `presence` fica null até a primeira mensagem (chega ~0,5s depois de montar).
 */
export function useDiscordPresence(userId: string | undefined) {
  const [presence, setPresence] = useState<DiscordPresence | null>(null);
  const [status, setStatus] = useState<SocketStatus>(getCurrentSocketStatus);

  useEffect(() => {
    if (!userId) return;
    return subscribeDiscordActivity(userId, (data) => setPresence(data.presence));
  }, [userId]);

  useEffect(() => subscribeSocketStatus(setStatus), []);

  return { presence, status };
}
