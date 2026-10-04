/** Os tokens de cor do site: os mesmos nomes do @theme do globals.css, sem o `--color-`. */
type Tokens = {
  canvas: string;
  ink: string;
  muted: string;
  subtle: string;
  chip: string;
  "chip-hover": string;
  "chip-ink": string;
  panel: string;
  "panel-hover": string;
  track: string;
  fill: string;
};

type Theme = { id: string; name: string; tokens: Tokens };

/**
 * Os temas do modal. Todos têm fundo em tom médio ou escuro, porque títulos e ícones do
 * site são brancos. O primeiro é o do Figma (e o padrão do globals.css).
 */
export const THEMES = [
  {
    id: "ardosia",
    name: "Ardósia",
    tokens: {
      canvas: "#95a0b1",
      ink: "#cbd1d7",
      muted: "#d9dee0",
      subtle: "#aeaeae",
      chip: "#1c2021",
      "chip-hover": "#2a3134",
      "chip-ink": "#a6a3a3",
      panel: "rgb(28 32 33 / 0.71)",
      "panel-hover": "rgb(28 32 33 / 0.84)",
      track: "#525252",
      fill: "#c2c2c2",
    },
  },
  {
    id: "noite",
    name: "Noite",
    tokens: {
      canvas: "#15181c",
      ink: "#a7b0ba",
      muted: "#c3cad2",
      subtle: "#8e959c",
      chip: "#23282e",
      "chip-hover": "#2f363e",
      "chip-ink": "#a3aab2",
      panel: "rgb(35 40 46 / 0.85)",
      "panel-hover": "rgb(45 51 58 / 0.95)",
      track: "#3b4148",
      fill: "#cfd6dd",
    },
  },
  {
    id: "salvia",
    name: "Sálvia",
    tokens: {
      canvas: "#8fa08c",
      ink: "#cfdacb",
      muted: "#e1e8dd",
      subtle: "#b1bcad",
      chip: "#1c241c",
      "chip-hover": "#2a352a",
      "chip-ink": "#a8b3a4",
      panel: "rgb(28 36 28 / 0.72)",
      "panel-hover": "rgb(28 36 28 / 0.85)",
      track: "#4d5a4b",
      fill: "#cad5c6",
    },
  },
  {
    id: "rose",
    name: "Rosé",
    tokens: {
      canvas: "#a8919a",
      ink: "#dfd0d5",
      muted: "#ece2e5",
      subtle: "#c3b3b9",
      chip: "#271d22",
      "chip-hover": "#372a30",
      "chip-ink": "#b9a9af",
      panel: "rgb(39 29 34 / 0.72)",
      "panel-hover": "rgb(39 29 34 / 0.85)",
      track: "#5d4a52",
      fill: "#d8c9ce",
    },
  },
  {
    id: "areia",
    name: "Areia",
    tokens: {
      canvas: "#a89a83",
      ink: "#ddd4c5",
      muted: "#ece5da",
      subtle: "#c2b7a5",
      chip: "#252019",
      "chip-hover": "#352e24",
      "chip-ink": "#b6ab99",
      panel: "rgb(37 32 25 / 0.72)",
      "panel-hover": "rgb(37 32 25 / 0.85)",
      track: "#5b5243",
      fill: "#d6cdbe",
    },
  },
  {
    id: "lavanda",
    name: "Lavanda",
    tokens: {
      canvas: "#9a93b2",
      ink: "#d3d0e2",
      muted: "#e3e1ed",
      subtle: "#b7b3c8",
      chip: "#1f1c2a",
      "chip-hover": "#2d293c",
      "chip-ink": "#aca8bd",
      panel: "rgb(31 28 42 / 0.72)",
      "panel-hover": "rgb(31 28 42 / 0.85)",
      track: "#524d65",
      fill: "#cdc9de",
    },
  },
  {
    id: "oceano",
    name: "Oceano",
    tokens: {
      canvas: "#7d9cab",
      ink: "#c8dbe3",
      muted: "#dce9ef",
      subtle: "#a7bdc7",
      chip: "#17232a",
      "chip-hover": "#23333d",
      "chip-ink": "#9eb3bd",
      panel: "rgb(23 35 42 / 0.72)",
      "panel-hover": "rgb(23 35 42 / 0.85)",
      track: "#46596a",
      fill: "#c2d6df",
    },
  },
  {
    id: "grafite",
    name: "Grafite",
    tokens: {
      canvas: "#6e7378",
      ink: "#c4c8cc",
      muted: "#d7dadd",
      subtle: "#a6aaae",
      chip: "#1a1c1e",
      "chip-hover": "#272a2d",
      "chip-ink": "#a2a6aa",
      panel: "rgb(26 28 30 / 0.74)",
      "panel-hover": "rgb(26 28 30 / 0.87)",
      track: "#4a4e52",
      fill: "#c5c9cd",
    },
  },
] as const satisfies readonly Theme[];

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "ardosia";
export const THEME_STORAGE_KEY = "theme";

export const isThemeId = (value: unknown): value is ThemeId => THEMES.some((theme) => theme.id === value);

/**
 * CSS dos temas. `:root[data-theme]` vence o padrão do Tailwind na página inteira e
 * `[data-theme]` sozinho deixa qualquer elemento (as miniaturas do modal) usar outro tema.
 */
export const THEME_CSS = THEMES.map(
  ({ id, tokens }) =>
    `:root[data-theme="${id}"],[data-theme="${id}"]{${Object.entries(tokens)
      .map(([name, value]) => `--color-${name}:${value}`)
      .join(";")}}`,
).join("\n");

/** Roda no <head> antes da primeira pintura: aplica o tema salvo sem piscar o padrão. */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(${JSON.stringify(
  THEMES.map((theme) => theme.id),
)}.indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
