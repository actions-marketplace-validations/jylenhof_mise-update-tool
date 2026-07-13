import * as core from '@actions/core';

import { MiseUpdateAction } from './mise-update-action.js';

MiseUpdateAction.createDefault()
  .run()
  .catch((error: unknown) => {
    core.setFailed(error instanceof Error ? error.message : String(error));
  });
