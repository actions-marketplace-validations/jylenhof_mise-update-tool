import { describe, expect, it } from 'vitest';

import { GitHubRepoResolver } from '../../src/github/github-repo-resolver.js';

describe('GitHubRepoResolver', () => {
  it('parses aqua and github backends', () => {
    expect(GitHubRepoResolver.parseBackend('aqua:jdx/aube')).toEqual({
      owner: 'jdx',
      repo: 'aube',
    });
    expect(GitHubRepoResolver.parseBackend('github:jdx/fnox')).toEqual({
      owner: 'jdx',
      repo: 'fnox',
    });
  });

  it('maps known core backends to GitHub repositories', () => {
    expect(GitHubRepoResolver.parseBackend('core:node')).toEqual({
      owner: 'nodejs',
      repo: 'node',
    });
  });

  it('returns null for unsupported backends', () => {
    expect(GitHubRepoResolver.parseBackend('cargo:ripgrep')).toBeNull();
  });

  it('parses and formats repository coordinates', () => {
    expect(GitHubRepoResolver.parseRepository('jdx/aube')).toEqual({
      owner: 'jdx',
      repo: 'aube',
    });
    expect(GitHubRepoResolver.parseRepository('invalid')).toBeNull();
    expect(GitHubRepoResolver.formatRepository({ owner: 'jdx', repo: 'aube' })).toBe('jdx/aube');
  });
});
