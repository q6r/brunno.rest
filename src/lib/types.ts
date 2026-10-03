export type BrandName = "instagram" | "github" | "discord" | "lastfm" | "spotify";

/** Destaque da bio: o "chip" escuro do Figma, com tooltip opcional. */
export type Highlight = {
  label: string;
  /** Texto do tooltip. */
  hint?: string;
  /** Ano de referência; o tooltip ganha "há N anos", calculado na hora. */
  since?: number;
  /** Data de nascimento (AAAA-MM-DD); o tooltip conta os dias até o próximo aniversário. */
  birthday?: string;
  href?: string;
};

/** A bio é texto corrido com destaques no meio. */
export type BioPart = string | Highlight;

export type SocialLink = {
  name: string;
  href: string;
  icon: BrandName;
  /** Aparece no tooltip, depois do nome da rede. */
  handle?: string;
};

export type Tech = {
  name: string;
  /** Caminho do SVG em /public. */
  icon: string;
};

export type Repo = {
  owner: string;
  /** URL do avatar no GitHub. */
  ownerAvatar: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  href: string;
};
