import * as core from '@actions/core';

import type { ActionInputs, GitActor } from '../types.js';
import { DEFAULT_GIT_ACTOR } from '../types.js';
import { ToolSelector } from './tool-selector.js';

export class InputReader {
  constructor(private readonly toolSelector = new ToolSelector()) {}

  read(): ActionInputs {
    const commitAuthorName = core.getInput('commit-author-name')?.trim();
    const commitAuthorEmail = core.getInput('commit-author-email')?.trim();

    return {
      token: core.getInput('token', { required: true }),
      tools: this.toolSelector.parseList(core.getInput('tools') ?? ''),
      keep: this.toolSelector.parseList(core.getInput('keep') ?? ''),
      workingDirectory: core.getInput('working-directory') || process.env.GITHUB_WORKSPACE || '.',
      createPullRequest: core.getBooleanInput('create-pull-request'),
      branchPrefix: core.getInput('branch-prefix') || 'chore/mise-tool-updates',
      pullRequestStrategy: this.toolSelector.parsePullRequestStrategy(
        core.getInput('pull-request-strategy') ?? 'single',
      ),
      pullRequestTitle: core.getInput('pull-request-title') ?? '',
      commitAuthor: InputReader.resolveCommitAuthor(commitAuthorName, commitAuthorEmail),
    };
  }

  static resolveCommitAuthor(name?: string, email?: string): GitActor {
    if (!name && !email) {
      return DEFAULT_GIT_ACTOR;
    }
    if (!name || !email) {
      throw new Error(
        'commit-author-name and commit-author-email must both be set when overriding the actor.',
      );
    }
    return { name, email };
  }
}
