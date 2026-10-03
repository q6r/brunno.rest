"use client";

import clsx from "clsx";
import { AnimatePresence, motion, stagger, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { useEffect, useRef } from "react";
import { BrandIcon, CloseIcon } from "@/components/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useLyrics } from "@/hooks/useLyrics";
import { useNow } from "@/hooks/useNow";
import { formatTime } from "@/lib/format";
import { currentLineIndex } from "@/lib/lyrics";
import { EASE_OUT } from "@/lib/motion";

/** A música do modal, tirada da atividade do Spotify. */
export type LyricsTrack = {
  trackId: string;
  title: string;
  artist: string | null;
  album: string | null;
  image: string | null;
  /** Início e fim da reprodução em ms (epoch), para saber em que linha está. */
  start: number | null;
  end: number | null;
};

type LyricsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: LyricsTrack | null;
  /** A faixa ainda está tocando: só assim dá para destacar a linha atual. */
  live: boolean;
};

/** Depois de rolar na mão, a rolagem automática espera esse tempo para voltar. */
const MANUAL_SCROLL_PAUSE_MS = 4000;

const panelMotion = {
  initial: { opacity: 0, scale: 0.94, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.96, y: 16, filter: "blur(6px)" },
};

const lines: Variants = {
  hidden: {},
  show: { transition: { delayChildren: stagger(0.02) } },
};

const lineIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

/**
 * Modal com a letra da música que está tocando (API do cee.bio, via /api/lyrics).
 * Letra sincronizada destaca a linha atual pelo tempo da faixa e rola até ela; se a
 * música trocar com o modal aberto, ele acompanha.
 */
