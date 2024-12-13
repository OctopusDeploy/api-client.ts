export interface RunGitRunbookResponse {
    RunbookRunServerTasks: RunRunbookServerTask[];
}

export interface RunRunbookServerTask {
    RunbookRunId: string;
    ServerTaskId: string;
}
