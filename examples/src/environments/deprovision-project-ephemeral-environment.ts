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

    const environment = await environmentsRepo.getEnvironmentByName(environmentName);

    if (environment === null || environment === undefined) {
        console.error(`Environment with name '${environmentName}' not found`);
        return;
    }
    else{
        console.log(`Environment found: (${environment.Name})`);
    }

    const deprovisionResponse = await environmentsRepo.deprovisionEphemeralEnvironmentForProject(environment.Id, project.Id);

    if (deprovisionResponse !== null && deprovisionResponse !== undefined) {
        console.log(`Ephemeral Environment Deprovisioning Started: (${environment.Name})`);
    }
    else{
        console.error(`Ephemeral Environment not deprovisioned`);
        return;
    }
};

main();