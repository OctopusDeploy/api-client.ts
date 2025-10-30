import { ClientConfiguration, EnvironmentRepository } from "../../../src/index";
import { CreateClient, GetProject } from "../utility";

const main = async () => {
    const projectNameOrId: string = "project-name-or-ID";
    const environmentName: string = "an-ephemeral-environment-name";

    const configuration: ClientConfiguration = {
        userAgentApp: "examples",
        instanceURL: "instance-url", // required
        apiKey: "api-key", // required
    };

    const client = await CreateClient(configuration);

    console.log(`Getting project: ${projectNameOrId}`);
    const project = await GetProject(client, projectNameOrId);

    const environmentsRepo = new EnvironmentRepository(client, "Default");

    console.log(`Creating ephemeral environment: ${environmentName}`);
    const environment = await environmentsRepo.createEphemeralEnvironment(environmentName, project.Id);
    
    console.log(`Getting ephemeral environment status: ${environment.Id}`);
    const response = await environmentsRepo.getEphemeralEnvironmentProjectStatus(environment.Id, project.Id);

    console.log(`Ephemeral Environment Status: ${response.Status}`);
};

main();