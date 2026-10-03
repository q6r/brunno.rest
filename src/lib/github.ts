import type { Repo } from "./types";

type GithubRepo = {
  name: string;
  full_name: string;
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
 * GET na API do GitHub. Sem token o limite é 60 requisições por hora por IP; com
 * `GITHUB_TOKEN` no ambiente (token sem permissões já basta) sobe para 5000.
 * Qualquer falha vira null.
 */
async function github<T>(path: string): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

function toRepo(repo: GithubRepo): Repo {
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
}

type RepoOptions = {
  /** "dono/repo" que entram primeiro, nessa ordem; servem para repos de organizações. */
  pinned?: string[];
  limit?: number;
};

/**
 * Repositórios da grade: os fixados primeiro e, completando, os públicos do usuário
 * como no `getTopRepos` do cee (sem forks nem arquivados, por estrelas e, no empate,
 * o mais recente). O repo do README de perfil (`usuario/usuario`) fica de fora.
 * Se a API falhar, devolve o que conseguiu (ou nada, e a grade mostra o link do perfil).
 */
export async function getRepos(username: string, { pinned = [], limit = 6 }: RepoOptions = {}): Promise<Repo[]> {
  const [fixed, owned] = await Promise.all([
    Promise.all(
      pinned
        .filter((fullName) => /^[\w.-]+\/[\w.-]+$/.test(fullName))
        .map((fullName) => github<GithubRepo>(`/repos/${fullName}`)),
    ),
    github<GithubRepo[]>(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`),
  ]);

  const mine = (owned ?? [])
    .filter((repo) => !repo.fork && !repo.archived && repo.name.toLowerCase() !== username.toLowerCase())
    .sort((a, b) => b.stargazers_count - a.stargazers_count || Date.parse(b.pushed_at) - Date.parse(a.pushed_at));

  const seen = new Set<string>();
  return [...fixed.filter((repo): repo is GithubRepo => repo !== null), ...mine]
    .filter((repo) => {
      const key = repo.full_name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(toRepo);
}
