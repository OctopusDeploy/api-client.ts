# api-client.ts

TypeScript API client for Octopus Deploy ✨🐙🚀✨

## Usage

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
