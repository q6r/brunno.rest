"use client";

import { AnimatePresence, motion, stagger, type Variants } from "motion/react";
import { Dialog } from "radix-ui";
import { Fragment, useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { EASE_OUT } from "@/lib/motion";

/** Onde cada vídeo cai (centro, em % da tela) e quanto fica torto, como fotos jogadas na mesa. */
const SLOTS = [
  { x: 14, y: 31, r: -9 },
  { x: 33, y: 27, r: 6 },
  { x: 52, y: 31, r: -5 },
  { x: 71, y: 27, r: 8 },
  { x: 88, y: 32, r: -6 },
  { x: 9, y: 74, r: 10 },
  { x: 27, y: 68, r: -7 },
  { x: 46, y: 75, r: 5 },
  { x: 65, y: 68, r: -8 },
  { x: 83, y: 75, r: 7 },
  { x: 96, y: 58, r: -11 },
  { x: 50, y: 50, r: 3 },
];

/** No monte do centro cada vídeo fica um pouco deslocado e torto, como fotos empilhadas. */
const STACK_JITTER = [
  { dx: -14, dy: 8, r: -7 },
  { dx: 12, dy: -10, r: 6 },
  { dx: -8, dy: -14, r: -4 },
  { dx: 16, dy: 10, r: 8 },
  { dx: -18, dy: -4, r: -9 },
  { dx: 6, dy: 16, r: 5 },
  { dx: -4, dy: 12, r: -6 },
  { dx: 18, dy: -6, r: 9 },
  { dx: -12, dy: -12, r: -3 },
  { dx: 10, dy: 4, r: 4 },
  { dx: -16, dy: 14, r: -8 },
  { dx: 4, dy: -16, r: 7 },
];

/** Ritmo da cena, em segundos. */
const VIDEO_START = 0.35;
/** "Bem rápido": um vídeo a cada 90ms caindo na pilha. */
const VIDEO_GAP = 0.09;
/** Quanto a pilha fica parada antes de juntar no centro. */
const PILE_HOLD = 0.8;
/** Quanto tempo o monte fica no centro, com o vídeo da frente trocando. */
const STACK_TIME = 7;
/** Quanto dura a ida dos vídeos para o centro (mola suave) antes das trocas. */
const GATHER_TIME = 0.65;
/** Ritmo das trocas: começa calmo, acelera no meio e desacelera antes da passagem. */
const SWAP_FAST = 0.08;
const SWAP_SLOW = 0.22;
const swapDelay = (progress: number) =>
  SWAP_FAST + (SWAP_SLOW - SWAP_FAST) * (1 - Math.sin(Math.PI * Math.min(1, Math.max(0, progress))));
/** Quanto o vídeo novo leva para "cair" em cima do monte. */
const SWAP_LAND = 0.16;
/** A passagem para o lado: um vídeo atrás do outro, rápido. */
const PASS_GAP = 0.08;
const PASS_DURATION = 0.5;

/** De onde o vídeo novo da frente chega: deslocamento e ângulo sorteados a cada troca. */
type Enter = { dx: number; dy: number; r: number };
/** O monte: `order` vai do fundo para a frente (o último é o da frente). */
type Deck = { order: number[]; enter: Enter };

function randomEnter(): Enter {
  const side = () => (Math.random() < 0.5 ? -1 : 1);
  return { dx: side() * (30 + Math.random() * 50), dy: side() * (20 + Math.random() * 35), r: side() * (6 + Math.random() * 9) };
}

/** Tira um vídeo da metade de baixo do monte e põe na frente: quem acabou de aparecer não volta logo. */
function promote(deck: Deck, pick: number, enter: Enter): Deck {
  const half = Math.max(1, Math.floor(deck.order.length / 2));
  const chosen = deck.order[Math.floor(pick * half)];
  return { order: [...deck.order.filter((i) => i !== chosen), chosen], enter };
}

type Phase = "pile" | "stack" | "pass" | "words";

const line: Variants = {
  hidden: {},
  show: (delay: number) => ({ transition: { delayChildren: stagger(0.06, { startDelay: delay }) } }),
};

const word: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE_OUT } },
};

type AnaMomentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videos: string[];
  /** O recado, em estrofes (cada uma é uma lista de linhas). */
  message: string[][];
};

/**
 * A surpresa da Ana em tela cheia: o site desfoca, os vídeos caem espalhados, se juntam
 * num monte no centro (todos tocando, o da frente trocando), passam rápido para o lado
 * e dão lugar ao recado. Esc, o X ou um clique no vazio fecham.
 */
