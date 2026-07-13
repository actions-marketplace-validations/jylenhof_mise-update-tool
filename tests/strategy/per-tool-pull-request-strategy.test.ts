import { describe, expect, it, vi } from 'vitest';

import { PerToolPullRequestStrategy } from '../../src/strategy/per-tool-pull-request-strategy.js';
import { nodeSnapshot, upgradedNodeSnapshot } from '../helpers/fixtures.js';
import { baseInputs } from '../helpers/mocks.js';

describe('PerToolPullRequestStrategy', () => {
  it('creates one pull request per changed tool', async () => {
    const mise = {
      snapshotLocalTools: vi
        .fn()
        .mockResolvedValueOnce(nodeSnapshot)
        .mockResolvedValueOnce(upgradedNodeSnapshot)
        .mockResolvedValueOnce(nodeSnapshot)
        .mockResolvedValueOnce(upgradedNodeSnapshot),
      upgrade: vi.fn(),
    };
    const git = {
      resetToBase: vi.fn(),
      hasModifiedFiles: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
    };
    const pullRequestCreator = {
      create: vi.fn().mockResolvedValue('https://example.com/pr/2'),
    };
    const strategy = new PerToolPullRequestStrategy(
      mise as never,
      git as never,
      pullRequestCreator as never,
    );

    const result = await strategy.execute(baseInputs, ['node', 'aube']);

    expect(git.resetToBase).toHaveBeenCalledWith('main');
    expect(result).toEqual({
      pullRequestUrls: ['https://example.com/pr/2'],
      changesMade: true,
    });
  });
});
