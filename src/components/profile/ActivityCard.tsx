"use client";

import clsx from "clsx";
import { AnimatePresence, motion, type Variants } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BrandIcon } from "@/components/icons";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDiscordPresence } from "@/hooks/useDiscordPresence";
import { useNow } from "@/hooks/useNow";
import { LyricsDialog, type LyricsTrack } from "./LyricsDialog";
import { KIND_LABEL, pickActivity, STATUS_LABEL, type Activity } from "@/lib/discord/activity";
import type { PresenceStatus } from "@/lib/discord/socket";
import { formatTime } from "@/lib/format";
import { cascade, EASE_OUT, fadeUp, SPRING_POP } from "@/lib/motion";
import type { BrandName } from "@/lib/types";

/** Sem resposta do socket nesse tempo, sai do esqueleto e mostra "Idle". */
const GIVE_UP_MS = 5000;

/** O que o card mostra, já resolvido a partir da atividade (ou da falta dela). */
type CardView = {
  /** Muda a cada atividade nova: dispara a troca animada do texto. */
  key: string;
  image: string | null;
  imageHint: string;
  label: string;
  icon: BrandName;
  title: string;
  subtitle: string | null;
  /** Música (ou qualquer coisa com fim): posição e duração em segundos. */
  progress: { elapsed: number; total: number } | null;
  /** Jogo (sem fim): segundos desde o início e a hora em que começou. */
  elapsed: { seconds: number; since: string } | null;
  /** Música do Spotify com ID: clicar abre o modal da letra. */
  lyrics: LyricsTrack | null;
};

const toSeconds = (ms: number) => Math.max(0, Math.floor(ms / 1000));

function toView(activity: Activity | null, status: PresenceStatus | undefined, idleImage: string, now: number | null): CardView {
  if (!activity) {
    return {
      key: "idle",
      image: idleImage,
      imageHint: `Discord: ${STATUS_LABEL[status ?? "offline"]}`,
      label: "Discord",
      icon: "discord",
      title: "Idle",
      subtitle: "nothing going on right now",
      progress: null,
      elapsed: null,
      lyrics: null,
    };
  }

  const { start, end } = activity;
  const elapsed = now !== null && start !== null ? toSeconds(now - start) : null;
  const total = start !== null && end !== null && end > start ? toSeconds(end - start) : null;
  const listening = activity.kind === "listening";
  const title = listening ? (activity.details ?? activity.name) : activity.name;
  const artists = activity.state?.replaceAll("; ", ", ") ?? null;

  return {
    key: activity.key,
    image: activity.image,
    imageHint: activity.largeText ?? activity.name,
    label: listening ? `${KIND_LABEL.listening} ${activity.name}` : KIND_LABEL[activity.kind],
    icon: activity.name === "Spotify" ? "spotify" : "discord",
    title,
    subtitle: listening ? artists && `by ${artists}` : (activity.details ?? activity.state),
    progress: elapsed !== null && total !== null ? { elapsed: Math.min(elapsed, total), total } : null,
    elapsed:
      elapsed !== null && total === null && start !== null
        ? { seconds: elapsed, since: new Date(start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
        : null,
    lyrics:
      listening && activity.trackId
        ? { trackId: activity.trackId, title, artist: artists, album: activity.largeText, image: activity.image, start, end }
        : null,
  };
}

const coverIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -4 },
  show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

/** Texto que sai subindo e desfocando quando a atividade troca. */
const textOut = { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.2, ease: "easeIn" } } as const;

type ActivityCardProps = {
  discordId: string;
  /** Capa do estado "Idle", quando não há nenhuma atividade. */
  idleImage: string;
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
};

/**
 * O card "Activy" do Figma, ao vivo pela API do cee.bio: o que estou ouvindo ou jogando
 * no Discord. Sem atividade mostra "Idle" com o GIF. Cada troca (outra música, outro
 * jogo) cruza a capa e reentra o texto; a barra anda a cada segundo.
 */
