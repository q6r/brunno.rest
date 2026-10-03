import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * O quadro do Figma (1440x1024). Do `lg` para cima o conteúdo é sempre diagramado
 * nesse tamanho e escalado por `--stage-scale` até caber inteiro na tela, centralizado:
 * o mesmo enquadramento em qualquer monitor e nada de scroll. Abaixo do `lg` (celular,
 * tablet em pé) o quadro ficaria pequeno demais, então o conteúdo flui numa coluna.
 */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className="relative min-h-dvh overflow-clip lg:h-dvh">
      <div
        className={clsx(
          "relative isolate lg:absolute lg:top-1/2 lg:left-1/2 lg:h-[1024px] lg:w-[1440px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:[scale:var(--stage-scale)]",
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}
