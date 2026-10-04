"use client";

import { motion, type Variants } from "motion/react";
import { Tooltip } from "@/components/ui/Tooltip";
import { useLang } from "@/hooks/useLang";
import { birthdayCountdown, yearsAgo } from "@/lib/format";
import { SPRING_POP } from "@/lib/motion";
import type { Highlight as HighlightData } from "@/lib/types";

/** Entra crescendo junto com a palavra (herda o "hidden"/"show" da bio). */
const chip: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.35, duration: 0.55 } },
};

// Gestos como objeto, não como rótulo: com rótulo o chip deixaria de herdar a entrada.
const lift = { scale: 1.08, y: -2, transition: SPRING_POP };
const press = { scale: 0.95 };

const CHIP_CLASS =
  "group/chip relative inline-flex overflow-hidden rounded-md bg-chip px-[7px] align-baseline text-[18px] font-normal leading-[23px] text-chip-ink outline-none transition-colors duration-200 hover:bg-chip-hover hover:text-white focus-visible:bg-chip-hover focus-visible:text-white focus-visible:ring-2 focus-visible:ring-white/70";

/**
 * O "Tooltip Idade/Ano" do Figma: um chip escuro no meio da bio. Ganha um tooltip de
 * verdade com o `hint` ("há N anos" com `since`, contagem até o aniversário com
 * `birthday`) e vira link com `href`. O tooltip só renderiza no cliente, então as
 * contas com a data de hoje não dão diferença de hidratação.
 */
export function Highlight({ label, hint, since, birthday, href }: HighlightData) {
  const lang = useLang();
  const tip = [hint, since === undefined ? null : yearsAgo(since, lang), birthday ? birthdayCountdown(birthday, lang) : null]
    .filter(Boolean)
    .join(" · ");

  const inner = (
    <>
      {label}
      {/* Brilho que atravessa o chip no hover; sem transição na volta, some na hora. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-[linear-gradient(100deg,transparent_25%,rgb(255_255_255/0.2)_50%,transparent_75%)] group-hover/chip:translate-x-[120%] group-hover/chip:transition-transform group-hover/chip:duration-700 group-hover/chip:ease-out group-focus-visible/chip:translate-x-[120%] group-focus-visible/chip:transition-transform group-focus-visible/chip:duration-700"
      />
    </>
  );

  const element = href ? (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={CHIP_CLASS}
      variants={chip}
      whileHover={lift}
      whileFocus={lift}
      whileTap={press}
    >
      {inner}
    </motion.a>
  ) : (
    <motion.span
      tabIndex={tip ? 0 : undefined}
      className={`${CHIP_CLASS} cursor-default`}
      variants={chip}
      whileHover={lift}
      whileFocus={lift}
      whileTap={press}
    >
      {inner}
    </motion.span>
  );

  return tip ? <Tooltip content={tip}>{element}</Tooltip> : element;
}
