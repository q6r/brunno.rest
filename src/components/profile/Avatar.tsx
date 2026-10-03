"use client";

import clsx from "clsx";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Image, { type StaticImageData } from "next/image";
import type { PointerEvent } from "react";
import { EASE_OUT } from "@/lib/motion";

/** Inclinação máxima, em graus. */
const TILT = 6;
const TILT_SPRING = { bounce: 0, duration: 0.6 };

type AvatarProps = {
  src: StaticImageData;
  alt: string;
  className?: string;
};

/**
 * Avatar do Figma (382px, cantos de 46px). Entra desfocado; com o mouse em cima,
 * inclina na direção do cursor e ganha um reflexo que acompanha o ponteiro.
 */
export function Avatar({ src, alt, className }: AvatarProps) {
  const reduced = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [TILT, -TILT]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-TILT, TILT]), TILT_SPRING);
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.18), transparent 60%)`;

  function track(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - box.left) / box.width);
    py.set((event.clientY - box.top) / box.height);
  }

  function reset() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      className={clsx(
        "group relative isolate aspect-square overflow-hidden rounded-[46px] shadow-[0_30px_60px_-30px_rgb(28_32_33/0.6)]",
        className,
      )}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      initial={{ opacity: 0, scale: 0.94, filter: "blur(16px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ duration: 0.9, ease: EASE_OUT }}
      onPointerMove={track}
      onPointerLeave={reset}
    >
      <Image
        src={src}
        alt={alt}
        fill
        preload
        placeholder="blur"
        // No desktop o quadro escala com a tela: 382px em 1440px de largura = ~27vw.
        sizes="(min-width: 1024px) 27vw, 382px"
        className="object-cover"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glare }}
      />
    </motion.div>
  );
}
