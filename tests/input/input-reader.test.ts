import * as core from '@actions/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InputReader } from '../../src/input/input-reader.js';
import { DEFAULT_GIT_ACTOR } from '../../src/types.js';

describe('InputReader', () => {
  describe('resolveCommitAuthor', () => {
    it('returns the default actor when name and email are empty', () => {
      expect(InputReader.resolveCommitAuthor('', '')).toEqual(DEFAULT_GIT_ACTOR);
      expect(InputReader.resolveCommitAuthor(undefined, undefined)).toEqual(DEFAULT_GIT_ACTOR);
    });

    it('returns a custom actor when both fields are set', () => {
      expect(InputReader.resolveCommitAuthor('Jane Doe', 'jane@example.com')).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });

    it('requires both fields when overriding the actor', () => {
      expect(() => InputReader.resolveCommitAuthor('Jane Doe', '')).toThrow(
        'commit-author-name and commit-author-email must both be set when overriding the actor.',
      );
    });
  });

  describe('read', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('reads action inputs from GitHub Actions context', () => {
      vi.mocked(core.getInput).mockImplementation((name) => {
        const values: Record<string, string> = {
          token: 'secret',
          tools: 'node,aube',
          keep: '',
          'working-directory': '/workspace',
          'branch-prefix': 'chore/custom',
          'pull-request-strategy': 'per-tool',
          'pull-request-title': 'chore: bump {tool}',
          'commit-author-name': 'Jane Doe',
          'commit-author-email': 'jane@example.com',
        };
        return values[name] ?? '';
      });
      vi.mocked(core.getBooleanInput).mockReturnValue(true);

      const inputs = new InputReader().read();

      expect(inputs.token).toBe('secret');
      expect(inputs.tools).toEqual(['node', 'aube']);
      expect(inputs.workingDirectory).toBe('/workspace');
      expect(inputs.branchPrefix).toBe('chore/custom');
      expect(inputs.pullRequestStrategy).toBe('per-tool');
      expect(inputs.pullRequestTitle).toBe('chore: bump {tool}');
      expect(inputs.commitAuthor).toEqual({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });
  });
});
