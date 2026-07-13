export const nodeSnapshot = {
  node: [{ version: '24.0.0', requested_version: '24' }],
};

export const upgradedNodeSnapshot = {
  node: [{ version: '26.0.0', requested_version: '26' }],
};

export const versionChange = {
  name: 'aube',
  previousRequested: '1.25',
  nextRequested: '1.26',
  previousVersion: '1.25.1',
  nextVersion: '1.26.0',
};

export const toolVersionChange = {
  name: 'aube',
  previousRequested: 'latest',
  nextRequested: 'latest',
  previousVersion: '1.25.1',
  nextVersion: '1.26.0',
};

export const miseSnapshots = {
  before: {
    node: [{ version: '24.14.1', requested_version: '24' }],
    aube: [{ version: '1.25.1', requested_version: 'latest' }],
  },
  after: {
    node: [{ version: '26.5.0', requested_version: '26' }],
    aube: [{ version: '1.26.0', requested_version: 'latest' }],
  },
};
