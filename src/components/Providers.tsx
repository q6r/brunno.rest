"use client";

import { MotionConfig } from "motion/react";
import { Tooltip } from "radix-ui";
import type { ReactNode } from "react";

/**
 * Configuração global do lado do cliente: respeita o "reduzir movimento" do sistema
 * e compartilha o atraso dos tooltips (passar de um ícone para o vizinho abre na hora).
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <Tooltip.Provider delayDuration={150} skipDelayDuration={400}>
        {children}
      </Tooltip.Provider>
    </MotionConfig>
  );
}
