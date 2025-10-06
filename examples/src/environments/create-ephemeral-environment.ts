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

    const project = await GetProject(client, projectNameOrId);  

    const environmentsRepo = new EnvironmentRepository(client, "Default");
    const environment = await environmentsRepo.createEphemeralEnvironment(environmentName, project.Id);

    if (environment !== null && environment !== undefined) {
        console.log(`Ephemeral Environment Created: (${environment.Id})`);
    }
    else{
        console.error(`Ephemeral Environment not created`);
        return;
    }
};

main();