"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { useLang } from "@/hooks/useLang";
import { LANGS, setLang } from "@/lib/i18n";
import { EASE_OUT, SPRING } from "@/lib/motion";

/** Largura de cada opção: a pílula desliza exatamente esse tanto. */
const OPTION_WIDTH = 40;

type LanguageToggleProps = {
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
};

/**
 * PT/EN no canto do site. A pílula desliza pela posição (não por medida de layout),
 * então anda certo mesmo com o quadro escalado. Também mantém o `lang` do <html>.
 */
export function LanguageToggle({ delay = 0, className }: LanguageToggleProps) {
  const lang = useLang();
  const index = LANGS.findIndex((option) => option.code === lang);

  useEffect(() => {
    document.documentElement.lang = LANGS[index].htmlLang;
  }, [index]);

  return (
    // O `className` de fora posiciona (ex.: absolute no canto); o visual fica no div de dentro,
    // senão um `relative` daqui brigaria com o `absolute` de quem usa.
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ delay, duration: 0.6, ease: EASE_OUT }}
    >
      <div
        role="group"
        aria-label="Idioma / Language"
        className="relative flex rounded-full bg-chip p-1 shadow-[0_10px_24px_-14px_rgb(28_32_33/0.8)]"
      >
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 rounded-full bg-white/15"
          style={{ width: OPTION_WIDTH }}
          initial={false}
          animate={{ x: index * OPTION_WIDTH }}
          transition={SPRING}
        />
        {LANGS.map((option) => {
          const active = option.code === lang;
          return (
            <Tooltip key={option.code} content={option.name} side="bottom">
              <button
                type="button"
                lang={option.htmlLang}
                aria-pressed={active}
                aria-label={option.name}
                onClick={() => setLang(option.code)}
                style={{ width: OPTION_WIDTH }}
                className={clsx(
                  "relative cursor-pointer rounded-full py-1 text-[13px] font-bold leading-[18px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/70",
                  active ? "text-white" : "text-chip-ink hover:text-white",
                )}
              >
                {option.label}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </motion.div>
  );
}
