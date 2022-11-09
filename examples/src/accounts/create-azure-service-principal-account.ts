import { Client, ClientConfiguration, Repository } from '@octopusdeploy/api-client';
import { NewAzureServicePrincipalAccount, NewSensitiveValue } from '@octopusdeploy/message-contracts';

const main = async () => {
    const configuration: ClientConfiguration = {
        apiKey: 'api-key', // required
        instanceURL: 'instance-url', // required
        autoConnect: true
    };

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

    const repository = new Repository(client);

    const applicationId = '00000000-0000-0000-0000-00000000000';
    const applicationPassword = NewSensitiveValue('fake-application-password');
    const name = 'Azure Service Principal Account (OK to Delete)';
    const subscriptionId = '00000000-0000-0000-0000-00000000000';
    const tenantId = '00000000-0000-0000-0000-00000000000';

    // define a new Azure service principal account
    const account = NewAzureServicePrincipalAccount(name, subscriptionId, tenantId, applicationId, applicationPassword);

    try {
        // create account
        await repository.accounts.create(account);
    }
    catch (error) {
        console.error(error);
        return;
    }
}

main();