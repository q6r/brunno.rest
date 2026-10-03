"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { cascade, popIn, SPRING_POP } from "@/lib/motion";
import type { Tech } from "@/lib/types";

type TechStackProps = {
  items: Tech[];
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
};

/**
 * A fileira de ícones da stack. Entram um a um; no hover o ícone sobe e gira de leve,
 * os vizinhos apagam para dar foco e o nome aparece no tooltip.
 */
export function TechStack({ items, delay = 0, className }: TechStackProps) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <motion.ul
      aria-label="Tecnologias"
      className={clsx("flex flex-wrap gap-2", className)}
      variants={cascade(0.035, delay)}
      initial="hidden"
      animate="show"
      onPointerLeave={() => setActive(null)}
    >
      {items.map((tech) => {
        const dimmed = active !== null && active !== tech.name;
        return (
          <motion.li key={tech.name} variants={popIn}>
            <Tooltip content={tech.name}>
              <motion.div
                tabIndex={0}
                className="block size-12 rounded-[11px] outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                animate={{ opacity: dimmed ? 0.45 : 1, filter: dimmed ? "grayscale(0.6)" : "grayscale(0)" }}
                whileHover={{ y: -6, scale: 1.12, rotate: -4 }}
                whileFocus={{ y: -6, scale: 1.12, rotate: -4 }}
                whileTap={{ scale: 0.94 }}
                transition={{ default: SPRING_POP, opacity: { duration: 0.2 }, filter: { duration: 0.2 } }}
                onHoverStart={() => setActive(tech.name)}
                onFocus={() => setActive(tech.name)}
                onBlur={() => setActive(null)}
              >
                <Image src={tech.icon} alt={tech.name} width={48} height={48} draggable={false} className="size-12" />
              </motion.div>
            </Tooltip>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
