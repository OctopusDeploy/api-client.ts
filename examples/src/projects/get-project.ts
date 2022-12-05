import { Client, ClientConfiguration, Project, ProjectRepository } from "@octopusdeploy/api-client";

const main = async () => {
    const configuration: ClientConfiguration = {
        userAgentApp: "examples",
        instanceURL: "instance-url", // required
        apiKey: "api-key", // required
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

    const repository = new ProjectRepository(client, "Default");
    const projectNameOrId: string = "project-name-or-ID";

    console.log(`Getting project, "${projectNameOrId}"...`);

    let project: Project | undefined;

    try {
        project = (await repository.list({ partialName: projectNameOrId })).Items[0];
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
