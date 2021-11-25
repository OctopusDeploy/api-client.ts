import { Client, ClientConfiguration, Repository } from '@octopusdeploy/api-client';
import { ChannelResource, DeploymentProcessResource, DeploymentResource, EnvironmentResource, NewDeploymentResource, NewReleaseResource, ProjectResource, ReleaseResource, ReleaseTemplateResource } from '@octopusdeploy/message-contracts';

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
    const channelNameOrId = 'channel-name-or-id';
    const environmentNameOrId = 'environment-name-or-id';

    let project: ProjectResource | undefined;

    console.log(`Getting project, "${projectNameOrId}"...`);

    try {
        project = await repository.projects.find(projectNameOrId);
    } catch (error) {
        console.error(error);
    }

    if (project === null || project === undefined) {
        console.error(`Project, "${projectNameOrId}" not found`);
        return;
    }

    console.log(`Project found: "${project.Name}" (${project.Id})`);

    let channel: ChannelResource | undefined;

    console.log(`Getting channel, "${channelNameOrId}"...`);

    try {
        channel = await repository.channels.find(channelNameOrId);
    } catch (error) {
        console.error(error);
    }

    if (channel === null || channel === undefined) {
        console.error(`Channel, "${channelNameOrId}" not found`);
        return;
    }

    console.log(`Channel found: "${channel.Name}" (${channel.Id})`);

    let environments: EnvironmentResource[] = [];

    console.log(`Getting environment, "${environmentNameOrId}"...`);

    try {
        environments = await repository.environments.find([environmentNameOrId]);
    } catch (error) {
        console.error(error);
    }

    if (environments.length <= 0) {
        console.error(`No matching environments found, "${environmentNameOrId}"`);
        return;
    }

    // don't do this (below); select an environment using a more appropriate filter
    const environment = environments[0];
    console.log(`Environment found: "${environment.Name}" (${channel.Id})`);

    let deploymentProcess: DeploymentProcessResource | undefined;

    console.log(`Getting deployment process for "${project.DeploymentProcessId}"...`);

    try {
        deploymentProcess = await repository.deploymentProcesses.get(project.DeploymentProcessId);
    } catch (error) {
        console.error(error);
        return;
    }

    console.log(`Deployment process found: "${deploymentProcess.Id}"`);

    let releaseTemplate: ReleaseTemplateResource | undefined;

    console.log(`Getting release template for deployment process, "${project.DeploymentProcessId}"...`);

    try {
        releaseTemplate = await repository.deploymentProcesses.getTemplate(deploymentProcess, channel);
    } catch (error) {
        console.error(error);
        return;
    }

    console.log(`Release template found for deployment process, "${releaseTemplate.DeploymentProcessId}"`);

    let newRelease: NewReleaseResource = {
        ChannelId: channel.Id,
        ProjectId: project.Id,
        Version: releaseTemplate.NextVersionIncrement
    }

    console.log(`Creating release with version, "${newRelease.Version}"...`);

    let release: ReleaseResource | undefined;

    try {
        release = await repository.releases.create(newRelease);
    } catch (error) {
        console.error(error);
        return;
    }

    console.log(`Release created, "${release.Id}"`);

    let newDeployment: NewDeploymentResource = {
        EnvironmentId: environment.Id,
        ReleaseId: release.Id
    }

    console.log(`Creating deployment for release ${release.Version} of project ${project.Name} to environment ${environment.Name}...`);

    let deployment: DeploymentResource | undefined;

    try {
        deployment = await repository.deployments.create(newDeployment);
    } catch (error) {
        console.error(error);
        return;
    }

    console.log(`Deployment created, "${deployment.Id}"`);
}

main();