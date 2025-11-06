import { ClientConfiguration, EnvironmentRepository } from "../../../src/index";
import { CreateClient } from "../utility";

const main = async () => {

    const configuration: ClientConfiguration = {
        userAgentApp: "examples",
        instanceURL: "http://localhost:5000", // required
        apiKey: "API-DONTCOMMITTHEKEY", // required
    };

    const client = await CreateClient(configuration);

    const environmentsRepo = new EnvironmentRepository(client, "Default");

    const environments = await environmentsRepo.list();

    environments.Items.map(env => console.log(` - ${env.Name} (ID: ${env.Id})`));
};

main();