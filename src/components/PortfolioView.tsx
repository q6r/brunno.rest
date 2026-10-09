"use client";

import { useEffect, useState } from "react";
import { Bio } from "@/components/about/Bio";
import { TechStack } from "@/components/about/TechStack";
import { AnaSignature } from "@/components/ana/AnaSignature";
import { ReadmeEditor } from "@/components/cyber/ReadmeEditor";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { ActivityCard } from "@/components/profile/ActivityCard";
import { Avatar } from "@/components/profile/Avatar";
import { RoleTitle } from "@/components/profile/RoleTitle";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { RepoGrid } from "@/components/projects/RepoGrid";
import { Stage } from "@/components/Stage";
import { ThemePicker } from "@/components/ThemePicker";
import { ana } from "@/content/ana";
import { cyberProfile, cyberRoles, cyberSocials } from "@/content/cyber";
import { activity, GITHUB_URL, profile, roles, socials, stack } from "@/content/profile";
import type { Lang } from "@/lib/i18n";
import { ENTRANCE } from "@/lib/motion";
import type { BioPart, Repo } from "@/lib/types";
import type { CyberNote } from "@/content/cyber-notes";

export function PortfolioView({ repos, bio, notes }: { repos: Repo[]; bio: Record<Lang, BioPart[]>; notes: CyberNote[] }) {
  const [cyber, setCyber] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.portfolioMode = cyber ? "cyber" : "portfolio";
    const previousTitle = document.title;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const previousColor = themeColor?.getAttribute("content");
    if (cyber) {
      document.title = "Brunno · Cibersegurança";
      themeColor?.setAttribute("content", "#000000");
    }
    return () => {
      delete document.documentElement.dataset.portfolioMode;
      if (cyber) {
        document.title = previousTitle;
        if (previousColor) themeColor?.setAttribute("content", previousColor);
      }
    };
  }, [cyber]);

  function toggleMode() {
    setCyber((current) => !current);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <div className={cyber ? "cyber-surface" : undefined} data-mode={cyber ? "cyber" : "portfolio"}>
      <Stage>
        <nav aria-label="Versão e idioma" className="absolute top-4 right-5 z-10 flex items-center gap-2 sm:right-8 lg:top-[30px] lg:right-[61px]">
          <ModeToggle cyber={cyber} onToggle={toggleMode} />
          {!cyber && <ThemePicker delay={ENTRANCE.language} />}
          <LanguageToggle delay={ENTRANCE.language + 0.06} />
        </nav>

        <div key={cyber ? "cyber" : "portfolio"} className={`mx-auto grid w-full max-w-[1382px] grid-cols-1 gap-y-10 px-5 pt-20 pb-44 sm:px-8 lg:grid-cols-[382px_minmax(0,1fr)] lg:gap-x-[50px] lg:gap-y-[29px] lg:pt-[84px] lg:pb-0 ${cyber ? "lg:grid-rows-[382px_auto]" : ""}`}>
          <Avatar
            src={cyber ? cyberProfile.avatar : profile.avatar}
            alt={cyber ? cyberProfile.avatarAlt : profile.avatarAlt}
            className="mx-auto w-full max-w-[382px] lg:col-start-1 lg:row-start-1"
          />
          <header className="flex flex-col items-center lg:col-start-1 lg:row-start-2">
            <RoleTitle name={profile.name} roles={cyber ? cyberRoles : roles} delay={ENTRANCE.role} className="text-center text-[22px] font-bold leading-7 text-white" />
            <SocialLinks links={cyber ? cyberSocials : socials} delay={ENTRANCE.socials} className="mt-2.5" />
            <ActivityCard discordId={activity.discordId} idleImage={activity.idleImage} delay={ENTRANCE.activity} className="mt-[42px] lg:self-start lg:pl-1.5" />
          </header>

          {cyber ? (
            <section aria-label="Arquivos de cibersegurança" className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2"><ReadmeEditor notes={notes} /></section>
          ) : (
            <section aria-label="Sobre mim" className="flex flex-col justify-between gap-12 lg:col-start-2 lg:row-start-1 lg:pt-[51px] lg:pb-[27px]">
              <Bio translations={bio} delay={ENTRANCE.bio} />
              <TechStack items={stack} delay={ENTRANCE.stack} />
            </section>
          )}

          {!cyber && <section aria-label="Projetos" className="lg:col-start-2 lg:row-start-2"><RepoGrid repos={repos} profileUrl={GITHUB_URL} delay={ENTRANCE.repos} /></section>}
        </div>
        {!cyber && <AnaSignature text={profile.signature} videos={ana.videos} message={ana.message} delay={ENTRANCE.signature} className="absolute -bottom-[43px] -left-[30px] z-10 w-[297px] rotate-[23.29deg]" />}
      </Stage>
    </div>
  );
}
