"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { Dialog } from "radix-ui";
import { useEffect, useState, type MouseEvent } from "react";
import { CheckIcon, CloseIcon, PaletteIcon } from "@/components/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useTheme } from "@/hooks/useTheme";
import { cascade, EASE_OUT, popIn, SPRING, SPRING_POP } from "@/lib/motion";
import { isThemeTransitionRunning, switchTheme, syncThemeColor } from "@/lib/theme";
import { isThemeId, THEMES, type ThemeId } from "@/lib/themes";

type ThemePickerProps = {
  /** Atraso da entrada do botão, em segundos. */
  delay?: number;
};

/**
 * Botão de paleta que abre o modal de temas. Cada opção é uma miniatura do site já com
 * as cores do tema (a miniatura usa `data-theme` próprio); escolher espalha a cor nova
 * pela página a partir do clique e o modal continua aberto para testar outras.
 */
export function ThemePicker({ delay = 0 }: ThemePickerProps) {
  const current = useTheme();
  const [open, setOpen] = useState(false);

  // Também no carregamento: o script do <head> aplica o tema salvo, mas não mexe na meta.
  useEffect(() => syncThemeColor(current), [current]);

  // No meio da troca a página fica coberta pela "foto" da transição e o clique cai no
  // <html>, não na miniatura: acha a miniatura sob o ponteiro pelo retângulo e troca.
  useEffect(() => {
    if (!open) return;
    function onClick(event: globalThis.MouseEvent) {
      if (!isThemeTransitionRunning()) return;
      if (event.target instanceof Element && event.target.closest("[data-theme-option]")) return;
      for (const option of document.querySelectorAll<HTMLElement>("[data-theme-option]")) {
        const box = option.getBoundingClientRect();
        const inside =
          event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
        if (inside && isThemeId(option.dataset.themeOption)) {
          switchTheme(option.dataset.themeOption, { x: event.clientX, y: event.clientY });
          return;
        }
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [open]);

  function pick(id: ThemeId, event: MouseEvent<HTMLButtonElement>) {
    // Teclado (Enter/Espaço) não tem posição de mouse: o círculo nasce do centro do botão.
    const box = event.currentTarget.getBoundingClientRect();
    const fromPointer = event.clientX !== 0 || event.clientY !== 0;
    switchTheme(id, {
      x: fromPointer ? event.clientX : box.left + box.width / 2,
      y: fromPointer ? event.clientY : box.top + box.height / 2,
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <motion.span
        className="block"
        initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
        transition={{ delay, duration: 0.6, ease: EASE_OUT }}
      >
        <Tooltip content="Tema" side="bottom">
          <Dialog.Trigger asChild>
            <motion.button
              type="button"
              aria-label="Trocar o tema"
              className="grid size-[34px] cursor-pointer place-items-center rounded-full bg-chip text-chip-ink shadow-[0_10px_24px_-14px_rgb(28_32_33/0.8)] outline-none transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
              whileHover={{ rotate: -14, scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              transition={SPRING_POP}
            >
              <PaletteIcon className="size-[18px]" />
            </motion.button>
          </Dialog.Trigger>
        </Tooltip>
      </motion.span>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-[rgb(0_0_0/0.25)] backdrop-blur-[6px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              onOpenAutoFocus={focusSelected}
              // Clique no meio da troca de tema não é "clique fora": o modal fica aberto.
              onInteractOutside={(event) => isThemeTransitionRunning() && event.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, y: 16, filter: "blur(6px)" }}
                transition={{ type: "spring", bounce: 0, duration: 0.45 }}
                className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-32px)] w-[min(600px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[24px] bg-chip p-5 text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10 outline-none sm:p-6"
              >
                <header className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-[20px] font-bold leading-[26px]">Tema</Dialog.Title>
                    <Dialog.Description className="mt-0.5 text-[14px] font-bold leading-[18px] text-chip-ink">
                      Escolha as cores do site.
                    </Dialog.Description>
                  </div>
                  <Tooltip content="Fechar (Esc)">
                    <Dialog.Close
                      aria-label="Fechar"
                      className="grid size-9 shrink-0 place-items-center rounded-full text-chip-ink transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                    >
                      <CloseIcon className="size-[18px]" />
                    </Dialog.Close>
                  </Tooltip>
                </header>

                <motion.ul
                  className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4"
                  variants={cascade(0.04, 0.12)}
                  initial="hidden"
                  animate="show"
                >
                  {THEMES.map((theme) => {
                    const selected = theme.id === current;
                    return (
                      <motion.li key={theme.id} variants={popIn}>
                        <motion.button
                          type="button"
                          data-theme-option={theme.id}
                          aria-pressed={selected}
                          aria-label={`Tema ${theme.name}`}
                          onClick={(event) => pick(theme.id, event)}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.96 }}
                          transition={SPRING_POP}
                          className="group relative block w-full cursor-pointer rounded-[16px] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        >
                          <ThemePreview id={theme.id} />
                          {selected && (
                            <motion.span
                              layoutId="theme-selected"
                              transition={SPRING}
                              className="pointer-events-none absolute -inset-1 bottom-auto aspect-[4/3] w-[calc(100%+8px)] rounded-[18px] ring-2 ring-white"
                            />
                          )}
                          <span className="mt-2 flex items-center justify-between gap-2 px-0.5 text-[13px] font-bold leading-[18px]">
                            <span className={clsx("transition-colors", selected ? "text-white" : "text-chip-ink group-hover:text-white")}>
                              {theme.name}
                            </span>
                            {selected && <CheckIcon className="size-4 text-white" />}
                          </span>
                        </motion.button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/**
 * Ao abrir, o foco vai para o tema atual (as setas/Tab seguem dali) em vez do botão de
 * fechar: senão o tooltip "Fechar" abriria sozinho e o primeiro Esc fecharia só ele.
 */
function focusSelected(event: Event) {
  event.preventDefault();
  document.querySelector<HTMLElement>('button[aria-label^="Tema "][aria-pressed="true"]')?.focus({ preventScroll: true });
}

/**
 * Miniatura do site (avatar, bio com chip, card de atividade e repos) pintada com os
 * tokens do próprio tema: o `data-theme` aqui troca as variáveis só dentro dela.
 */
function ThemePreview({ id }: { id: ThemeId }) {
  return (
    <span data-theme={id} className="relative block aspect-[4/3] overflow-hidden rounded-[14px] bg-canvas ring-1 ring-white/10">
      <span className="absolute top-[12%] left-[8%] size-[30%] rounded-[24%] bg-white/30" />
      <span className="absolute top-[16%] left-[46%] h-[6%] w-[44%] rounded-full bg-ink" />
      <span className="absolute top-[27%] left-[46%] h-[6%] w-[22%] rounded-full bg-ink/80" />
      <span className="absolute top-[26%] left-[70%] h-[8%] w-[12%] rounded-[30%] bg-chip" />
      <span className="absolute top-[52%] left-[8%] h-[8%] w-[30%] rounded-full bg-muted/70" />
      <span className="absolute bottom-[10%] left-[8%] h-[20%] w-[30%] rounded-[18%] bg-chip/70" />
      <span className="absolute bottom-[10%] left-[46%] h-[36%] w-[46%] rounded-[14%] bg-panel" />
      <span className="absolute bottom-[34%] left-[51%] h-[5%] w-[20%] rounded-full bg-white/80" />
      <span className="absolute bottom-[18%] left-[51%] h-[7%] w-[34%] rounded-full bg-fill/70" />
    </span>
  );
}
