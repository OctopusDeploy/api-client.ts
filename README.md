# api-client.ts

TypeScript API client for Octopus Deploy ✨🐙🚀✨

## Usage

```typescript
import type { ProjectResource } from '@octopusdeploy/message-contracts';
import {
  Client,
  ClientConfiguration,
  Repository,
} from '@octopusdeploy/api-client';

const configuration: ClientConfiguration = {
  apiKey: '<api-key>',
  apiUri: '<api-uri>',
  space: '<space-id>',
};

const client = await Client.NewClient(configuration);
const repository = new Repository(client);
const projectNameOrId: string = '<project-name-or-ID>';

let project: ProjectResource | undefined;

try {
  console.log(`Getting project, "${projectNameOrId}"...`);
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
