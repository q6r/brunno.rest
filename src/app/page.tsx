import { Bio } from "@/components/about/Bio";
import { TechStack } from "@/components/about/TechStack";
import { ActivityCard } from "@/components/profile/ActivityCard";
import { Avatar } from "@/components/profile/Avatar";
import { Signature } from "@/components/profile/Signature";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { RepoGrid } from "@/components/projects/RepoGrid";
import { Stage } from "@/components/Stage";
import { Reveal } from "@/components/ui/Reveal";
import { activity, getBio, GITHUB_URL, pinnedRepos, profile, socials, stack } from "@/content/profile";
import { getRepos } from "@/lib/github";
import { ENTRANCE } from "@/lib/motion";

/**
 * Layout do Figma em duas colunas (382px + 50px + resto) dentro do quadro de 1440x1024.
 * A primeira linha alinha o avatar com bio + stack; a segunda, o cargo com a grade de
 * repositórios, que vem do GitHub. No celular vira uma coluna só, na ordem do HTML.
 */
export default async function Home() {
  const repos = await getRepos(profile.github, { pinned: pinnedRepos });

  return (
    <Stage>
      <div className="mx-auto grid w-full max-w-[1382px] grid-cols-1 gap-y-10 px-5 pt-10 pb-44 sm:px-8 lg:grid-cols-[382px_minmax(0,1fr)] lg:gap-x-[50px] lg:gap-y-[29px] lg:pt-[84px] lg:pb-0">
        <Avatar
          src={profile.avatar}
          alt={profile.avatarAlt}
          className="mx-auto w-full max-w-[382px] lg:col-start-1 lg:row-start-1"
        />

        <header className="flex flex-col items-center lg:col-start-1 lg:row-start-2">
          <Reveal as="h1" delay={ENTRANCE.role} className="text-center text-[22px] font-bold leading-[28px] text-white">
            <span className="sr-only">{profile.name}, </span>
            {profile.role}
          </Reveal>
          <SocialLinks links={socials} delay={ENTRANCE.socials} className="mt-2.5" />
          <ActivityCard
            discordId={activity.discordId}
            idleImage={activity.idleImage}
            delay={ENTRANCE.activity}
            className="mt-[42px] lg:self-start lg:pl-1.5"
          />
        </header>

        <section
          aria-label="Sobre mim"
          className="flex flex-col justify-between gap-12 lg:col-start-2 lg:row-start-1 lg:pt-[51px] lg:pb-[27px]"
        >
          <Bio parts={getBio()} delay={ENTRANCE.bio} />
          <TechStack items={stack} delay={ENTRANCE.stack} />
        </section>

        <section aria-label="Projetos" className="lg:col-start-2 lg:row-start-2">
          <RepoGrid repos={repos} profileUrl={GITHUB_URL} delay={ENTRANCE.repos} />
        </section>
      </div>

      <Signature
        text={profile.signature}
        delay={ENTRANCE.signature}
        className="absolute -bottom-[43px] -left-[30px] -z-10 w-[297px] rotate-[23.29deg]"
      />
    </Stage>
  );
}
