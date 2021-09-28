# api-client.ts

Node.js API client for Octopus Deploy ✨🐙🚀✨

## Usage

```typescript
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