export function AnaMoment({ open, onOpenChange, videos, message }: AnaMomentProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-[rgb(0_0_0/0.35)]"
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(18px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.5, delay: 0.2 } }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount onOpenAutoFocus={focusScene}>
              <motion.div className="fixed inset-0 z-50 overflow-hidden outline-none">
                <Dialog.Title className="sr-only">Ana</Dialog.Title>
                <Dialog.Description className="sr-only">Vídeos da Ana e um recado sobre ela.</Dialog.Description>
                <AnaScene videos={videos} message={message} onClose={() => onOpenChange(false)} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/** Ao abrir, o foco vai para a cena (o X abriria o tooltip sozinho). */
function focusScene(event: Event) {
  event.preventDefault();
  document.querySelector<HTMLElement>("[data-ana-scene]")?.focus({ preventScroll: true });
}

/** Tamanho da janela, para posicionar os vídeos em pixels. */
function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

function AnaScene({ videos, message, onClose }: { videos: string[]; message: string[][]; onClose: () => void }) {
  const { w, h } = useViewport();
  const count = videos.length;
  const [phase, setPhase] = useState<Phase>("pile");
  // O monte começa na ordem da pilha: o último que caiu (o de cima) na frente.
  const [deck, setDeck] = useState<Deck>(() => ({ order: videos.map((_, i) => i), enter: { dx: 0, dy: 0, r: 0 } }));
  // Já chegaram no centro: a partir daí começam as trocas.
  const [gathered, setGathered] = useState(false);

  // Roteiro: pilha → monte no centro → passagem para o lado → recado.
  useEffect(() => {
    const stackAt = VIDEO_START + count * VIDEO_GAP + PILE_HOLD;
    const passAt = stackAt + STACK_TIME;
    const wordsAt = passAt + count * PASS_GAP + PASS_DURATION;
    const timers = [
      setTimeout(() => setPhase("stack"), stackAt * 1000),
      setTimeout(() => setGathered(true), (stackAt + GATHER_TIME) * 1000),
      setTimeout(() => setPhase("pass"), passAt * 1000),
      setTimeout(() => setPhase("words"), wordsAt * 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [count]);

  // No monte, o vídeo da frente vai trocando, com o ritmo acelerando e desacelerando.
  useEffect(() => {
    if (phase !== "stack" || !gathered) return;
    const started = performance.now();
    const span = (STACK_TIME - GATHER_TIME) * 1000;
    let id: ReturnType<typeof setTimeout>;
    const swap = () => {
      // Sorteia fora do updater: o React pode chamá-lo duas vezes em desenvolvimento.
      const pick = Math.random();
      const enter = randomEnter();
      setDeck((current) => promote(current, pick, enter));
      id = setTimeout(swap, swapDelay((performance.now() - started) / span) * 1000);
    };
    id = setTimeout(swap, swapDelay(0) * 1000);
    return () => clearTimeout(id);
  }, [phase, gathered]);

  /** O alvo de cada vídeo em cada fase (pixels a partir do lugar dele na pilha). */
  function target(i: number) {
    const slot = SLOTS[i % SLOTS.length];
    const toCenterX = ((50 - slot.x) / 100) * w;
    const toCenterY = ((50 - slot.y) / 100) * h;
    // Profundidade no monte: 0 é o da frente.
    const depth = count - 1 - deck.order.indexOf(i);

    if (phase === "stack") {
      const jitter = STACK_JITTER[i % STACK_JITTER.length];
      if (gathered && depth === 0) {
        // O vídeo novo chega de um lado sorteado, como foto jogada em cima do monte.
        const { enter } = deck;
        return {
          opacity: 1,
          x: [toCenterX + enter.dx, toCenterX],
          y: [toCenterY + enter.dy, toCenterY],
          rotate: [enter.r, 0],
          scale: [1.48, 1.4],
          transition: { duration: SWAP_LAND, ease: "easeOut" as const },
        };
      }
      return {
        opacity: 1,
        x: toCenterX + (depth === 0 ? 0 : jitter.dx),
        y: toCenterY + (depth === 0 ? 0 : jitter.dy),
        rotate: depth === 0 ? 0 : jitter.r,
        scale: depth === 0 ? 1.4 : 1.3,
        // A ida para o centro com mola; depois, quem sai da frente volta para o monte rápido.
        transition: gathered
          ? { duration: 0.2, ease: "easeOut" as const }
          : { type: "spring" as const, bounce: 0.2, duration: GATHER_TIME },
      };
    }
    if (phase === "pass") {
      // Sai pela esquerda, a partir do da frente, acelerando.
      return {
        opacity: 1,
        x: -(slot.x / 100) * w - 0.45 * w,
        y: toCenterY - 40,
        rotate: -14,
        scale: 1.25,
        transition: { duration: PASS_DURATION, ease: [0.55, 0, 0.8, 0.4] as const, delay: depth * PASS_GAP },
      };
    }
    return {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: slot.r,
      scale: 1,
      transition: { type: "spring" as const, bounce: 0.3, duration: 0.7, delay: VIDEO_START + i * VIDEO_GAP },
    };
  }

  return (
    <div
      data-ana-scene
      tabIndex={-1}
      className="absolute inset-0 outline-none"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      {phase !== "words" &&
        videos.map((src, i) => {
          const slot = SLOTS[i % SLOTS.length];
          const position = deck.order.indexOf(i);
          return (
            <motion.div
              key={src}
              aria-hidden="true"
              initial={{ opacity: 0, x: (i % 2 ? 1 : -1) * (80 + ((i * 37) % 120)), y: h * 0.75, rotate: slot.r * 4, scale: 0.6 }}
              animate={target(i)}
              exit={{ opacity: 0, y: h * 0.85, rotate: slot.r * 3, transition: { duration: 0.35, ease: "easeIn" } }}
              className="pointer-events-none absolute aspect-[9/16] h-[min(44vh,62vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] bg-chip shadow-[0_30px_60px_-20px_rgb(0_0_0/0.75)] ring-4 ring-white/90"
              style={{ left: `${slot.x}%`, top: `${slot.y}%`, zIndex: phase === "pile" ? i + 1 : position + 1 }}
            >
              <video
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="size-full object-cover"
              />
            </motion.div>
          );
        })}

      {phase === "words" && (
        <>
          {/* Escurece o centro, para o recado ler bem sobre o site desfocado. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[45] bg-[radial-gradient(ellipse_66%_52%_at_center,rgb(0_0_0/0.6),transparent)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          />
          <AnaMessage stanzas={message} />
        </>
      )}

      <Tooltip content="Voltar (Esc)" side="bottom">
        <Dialog.Close
          aria-label="Voltar"
          className="absolute top-5 right-5 z-[60] grid size-11 cursor-pointer place-items-center rounded-full bg-chip text-chip-ink shadow-[0_10px_24px_-10px_rgb(0_0_0/0.8)] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
        >
          <CloseIcon className="size-5" />
        </Dialog.Close>
      </Tooltip>
    </div>
  );
}

/** Espaço entre uma palavra e a seguinte na revelação. */
const WORD_STEP = 0.06;
/** Quando a primeira estrofe começa (depois do centro escurecer); as outras quase na hora. */
const MESSAGE_START = 0.6;
const NEXT_STANZA_START = 0.15;
/** Tempo para ler uma estrofe: ~3,5 palavras por segundo, nunca menos de 2,5s. */
const readTime = (words: number) => Math.max(2.5, words / 3.5);
const countWords = (text: string) => text.split(" ").length;

/**
 * O recado em estrofes: cada uma aparece palavra por palavra (linha após linha), fica o
 * tempo de ler, some subindo e dá lugar à próxima. A última fica com o ♡ pulsando.
 */
function AnaMessage({ stanzas }: { stanzas: string[][] }) {
  const [index, setIndex] = useState(0);
  const lastIndex = stanzas.length - 1;
  const stanza = stanzas[index];
  // Cada linha começa quando a anterior termina de revelar.
  const first = index === 0 ? MESSAGE_START : NEXT_STANZA_START;
  const starts = stanza.map((_, i) =>
    stanza.slice(0, i).reduce((total, text) => total + countWords(text) * WORD_STEP, first),
  );
  const revealEnd = starts[starts.length - 1] + countWords(stanza[stanza.length - 1]) * WORD_STEP;
  const words = stanza.reduce((total, text) => total + countWords(text), 0);

  useEffect(() => {
    if (index >= lastIndex) return;
    const id = setTimeout(() => setIndex(index + 1), (revealEnd + readTime(words)) * 1000);
    return () => clearTimeout(id);
  }, [index, lastIndex, revealEnd, words]);

  return (
    <div className="pointer-events-none absolute inset-x-6 top-1/2 z-50 mx-auto max-w-4xl -translate-y-1/2 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="space-y-2"
          exit={{ opacity: 0, y: -12, filter: "blur(6px)", transition: { duration: 0.5, ease: "easeIn" } }}
        >
          {stanza.map((text, i) => (
            <motion.p
              key={i}
              custom={starts[i]}
              variants={line}
              initial="hidden"
              animate="show"
              className="text-[clamp(20px,2.5vw,36px)] font-bold leading-[1.25] text-white [text-shadow:0_4px_24px_rgb(0_0_0/0.7)]"
            >
              {text.split(" ").map((piece, j) => (
                <Fragment key={j}>
                  {j > 0 && " "}
                  <motion.span variants={word} className="inline-block">
                    {piece}
                  </motion.span>
                </Fragment>
              ))}
            </motion.p>
          ))}
          {index === lastIndex && (
            <motion.p
              aria-hidden="true"
              className="mt-4 text-[clamp(32px,4vw,56px)] leading-none text-rose-200 [text-shadow:0_0_30px_rgb(255_180_200/0.7)]"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: [1, 1.15, 1] }}
              transition={{
                opacity: { delay: revealEnd + 0.3, duration: 0.6 },
                scale: { delay: revealEnd + 0.3, duration: 1.6, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              ♡
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
