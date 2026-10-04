"use client";

import { useSyncExternalStore } from "react";
import { getTheme, subscribeTheme } from "@/lib/theme";
import { DEFAULT_THEME, type ThemeId } from "@/lib/themes";

/** Tema atual. Na hidratação vale o padrão (como o HTML do servidor) e logo depois o salvo. */
export function useTheme(): ThemeId {
  return useSyncExternalStore(subscribeTheme, getTheme, () => DEFAULT_THEME);
}
