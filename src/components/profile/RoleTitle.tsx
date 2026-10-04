"use client";

import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/hooks/useLang";
import type { Lang } from "@/lib/i18n";

type RoleTitleProps = {
  name: string;
  roles: Record<Lang, string>;
  /** Atraso da entrada, em segundos. */
  delay?: number;
  className?: string;
};

/** A função ("Desenvolvedor Full Stack") no idioma atual; trocar de idioma re-anima a entrada. */
export function RoleTitle({ name, roles, delay = 0, className }: RoleTitleProps) {
  const lang = useLang();
  return (
    <Reveal key={lang} as="h1" delay={delay} className={className}>
      <span className="sr-only">{name}, </span>
      {roles[lang]}
    </Reveal>
  );
}
