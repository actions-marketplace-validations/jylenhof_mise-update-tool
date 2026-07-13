import * as core from '@actions/core';
import { describe, expect, it, vi } from 'vitest';

import { MiseUpgrader } from '../../src/mise/mise-upgrader.js';
import { createMockRunner } from '../helpers/mocks.js';

describe('MiseUpgrader', () => {
  describe('buildUpgradeArgs', () => {
    it('builds the default local bump upgrade command', () => {
      expect(MiseUpgrader.buildUpgradeArgs({ tools: [], keep: [] })).toEqual([
        'upgrade',
        '--bump',
        '--local',
      ]);
    });

    it('adds exclude and tool arguments', () => {
      expect(MiseUpgrader.buildUpgradeArgs({ tools: ['node', 'aube'], keep: ['prek'] })).toEqual([
        'upgrade',
        '--bump',
        '--local',
        '--exclude',
        'prek',
        'node',
        'aube',
      ]);
    });
  });

  describe('instance methods', () => {
    it('reads local tools and tool metadata from mise', async () => {
      const runner = createMockRunner({
        'ls --local --json': JSON.stringify({
          node: [{ version: '24.0.0', requested_version: '24' }],
        }),
        'tool node --json': JSON.stringify({ backend: 'core:node' }),
      });
      const mise = new MiseUpgrader('/repo', runner as never);

      await expect(mise.listLocalTools()).resolves.toEqual(['node']);
      await expect(mise.getToolBackend('node')).resolves.toBe('core:node');
    });

    it('logs mise output when upgrading tools', async () => {
      const runner = createMockRunner({
        'upgrade --bump --local node': 'upgraded node\n',
      });
      const mise = new MiseUpgrader('/repo', runner as never);

      await mise.upgrade(['node'], []);

      expect(core.info).toHaveBeenCalledWith('Running: mise upgrade --bump --local node');
      expect(core.info).toHaveBeenCalledWith('upgraded node');
    });

    it('logs stderr warnings from mise', async () => {
      const runner = {
        run: vi.fn(async () => ({ stdout: '', stderr: 'warning from mise' })),
      };
      const mise = new MiseUpgrader('/repo', runner as never);

      await mise.upgrade([], []);

      expect(core.warning).toHaveBeenCalledWith('warning from mise');
    });
  });
});
