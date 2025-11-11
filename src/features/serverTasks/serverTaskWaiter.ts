/* eslint-disable no-eq-null */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client } from "../..";
import { ServerTask } from "../../features/serverTasks";
import { SpaceServerTaskRepository } from "../serverTasks";
import { ServerTaskRepository } from "../serverTasks";

export interface ServerTaskWaiterOptions {
    maxRetries?: number; // Default: 3
    retryBackoffMs?: number; // Initial backoff in ms, default: 5000
}

export class ServerTaskWaiter {
    private readonly maxRetries: number;
    private readonly retryBackoffMs: number;

    constructor(private readonly client: Client, private readonly spaceName: string, options?: ServerTaskWaiterOptions) {
        this.maxRetries = options?.maxRetries ?? 3;
        this.retryBackoffMs = options?.retryBackoffMs ?? 5000;
    }

    async waitForServerTasksToComplete(
        serverTaskIds: string[],
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTask: ServerTask) => void,
        cancelOnTimeout: boolean = false
    ): Promise<ServerTask[]> {
        const spaceServerTaskRepository = new SpaceServerTaskRepository(this.client, this.spaceName);
        const serverTaskRepository = new ServerTaskRepository(this.client);

        return this.waitForTasks(
            spaceServerTaskRepository,
            serverTaskRepository,
            serverTaskIds,
            statusCheckSleepCycle,
            timeout,
            cancelOnTimeout,
            pollingCallback
        );
    }

    async waitForServerTaskToComplete(
        serverTaskId: string,
        statusCheckSleepCycle: number,
        timeout: number,
        pollingCallback?: (serverTask: ServerTask) => void,
        cancelOnTimeout: boolean = false
    ): Promise<ServerTask> {
        const spaceServerTaskRepository = new SpaceServerTaskRepository(this.client, this.spaceName);
        const serverTaskRepository = new ServerTaskRepository(this.client);
        const tasks = await this.waitForTasks(
            spaceServerTaskRepository,
            serverTaskRepository,
            [serverTaskId],
            statusCheckSleepCycle,
            timeout,
            cancelOnTimeout,
            pollingCallback
        );
        return tasks[0];
    }

    private async waitForTasks(
        spaceServerTaskRepository: SpaceServerTaskRepository,
        serverTaskRepository: ServerTaskRepository,
        serverTaskIds: string[],
        statusCheckSleepCycle: number,
        timeout: number,
        cancelOnTimeout: boolean,
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
        let timedOut = false;
        const t = setTimeout(() => {
            stop = true;
            timedOut = true;
        }, timeout);

        const completedTasks: ServerTask[] = [];

        try {
            while (!stop) {
                const tasks = await this.getTasksWithRetry(spaceServerTaskRepository, serverTaskIds);

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

            if (timedOut && cancelOnTimeout && serverTaskIds.length > 0) {
                await this.cancelTasks(serverTaskRepository, serverTaskIds);
            }
            if (timedOut && cancelOnTimeout) {
                throw new Error(`Timeout reached after ${timeout / 1000} seconds. Tasks were cancelled.`);
            }
        } finally {
            clearTimeout(t);
        }

        return completedTasks;
    }

    private async cancelTasks(serverTaskRepository: ServerTaskRepository, taskIds: string[]): Promise<void> {
        for (const taskId of taskIds) {
            try {
                await serverTaskRepository.cancel(taskId);
            } catch (error) {
                console.warn(`Failed to cancel task ${taskId}:`, error);
            }
        }
    }

    private async getTasksWithRetry(repository: SpaceServerTaskRepository, taskIds: string[]): Promise<ServerTask[]> {
        // eslint-disable-next-line @typescript-eslint/init-declarations
        let lastError: any;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await repository.getByIds(taskIds);
            } catch (error) {
                lastError = error;
                const errorMessage = error instanceof Error ? error.message : String(error);

                const statusCode =
                    (error as any).StatusCode ||
                    (typeof (error as any).code === "number" ? (error as any).code : null) ||
                    (error as any).response?.status ||
                    (error as any).status;

                const isRetryable = this.isRetryableError(error, statusCode);

                if (!isRetryable) throw error;

                if (attempt === this.maxRetries)
                    throw new Error(`Failed to connect to Octopus server after ${this.maxRetries} attempts. ` + `Last error: ${errorMessage}`);

                const backoffDelay = this.retryBackoffMs * Math.pow(2, attempt);
                this.client.warn(
                    `HTTP request failed (attempt ${attempt + 1}/${this.maxRetries}): ${errorMessage}${
                        statusCode ? ` [${statusCode}]` : ""
                    }. Retrying in ${backoffDelay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            }
        }

        // This should never be reached due to throws above, but TypeScript needs it
        throw lastError;
    }

    private isRetryableError(error: any, statusCode: number | null): boolean {
        if (!error) return false;

        if (statusCode && [408, 429, 500, 502, 503, 504].includes(statusCode)) {
            return true;
        }

        try {
            const errorStr = String(error.message || error).toLowerCase();
            const errorCode = error.code ? String(error.code).toLowerCase() : "";
            const keywords = [
                "timeout",
                "etimedout",
                "econnreset",
                "econnrefused",
                "econnaborted",
                "enotfound",
                "eai_again",
                "epipe",
                "ehostunreach",
                "enetunreach",
                "socket",
                "network",
            ];
            return keywords.some((k) => errorStr.includes(k) || errorCode.includes(k));
        } catch {
            return false;
        }
    }
}
