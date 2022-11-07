# 🚀 Getting Started with the TypeScript API Client for Octopus Deploy

The TypeScript API Client for Octopus Deploy provides a collection of repositories that target their respective service endpoints available in Octopus Deploy.

❗️ The TypeScript API Client for Octopus Deploy currently assumes [Node.js](https://nodejs.org/) for the host runtime. Installation packages for Node.js can be found on [Downloads](https://nodejs.org/en/download/).

## 🪄 Install and Import Dependencies

To begin, the first step is to ensure the initialization of the project via `npm init`. This command will establish the directory and create the `project.json` file that's used by npm.

Next, dependencies will need to be installed:

```shell
npm install -D typescript
npm install -D ts-node # optional but recommended for TypeScript projects
npm install @octopusdeploy/message-contracts
npm install @octopusdeploy/api-client
```

The dependency, `@octopusdeploy/message-contracts` contains the resource types used to represent the messages that are sent/received by the service endpoints in Octopus Deploy. (See "Example: Getting a Project Resource" below for a detailed explanation.)

The dependency `@octopusdeploy/api-client` contains the types used to communicate with a target instance of Octopus Deploy. It also contains types that represent the various service endpoints that are available in Octopus Deploy. (See "Initialization of Repositories and Processing API Root Document" below for more information regarding endpoints and repositories.)

Import the following types to your TypeScript source file:

```typescript
import { Client, ClientConfiguration, Repository } from '@octopusdeploy/api-client';
```

These types serve different functions:

* `Client` is used to manage connections with Octopus Deploy and provides events for successful/failed requests
* `ClientConfiguration` describes the configuration parameters needed to establish a connection to Octopus Deploy, including the API key
* `Repository` is the base "entry point" for developers to access the available repositories that represent service endpoints available in Octopus Deploy

## 📜 Client Configuration

Next, define a `ClientConfiguration` to define the parameters to use for connecting to Octopus Deploy:

```typescript
const configuration: ClientConfiguration = {
    agent: new Agent(/* ... */), // proxy agent if required for debugging
    apiKey: 'api-key',
    instanceUri: 'instance-uri',
    autoConnect: true,
    space: 'space-id',
};
```

Each parameter serve a specific purpose:

* `agent` (optional) defines an HTTP proxy agent that may be defined for debugging purposes (i.e. Fiddler) -- useful for viewing inbound/outbound messages between the API client and the target instance of Octopus Deploy
* `apiKey` (required) defines the API key to be used to connect to Octopus Deploy (see [How to Create an API Key](https://octopus.com/docs/octopus-rest-api/how-to-create-an-api-key) for more information concerning API keys)
* `instanceUri` (required) defines the full URI of target instance of Octopus Deploy (i.e. `'https://demo.octopus.app'`)
* `autoConnect` (optional) informs the `Client` to automatically attempt to connect to the target instance of Octopus Deploy when `Client.create(configuration)` is invoked
* `space`: (optional) defines the target space in Octopus Deploy for API operations -- assumes the default space if undefined

## 🐙 Connecting to Octopus Deploy

Once you've defined the client configuration, the next step is to connect to the target instance of Octopus Deploy:

```typescript
let client: Client | undefined;

try {
    client = await Client.create(configuration);
} catch (error) {
    console.error('The TypeScript API client could not be constructed.');
    return;
}

if (client === null || client === undefined) {
    return;
}
```

## ✨ Initialization of Repositories and Processing API Root Document

At this point, a client connection to the target instance of Octopus Deploy has been established and the repository is set to be initialized. This step is accomplished as follows:

```typescript
const repository = new Repository(client);
```

The repository will retrieve and process the root document (`/api`) of the Octopus API (i.e. `HTTP GET https://demo.octopus.app/api`). This document provides key/value mappings of the endpoints available by the target instance of Octopus Deploy. Once this document is processed by the `repository`, API calls may be invoked.

## 👩🏼‍💻 Example: Getting a Project Resource

Resources describe the message contracts that Octopus Deploy uses to serialize types into JSON. These resources are contained in a separate library: `@octopusdeploy/message-contracts`.

This is an example of conducting a search against the `projects` endpoint to find a project in Octopus Deploy by its ID (i.e. `Projects-123`) or by its name (i.e. `Deployment Project`):

```typescript
// import the appropriate resources
import { ProjectResource } from '@octopusdeploy/message-contracts';

// ...

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

There are various endpoints to use that are exposed through the `repository` -- each of these provide access to the operations that are exposed through Octopus Deploy.

Happy deployments! 🐙