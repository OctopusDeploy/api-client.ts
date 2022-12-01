import { Client } from "../..";
import { ServerTask, ServerTaskDetails } from "../../features/serverTasks";
import { SpaceServerTaskRepository } from "../serverTasks";

export class ExecutionWaiter {
    constructor(private readonly client: Client, private readonly spaceName: string) {}

    async waitForExecutionsToComplete(
        serverTaskIds: string[],
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTaskDetails: ServerTaskDetails) => void
    ): Promise<PromiseSettledResult<ServerTask | null>[]> {
        const spaceServerTaskRepository = new SpaceServerTaskRepository(this.client, this.spaceName);
        const taskPromises: Promise<ServerTask | null>[] = [];
        for (const serverTaskId of serverTaskIds) {
            taskPromises.push(
                this.waitForExecutionToCompleteInternal(spaceServerTaskRepository, serverTaskId, statusCheckSleepCycle, timeout, pollingCallback)
            );
        }
        return await Promise.allSettled(taskPromises);
    }

    async waitForExecutionToComplete(
        serverTaskId: string,
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTaskDetails: ServerTaskDetails) => void
    ): Promise<ServerTask | null> {
        const spaceServerTaskRepository = new SpaceServerTaskRepository(this.client, this.spaceName);
        return this.waitForExecutionToCompleteInternal(spaceServerTaskRepository, serverTaskId, statusCheckSleepCycle, timeout, pollingCallback);
    }

    private async waitForExecutionToCompleteInternal(
        spaceServerTaskRepository: SpaceServerTaskRepository,
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
                const taskDetails = await spaceServerTaskRepository.getDetails(serverTaskId);
                pollingCallback(taskDetails);

                if (taskDetails.Task.IsCompleted) {
                    clearTimeout(t);
                    return taskDetails.Task;
                }
            } else {
                const task = await spaceServerTaskRepository.getById(serverTaskId);

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
