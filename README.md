# :octopus: TypeScript API Client for Octopus Deploy

<div align="center">
  <!-- npm -->
  <a href="https://www.npmjs.com/package/@octopusdeploy/api-client">
    <img alt="npm" src="https://img.shields.io/npm/dw/@octopusdeploy/api-client?logo=npm&style=flat-square" />
  </a>
  <!-- build status -->
  <a href="https://github.com/OctopusDeploy/api-client.ts/actions/workflows/test.yml">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/OctopusDeploy/api-client.ts/Run%20Tests?logo=github&style=flat-square" />
  </a>
</div>

<p>This repository contains the source code for the TypeScript API Client for Octopus Deploy.</p>

## 🚀 Getting Started

The TypeScript API Client for Octopus Deploy is easy to use after it's been initialized. Refer to [Getting Started](getting-started.md) for step-by-step set of instructions on setup, initialization, and usage of its functionality.

## Documentation

The reference documentation for this library is auto-generated via [Typedoc](https://typedoc.org/) and made available through GitHub Pages: [octopusdeploy.github.io/api-client.ts](https://octopusdeploy.github.io/api-client.ts/)

## 🏎 Usage

```typescript
import { Client, ClientConfiguration, Repository } from '@octopusdeploy/api-client';
import type { ProjectResource } from '@octopusdeploy/message-contracts';

const configuration: ClientConfiguration = {
  // agent: new Agent({ proxy: { hostname: '127.0.0.1', port: 8866 } }), // proxy agent if required
  apiKey: 'api-key',
  apiUri: 'api-uri',
  space: 'space-id',
};

const client = await Client.create(configuration);
if (client === undefined) {
  throw new Error('client could not be constructed');
}

const repository = new Repository(client);
const projectNameOrId: string = 'project-name-or-ID';

console.log(`Getting project, "${projectNameOrId}"...`);

let project: ProjectResource | undefined;

try {
  project = await repository.projects.find(projectNameOrId);
} catch (error) {
  console.error(error);
}

if (project !== null && project !== undefined) {
  console.log(`Project found: "${project?.Name}" (${project?.Id})`);
} else {
  console.error(`Project, "${projectNameOrId}" not found`);
}
```
