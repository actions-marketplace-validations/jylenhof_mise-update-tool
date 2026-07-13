import { vi } from 'vitest';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  warning: vi.fn(),
  setOutput: vi.fn(),
  getInput: vi.fn(),
  getBooleanInput: vi.fn(),
}));

vi.mock('@actions/github', () => ({
  context: {
    repo: { owner: 'jdx', repo: 'mise-update-tool' },
    ref: 'refs/heads/main',
  },
  getOctokit: vi.fn(),
}));
