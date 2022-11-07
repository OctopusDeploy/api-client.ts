import { Client, ClientConfiguration, Repository } from '@octopusdeploy/api-client';
import { NewAmazonWebServicesAccount, NewSensitiveValue } from '@octopusdeploy/message-contracts';

const main = async () => {
    const configuration: ClientConfiguration = {
        apiKey: 'api-key', // required
        instanceUri: 'instance-uri', // required
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

    // define a new AWS account
    const account = NewAmazonWebServicesAccount('AWS Account', 'aws-access-key', NewSensitiveValue('aws-secret-key'));

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