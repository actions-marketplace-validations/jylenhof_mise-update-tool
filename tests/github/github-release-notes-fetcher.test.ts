import * as core from '@actions/core';
import * as github from '@actions/github';
import semver from 'semver';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GitHubReleaseNotesFetcher } from '../../src/github/github-release-notes-fetcher.js';

describe('GitHubReleaseNotesFetcher', () => {
  const releases = [
    { tag: 'v1.25.0', body: 'First', version: semver.coerce('1.25.0')! },
    { tag: 'v1.25.1', body: 'Patch', version: semver.coerce('1.25.1')! },
    { tag: 'v1.26.0', body: 'Minor', version: semver.coerce('1.26.0')! },
    { tag: 'v1.27.0', body: 'Future', version: semver.coerce('1.27.0')! },
  ];

  const change = {
    name: 'aube',
    previousRequested: 'latest',
    nextRequested: 'latest',
    previousVersion: '1.25.1',
    nextVersion: '1.26.0',
  };

  describe('filterReleasesBetween', () => {
    it('returns releases strictly after the previous version up to the target', () => {
      expect(GitHubReleaseNotesFetcher.filterReleasesBetween(releases, '1.25.1', '1.26.0')).toEqual(
        [{ tag: 'v1.26.0', body: 'Minor' }],
      );
    });

    it('returns multiple releases when several versions were skipped', () => {
      expect(GitHubReleaseNotesFetcher.filterReleasesBetween(releases, '1.24.0', '1.26.0')).toEqual(
        [
          { tag: 'v1.25.0', body: 'First' },
          { tag: 'v1.25.1', body: 'Patch' },
          { tag: 'v1.26.0', body: 'Minor' },
        ],
      );
    });

    it('returns an empty list for invalid version ranges', () => {
      expect(
        GitHubReleaseNotesFetcher.filterReleasesBetween([], 'invalid', 'also-invalid'),
      ).toEqual([]);
      expect(GitHubReleaseNotesFetcher.filterReleasesBetween([], '2.0.0', '1.0.0')).toEqual([]);
    });
  });

  describe('enrich', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('returns the original change when the backend cannot be resolved', async () => {
      const mise = { getToolBackend: vi.fn().mockResolvedValue(null) };
      const fetcher = new GitHubReleaseNotesFetcher('token', mise as never);

      await expect(fetcher.enrich([change])).resolves.toEqual([change]);
      expect(core.warning).toHaveBeenCalledWith('Could not resolve mise backend for aube.');
    });

    it('returns the original change when no GitHub repository mapping exists', async () => {
      const mise = { getToolBackend: vi.fn().mockResolvedValue('cargo:ripgrep') };
      const fetcher = new GitHubReleaseNotesFetcher('token', mise as never);

      await expect(fetcher.enrich([change])).resolves.toEqual([change]);
      expect(core.info).toHaveBeenCalledWith(
        'No GitHub repository mapping for aube (cargo:ripgrep).',
      );
    });

    it('fetches release notes for mapped GitHub repositories', async () => {
      const mise = { getToolBackend: vi.fn().mockResolvedValue('github:jdx/aube') };
      const paginate = {
        iterator: vi.fn(async function* () {
          yield {
            data: [{ tag_name: 'v1.26.0', body: '- faster installs' }],
          };
        }),
      };
      vi.mocked(github.getOctokit).mockReturnValue({
        rest: { repos: { listReleases: vi.fn() } },
        paginate,
      } as never);

      const fetcher = new GitHubReleaseNotesFetcher('token', mise as never);
      const [enriched] = await fetcher.enrich([change]);

      expect(enriched.githubRepo).toBe('jdx/aube');
      expect(enriched.releaseNotes).toEqual([{ tag: 'v1.26.0', body: '- faster installs' }]);
    });

    it('returns empty release notes when fetching fails', async () => {
      const mise = { getToolBackend: vi.fn().mockResolvedValue('github:jdx/aube') };
      vi.mocked(github.getOctokit).mockReturnValue({
        rest: { repos: { listReleases: vi.fn() } },
        paginate: {
          iterator: vi.fn(() => {
            throw new Error('rate limited');
          }),
        },
      } as never);

      const fetcher = new GitHubReleaseNotesFetcher('token', mise as never);
      const [enriched] = await fetcher.enrich([change]);

      expect(enriched.githubRepo).toBe('jdx/aube');
      expect(enriched.releaseNotes).toEqual([]);
      expect(core.warning).toHaveBeenCalledWith(
        'Failed to fetch release notes for aube: rate limited',
      );
    });
  });
});
