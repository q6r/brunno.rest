import type { Lang } from "./i18n";

/** Segundos em "m:ss" (98 vira "1:38") ou "h:mm:ss" a partir de uma hora. */
export function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}

/** Plural simples: plural(2, "estrela", "estrelas"). */
export const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** "há 5 anos" / "5 years ago" (ou "este ano" / "this year"). */
export function yearsAgo(year: number, lang: Lang = "pt", now = new Date().getFullYear()) {
  const n = now - year;
  if (lang === "en") return n <= 0 ? "this year" : `${n} ${plural(n, "year", "years")} ago`;
  return n <= 0 ? "este ano" : `há ${n} ${plural(n, "ano", "anos")}`;
}

const DAY_MS = 86_400_000;
const TODAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data de hoje no fuso de São Paulo (o servidor roda em UTC): a idade vira no dia certo. */
function today(now: Date) {
  const [y, m, d] = TODAY_FORMAT.format(now).split("-").map(Number);
  return { y, m, d };
}

const parseDate = (iso: string) => iso.split("-").map(Number) as [number, number, number];

/** Idade completa a partir da data de nascimento (AAAA-MM-DD). */
export function ageOn(birthDate: string, now = new Date()) {
  const [by, bm, bd] = parseDate(birthDate);
  const t = today(now);
  return t.y - by - (t.m < bm || (t.m === bm && t.d < bd) ? 1 : 0);
}

/** "24 de fevereiro" / "February 24". */
export function birthdayLabel(birthDate: string, lang: Lang = "pt") {
  const [y, m, d] = parseDate(birthDate);
  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "pt-BR", { day: "numeric", month: "long", timeZone: "UTC" }).format(
    Date.UTC(y, m - 1, d),
  );
}

/** Até o próximo aniversário: "faltam 144 dias" / "144 days to go" (ou "é hoje!" / "it's today!"). */
export function birthdayCountdown(birthDate: string, lang: Lang = "pt", now = new Date()) {
  const [, bm, bd] = parseDate(birthDate);
  const t = today(now);
  const start = Date.UTC(t.y, t.m - 1, t.d);
  let next = Date.UTC(t.y, bm - 1, bd);
  if (next < start) next = Date.UTC(t.y + 1, bm - 1, bd);
  const days = Math.round((next - start) / DAY_MS);
  if (lang === "en") return days === 0 ? "it's today!" : `${days} ${plural(days, "day", "days")} to go`;
  return days === 0 ? "é hoje!" : `${plural(days, "falta", "faltam")} ${days} ${plural(days, "dia", "dias")}`;
}
