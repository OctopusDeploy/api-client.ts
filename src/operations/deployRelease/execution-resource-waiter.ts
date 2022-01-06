import { OctopusSpaceRepository } from '../../index';
import {
  DeploymentResource,
  ProjectResource,
  ReleaseResource,
  EnvironmentResource,
  TaskResource
} from '@octopusdeploy/message-contracts';
import { IExecutionResource } from '@octopusdeploy/message-contracts/dist/deploymentResource';
import fs from 'fs/promises';

export class ExecutionResourceWaiter {
  constructor(
    private readonly repository: OctopusSpaceRepository,
    private readonly serverBaseUrl: string
  ) {}

  async waitForDeploymentToComplete(
    resources: DeploymentResource[],
    project: ProjectResource,
    release: ReleaseResource,
    showProgress: boolean,
    noRawLog: boolean,
    rawLogFile: string | undefined,
    cancelOnTimeout: boolean,
    deploymentStatusCheckSleepCycle: number,
    deploymentTimeout: number
  ) {
    const guidedFailureWarning = async (
      guidedFailureDeployment: IExecutionResource
    ) => {
      const environment = await this.repository.client.get<EnvironmentResource>(
        this.repository.client.getLink('Environments')
      );
      this.repository.client.warn(
        `  - ${environment.Name}: ${this.getPortalUrl(
          `/app#/projects/${project.Slug}/releases/${release.Version}/deployments/${guidedFailureDeployment.Id}`
        )}`
      );
    };

    await this.waitForExecutionToComplete(
      resources,
      showProgress,
      noRawLog,
      rawLogFile,
      cancelOnTimeout,
      deploymentStatusCheckSleepCycle,
      deploymentTimeout,
      guidedFailureWarning,
      'deployment'
    );
  }

  private async waitForCompletion(
    deploymentTasks: TaskResource[],
    deploymentStatusCheckSleepCycle: number,
    deploymentTimeout: number
  ) {
    const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));
    const timeout = new Promise(r => setTimeout(r, deploymentTimeout));
    let stop = false;
    // eslint-disable-next-line github/no-then
    timeout.then(() => {
      stop = true;
    });
    for (const deploymentTask of deploymentTasks) {
      while (!stop) {
        const task = await this.repository.tasks.get(deploymentTask.Id);

        if (task.IsCompleted) {
          break;
        }

        await sleep(deploymentStatusCheckSleepCycle);
      }
    }
  }

  private async waitForExecutionToComplete(
    resources: IExecutionResource[],
    showProgress: boolean,
    noRawLog: boolean,
    rawLogFile: string | undefined,
    cancelOnTimeout: boolean,
    deploymentStatusCheckSleepCycle: number,
    deploymentTimeout: number,
    guidedFailureWarningGenerator: (
      resource: IExecutionResource
    ) => Promise<void>,
    alias: string
  ) {
    const getTasks = resources.map(async dep =>
      this.repository.tasks.get(dep.TaskId)
    );
    const deploymentTasks = await Promise.all(getTasks);
    if (showProgress && resources.length > 1)
      this.repository.client.info(
        `Only progress of the first task (${deploymentTasks[0].Name}) will be shown`
      );

    try {
      this.repository.client.info(`Waiting for ${deploymentTasks.length} ${alias}(s) to complete....`);
      await this.waitForCompletion(
        deploymentTasks,
        deploymentStatusCheckSleepCycle,
        deploymentTimeout
      );
      let failed = false;
      for (const deploymentTask of deploymentTasks) {
        const updated = await this.repository.tasks.get(deploymentTask.Id);
        if (updated.FinishedSuccessfully) {
          this.repository.client.info(`${updated.Description}: ${updated.State}`);
        } else {
          this.repository.client.error(
            `${updated.Description}: ${updated.State}, ${updated.ErrorMessage}`
          );

          failed = true;

          if (noRawLog) continue;

          try {
            const raw = await this.repository.tasks.getRaw(updated);
            if (rawLogFile) await fs.writeFile(rawLogFile, raw);
            else this.repository.client.error(raw);
          } catch (er: unknown) {
            if (er instanceof Error) {
              this.repository.client.error('Could not retrieve raw log', er);
            }
          }
        }
      }

      if (failed) throw new Error(`One or more ${alias} tasks failed.`);

      this.repository.client.info('Done!');
    } catch (er: unknown) {
      if (er instanceof Error) {
        this.repository.client.error('Failed!', er);
      }
    }
  }

  private async cancelExecutionOnTimeoutIfRequested(
    deploymentTasks: TaskResource[],
    cancelOnTimeout: boolean,
    alias: string
  ) {
    if (!cancelOnTimeout) return;

    const tasks = deploymentTasks.map(async task => {
      this.repository.client.warn(`Cancelling ${alias} task '{${task.Description}}'`);
      try {
        await this.repository.tasks.cancel(task);
      } catch (er) {
        if (er instanceof Error) {
          this.repository.client.error(
            `Failed to cancel ${alias} task '{${task.Description}}': {${er.message}}`
          );
        }
      }
    });

    return Promise.all(tasks);
  }

  private async printTaskOutput(taskResources: TaskResource[]) {
    const task = taskResources[0];
    return this.printTask(task);
  }

  private printTask(task: TaskResource) {
    this.repository.client.info(task.Name);
  }

  private getPortalUrl(path: string) {
    if (!path.startsWith('/')) path = `/${path}`;
    const uri = new URL(this.serverBaseUrl + path);
    return uri.toString();
  }
}
