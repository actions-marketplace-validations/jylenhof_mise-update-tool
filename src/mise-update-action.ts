import * as core from '@actions/core';

import { CommandRunner } from './command-runner.js';
import { InputReader } from './input/input-reader.js';
import { ToolSelector } from './input/tool-selector.js';
import { MiseUpgrader } from './mise/mise-upgrader.js';
import { UpgradeStrategyFactory } from './strategy/upgrade-strategy-factory.js';

export class MiseUpdateAction {
  constructor(
    private readonly inputReader: InputReader,
    private readonly toolSelector: ToolSelector,
    private readonly strategyFactory: UpgradeStrategyFactory,
    private readonly runner: CommandRunner,
  ) {}

  static createDefault(): MiseUpdateAction {
    const runner = new CommandRunner();
    return new MiseUpdateAction(
      new InputReader(),
      new ToolSelector(),
      new UpgradeStrategyFactory(runner),
      runner,
    );
  }

  async run(): Promise<void> {
    const inputs = this.inputReader.read();
    core.info(`Working directory: ${inputs.workingDirectory}`);
    core.info(`Pull request strategy: ${inputs.pullRequestStrategy}`);

    const mise = new MiseUpgrader(inputs.workingDirectory, this.runner);
    const localTools = await mise.listLocalTools();
    core.info(`Local mise tools: ${localTools.join(', ') || '(none)'}`);

    const upgradeTools = this.toolSelector.resolveUpgradeTools(
      localTools,
      inputs.tools,
      inputs.keep,
    );
    if (upgradeTools.length === 0) {
      core.info('No tools selected for upgrade.');
      this.setOutputs({ changesMade: false, updatedTools: '', pullRequestUrls: [] });
      return;
    }

    const strategy = this.strategyFactory.create(
      inputs.pullRequestStrategy,
      inputs.workingDirectory,
      inputs.token,
    );
    const result = await strategy.execute(inputs, upgradeTools);

    this.setOutputs({
      changesMade: result.changesMade,
      updatedTools: upgradeTools.join(','),
      pullRequestUrls: result.pullRequestUrls,
    });
  }

  private setOutputs(options: {
    changesMade: boolean;
    updatedTools: string;
    pullRequestUrls: string[];
  }): void {
    core.setOutput('changes-made', options.changesMade);
    core.setOutput('updated-tools', options.updatedTools);
    core.setOutput('pull-request-urls', options.pullRequestUrls.join('\n'));
  }
}
