import type { CommandRunner } from '../command-runner.js';

export class GitRepository {
  constructor(
    private readonly cwd: string,
    private readonly runner: CommandRunner,
  ) {}

  static mergeFileLists(...lists: string[][]): string[] {
    return [
      ...new Set(
        lists
          .flat()
          .map((file) => file.trim())
          .filter(Boolean),
      ),
    ].sort();
  }

  async listModifiedFiles(): Promise<string[]> {
    const [unstaged, staged, untracked] = await Promise.all([
      this.runner.run('git', ['diff', '--name-only'], this.cwd),
      this.runner.run('git', ['diff', '--cached', '--name-only'], this.cwd),
      this.runner.run('git', ['ls-files', '--others', '--exclude-standard'], this.cwd),
    ]);

    return GitRepository.mergeFileLists(
      unstaged.stdout.split('\n'),
      staged.stdout.split('\n'),
      untracked.stdout.split('\n'),
    );
  }

  async hasModifiedFiles(): Promise<boolean> {
    const files = await this.listModifiedFiles();
    return files.length > 0;
  }

  async resetToBase(baseRef: string): Promise<void> {
    await this.runner.run('git', ['checkout', baseRef], this.cwd);
    await this.runner.run('git', ['reset', '--hard', 'HEAD'], this.cwd);
    await this.runner.run('git', ['clean', '-fd'], this.cwd);
  }
}
