"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { BrandIcon } from "@/components/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { cascade, popIn, SPRING_POP } from "@/lib/motion";
import type { SocialLink } from "@/lib/types";

type SocialLinksProps = {
  links: SocialLink[];
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
};

/** Redes sociais: entram em sequência e pulam no hover, com o perfil no tooltip. */
export function SocialLinks({ links, delay = 0, className }: SocialLinksProps) {
  return (
    <motion.ul
      aria-label="Redes sociais"
      className={clsx("flex items-center gap-[11px]", className)}
      variants={cascade(0.06, delay)}
      initial="hidden"
      animate="show"
    >
      {links.map((link) => (
        <motion.li key={link.name} variants={popIn}>
          <Tooltip
            side="bottom"
            content={
              <span className="flex items-center gap-1.5">
                {link.name}
                {link.handle && <span className="text-chip-ink">{link.handle}</span>}
              </span>
            }
          >
            <motion.a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.handle ? `${link.name} (${link.handle})` : link.name}
              // 46x62 como os frames do Figma: é essa altura que posiciona o card do Spotify.
              className="grid h-[62px] w-[46px] place-items-center rounded-xl text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              whileHover={{ y: -4, scale: 1.1 }}
              whileFocus={{ y: -4, scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING_POP}
            >
              <BrandIcon name={link.icon} className="size-10" />
            </motion.a>
          </Tooltip>
        </motion.li>
      ))}
    </motion.ul>
  );
}
