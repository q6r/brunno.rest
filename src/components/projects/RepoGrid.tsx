"use client";

import clsx from "clsx";
import { motion, type Variants } from "motion/react";
import { ExternalLinkIcon } from "@/components/icons";
import { cascade, EASE_OUT, SPRING_POP } from "@/lib/motion";
import type { Repo } from "@/lib/types";
import { RepoCard } from "./RepoCard";

/**
 * A entrada fica no item da lista, não no card: o card usa rótulos de variante no
 * hover (para animar a seta junto) e, no motion, quem tem rótulo próprio deixa de
 * herdar o "hidden"/"show" da lista.
 */
const item: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT },
    transitionEnd: { filter: "none" },
  },
};

type RepoGridProps = {
  repos: Repo[];
  /** Para onde aponta o card de reserva quando não veio nenhum repositório. */
  profileUrl: string;
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
};

/** Grade 2x3 do Figma (cards de 418px, 48px entre colunas), entrando em cascata. */
export function RepoGrid({ repos, profileUrl, delay = 0, className }: RepoGridProps) {
  return (
    <motion.ul
      aria-label="Repositórios"
      className={clsx("grid gap-x-12 gap-y-4 sm:grid-cols-2", className)}
      variants={cascade(0.08, delay)}
      initial="hidden"
      animate="show"
    >
      {repos.map((repo) => (
        <motion.li key={repo.href} variants={item}>
          <RepoCard repo={repo} />
        </motion.li>
      ))}

      {/* GitHub fora do ar ou sem repositórios públicos: só o atalho para o perfil. */}
      {repos.length === 0 && (
        <motion.li variants={item} className="sm:col-span-2">
          <motion.a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-32 items-center justify-center gap-3 rounded-[15px] bg-panel text-[20px] font-bold text-white outline-none transition-colors duration-300 hover:bg-panel-hover focus-visible:ring-2 focus-visible:ring-white/70"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
            transition={SPRING_POP}
          >
            Ver meus projetos no GitHub
            <ExternalLinkIcon className="size-6" />
          </motion.a>
        </motion.li>
      )}
    </motion.ul>
  );
}
