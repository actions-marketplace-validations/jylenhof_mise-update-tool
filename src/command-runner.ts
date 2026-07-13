import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export class CommandRunner {
  async run(command: string, args: string[], cwd: string): Promise<CommandResult> {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
      env: process.env,
    });

    return {
      stdout: stdout.toString(),
      stderr: stderr.toString(),
    };
  }
}
