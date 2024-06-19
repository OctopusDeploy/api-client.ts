import { Client } from "../..";
import { ServerTask } from "../../features/serverTasks";
import { SpaceServerTaskRepository } from "../serverTasks";

export class ServerTaskWaiter {
    constructor(private readonly client: Client, private readonly spaceName: string) {}

    async waitForServerTasksToComplete(
        serverTaskIds: string[],
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTask: ServerTask) => void
    ): Promise<ServerTask[]> {
        const spaceServerTaskRepository = new SpaceServerTaskRepository(this.client, this.spaceName);

        return this.waitForTasks(spaceServerTaskRepository, serverTaskIds, statusCheckSleepCycle, timeout, pollingCallback);
    }

    async waitForServerTaskToComplete(
        serverTaskId: string,
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTask: ServerTask) => void
    ): Promise<ServerTask> {
        const spaceServerTaskRepository = new SpaceServerTaskRepository(this.client, this.spaceName);
        const tasks = await this.waitForTasks(spaceServerTaskRepository, [serverTaskId], statusCheckSleepCycle, timeout, pollingCallback);
        return tasks[0];
    }

    private async waitForTasks(
        spaceServerTaskRepository: SpaceServerTaskRepository,
        serverTaskIds: string[],
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTask: ServerTask) => void
    ): Promise<ServerTask[]> {
        // short circuit if no ids are passed. Sending an empty array to server here
        // doesn't do what you may expect. To server, no ids == return every task the user
        // has permission to see
        if (serverTaskIds.length === 0) {
            return [];
        }

        const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms));

        let stop = false;
        const t = setTimeout(() => {
            stop = true;
        }, timeout);

        const completedTasks: ServerTask[] = [];

        try {
            while (!stop) {
                const tasks = await spaceServerTaskRepository.getByIds(serverTaskIds);

                const unknownTaskIds = serverTaskIds.filter((id) => tasks.filter((t) => t.Id === id).length == 0);
                if (unknownTaskIds.length) {
                    throw new Error(`Unknown task Id(s) ${unknownTaskIds.join(", ")}`);
                }

                const nowCompletedTaskIds: string[] = [];

                for (const task of tasks) {
                    if (pollingCallback) {
                        pollingCallback(task);
                    }

                    // once the task is complete
                    if (task.IsCompleted) {
                        nowCompletedTaskIds.push(task.Id);
                        completedTasks.push(task);
                    }
                }

                // filter down the ids to only those that haven't completed for the next time around the loop
                serverTaskIds = serverTaskIds.filter((id) => nowCompletedTaskIds.indexOf(id) < 0);

                // once all tasks have completed we can stop the loop
                if (serverTaskIds.length === 0 || tasks.length === 0) {
                    stop = true;
                    clearTimeout(t);
                }

                await sleep(statusCheckSleepCycle);
            }
        } finally {
            clearTimeout(t);
        }

        return completedTasks;
    }
}
