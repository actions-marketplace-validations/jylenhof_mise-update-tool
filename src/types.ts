import type { ToolVersionChange } from './mise/tool-version-changelog.js';

export type PullRequestStrategy = 'single' | 'per-tool';

export interface GitActor {
  name: string;
  email: string;
}

export interface ActionInputs {
  token: string;
  tools: string[];
  keep: string[];
  workingDirectory: string;
  createPullRequest: boolean;
  branchPrefix: string;
  pullRequestStrategy: PullRequestStrategy;
  pullRequestTitle: string;
  commitAuthor: GitActor;
}

export interface UpgradeResult {
  pullRequestUrls: string[];
  changesMade: boolean;
}

export interface CreatePullRequestOptions {
  branchPrefix: string;
  branchSuffix?: string;
  updatedTools: string[];
  versionChanges?: ToolVersionChange[];
  pullRequestTitle?: string;
  commitAuthor?: GitActor;
}

export const DEFAULT_GIT_ACTOR: GitActor = {
  name: 'github-actions[bot]',
  email: '41898282+github-actions[bot]@users.noreply.github.com',
};
