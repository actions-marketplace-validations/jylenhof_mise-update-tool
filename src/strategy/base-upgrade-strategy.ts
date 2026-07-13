import * as core from '@actions/core';

import type { GitRepository } from '../git/git-repository.js';
import type { PullRequestCreator } from '../github/pull-request-creator.js';
import type { MiseUpgrader } from '../mise/mise-upgrader.js';
import type { ToolVersionChange } from '../mise/tool-version-changelog.js';
import type { ActionInputs, UpgradeResult } from '../types.js';
import type { UpgradeStrategy } from './upgrade-strategy.js';

export abstract class BaseUpgradeStrategy implements UpgradeStrategy {
  constructor(
    protected readonly mise: MiseUpgrader,
    protected readonly git: GitRepository,
    protected readonly pullRequestCreator: PullRequestCreator,
  ) {}

  abstract execute(inputs: ActionInputs, upgradeTools: string[]): Promise<UpgradeResult>;

  protected async maybeCreatePullRequest(
    inputs: ActionInputs,
    updatedTools: string[],
    versionChanges: ToolVersionChange[] = [],
    branchSuffix?: string,
  ): Promise<string | null> {
    if (!inputs.createPullRequest) {
      core.info('Changes detected but create-pull-request is disabled.');
      return null;
    }

    return this.pullRequestCreator.create({
      branchPrefix: inputs.branchPrefix,
      branchSuffix,
      updatedTools,
      versionChanges,
      pullRequestTitle: inputs.pullRequestTitle,
      commitAuthor: inputs.commitAuthor,
    });
  }
}
