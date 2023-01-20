# :octopus: TypeScript API Client for Octopus Deploy

[![npm](https://img.shields.io/npm/v/@octopusdeploy/api-client?logo=npm&style=flat-square)](https://www.npmjs.com/package/@octopusdeploy/api-client)
[![CI](https://img.shields.io/github/workflow/status/OctopusDeploy/api-client.ts/Run%20Tests?logo=github&style=flat-square)](https://github.com/OctopusDeploy/api-client.ts/actions/workflows/test.yml)

## 🚀 Getting Started

The TypeScript API Client for Octopus Deploy is easy to use after it's been initialized. Refer to [Getting Started](getting-started.md) for step-by-step set of instructions on setup, initialization, and usage of its functionality.

## Documentation

The reference documentation for this library is auto-generated via [Typedoc](https://typedoc.org/) and made available through GitHub Pages: [octopusdeploy.github.io/api-client.ts](https://octopusdeploy.github.io/api-client.ts/)

Run `npx typedoc src` to update the documentation.

## 🏎 Usage

```typescript
import { Client, ClientConfiguration, ProjectRepository } from "@octopusdeploy/api-client";

const configuration: ClientConfiguration = {
    userAgentApp: 'CustomTypeScript',
    instanceURL: "instance-url",
    apiKey: "api-key",
    agent: new Agent({ proxy: { hostname: "127.0.0.1", port: 8866 } }), // proxy agent if required
};

const client = await Client.create(configuration);
const repository = new ProjectRepository(client);
const projectName: string = "project-name";

console.log(`Getting project, "${projectName}"...`);

let project: ProjectResource | undefined;
try {
    const projects = await repository.list({ partialName: projectName });
    project = projects[0];
} catch (error) {
    console.error(error);
}

if (project !== null && project !== undefined) {
    console.log(`Project found: "${project?.Name}" (${project?.Id})`);
} else {
    console.error(`Project, "${projectName}" not found`);
}
```
