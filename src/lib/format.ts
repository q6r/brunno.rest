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

/** "há 5 anos", "há 1 ano" ou "este ano". */
export function yearsAgo(year: number, now = new Date().getFullYear()) {
  const n = now - year;
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

/** "24 de fevereiro". */
export function birthdayLabel(birthDate: string) {
  const [y, m, d] = parseDate(birthDate);
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", timeZone: "UTC" }).format(Date.UTC(y, m - 1, d));
}

/** "faltam 144 dias", "falta 1 dia" ou "é hoje!" até o próximo aniversário. */
export function birthdayCountdown(birthDate: string, now = new Date()) {
  const [, bm, bd] = parseDate(birthDate);
  const t = today(now);
  const start = Date.UTC(t.y, t.m - 1, t.d);
  let next = Date.UTC(t.y, bm - 1, bd);
  if (next < start) next = Date.UTC(t.y + 1, bm - 1, bd);
  const days = Math.round((next - start) / DAY_MS);
  return days === 0 ? "é hoje!" : `${plural(days, "falta", "faltam")} ${days} ${plural(days, "dia", "dias")}`;
}
