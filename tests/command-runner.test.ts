import { describe, expect, it } from 'vitest';

import { CommandRunner } from '../src/command-runner.js';

describe('CommandRunner', () => {
  it('executes a command and returns stdout', async () => {
    const runner = new CommandRunner();
    const result = await runner.run('echo', ['hello coverage'], process.cwd());
    expect(result.stdout.trim()).toBe('hello coverage');
  });
});
