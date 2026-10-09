import { PortfolioView } from "@/components/PortfolioView";
import { getBio, pinnedRepos, preferredLanguages, profile } from "@/content/profile";
import { getRepos } from "@/lib/github";
import { getCyberNotes } from "@/lib/cyber-notes";

export default async function Home() {
  const [repos, notes] = await Promise.all([
    getRepos(profile.github, { pinned: pinnedRepos, preferLanguages: preferredLanguages }),
    getCyberNotes(),
  ]);
  return <PortfolioView repos={repos} notes={notes} bio={{ pt: getBio("pt"), en: getBio("en") }} />;
}
