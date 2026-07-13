import * as core from '@actions/core';

import { ToolVersionChangelog } from '../mise/tool-version-changelog.js';
import type { ActionInputs, UpgradeResult } from '../types.js';
import { BaseUpgradeStrategy } from './base-upgrade-strategy.js';

export class SinglePullRequestStrategy extends BaseUpgradeStrategy {
  async execute(inputs: ActionInputs, upgradeTools: string[]): Promise<UpgradeResult> {
    const before = await this.mise.snapshotLocalTools();
    await this.mise.upgrade(inputs.tools, inputs.keep);
    const after = await this.mise.snapshotLocalTools();
    const versionChanges = ToolVersionChangelog.diff(before, after, upgradeTools);

    const changesMade = await this.git.hasModifiedFiles();
    if (!changesMade) {
      core.info('No modified files detected.');
      return { pullRequestUrls: [], changesMade: false };
    }

    const pullRequestUrl = await this.maybeCreatePullRequest(inputs, upgradeTools, versionChanges);
    return {
      pullRequestUrls: pullRequestUrl ? [pullRequestUrl] : [],
      changesMade: true,
    };
  }
}
