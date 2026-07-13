import { describe, expect, it } from 'vitest';

import { GitRepository } from '../../src/git/git-repository.js';
import { createMockRunner } from '../helpers/mocks.js';

describe('GitRepository', () => {
  describe('mergeFileLists', () => {
    it('deduplicates and sorts modified file paths', () => {
      expect(
        GitRepository.mergeFileLists(
          ['.config/mise/myfile.toml', 'mise.lock'],
          ['mise.lock', '.mise.toml'],
          ['  ', ''],
        ),
      ).toEqual(['.config/mise/myfile.toml', '.mise.toml', 'mise.lock']);
    });
  });

  describe('instance methods', () => {
    it('lists modified files from git output', async () => {
      const runner = createMockRunner({
        modified: '.mise.toml\n',
        staged: 'mise.lock\n',
        untracked: '',
      });
      const git = new GitRepository('/repo', runner as never);

      await expect(git.listModifiedFiles()).resolves.toEqual(['.mise.toml', 'mise.lock']);
      await expect(git.hasModifiedFiles()).resolves.toBe(true);
    });

    it('resets the repository to the base ref', async () => {
      const runner = createMockRunner();
      const git = new GitRepository('/repo', runner as never);

      await git.resetToBase('main');

      expect(runner.run).toHaveBeenCalledWith('git', ['checkout', 'main'], '/repo');
      expect(runner.run).toHaveBeenCalledWith('git', ['reset', '--hard', 'HEAD'], '/repo');
      expect(runner.run).toHaveBeenCalledWith('git', ['clean', '-fd'], '/repo');
    });
  });
});
