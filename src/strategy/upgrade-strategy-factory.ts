import type { CommandRunner } from '../command-runner.js';
import { GitRepository } from '../git/git-repository.js';
import { PullRequestCreator } from '../github/pull-request-creator.js';
import { MiseUpgrader } from '../mise/mise-upgrader.js';
import type { PullRequestStrategy } from '../types.js';
import { PerToolPullRequestStrategy } from './per-tool-pull-request-strategy.js';
import { SinglePullRequestStrategy } from './single-pull-request-strategy.js';
import type { UpgradeStrategy } from './upgrade-strategy.js';

export class UpgradeStrategyFactory {
  constructor(private readonly runner: CommandRunner) {}

  create(strategy: PullRequestStrategy, workingDirectory: string, token: string): UpgradeStrategy {
    const mise = new MiseUpgrader(workingDirectory, this.runner);
    const git = new GitRepository(workingDirectory, this.runner);
    const pullRequestCreator = new PullRequestCreator(
      workingDirectory,
      token,
      git,
      this.runner,
      mise,
    );

    if (strategy === 'per-tool') {
      return new PerToolPullRequestStrategy(mise, git, pullRequestCreator);
    }

    return new SinglePullRequestStrategy(mise, git, pullRequestCreator);
  }
}
