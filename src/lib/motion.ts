import { stagger, type Transition, type Variants } from "motion/react";

/** easeOutQuint: sai rápido e assenta devagar. Para entradas. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Mola sem quique, para o que só aparece (tooltips). */
export const SPRING: Transition = { type: "spring", bounce: 0, duration: 0.3 };

/** Mola com um leve quique, para o hover de ícones, chips e cards. */
export const SPRING_POP: Transition = { type: "spring", bounce: 0.4, duration: 0.45 };

/** Roteiro da animação de entrada, em segundos desde o carregamento. */
export const ENTRANCE = {
  avatar: 0,
  bio: 0.15,
  role: 0.3,
  socials: 0.4,
  stack: 0.55,
  activity: 0.6,
  repos: 0.75,
  language: 0.9,
  signature: 1.2,
} as const;

/** Contêiner que só orquestra: segura e escalona a entrada dos filhos. */
export const cascade = (interval: number, startDelay = 0): Variants => ({
  hidden: {},
  show: { transition: { delayChildren: stagger(interval, { startDelay }) } },
});

/**
 * Sobe, desfoca e aparece. Dentro de um `cascade` usa o atraso dele; solto, o atraso
 * vem do `custom` (só entra na transição quando existe, senão anularia o escalonamento).
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  show: (delay?: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT, ...(delay ? { delay } : {}) },
    transitionEnd: { filter: "none" },
  }),
};

/** Cresce de pequeno com quique: ícones e chips. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.45, duration: 0.6 } },
};
