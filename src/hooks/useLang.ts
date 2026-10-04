"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LANG, getLang, subscribeLang, type Lang } from "@/lib/i18n";

/**
 * Idioma atual. Na hidratação vale o padrão (igual ao HTML do servidor) e logo em
 * seguida o React troca para o do navegador, sem erro de hidratação.
 */
export function useLang(): Lang {
  return useSyncExternalStore(subscribeLang, getLang, () => DEFAULT_LANG);
}
