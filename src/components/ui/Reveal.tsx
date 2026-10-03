"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";

const TAGS = { div: motion.div, p: motion.p, h1: motion.h1, h2: motion.h2 };

type RevealProps = {
  as?: keyof typeof TAGS;
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
  children: ReactNode;
};

/** Entrada padrão da página (sobe, desfoca e aparece) para um bloco solto. */
export function Reveal({ as = "div", delay = 0, className, children }: RevealProps) {
  const Tag = TAGS[as];
  return (
    <Tag className={className} variants={fadeUp} custom={delay} initial="hidden" animate="show">
      {children}
    </Tag>
  );
}
