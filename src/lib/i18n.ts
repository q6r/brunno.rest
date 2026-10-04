/** Idiomas da função e da descrição (o resto do site fica como está). */
export type Lang = "pt" | "en";

export const LANGS: { code: Lang; label: string; name: string; htmlLang: string }[] = [
  { code: "pt", label: "PT", name: "Português", htmlLang: "pt-BR" },
  { code: "en", label: "EN", name: "English", htmlLang: "en" },
];

/** O HTML sai em português; no navegador o idioma é decidido assim que a página hidrata. */
export const DEFAULT_LANG: Lang = "pt";

const STORAGE_KEY = "lang";
const listeners = new Set<() => void>();
let current: Lang | null = null;

/** Escolha salva > idioma do navegador (português fica PT, qualquer outro vira EN). */
function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "pt" || saved === "en") return saved;
  } catch {
    /* sem localStorage (aba anônima, bloqueado): segue pelo navegador */
  }
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const lower = tag?.toLowerCase() ?? "";
    if (lower.startsWith("pt")) return "pt";
    if (lower.startsWith("en")) return "en";
  }
  return "en";
}

export function getLang(): Lang {
  current ??= detect();
  return current;
}

export function setLang(lang: Lang) {
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* sem localStorage: vale só para esta visita */
  }
  listeners.forEach((listener) => listener());
}

export function subscribeLang(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
