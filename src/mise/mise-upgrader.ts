import * as core from '@actions/core';

import type { CommandRunner } from '../command-runner.js';

export interface MiseToolEntry {
  version: string;
  requested_version: string;
  source?: {
    path?: string;
  };
}

export type MiseLsLocalJson = Record<string, MiseToolEntry[]>;

export interface MiseToolInfo {
  backend?: string;
}

export interface UpgradeCommandOptions {
  tools: string[];
  keep: string[];
}

export class MiseUpgrader {
  constructor(
    private readonly cwd: string,
    private readonly runner: CommandRunner,
  ) {}

  static buildUpgradeArgs(options: UpgradeCommandOptions): string[] {
    const args = ['upgrade', '--bump', '--local'];

    for (const tool of options.keep) {
      args.push('--exclude', tool);
    }

    args.push(...options.tools);

    return args;
  }

  async listLocalTools(): Promise<string[]> {
    const payload = await this.snapshotLocalTools();
    return Object.keys(payload).sort();
  }

  async snapshotLocalTools(): Promise<MiseLsLocalJson> {
    const { stdout } = await this.runner.run('mise', ['ls', '--local', '--json'], this.cwd);
    return JSON.parse(stdout) as MiseLsLocalJson;
  }

  async getToolBackend(tool: string): Promise<string | null> {
    const info = await this.getToolInfo(tool);
    return info.backend ?? null;
  }

  async getToolInfo(tool: string): Promise<MiseToolInfo> {
    const { stdout } = await this.runner.run('mise', ['tool', tool, '--json'], this.cwd);
    return JSON.parse(stdout) as MiseToolInfo;
  }

  async upgrade(tools: string[], keep: string[]): Promise<void> {
    const args = MiseUpgrader.buildUpgradeArgs({ tools, keep });
    core.info(`Running: mise ${args.join(' ')}`);
    const { stdout, stderr } = await this.runner.run('mise', args, this.cwd);
    if (stdout.trim()) {
      core.info(stdout.trim());
    }
    if (stderr.trim()) {
      core.warning(stderr.trim());
    }
  }
}
