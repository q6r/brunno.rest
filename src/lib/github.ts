import type { Repo } from "./types";

type GithubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  owner: { login: string; avatar_url: string };
};

/** Uma hora: a página é estática e o Next refaz a lista em segundo plano (ISR). */
const REVALIDATE_SECONDS = 3600;

/**
 * Repositórios públicos para a grade, como o `getTopRepos` do cee: sem forks nem
 * arquivados, por estrelas (no empate, o mais recente). O repo do README de perfil
 * (`usuario/usuario`) fica de fora. Sem token o GitHub dá 60 requisições por hora por IP;
 * com `GITHUB_TOKEN` no ambiente (token sem permissões já basta) sobe para 5000.
 * Se a API falhar, devolve lista vazia e a grade mostra o link para o perfil.
 */
export async function getRepos(username: string, limit = 6): Promise<Repo[]> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const all = (await res.json()) as GithubRepo[];

    return all
      .filter((repo) => !repo.fork && !repo.archived && repo.name.toLowerCase() !== username.toLowerCase())
      .sort((a, b) => b.stargazers_count - a.stargazers_count || Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
      .slice(0, limit)
      .map((repo) => {
        const avatar = new URL(repo.owner.avatar_url);
        avatar.searchParams.set("s", "40");
        return {
          owner: repo.owner.login,
          ownerAvatar: avatar.toString(),
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          href: repo.html_url,
        };
      });
  } catch {
    return [];
  }
}
