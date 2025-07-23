import { Client, ClientConfiguration, Project, ProjectRepository } from "../../../src/index";

export async function CreateClient(configuration: ClientConfiguration) : Promise<Client> {
    let client: Client | undefined;

    try {
        client = await Client.create(configuration);
    } catch (error) {
        console.error("The TypeScript API client could not be constructed.");
        throw error;
    }

    if (client === null || client === undefined) {
        throw new Error("The TypeScript API client could not be constructed.");
    }

    return client;
}

export async function GetProject(client: Client, projectNameOrId: string): Promise<Project> {
    const projectRepository = new ProjectRepository(client, "Default");

    console.log(`Getting Project, "${projectNameOrId}"...`);

    let project: Project | undefined;

    try {
        project = (await projectRepository.list({ partialName: projectNameOrId })).Items[0];
    } catch (error) {
        console.error(error);
    }

    if (project !== null && project !== undefined) {
        console.log(`Project found: "${project?.Name}" (${project?.Id})`);
        return project;
    } else {
        console.error(`Project, "${projectNameOrId}" not found`);
        throw new Error(`Project, "${projectNameOrId}" not found`);
    }
}