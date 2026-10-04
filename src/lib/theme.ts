import { flushSync } from "react-dom";
import { DEFAULT_THEME, isThemeId, THEME_STORAGE_KEY, THEMES, type ThemeId } from "./themes";

const listeners = new Set<() => void>();

/** A troca animada em andamento (null quando não há nenhuma). */
let running: ViewTransition | null = null;

/** Se a troca de tema ainda está animando: o modal não deve fechar por "clique fora" agora. */
export const isThemeTransitionRunning = () => running !== null;

/** O tema atual é o `data-theme` do <html> (o script do <head> já aplicou o salvo). */
export function getTheme(): ThemeId {
  const value = document.documentElement.dataset.theme;
  return isThemeId(value) ? value : DEFAULT_THEME;
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** A barra do navegador no celular (<meta name="theme-color">) acompanha o fundo do tema. */
export function syncThemeColor(id: ThemeId) {
  const canvas = THEMES.find((theme) => theme.id === id)?.tokens.canvas;
  if (canvas) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", canvas);
}

function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  } catch {
    /* sem localStorage: vale só para esta visita */
  }
  listeners.forEach((listener) => listener());
}

/**
 * Troca o tema. Com View Transitions, a página nova se espalha num círculo a partir de
 * `origin` (o ponto do clique); sem suporte ou com "reduzir movimento", troca na hora.
 */
export function switchTheme(id: ThemeId, origin?: { x: number; y: number }) {
  if (id === getTheme()) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!origin || reduced || !("startViewTransition" in document)) {
    applyTheme(id);
    return;
  }

  // flushSync: o React precisa pintar o estado novo dentro da transição.
  const transition = document.startViewTransition(() => flushSync(() => applyTheme(id)));
  running = transition;
  const clear = () => {
    if (running === transition) running = null;
  };
  transition.finished.then(clear, clear);
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`],
        },
        { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {
      /* transição pulada (outro clique no meio): o tema já foi aplicado */
    });
}
