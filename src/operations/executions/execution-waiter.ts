import { TaskResource } from "@octopusdeploy/message-contracts";
import { promises as fs } from "fs";
import { Client, getServerTaskRaw } from "../..";
import { getServerTask } from "../serverTasks";

export class ExecutionWaiter {
    constructor(private readonly client: Client, private readonly spaceName: string) {}

    async waitForExecutionToComplete(
        serverTaskIds: string[],
        showProgress: boolean,
        noRawLog: boolean,
        rawLogFile: string | undefined,
        statusCheckSleepCycle: number,
        timeout: number,
        alias: string
    ) {
        const getTasks = serverTaskIds.map(async (taskId) => getServerTask(this.client, this.spaceName, taskId));
        const executionTasks = await Promise.all(getTasks);
        if (showProgress && serverTaskIds.length > 1) this.client.info(`Only progress of the first task (${executionTasks[0].Name}) will be shown`);

        try {
            this.client.info(`Waiting for ${executionTasks.length} ${alias}(s) to complete...`);
            await this.waitForCompletion(executionTasks, statusCheckSleepCycle, timeout);
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

    private async waitForCompletion(serverTasks: TaskResource[], statusCheckSleepCycle: number, timeout: number) {
        const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms));
        const t = new Promise((r) => setTimeout(r, timeout));
        let stop = false;
        // eslint-disable-next-line github/no-then
        t.then(() => {
            stop = true;
        });
        for (const deploymentTask of serverTasks) {
            while (!stop) {
                const task = await getServerTask(this.client, this.spaceName, deploymentTask.Id);

                if (task.IsCompleted) {
                    break;
                }

                await sleep(statusCheckSleepCycle);
            }
        }
    }
}
