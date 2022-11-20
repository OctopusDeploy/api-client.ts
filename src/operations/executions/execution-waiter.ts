import { promises as fs } from "fs";
import { Client, getServerTaskRaw } from "../..";
import { ServerTask, ServerTaskDetails } from "../../features/serverTasks";
import { getServerTask, getServerTaskDetails } from "../serverTasks";

export class ExecutionWaiter {
    constructor(private readonly client: Client, private readonly spaceName: string) {}

    async waitForExecutionToComplete(
        serverTaskIds: string[],
        showProgress: boolean,
        noRawLog: boolean,
        rawLogFile: string | undefined,
        statusCheckSleepCycle: number,
        timeout: number,
        alias: string,
        pollingCallback?: (serverTaskDetails: ServerTaskDetails) => any
    ) {
        const getTasks = serverTaskIds.map(async (taskId) => getServerTask(this.client, this.spaceName, taskId));
        const executionTasks = await Promise.all(getTasks);
        if (showProgress && serverTaskIds.length > 1) this.client.info(`Only progress of the first task (${executionTasks[0].name}) will be shown`);

        try {
            this.client.info(`Waiting for ${executionTasks.length} ${alias}(s) to complete...`);
            await this.waitForCompletion(executionTasks, statusCheckSleepCycle, timeout, pollingCallback);
            let failed = false;
            for (const executionTask of executionTasks) {
                const updated = await getServerTask(this.client, this.spaceName, executionTask.id);
                if (updated.finishedSuccessfully) {
                    this.client.info(`${updated.description}: ${updated.state}`);
                } else {
                    this.client.error(`${updated.description}: ${updated.state}, ${updated.errorMessage}`);

                    failed = true;

                    if (noRawLog) continue;

                    try {
                        const raw = await getServerTaskRaw(this.client, this.spaceName, executionTask.id);
                        if (rawLogFile) await fs.writeFile(rawLogFile, raw);
                        else this.client.error(raw);
                    } catch (er: unknown) {
                        if (er instanceof Error) {
                            this.client.error("Could not retrieve raw log", er);
                        }
                    }
                }
            }

            if (failed) throw new Error(`One or more ${alias} tasks failed.`);

            this.client.info("Done!");
        } catch (er: unknown) {
            if (er instanceof Error) {
                this.client.error("Failed!", er);
            }
        }
    }

    private async waitForCompletion(
        serverTasks: ServerTask[],
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTaskDetails: ServerTaskDetails) => any
    ) {
        const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms));
        const t = new Promise((r) => setTimeout(r, timeout));
        let stop = false;
        // eslint-disable-next-line github/no-then
        t.then(() => {
            stop = true;
        });
        for (const deploymentTask of serverTasks) {
            while (!stop) {
                if (pollingCallback) {
                    const taskDetails = await getServerTaskDetails(this.client, this.spaceName, deploymentTask.id);
                    pollingCallback(taskDetails);

                    if (taskDetails.task.isCompleted) {
                        break;
                    }
                } else {
                    const task = await getServerTask(this.client, this.spaceName, deploymentTask.id);

                    if (task.isCompleted) {
                        break;
                    }
                }

                await sleep(statusCheckSleepCycle);
            }
        }
    }
}
