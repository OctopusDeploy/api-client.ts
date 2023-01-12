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
    ): Promise<ServerTask | null> {
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
        const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms));

        let stop = false;
        const t = setTimeout(() => {
            stop = true;
        }, timeout);

        const completedTasks: ServerTask[] = [];

        while (!stop) {
            try {
                const tasks = await spaceServerTaskRepository.getByIds(serverTaskIds);

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
                if (serverTaskIds.length === 0) {
                    stop = true;
                }
            } finally {
                clearTimeout(t);
            }

            await sleep(statusCheckSleepCycle);
        }
        return completedTasks;
    }
}
