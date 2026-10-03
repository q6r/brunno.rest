/** Cores das linguagens como no GitHub (linguist); Rust no tom usado no Figma. */
const COLORS: Record<string, string> = {
  Rust: "#ad552f",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00add8",
  Python: "#3572a5",
  Lua: "#000080",
  Ruby: "#701516",
  Svelte: "#ff3e00",
  HTML: "#e34c26",
  CSS: "#663399",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Java: "#b07219",
  Kotlin: "#a97bff",
};

export const languageColor = (language: string) => COLORS[language] ?? "#8b949e";
