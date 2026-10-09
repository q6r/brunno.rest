"use client";

import { motion } from "motion/react";
import { Tooltip } from "@/components/ui/Tooltip";
import { useLang } from "@/hooks/useLang";
import { EASE_OUT } from "@/lib/motion";

export function ModeToggle({ cyber, onToggle }: { cyber: boolean; onToggle: () => void }) {
  const lang = useLang();
  const label = cyber
    ? lang === "pt" ? "Voltar ao portfólio" : "Back to portfolio"
    : lang === "pt" ? "Ativar versão de cibersegurança" : "Enable cybersecurity version";

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT }}>
      <Tooltip content={label} side="bottom">
        <motion.button
          type="button"
          onClick={onToggle}
          aria-label={label}
          aria-pressed={cyber}
          whileTap={{ scale: 0.96 }}
          className="group flex h-9 cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-[#151515] pr-3 pl-1 text-white shadow-[0_2px_8px_rgb(0_0_0/0.18),inset_0_1px_0_rgb(255_255_255/0.05)] outline-none transition-colors duration-200 hover:border-white/30 hover:bg-[#202020] focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          <span aria-hidden="true" className="grid size-7 place-items-center rounded-[5px] bg-white/[0.07] text-white/75 transition-colors group-hover:text-white">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {cyber ? <path d="m10 7-5 5 5 5M5 12h14" /> : <><path d="m5 6 6 6-6 6" /><path d="M13 18h6" /></>}
            </svg>
          </span>
          <span className="font-mono text-[12px] font-medium tracking-wide">{cyber ? "portfolio" : "cyber"}</span>
          {!cyber && <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3 text-white/40 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-white/80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>}
        </motion.button>
      </Tooltip>
    </motion.div>
  );
}
