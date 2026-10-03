"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { EASE_OUT } from "@/lib/motion";

type ProgressBarProps = ComponentProps<"div"> & {
  /** De 0 a 1. */
  value: number;
  /** Atraso da entrada, em segundos. */
  delay?: number;
};

/**
 * Barra do Figma: trilho #525252 e preenchimento #C2C2C2. Na entrada o preenchimento
 * é revelado da esquerda (clip-path, sem distorcer as pontas); depois a largura anda
 * em linha reta a cada atualização, e volta a zero sem animar quando a faixa recomeça.
 */
export function ProgressBar({ value, delay = 0, className, ...props }: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={clsx("h-4 overflow-hidden rounded-full bg-track", className)}
      {...props}
    >
      <motion.div
        className={clsx("h-full rounded-full bg-fill", pct > 0 && "transition-[width] duration-1000 ease-linear")}
        style={{ width: `${pct}%` }}
        initial={{ clipPath: "inset(0% 100% 0% 0% round 999px)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0% round 999px)" }}
        transition={{ delay, duration: 1.1, ease: EASE_OUT }}
      />
    </div>
  );
}
