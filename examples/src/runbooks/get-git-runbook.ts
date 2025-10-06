import { ClientConfiguration, RunbookRepository } from "../../../src/index";
import { CreateClient, GetProject } from "../utility";

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
};

main();
