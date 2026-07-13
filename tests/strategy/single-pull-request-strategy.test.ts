import { describe, expect, it, vi } from 'vitest';

import { SinglePullRequestStrategy } from '../../src/strategy/single-pull-request-strategy.js';
import { nodeSnapshot, upgradedNodeSnapshot } from '../helpers/fixtures.js';
import { baseInputs } from '../helpers/mocks.js';

describe('SinglePullRequestStrategy', () => {
  it('creates a single pull request for all upgraded tools', async () => {
    const mise = {
      snapshotLocalTools: vi
        .fn()
        .mockResolvedValueOnce(nodeSnapshot)
        .mockResolvedValueOnce(upgradedNodeSnapshot),
      upgrade: vi.fn(),
    };
    const git = { hasModifiedFiles: vi.fn().mockResolvedValue(true) };
    const pullRequestCreator = {
      create: vi.fn().mockResolvedValue('https://example.com/pr/1'),
    };
    const strategy = new SinglePullRequestStrategy(
      mise as never,
      git as never,
      pullRequestCreator as never,
    );

    const result = await strategy.execute(baseInputs, ['node']);

    expect(result).toEqual({
      pullRequestUrls: ['https://example.com/pr/1'],
      changesMade: true,
    });
  });

  it('skips pull request creation when no files changed', async () => {
    const mise = {
      snapshotLocalTools: vi.fn().mockResolvedValue(nodeSnapshot),
      upgrade: vi.fn(),
    };
    const git = { hasModifiedFiles: vi.fn().mockResolvedValue(false) };
    const pullRequestCreator = { create: vi.fn() };
    const strategy = new SinglePullRequestStrategy(
      mise as never,
      git as never,
      pullRequestCreator as never,
    );

    const result = await strategy.execute(baseInputs, ['node']);

    expect(result).toEqual({ pullRequestUrls: [], changesMade: false });
    expect(pullRequestCreator.create).not.toHaveBeenCalled();
  });

  it('skips pull request creation when create-pull-request is disabled', async () => {
    const mise = {
      snapshotLocalTools: vi
        .fn()
        .mockResolvedValueOnce(nodeSnapshot)
        .mockResolvedValueOnce(upgradedNodeSnapshot),
      upgrade: vi.fn(),
    };
    const git = { hasModifiedFiles: vi.fn().mockResolvedValue(true) };
    const pullRequestCreator = { create: vi.fn() };
    const strategy = new SinglePullRequestStrategy(
      mise as never,
      git as never,
      pullRequestCreator as never,
    );

    const result = await strategy.execute({ ...baseInputs, createPullRequest: false }, ['node']);

    expect(result.changesMade).toBe(true);
    expect(result.pullRequestUrls).toEqual([]);
    expect(pullRequestCreator.create).not.toHaveBeenCalled();
  });
});