export function LyricsDialog({ open, onOpenChange, track, live }: LyricsDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && track && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-[rgb(28_32_33/0.45)] backdrop-blur-[6px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onOpenAutoFocus={focusLyrics}>
              <motion.div
                {...panelMotion}
                transition={{ type: "spring", bounce: 0, duration: 0.45 }}
                className="fixed top-1/2 left-1/2 z-50 flex h-[min(680px,calc(100dvh-48px))] w-[min(560px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[24px] bg-chip text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10 outline-none"
              >
                {/* Música nova com o modal aberto: o painel inteiro recomeça (letra, rolagem). */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={track.trackId}
                    className="flex min-h-0 flex-1 flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LyricsPanel track={track} live={live} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/**
 * Ao abrir, o foco vai para a letra (as setas já rolam) em vez do primeiro botão: senão o
 * tooltip de "Fechar" abriria sozinho e o primeiro Esc fecharia só ele.
 */
function focusLyrics(event: Event) {
  event.preventDefault();
  document.querySelector<HTMLElement>("[data-lyrics-list]")?.focus({ preventScroll: true });
}

function LyricsPanel({ track, live }: { track: LyricsTrack; live: boolean }) {
  const state = useLyrics(track.trackId);
  const now = useNow(250);
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const pauseUntil = useRef(0);
  const scrolledOnce = useRef(false);

  const lyrics = state.status === "ready" ? state.lyrics : null;
  const position = live && now !== null && track.start !== null ? now - track.start : null;
  const total = track.start !== null && track.end !== null ? track.end - track.start : null;
  const active = lyrics?.synced && position !== null ? currentLineIndex(lyrics.lines, position) : -1;

  // Centraliza a linha atual no rolo (a primeira vez sem animação).
  useEffect(() => {
    const list = listRef.current;
    if (active < 0 || !list || Date.now() < pauseUntil.current) return;
    const line = list.querySelector<HTMLElement>(`[data-line="${active}"]`);
    if (!line) return;
    list.scrollTo({
      top: line.offsetTop - list.clientHeight / 2 + line.clientHeight / 2,
      behavior: reduced || !scrolledOnce.current ? "auto" : "smooth",
    });
    scrolledOnce.current = true;
  }, [active, reduced, lyrics]);

  const pauseAutoScroll = () => {
    pauseUntil.current = Date.now() + MANUAL_SCROLL_PAUSE_MS;
  };

  return (
    <>
      <header className="flex items-center gap-4 p-5 pb-4">
        <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[16px] bg-white/5">
          {track.image && <Image src={track.image} alt="" fill unoptimized className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <Dialog.Title className="truncate text-[20px] font-bold leading-[26px]">{track.title}</Dialog.Title>
          <Dialog.Description className="truncate text-[14px] font-bold leading-[18px] text-muted">
            {track.artist ? `by ${track.artist}` : "Spotify"}
          </Dialog.Description>
          {track.album && <p className="mt-0.5 truncate text-[12px] font-medium text-chip-ink">{track.album}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1 self-start">
          <Tooltip content="Abrir no Spotify">
            <a
              href={`https://open.spotify.com/track/${track.trackId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir no Spotify"
              className="grid size-9 place-items-center rounded-full text-chip-ink transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            >
              <BrandIcon name="spotify" className="size-[18px]" />
            </a>
          </Tooltip>
          <Tooltip content="Fechar (Esc)">
            <Dialog.Close
              aria-label="Fechar"
              className="grid size-9 place-items-center rounded-full text-chip-ink transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            >
              <CloseIcon className="size-[18px]" />
            </Dialog.Close>
          </Tooltip>
        </div>
      </header>

      {position !== null && total !== null && total > 0 && (
        <div className="flex items-center gap-3 px-5 pb-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-fill transition-[width] duration-300 ease-linear"
              style={{ width: `${Math.min(100, (position / total) * 100)}%` }}
            />
          </div>
          <span className="text-[12px] font-bold text-chip-ink tabular-nums">
            {formatTime(Math.min(position, total) / 1000)} / {formatTime(total / 1000)}
          </span>
        </div>
      )}

      <div
        ref={listRef}
        data-lyrics-list
        onWheel={pauseAutoScroll}
        onTouchMove={pauseAutoScroll}
        onKeyDown={pauseAutoScroll}
        tabIndex={0}
        aria-label="Letra"
        className="scrollbar-none relative flex-1 overflow-y-auto overscroll-contain px-6 outline-none [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-inset"
      >
        {/* Sem "wait": a letra monta junto com os dados, então o efeito já acha a linha atual. */}
        <AnimatePresence initial={false}>
          {lyrics ? (
            <motion.div key="lyrics" variants={lines} initial="hidden" animate="show" className="space-y-3 py-[30%]">
              {lyrics.lines.map((line, i) =>
                line.text ? (
                  <motion.p
                    key={i}
                    data-line={i}
                    variants={lineIn}
                    className={clsx(
                      "origin-left text-[22px] font-bold leading-[1.35] transition-[color,scale] duration-300",
                      !lyrics.synced || active < 0
                        ? "text-white/80"
                        : i === active
                          ? "scale-[1.02] text-white"
                          : i < active
                            ? "text-white/45"
                            : "text-white/25",
                    )}
                  >
                    {line.text}
                  </motion.p>
                ) : (
                  <div key={i} data-line={i} className="h-3" />
                ),
              )}
            </motion.div>
          ) : (
            <motion.div
              key={state.status}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-6 inset-y-0 flex flex-col justify-center gap-3"
            >
              {state.status === "loading" ? (
                ["w-3/4", "w-1/2", "w-2/3", "w-5/12", "w-3/5", "w-1/2"].map((width, i) => (
                  <span key={i} className={clsx("h-6 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none", width)} />
                ))
              ) : (
                <p className="text-center text-[16px] font-bold text-chip-ink">
                  {state.status === "missing" ? "Essa música não tem letra disponível." : "Não consegui carregar a letra agora."}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t border-white/5 px-5 py-3 text-[11px] font-bold text-white/40">
        {lyrics ? (lyrics.synced ? "Letra sincronizada" : "Letra") : "Letra"}
        {lyrics?.provider && ` · via ${lyrics.provider}`}
        {!live && " · a música já parou"}
      </footer>
    </>
  );
}
