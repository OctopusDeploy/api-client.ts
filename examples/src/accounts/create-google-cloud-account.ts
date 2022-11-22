import { Client, ClientConfiguration, Repository } from "@octopusdeploy/api-client";
import { NewGoogleCloudAccount, NewSensitiveValue } from "@octopusdeploy/message-contracts";

const main = async () => {
    const configuration: ClientConfiguration = {
        userAgentApp: "examples",
        instanceURL: "instance-url", // required
        apiKey: "api-key", // required
        autoConnect: true,
    };

    let client: Client | undefined;

    try {
        client = await Client.create(configuration);
    } catch (error) {
        console.error("The TypeScript API client could not be constructed.");
        return;
    }

    if (client === null || client === undefined) {
        return;
    }

    const repository = new Repository(client);

    const jsonKey = NewSensitiveValue("fake-json-key");
    const name = "Google Cloud Account (OK to Delete)";

    // define a new Google cloud account
    const account = NewGoogleCloudAccount(name, jsonKey);

    try {
        // create account
        await repository.accounts.create(account);
    } catch (error) {
        console.error(error);
        return;
    }
};

main();