export function ActivityCard({ discordId, idleImage, delay = 0, className }: ActivityCardProps) {
  const { presence } = useDiscordPresence(discordId);
  const now = useNow();
  const [gaveUp, setGaveUp] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  // A música de quando o modal abriu: se ela parar de tocar, o modal segue com a última.
  const [openedTrack, setOpenedTrack] = useState<LyricsTrack | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setGaveUp(true), GIVE_UP_MS);
    return () => clearTimeout(id);
  }, []);

  const view = presence || gaveUp ? toView(pickActivity(presence), presence?.status, idleImage, now) : null;
  const playing = view?.lyrics ?? null;

  function openLyrics() {
    if (!playing) return;
    setOpenedTrack(playing);
    setLyricsOpen(true);
  }

  const coverClass =
    "relative block size-[150px] overflow-hidden rounded-[31px] bg-chip/50 shadow-[0_18px_36px_-20px_rgb(28_32_33/0.7)] outline-none focus-visible:ring-2 focus-visible:ring-white/70";
  const coverArt = (
    <AnimatePresence initial={false}>
      {view ? (
        <motion.div
          key={view.image ?? "no-image"}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          {view.image ? (
            // Imagens de CDNs externas que mudam o tempo todo: carrega direto, sem otimizador.
            <Image src={view.image} alt="" fill unoptimized className="object-cover" />
          ) : (
            <span className="grid size-full place-items-center bg-chip text-white">
              <BrandIcon name="discord" className="size-14" />
            </span>
          )}
        </motion.div>
      ) : (
        <motion.span
          key="loading"
          className="absolute inset-0 animate-pulse bg-white/10 motion-reduce:animate-none"
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>
  );

  return (
    <motion.article
      aria-label={view ? `${view.label}: ${view.title}` : "Carregando atividade do Discord"}
      className={clsx("flex w-full max-w-[375px] items-start gap-[25px]", className)}
      variants={cascade(0.07, delay)}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={coverIn} className="shrink-0">
        {playing ? (
          <Tooltip
            content={
              <span className="flex flex-col">
                Ver letra
                {playing.album && <span className="text-chip-ink">{playing.album}</span>}
              </span>
            }
          >
            <motion.button
              type="button"
              onClick={openLyrics}
              aria-label={`Ver a letra de ${playing.title}`}
              className={clsx(coverClass, "cursor-pointer")}
              whileHover={{ scale: 1.04, rotate: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_POP}
            >
              {coverArt}
            </motion.button>
          </Tooltip>
        ) : (
          <Tooltip content={view?.imageHint ?? "Conectando ao Discord…"}>
            <motion.div
              tabIndex={0}
              className={coverClass}
              whileHover={{ scale: 1.04, rotate: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_POP}
            >
              {coverArt}
            </motion.div>
          </Tooltip>
        )}
      </motion.div>

      {/* Altura fixa: a barra fica sempre no mesmo lugar do Figma, com ou sem subtítulo. */}
      <div className="relative h-[150px] min-w-0 flex-1 pt-[7px]">
        <AnimatePresence mode="wait">
          {view ? (
            <motion.div key={view.key} variants={cascade(0.06)} exit={textOut}>
              <motion.p variants={fadeUp} className="flex items-center gap-[7px] text-[11px] font-bold leading-[14px] text-muted">
                <span className="truncate">{view.label}</span>
                <BrandIcon name={view.icon} className="size-[14px] shrink-0 text-track" />
              </motion.p>
              <motion.p variants={fadeUp} className="truncate text-[22px] font-bold leading-[28px] text-white">
                {view.lyrics ? (
                  <Tooltip content="Ver letra">
                    <button
                      type="button"
                      onClick={openLyrics}
                      className="block max-w-full cursor-pointer truncate text-left decoration-white/50 decoration-2 underline-offset-4 outline-none hover:underline focus-visible:underline"
                    >
                      {view.title}
                    </button>
                  </Tooltip>
                ) : (
                  view.title
                )}
              </motion.p>
              {view.subtitle && (
                <motion.p variants={fadeUp} className="mt-1 truncate text-[14px] font-bold leading-[18px] text-muted">
                  {view.subtitle}
                </motion.p>
              )}

              {view.progress && (
                <motion.div variants={fadeUp} className="absolute top-[115px] left-0">
                  <Tooltip content={`${formatTime(view.progress.elapsed)} / ${formatTime(view.progress.total)}`}>
                    <ProgressBar
                      aria-label="Progresso da música"
                      value={view.progress.elapsed / view.progress.total}
                      delay={0.25}
                      className="w-[145px]"
                    />
                  </Tooltip>
                </motion.div>
              )}
              {view.elapsed && (
                <motion.div variants={fadeUp} className="absolute top-[114px] left-0">
                  <Tooltip content={`Desde ${view.elapsed.since}`}>
                    <span className="text-[13px] font-bold leading-[17px] text-muted tabular-nums">
                      {formatTime(view.elapsed.seconds)} elapsed
                    </span>
                  </Tooltip>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="loading" variants={fadeUp} exit={textOut} aria-hidden="true" className="flex flex-col gap-2.5 pt-0.5">
              <span className="h-2.5 w-24 animate-pulse rounded-full bg-white/15 motion-reduce:animate-none" />
              <span className="h-5 w-32 animate-pulse rounded-full bg-white/20 motion-reduce:animate-none" />
              <span className="h-3 w-20 animate-pulse rounded-full bg-white/15 motion-reduce:animate-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LyricsDialog
        open={lyricsOpen}
        onOpenChange={setLyricsOpen}
        track={playing ?? openedTrack}
        live={playing !== null}
      />
    </motion.article>
  );
}
