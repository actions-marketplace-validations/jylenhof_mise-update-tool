import type { ToolVersionChange } from '../mise/tool-version-changelog.js';

export class PullRequestTitleBuilder {
  static resolve(
    template: string | undefined,
    updatedTools: string[],
    versionChange?: ToolVersionChange,
  ): string {
    if (!template?.trim()) {
      return PullRequestTitleBuilder.defaultTitle(updatedTools);
    }

    const tool = updatedTools[0] ?? '';
    return template
      .replaceAll('{tool}', tool)
      .replaceAll('{tools}', updatedTools.join(', '))
      .replaceAll('{previousVersion}', versionChange?.previousVersion ?? '')
      .replaceAll('{nextVersion}', versionChange?.nextVersion ?? '')
      .replaceAll('{previousRequested}', versionChange?.previousRequested ?? '')
      .replaceAll('{nextRequested}', versionChange?.nextRequested ?? '');
  }

  static defaultTitle(updatedTools: string[]): string {
    return updatedTools.length === 1
      ? `chore(mise): upgrade ${updatedTools[0]}`
      : 'chore(mise): upgrade local tools';
  }
}
