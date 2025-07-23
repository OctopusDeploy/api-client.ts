import { ClientConfiguration, RunbookRepository, RunbookRunRepository } from "../../../src/index";
import { CreateClient, GetProject } from "./utility";

const main = async () => {
    const projectNameOrId: string = "project-name-or-ID";
    const runbookId: string = "runbook-ID";

    const configuration: ClientConfiguration = {
        userAgentApp: "examples",
        instanceURL: "instance-url", // required
        apiKey: "api-key", // required
    };

    const client = await CreateClient(configuration);

    const project = await GetProject(client, projectNameOrId);

    const runbookRepo = new RunbookRepository(client, "Default", project);
    const runbook = await runbookRepo.getWithGitRef(runbookId, "main");

    if (runbook !== null && runbook !== undefined) {
        console.log(`Runbook found: "${runbook.Name}" (${runbook.Id})`);
    } else {
        console.error(`Runbook, "${runbookId}" not found`);
        return;
    }

    const command = {
        RunbookName: runbook.Name,
        ProjectName: project.Name,
        spaceName: "Default",
        Notes: "Runbook run from TypeScript API client",
        EnvironmentNames: [ "Development"]
    };
    
    const runbookRunRepo = new RunbookRunRepository(client, "Default");
    const runbookRun = await runbookRunRepo.createGit(command, "main");

    if (runbookRun !== null && runbookRun !== undefined) {
        const firstItem = runbookRun.RunbookRunServerTasks[0];
        console.log(`Runbook Run created: "${firstItem.RunbookRunId}" (${firstItem.ServerTaskId})`);
    } else {
        console.error(`Runbook Run, "${runbookId}" not created`);
        return;
    }
};

main();