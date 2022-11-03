import { TaskResource } from "@octopusdeploy/message-contracts";
import { promises as fs } from "fs";
import { OctopusSpaceRepository } from "../../index";

export class ExecutionWaiter {
    constructor(private readonly repository: OctopusSpaceRepository, private readonly serverBaseUrl: string) {}

    async waitForExecutionToComplete(
        serverTaskIds: string[],
        showProgress: boolean,
        noRawLog: boolean,
        rawLogFile: string | undefined,
        statusCheckSleepCycle: number,
        timeout: number,
        alias: string
    ) {
        const getTasks = serverTaskIds.map(async (taskId) => this.repository.tasks.get(taskId));
        const executionTasks = await Promise.all(getTasks);
        if (showProgress && serverTaskIds.length > 1) console.info(`Only progress of the first task (${executionTasks[0].Name}) will be shown`);

        try {
            console.info(`Waiting for ${executionTasks.length} ${alias}(s) to complete...`);
            await this.waitForCompletion(executionTasks, statusCheckSleepCycle, timeout);
            let failed = false;
            for (const executionTask of executionTasks) {
                const updated = await this.repository.tasks.get(executionTask.Id);
                if (updated.FinishedSuccessfully) {
                    console.info(`${updated.Description}: ${updated.State}`);
                } else {
                    console.error(`${updated.Description}: ${updated.State}, ${updated.ErrorMessage}`);

                    failed = true;

                    if (noRawLog) continue;

                    try {
                        const raw = await this.repository.tasks.getRaw(updated);
                        if (rawLogFile) await fs.writeFile(rawLogFile, raw);
                        else console.error(raw);
                    } catch (er: unknown) {
                        if (er instanceof Error) {
                            console.error("Could not retrieve raw log", er);
                        }
                    }
                }
            }

            if (failed) throw new Error(`One or more ${alias} tasks failed.`);

            console.info("Done!");
        } catch (er: unknown) {
            if (er instanceof Error) {
                console.error("Failed!", er);
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
                const task = await this.repository.tasks.get(deploymentTask.Id);

                if (task.IsCompleted) {
                    break;
                }

                await sleep(statusCheckSleepCycle);
            }
        }
    }
}
