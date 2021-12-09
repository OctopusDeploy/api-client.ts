import { Client, ClientConfiguration, Repository } from "@octopusdeploy/api-client";
import { ProjectResource } from "@octopusdeploy/message-contracts";

const main = async () => {
    const configuration: ClientConfiguration = {
        apiKey: "api-key", // required
        apiUri: "api-uri", // required
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
    const projectNameOrId: string = "project-name-or-ID";

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
};

main();
