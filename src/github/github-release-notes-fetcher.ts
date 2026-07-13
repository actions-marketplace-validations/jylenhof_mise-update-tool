import * as core from '@actions/core';
import * as github from '@actions/github';
import semver from 'semver';

import type { MiseUpgrader } from '../mise/mise-upgrader.js';
import type { ReleaseNoteEntry, ToolVersionChange } from '../mise/tool-version-changelog.js';
import { GitHubRepoResolver } from './github-repo-resolver.js';

export interface GitHubReleaseSummary {
  tag: string;
  body: string;
  version: semver.SemVer;
}

export class GitHubReleaseNotesFetcher {
  constructor(
    private readonly token: string,
    private readonly mise: MiseUpgrader,
  ) {}

  static filterReleasesBetween(
    releases: GitHubReleaseSummary[],
    fromVersion: string,
    toVersion: string,
  ): ReleaseNoteEntry[] {
    const from = semver.coerce(fromVersion);
    const to = semver.coerce(toVersion);
    if (!from || !to || !semver.gt(to, from)) {
      return [];
    }

    return releases
      .filter((release) => semver.gt(release.version, from) && semver.lte(release.version, to))
      .sort((left, right) => semver.compare(left.version, right.version))
      .map((release) => ({
        tag: release.tag,
        body: release.body.trim(),
      }));
  }

  async enrich(changes: ToolVersionChange[]): Promise<ToolVersionChange[]> {
    return Promise.all(changes.map((change) => this.enrichOne(change)));
  }

  private async enrichOne(change: ToolVersionChange): Promise<ToolVersionChange> {
    const backend = await this.mise.getToolBackend(change.name);
    if (!backend) {
      core.warning(`Could not resolve mise backend for ${change.name}.`);
      return change;
    }

    const repository = GitHubRepoResolver.parseBackend(backend);
    if (!repository) {
      core.info(`No GitHub repository mapping for ${change.name} (${backend}).`);
      return change;
    }

    try {
      const releaseNotes = await this.fetchReleaseNotesBetween(
        repository,
        change.previousVersion,
        change.nextVersion,
      );

      return {
        ...change,
        githubRepo: GitHubRepoResolver.formatRepository(repository),
        releaseNotes,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      core.warning(`Failed to fetch release notes for ${change.name}: ${message}`);
      return {
        ...change,
        githubRepo: GitHubRepoResolver.formatRepository(repository),
        releaseNotes: [],
      };
    }
  }

  private async fetchReleaseNotesBetween(
    repository: { owner: string; repo: string },
    fromVersion: string,
    toVersion: string,
  ): Promise<ReleaseNoteEntry[]> {
    const octokit = github.getOctokit(this.token);
    const releases: GitHubReleaseSummary[] = [];

    for await (const response of octokit.paginate.iterator(octokit.rest.repos.listReleases, {
      owner: repository.owner,
      repo: repository.repo,
      per_page: 100,
    })) {
      for (const release of response.data) {
        const version = semver.coerce(release.tag_name);
        if (!version) {
          continue;
        }

        releases.push({
          tag: release.tag_name,
          body: release.body ?? '',
          version,
        });
      }
    }

    return GitHubReleaseNotesFetcher.filterReleasesBetween(releases, fromVersion, toVersion);
  }
}
