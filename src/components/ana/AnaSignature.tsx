"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useState } from "react";
import { Signature } from "@/components/profile/Signature";
import { Tooltip } from "@/components/ui/Tooltip";
import { SPRING_POP } from "@/lib/motion";
import { AnaMoment } from "./AnaMoment";

type AnaSignatureProps = {
  text: string;
  videos: string[];
  /** O recado, em estrofes. */
  message: string[][];
  /** Atraso do traço, em segundos. */
  delay?: number;
  /** Posição do rabisco na página. */
  className?: string;
};

/** O "ANA" do canto vira botão: brilha no hover e abre a surpresa (AnaMoment). */
export function AnaSignature({ text, videos, message, delay = 0, className }: AnaSignatureProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip content="♡">
        <motion.button
          type="button"
          aria-label={`${text}: abrir a surpresa`}
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING_POP}
          className={clsx("group cursor-pointer outline-none", className)}
        >
          <Signature
            text={text}
            delay={delay}
            className="w-full transition-[filter] duration-300 group-hover:drop-shadow-[0_0_10px_rgb(255_255_255/0.75)] group-focus-visible:drop-shadow-[0_0_10px_rgb(255_255_255/0.75)]"
          />
        </motion.button>
      </Tooltip>
      <AnaMoment open={open} onOpenChange={setOpen} videos={videos} message={message} />
    </>
  );
}
