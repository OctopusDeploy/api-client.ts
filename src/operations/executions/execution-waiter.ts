import { promises as fs } from "fs";
import { Client, getServerTaskRaw } from "../..";
import { ServerTask, ServerTaskDetails } from "../../features/serverTasks";
import { getServerTask, getServerTaskDetails } from "../serverTasks";

export class ExecutionWaiter {
    constructor(private readonly client: Client, private readonly spaceName: string) {}

    async waitForExecutionToComplete(
        serverTaskIds: string[],
        noRawLog: boolean,
        rawLogFile: string | undefined,
        statusCheckSleepCycle: number,
        timeout: number,
        alias: string,
        pollingCallback?: (serverTaskDetails: ServerTaskDetails) => any
    ) {
        const getTasks = serverTaskIds.map(async (taskId) => getServerTask(this.client, this.spaceName, taskId));
        const executionTasks = await Promise.all(getTasks);

        try {
            this.client.info(`Waiting for ${executionTasks.length} ${alias}(s) to complete...`);
            await this.waitForCompletion(executionTasks, statusCheckSleepCycle, timeout, pollingCallback);
            let failed = false;
            for (const executionTask of executionTasks) {
                const updated = await getServerTask(this.client, this.spaceName, executionTask.Id);
                if (updated.FinishedSuccessfully) {
                    this.client.info(`${updated.Description}: ${updated.State}`);
                } else {
                    this.client.error(`${updated.Description}: ${updated.State}, ${updated.ErrorMessage}`);

                    failed = true;

                    if (noRawLog) continue;

                    try {
                        const raw = await getServerTaskRaw(this.client, this.spaceName, executionTask.Id);
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
        t.then(() => {
            stop = true;
        });
        for (const deploymentTask of serverTasks) {
            while (!stop) {
                if (pollingCallback) {
                    const taskDetails = await getServerTaskDetails(this.client, this.spaceName, deploymentTask.Id);
                    pollingCallback(taskDetails);

                    if (taskDetails.Task.IsCompleted) {
                        break;
                    }
                } else {
                    const task = await getServerTask(this.client, this.spaceName, deploymentTask.Id);

                    if (task.IsCompleted) {
                        break;
                    }
                }

                await sleep(statusCheckSleepCycle);
            }
        }
    }
}
