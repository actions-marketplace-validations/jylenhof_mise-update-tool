import * as core from '@actions/core';
import * as github from '@actions/github';

import { PullRequestCreator } from '../github/pull-request-creator.js';
import { ToolVersionChangelog } from '../mise/tool-version-changelog.js';
import type { ActionInputs, UpgradeResult } from '../types.js';
import { BaseUpgradeStrategy } from './base-upgrade-strategy.js';

export class PerToolPullRequestStrategy extends BaseUpgradeStrategy {
  async execute(inputs: ActionInputs, upgradeTools: string[]): Promise<UpgradeResult> {
    const baseRef = github.context.ref.replace(/^refs\/heads\//, '');
    const pullRequestUrls: string[] = [];
    let changesMade = false;

    for (const tool of upgradeTools) {
      core.info(`Processing tool: ${tool}`);
      await this.git.resetToBase(baseRef);
      const before = await this.mise.snapshotLocalTools();
      await this.mise.upgrade([tool], []);
      const after = await this.mise.snapshotLocalTools();
      const versionChanges = ToolVersionChangelog.diff(before, after, [tool]);

      const toolChanged = await this.git.hasModifiedFiles();
      if (!toolChanged) {
        core.info(`No modified files detected for ${tool}.`);
        continue;
      }

      changesMade = true;

      const pullRequestUrl = await this.maybeCreatePullRequest(
        inputs,
        [tool],
        versionChanges,
        PullRequestCreator.sanitizeBranchSegment(tool),
      );
      if (pullRequestUrl) {
        pullRequestUrls.push(pullRequestUrl);
      }
    }

    return { pullRequestUrls, changesMade };
  }
}
