"use client";

import { motion, useMotionTemplate, useMotionValue, type Variants } from "motion/react";
import Image from "next/image";
import type { PointerEvent } from "react";
import { ExternalLinkIcon, StarIcon } from "@/components/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { plural } from "@/lib/format";
import { languageColor } from "@/lib/languages";
import { SPRING_POP } from "@/lib/motion";
import type { Repo } from "@/lib/types";

/** No hover sobe 4px e afunda no clique (a entrada fica no item da grade). */
const card: Variants = {
  hover: { y: -4 },
  tap: { scale: 0.985 },
};

/** A seta de "abrir" escapa na diagonal, para onde o link leva. */
const arrow: Variants = {
  hover: { x: 2, y: -2, scale: 1.08 },
};

/** Card de repositório do Figma (418x128): dono, nome, linguagem e estrelas. */
export function RepoCard({ repo }: { repo: Repo }) {
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgb(255 255 255 / 0.08), transparent 70%)`;
  const stars = `${repo.stars} ${plural(repo.stars, "estrela", "estrelas")}`;

  function track(event: PointerEvent<HTMLAnchorElement>) {
    const el = event.currentTarget;
    const box = el.getBoundingClientRect();
    // O quadro pode estar escalado: converte da tela para o tamanho do próprio card.
    const scale = box.width / el.offsetWidth || 1;
    mx.set((event.clientX - box.left) / scale);
    my.set((event.clientY - box.top) / scale);
  }

  return (
    <motion.a
      href={repo.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={[repo.name, `de ${repo.owner}`, repo.language && `em ${repo.language}`, stars, repo.description]
        .filter(Boolean)
        .join(", ")}
      className="group relative flex h-32 flex-col rounded-[15px] bg-panel px-[18px] pt-[14px] ring-1 ring-transparent outline-none transition-[background-color,box-shadow] duration-300 hover:bg-panel-hover hover:ring-white/10 hover:shadow-[0_18px_40px_-24px_rgb(28_32_33/0.9)] focus-visible:ring-2 focus-visible:ring-white/70"
      variants={card}
      whileHover="hover"
      whileFocus="hover"
      whileTap="tap"
      transition={SPRING_POP}
      onPointerMove={track}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />

      <span className="flex items-center gap-[5px]">
        {/* Avatar do GitHub já vem no tamanho certo (?s=40): sem passar pelo otimizador. */}
        <Image src={repo.ownerAvatar} alt="" width={20} height={20} unoptimized className="size-5 rounded-full" />
        <span className="text-[11px] font-bold leading-[14px] text-white">{repo.owner}</span>
      </span>

      {repo.description ? (
        <Tooltip content={<span className="block max-w-64">{repo.description}</span>}>
          <span className="mt-[17px] max-w-full self-start truncate pr-10 text-[20px] font-bold leading-[26px] text-white">
            {repo.name}
          </span>
        </Tooltip>
      ) : (
        <span className="mt-[17px] truncate pr-10 text-[20px] font-bold leading-[26px] text-white">{repo.name}</span>
      )}

      <span className="mt-5 flex items-center gap-1.5 text-[13px] font-bold leading-[17px]">
        {repo.language && (
          <span className="flex items-center gap-1 text-white">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
            {repo.language}
          </span>
        )}
        <Tooltip content={stars}>
          <span className="flex items-center gap-0.5 text-subtle">
            <StarIcon className="size-[13px]" />
            {repo.stars}
          </span>
        </Tooltip>
      </span>

      <Tooltip content="Abrir no GitHub">
        <motion.span variants={arrow} transition={SPRING_POP} className="absolute top-2.5 right-[11px] text-white">
          <ExternalLinkIcon className="size-[29px]" />
        </motion.span>
      </Tooltip>
    </motion.a>
  );
}
