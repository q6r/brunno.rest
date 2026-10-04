"use client";

import clsx from "clsx";
import { motion, type Variants } from "motion/react";
import { Fragment } from "react";
import { useLang } from "@/hooks/useLang";
import type { Lang } from "@/lib/i18n";
import { cascade, EASE_OUT } from "@/lib/motion";
import type { BioPart, Highlight as HighlightData } from "@/lib/types";
import { Highlight } from "./Highlight";

/** Uma palavra pode misturar texto e destaque, como "2021," (chip + vírgula). */
type Word = (string | HighlightData)[];

const wordIn: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE_OUT },
    transitionEnd: { filter: "none" },
  },
};

/**
 * Quebra a bio em palavras. O que vem colado (chip e pontuação) fica na mesma
 * palavra, que não quebra linha no meio.
 */
function toWords(parts: BioPart[]): Word[] {
  const words: Word[] = [[]];
  for (const part of parts) {
    if (typeof part !== "string") {
      words[words.length - 1].push(part);
      continue;
    }
    for (const chunk of part.split(/(\s+)/)) {
      if (!chunk) continue;
      if (/^\s+$/.test(chunk)) words.push([]);
      else words[words.length - 1].push(chunk);
    }
  }
  return words.filter((word) => word.length > 0);
}

type BioProps = {
  /** A bio em cada idioma; mostra a do idioma atual. */
  translations: Record<Lang, BioPart[]>;
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
};

/**
 * A bio do Figma, entrando palavra por palavra; os destaques viram chips com tooltip.
 * Trocar de idioma remonta o parágrafo e a entrada palavra por palavra roda de novo.
 */
export function Bio({ translations, delay = 0, className }: BioProps) {
  const lang = useLang();
  return (
    <motion.p
      key={lang}
      className={clsx("max-w-[558px] text-[22px] font-medium leading-[28px] text-ink", className)}
      variants={cascade(0.018, delay)}
      initial="hidden"
      animate="show"
    >
      {toWords(translations[lang]).map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <motion.span variants={wordIn} className="inline-block whitespace-nowrap">
            {word.map((piece, j) => (typeof piece === "string" ? piece : <Highlight key={j} {...piece} />))}
          </motion.span>
        </Fragment>
      ))}
    </motion.p>
  );
}
