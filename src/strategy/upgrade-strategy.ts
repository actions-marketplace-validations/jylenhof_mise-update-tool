import type { ActionInputs, UpgradeResult } from '../types.js';

export interface UpgradeStrategy {
  execute(inputs: ActionInputs, upgradeTools: string[]): Promise<UpgradeResult>;
}
