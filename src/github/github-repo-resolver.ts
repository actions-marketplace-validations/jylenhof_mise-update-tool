const CORE_GITHUB_REPOS: Record<string, string> = {
  node: 'nodejs/node',
  python: 'python/cpython',
  go: 'golang/go',
  ruby: 'ruby/ruby',
  rust: 'rust-lang/rust',
  java: 'adoptium/temurin21-binaries',
};

export interface GitHubRepository {
  owner: string;
  repo: string;
}

export class GitHubRepoResolver {
  static parseBackend(backend: string): GitHubRepository | null {
    const prefixed = backend.match(/^(?:aqua|github):([^/\s]+\/[^/\s]+)$/);
    if (prefixed) {
      return GitHubRepoResolver.parseRepository(prefixed[1]);
    }

    const core = backend.match(/^core:([^/\s]+)$/);
    if (core) {
      const repository = CORE_GITHUB_REPOS[core[1]];
      return repository ? GitHubRepoResolver.parseRepository(repository) : null;
    }

    return null;
  }

  static parseRepository(value: string): GitHubRepository | null {
    const [owner, repo] = value.split('/');
    if (!owner || !repo) {
      return null;
    }
    return { owner, repo };
  }

  static formatRepository(repository: GitHubRepository): string {
    return `${repository.owner}/${repository.repo}`;
  }
}
