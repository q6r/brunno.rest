"use client";

import { AnimatePresence, motion } from "motion/react";
import { Tooltip as Primitive } from "radix-ui";
import { useState, type ReactElement, type ReactNode } from "react";
import { SPRING } from "@/lib/motion";

type Side = "top" | "right" | "bottom" | "left";

/** O tooltip nasce encostado no gatilho e se afasta dele; sai pelo mesmo caminho. */
const NEAR_TRIGGER: Record<Side, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  left: { x: 6 },
  right: { x: -6 },
};

type TooltipProps = {
  content: ReactNode;
  /** Um único elemento que aceite ref (elemento HTML ou componente motion). */
  children: ReactElement;
  side?: Side;
  sideOffset?: number;
};

/**
 * Tooltip no estilo dos chips do Figma (#1C2021, cantos de 6px). O Radix cuida de
 * teclado, leitor de tela e colisão com as bordas; o motion faz o tooltip crescer a
 * partir do gatilho, materializando (desfoque + escala) com uma mola sem quique.
 */
export function Tooltip({ content, children, side = "top", sideOffset = 8 }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Primitive.Root open={open} onOpenChange={setOpen}>
      <Primitive.Trigger asChild>{children}</Primitive.Trigger>
      <AnimatePresence>
        {open && (
          <Primitive.Portal forceMount>
            <Primitive.Content
              side={side}
              sideOffset={sideOffset}
              collisionPadding={12}
              // Os gatilhos se mexem no hover; reposiciona a cada quadro enquanto aberto.
              updatePositionStrategy="always"
              asChild
              forceMount
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)", ...NEAR_TRIGGER[side] }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  filter: "blur(2px)",
                  ...NEAR_TRIGGER[side],
                  transition: { duration: 0.12, ease: "easeIn" },
                }}
                transition={SPRING}
                style={{ transformOrigin: "var(--radix-tooltip-content-transform-origin)" }}
                // Fica fora do quadro (portal), então acompanha a escala dele à parte.
                className="z-50 rounded-md bg-chip px-2.5 py-1 text-[13px] font-medium leading-[18px] text-muted shadow-[0_10px_24px_-10px_rgb(28_32_33/0.7)] select-none [scale:var(--stage-scale)]"
              >
                {content}
                <Primitive.Arrow width={10} height={5} className="fill-chip" />
              </motion.div>
            </Primitive.Content>
          </Primitive.Portal>
        )}
      </AnimatePresence>
    </Primitive.Root>
  );
}
