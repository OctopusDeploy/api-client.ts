import { GuidedFailureMode, RunbookEnvironmentScope, TenantedDeploymentMode } from "../../../";
import { ClientConfiguration, RunbookRepository, RunbookRetentionUnit } from "../../../src/index";
import { CreateClient, GetProject } from "../utility";

const main = async () => {
    const projectNameOrId: string = "project-name-or-ID";

    const configuration: ClientConfiguration = {
        userAgentApp: "examples",
        instanceURL: "instance-url", // required
        apiKey: "api-key", // required
    };

    const client = await CreateClient(configuration);

    const project = await GetProject(client, projectNameOrId);  
    
    const newRunbook = {
        Name: "New Runbook",
        Description: "This is a new runbook",
        ProjectId: project.Id,
        RunRetentionPolicy: {
            QuantityToKeep: 20,
            ShouldKeepForever: false,
            Unit: RunbookRetentionUnit.Days
        },
        MultiTenancyMode: TenantedDeploymentMode.TenantedOrUntenanted,
        EnvironmentScope: RunbookEnvironmentScope.All,
        DefaultGuidedFailureMode: GuidedFailureMode.Off,
    }

    const runbookRepo = new RunbookRepository(client, "Default", project);
    const runbook = await runbookRepo.createWithGitRef(newRunbook, "main");

    if (runbook !== null && runbook !== undefined) {
        console.log(`Runbook Created: "${runbook.Name}" (${runbook.Id})`);
    } else {
        console.error(`Runbook, "${newRunbook.Name}" not found`);
        return;
    }

    const result = runbookRepo.deleteWithGitRef(runbook, "main");

    if (result !== null && result !== undefined) {
        console.log(`Runbook deleted successfully`);
    } else {
        console.error(`Runbook, "${newRunbook.Name}" not found`);
        return;
    }

};

main();
