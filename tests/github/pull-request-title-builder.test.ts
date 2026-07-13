import { describe, expect, it } from 'vitest';

import { PullRequestTitleBuilder } from '../../src/github/pull-request-title-builder.js';
import { versionChange } from '../helpers/fixtures.js';

describe('PullRequestTitleBuilder', () => {
  it('uses the default title when no template is provided', () => {
    expect(PullRequestTitleBuilder.resolve('', ['aube'], versionChange)).toBe(
      'chore(mise): upgrade aube',
    );
    expect(PullRequestTitleBuilder.resolve(undefined, ['aube', 'node'], versionChange)).toBe(
      'chore(mise): upgrade local tools',
    );
  });

  it('replaces placeholders in custom titles', () => {
    expect(
      PullRequestTitleBuilder.resolve(
        'chore: bump {tool} ({previousVersion} -> {nextVersion})',
        ['aube'],
        versionChange,
      ),
    ).toBe('chore: bump aube (1.25.1 -> 1.26.0)');
    expect(
      PullRequestTitleBuilder.resolve('chore: bump {tools}', ['aube', 'node'], versionChange),
    ).toBe('chore: bump aube, node');
  });
});
