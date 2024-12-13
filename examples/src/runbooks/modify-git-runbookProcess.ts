import { ClientConfiguration, RunbookRepository, RunbookProcessRepository } from "../../../src/index";
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

    const runbookProcessRepo = new RunbookProcessRepository(client, "Default", project);
    const runbookProcess = await runbookProcessRepo.getWithGitRef(runbook, "main");

    if (runbookProcess !== null && runbookProcess !== undefined) {
        console.log(`Runbook Procces found: "${runbookProcess.Id}" (${runbookProcess.Id})`);
    } else {
        console.error(`Runbook Process, "${runbookId}" not found`);
        return;
    }

    runbookProcess.Steps[0].Actions[0].Name = "Modified Action Name";
    const modifiedRunbookProcess = await runbookProcessRepo.updateWithGitRef(runbookProcess, "main");

    if (modifiedRunbookProcess !== null && modifiedRunbookProcess !== undefined) {
        console.log(`Runbook Procces updated: "${modifiedRunbookProcess.Id}" (${modifiedRunbookProcess.Id})`);
    } else {
        console.error(`Runbook Process, "${runbookId}" not found`);
        return;
    }
};

main();
