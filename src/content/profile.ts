import avatar from "@/assets/avatar.webp";
import { ageOn, birthdayLabel } from "@/lib/format";
import type { BioPart, SocialLink, Tech } from "@/lib/types";

/**
 * Todo o conteúdo do portfólio. As imagens em src/assets foram recortadas do export
 * do Figma: troque pelos arquivos originais para ganhar resolução.
 */
export const profile = {
  name: "Brunno",
  role: "Desenvolvedor Full Stack",
  github: "q6r",
  discordId: "1327261533612408870",
  /** AAAA-MM-DD: a idade da bio sai daqui. */
  birthDate: "2007-02-24",
  avatar,
  avatarAlt: "Mai Sakurajima segurando o livro The Rust Programming Language",
  /** O rabisco do canto inferior esquerdo. */
  signature: "ANA",
};

export const GITHUB_URL = `https://github.com/${profile.github}`;

/**
 * Repositórios fixados na grade ("dono/repo"), sempre primeiro e nessa ordem. Aceita
 * repos de organizações; o resto da grade vem dos seus repos públicos.
 */
export const pinnedRepos: string[] = [];

/** Entre os seus repos, essas linguagens vêm primeiro (nessa ordem). */
export const preferredLanguages = ["Rust"];

/**
 * A bio do Figma. É função para a idade ser calculada a cada render da página (que se
 * regenera de hora em hora), e não uma vez só quando o módulo carrega.
 */
export function getBio(): BioPart[] {
  return [
    "Olá, me chamo Brunno! :] tenho ",
    {
      label: String(ageOn(profile.birthDate)),
      hint: `Aniversário: ${birthdayLabel(profile.birthDate)}`,
      birthday: profile.birthDate,
    },
    " anos, sou Desenvolvedor desde ",
    { label: "2021", hint: "Dev profissionalmente", since: 2021 },
    ", comecei a buscar aprender programação em ",
    { label: "2018", hint: "Primeiras linhas de código", since: 2018 },
    ". Amo tecnologia e estou buscando sempre aprender cada vez mais, curso cyber segurança e tenho um ",
    { label: "Github", hint: `github.com/${profile.github}`, href: GITHUB_URL },
    " onde ficam meus projetos e mais um pouco sobre mim.",
  ];
}

export const socials: SocialLink[] = [
  { name: "Instagram", icon: "instagram", href: "https://www.instagram.com/imsbrunno/", handle: "@imsbrunno" },
  { name: "GitHub", icon: "github", href: GITHUB_URL, handle: `@${profile.github}` },
  { name: "Discord", icon: "discord", href: `https://discord.com/users/${profile.discordId}`, handle: "@xqxqqx" },
  { name: "Last.fm", icon: "lastfm", href: "https://www.last.fm/user/crynew", handle: "@crynew" },
];

/** Ícones do skill-icons (MIT), em public/stack. */
export const stack: Tech[] = [
  { name: "Rust", icon: "/stack/rust.svg" },
  { name: "TypeScript", icon: "/stack/typescript.svg" },
  { name: "JavaScript", icon: "/stack/javascript.svg" },
  { name: "Go", icon: "/stack/go.svg" },
  { name: "Python", icon: "/stack/python.svg" },
  { name: "Lua", icon: "/stack/lua.svg" },
  { name: "Ruby", icon: "/stack/ruby.svg" },
  { name: "React", icon: "/stack/react.svg" },
  { name: "Next.js", icon: "/stack/nextjs.svg" },
  { name: "Svelte", icon: "/stack/svelte.svg" },
  { name: "Angular", icon: "/stack/angular.svg" },
  { name: "Tailwind CSS", icon: "/stack/tailwind.svg" },
  { name: "PostgreSQL", icon: "/stack/postgresql.svg" },
  { name: "MongoDB", icon: "/stack/mongodb.svg" },
  { name: "Docker", icon: "/stack/docker.svg" },
];

/** Card de atividade: presence ao vivo do Discord pela API do cee.bio. */
export const activity = {
  discordId: profile.discordId,
  /** Capa do estado "Idle", quando não estou ouvindo nem jogando nada. */
  idleImage: "https://cdn.cee.bio/uploads/a06951a3d78e1a656c4b7479759d5b4a-ac7e925ad0156ae1344a340f81bc4384.gif",
};
