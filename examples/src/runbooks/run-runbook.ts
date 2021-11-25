import { Client, ClientConfiguration, Repository } from '@octopusdeploy/api-client';
import { EnvironmentResource, ProjectResource, RunbookResource, RunbookRunParameters, RunbookRunResource, TenantResource } from '@octopusdeploy/message-contracts';

const main = async () => {
    const configuration: ClientConfiguration = {
        apiKey: 'api-key', // required
        apiUri: 'api-uri', // required
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
    const projectNameOrId = 'project-name-or-id';
    const runbookNameOrId = 'runbook-name-or-id';
    const environmentNamesOrIds = ['environment-name-or-id'];
    const tenantNamesOrIds = ['tenant-name-or-id'];

    let project: ProjectResource | undefined;

    console.log(`Getting project, "${projectNameOrId}"...`);

    try {
        project = await repository.projects.find(projectNameOrId);
    } catch (error) {
        console.error(error);
    }

    if (project === null || project === undefined) {
        throw new Error(`Project, "${projectNameOrId}" not found`);
    }

    console.log(`Project found: "${project.Name}" (${project.Id})`);

    let runbook: RunbookResource | undefined;

    console.log(`Getting runbook, "${runbookNameOrId}"...`);

    try {
        runbook = await repository.runbooks.find(runbookNameOrId, project);
    } catch (error) {
        console.error(error);
    }

    if (runbook === null || runbook === undefined) {
        throw new Error(`Runbook, "${runbookNameOrId}" not found`);
    }

    console.log(`Runbook found: "${runbook.Name}" (${runbook.Id})`);

    let environments: EnvironmentResource[] | undefined;

    console.log(`Getting environments, "${environmentNamesOrIds}"...`);

    try {
        environments = await repository.environments.find(environmentNamesOrIds);
    } catch (error) {
        console.error(error);
    }

    if (environments === null || environments === undefined || environments.length === 0) {
        throw new Error(`No environments found.`);
    }

    for (const environment of environments) {
        console.log(`Environment found: "${environment.Name}" (${environment.Id})`);
    }

    let tenants: TenantResource[] | undefined;

    console.log(`Getting tenants, "${tenantNamesOrIds}"...`);

    try {
        tenants = await repository.tenants.find(tenantNamesOrIds);
    } catch (error) {
        console.error(error);
    }

    if (tenants === null || tenants === undefined || tenants.length === 0) {
        throw new Error(`No tenants found.`);
    }

    for (const tenant of tenants) {
        console.log(`Tenant found: "${tenant.Name}" (${tenant.Id})`);
    }

    let runbookRuns: RunbookRunResource[] | undefined;
    let runbookRunParameters: RunbookRunParameters = {
        EnvironmentIds: environments.map(env => env.Id),
        ExcludedMachineIds: [],
        ForcePackageDownload: false,
        FormValues: {},
        ProjectId: project.Id,
        RunbookId: runbook.Id,
        SkipActions: [],
        SpecificMachineIds: [],
        TenantIds: tenants.map(ten => ten.Id),
        UseDefaultSnapshot: true,
        UseGuidedFailure: false
    };

    console.log(`Running runbook, "${runbook.Name}" (${runbook.Id})...`);

    try {
        runbookRuns = await repository.runbooks.runWithParameters(runbook, runbookRunParameters);
    } catch (error) {
        console.error(error);
    }

    if (runbookRuns === null || runbookRuns === undefined || runbookRuns.length === 0) {
        throw new Error(`No runbook runs found.`);
    }

    for (const runbookRun of runbookRuns) {
        console.log(`Runbook run: "${runbookRun.Name}" (${runbookRun.Id})`);
    }
}

main();