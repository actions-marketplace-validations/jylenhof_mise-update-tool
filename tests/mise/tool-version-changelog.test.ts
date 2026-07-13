import { describe, expect, it } from 'vitest';

import { PullRequestCreator } from '../../src/github/pull-request-creator.js';
import { ToolVersionChangelog } from '../../src/mise/tool-version-changelog.js';
import { miseSnapshots } from '../helpers/fixtures.js';

describe('ToolVersionChangelog', () => {
  it('builds version diffs for upgraded tools', () => {
    expect(
      ToolVersionChangelog.diff(miseSnapshots.before, miseSnapshots.after, ['node', 'aube']),
    ).toEqual([
      {
        name: 'node',
        previousRequested: '24',
        nextRequested: '26',
        previousVersion: '24.14.1',
        nextVersion: '26.5.0',
      },
      {
        name: 'aube',
        previousRequested: 'latest',
        nextRequested: 'latest',
        previousVersion: '1.25.1',
        nextVersion: '1.26.0',
      },
    ]);
  });

  it('ignores missing or unchanged tools', () => {
    expect(
      ToolVersionChangelog.diff(
        { node: [{ version: '1.0.0', requested_version: '1' }] },
        { node: [{ version: '1.0.0', requested_version: '1' }] },
        ['node'],
      ),
    ).toEqual([]);
    expect(
      ToolVersionChangelog.diff({}, { node: [{ version: '2.0.0', requested_version: '2' }] }, [
        'node',
      ]),
    ).toEqual([]);
  });

  it('renders a collapsible version table', () => {
    const markdown = ToolVersionChangelog.formatCollapsible([
      {
        name: 'node',
        previousRequested: '24',
        nextRequested: '26',
        previousVersion: '24.14.1',
        nextVersion: '26.5.0',
      },
    ]);

    expect(markdown).toContain('<summary>Version changelog (node)</summary>');
    expect(markdown).toContain('`24.14.1` → `26.5.0`');
  });

  it('renders multi-tool summaries', () => {
    const changelog = ToolVersionChangelog.formatCollapsible([
      {
        name: 'node',
        previousRequested: '24',
        nextRequested: '26',
        previousVersion: '24.0.0',
        nextVersion: '26.0.0',
      },
      {
        name: 'aube',
        previousRequested: 'latest',
        nextRequested: 'latest',
        previousVersion: '1.0.0',
        nextVersion: '2.0.0',
      },
    ]);
    expect(changelog).toContain('Version changelog (2 tools)');
  });

  it('renders collapsible GitHub release notes per tool', () => {
    const markdown = ToolVersionChangelog.formatReleaseNotesCollapsible([
      {
        name: 'aube',
        previousRequested: 'latest',
        nextRequested: 'latest',
        previousVersion: '1.25.1',
        nextVersion: '1.26.0',
        githubRepo: 'jdx/aube',
        releaseNotes: [{ tag: 'v1.26.0', body: '- faster installs' }],
      },
    ]);

    expect(markdown).toContain('<summary>Release notes (1 tools)</summary>');
    expect(markdown).toContain('<summary>aube: `1.25.1` → `1.26.0` (jdx/aube)</summary>');
    expect(markdown).toContain('### v1.26.0');
    expect(markdown).toContain('- faster installs');
  });

  it('renders empty release note bodies', () => {
    const releaseNotes = ToolVersionChangelog.formatReleaseNotesCollapsible([
      {
        name: 'aube',
        previousRequested: 'latest',
        nextRequested: 'latest',
        previousVersion: '1.0.0',
        nextVersion: '2.0.0',
        releaseNotes: [{ tag: 'v2.0.0', body: '' }],
      },
    ]);
    expect(releaseNotes).toContain('_No release notes provided._');
  });

  it('includes version and release note sections in pull request body', () => {
    const body = PullRequestCreator.buildBody(
      ['aube'],
      ['.mise.toml'],
      [
        {
          name: 'aube',
          previousRequested: 'latest',
          nextRequested: 'latest',
          previousVersion: '1.25.1',
          nextVersion: '1.26.0',
          githubRepo: 'jdx/aube',
          releaseNotes: [{ tag: 'v1.26.0', body: '- faster installs' }],
        },
      ],
    );

    expect(body).toContain('Version changelog');
    expect(body).toContain('Release notes');
    expect(body).toContain('Modified files:');
  });
});
