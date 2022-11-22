import { Client } from "../..";
import { ServerTask, ServerTaskDetails } from "../../features/serverTasks";
import { serverTaskGet, serverTaskDetailsGet } from "../serverTasks";

export class ExecutionWaiter {
    constructor(private readonly client: Client, private readonly spaceName: string) {}

    async waitForExecutionsToComplete(
        serverTaskIds: string[],
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTaskDetails: ServerTaskDetails) => void
    ): Promise<PromiseSettledResult<ServerTask | null>[]> {
        const taskPromises: Promise<ServerTask | null>[] = [];
        for (const taskId of serverTaskIds) {
            taskPromises.push(this.waitForExecutionToComplete(taskId, statusCheckSleepCycle, timeout, pollingCallback));
        }
        return await Promise.allSettled(taskPromises);
    }

    async waitForExecutionToComplete(
        serverTaskId: string,
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTaskDetails: ServerTaskDetails) => void
    ): Promise<ServerTask | null> {
        const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms));

        let stop = false;
        const t = setTimeout(() => {
            stop = true;
        }, timeout);

        while (!stop) {
            if (pollingCallback) {
                const taskDetails = await serverTaskDetailsGet(this.client, this.spaceName, serverTaskId);
                pollingCallback(taskDetails);

                if (taskDetails.Task.IsCompleted) {
                    clearTimeout(t);
                    return taskDetails.Task;
                }
            } else {
                const task = await serverTaskGet(this.client, this.spaceName, serverTaskId);

                if (task.IsCompleted) {
                    clearTimeout(t);
                    return task;
                }
            }

            await sleep(statusCheckSleepCycle);
        }
        return null;
    }
}
