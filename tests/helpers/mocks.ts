import { vi } from 'vitest';

import type { ActionInputs } from '../../src/types.js';
import { DEFAULT_GIT_ACTOR } from '../../src/types.js';

export const baseInputs: ActionInputs = {
  token: 'token',
  tools: ['node'],
  keep: [],
  workingDirectory: '/repo',
  createPullRequest: true,
  branchPrefix: 'chore/mise-tool-updates',
  pullRequestStrategy: 'single',
  pullRequestTitle: '',
  commitAuthor: DEFAULT_GIT_ACTOR,
};

export function createMockRunner(responses: Record<string, string> = {}) {
  return {
    run: vi.fn(async (_command: string, args: string[]) => {
      const key = args.join(' ');
      if (key in responses) {
        return { stdout: responses[key], stderr: '' };
      }
      if (args.includes('--cached')) {
        return { stdout: responses.staged ?? '', stderr: '' };
      }
      if (args.includes('--others')) {
        return { stdout: responses.untracked ?? '', stderr: '' };
      }
      if (args.includes('--name-only')) {
        return { stdout: responses.modified ?? '', stderr: '' };
      }
      return { stdout: '', stderr: '' };
    }),
  };
}
