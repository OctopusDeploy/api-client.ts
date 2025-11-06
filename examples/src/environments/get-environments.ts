import { ClientConfiguration, EnvironmentV2Repository } from "../../../src/index";
import { CreateClient } from "../utility";

const main = async () => {

    const configuration: ClientConfiguration = {
        userAgentApp: "examples",
        instanceURL: "instance-url", // required
        apiKey: "api-key", // required
    };

    const client = await CreateClient(configuration);

    const environmentsRepo = new EnvironmentV2Repository(client, "Default");

    const environments = await environmentsRepo.list({ skip: 0, take: 1000 });

    if (environments.Items.length === 0) {
        console.log("No environments found.");
        return;
    }
    environments.Items.map(env => console.log(` - ${env.Name} (ID: ${env.Id})`));
};

main();