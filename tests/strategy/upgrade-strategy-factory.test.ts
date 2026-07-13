import { describe, expect, it } from 'vitest';

import { PerToolPullRequestStrategy } from '../../src/strategy/per-tool-pull-request-strategy.js';
import { SinglePullRequestStrategy } from '../../src/strategy/single-pull-request-strategy.js';
import { UpgradeStrategyFactory } from '../../src/strategy/upgrade-strategy-factory.js';
import { createMockRunner } from '../helpers/mocks.js';

describe('UpgradeStrategyFactory', () => {
  it('creates single and per-tool strategies', () => {
    const factory = new UpgradeStrategyFactory(createMockRunner() as never);

    expect(factory.create('single', '/repo', 'token')).toBeInstanceOf(SinglePullRequestStrategy);
    expect(factory.create('per-tool', '/repo', 'token')).toBeInstanceOf(PerToolPullRequestStrategy);
  });
});
