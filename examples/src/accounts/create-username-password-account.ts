import { Client, ClientConfiguration, Repository } from "@octopusdeploy/api-client";
import { NewUsernamePasswordAccount, NewSensitiveValue } from "@octopusdeploy/message-contracts";

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

    const password = NewSensitiveValue("fake-password");
    const name = "Username/Password Account (OK to Delete)";
    const username = "fake-username";

    // define a new username/password account
    const account = NewUsernamePasswordAccount(name, username, password);

    try {
        // create account
        await repository.accounts.create(account);
    } catch (error) {
        console.error(error);
        return;
    }
};

main();
