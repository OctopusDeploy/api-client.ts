import { ServerTask } from "./serverTask";

export enum ActivityStatus {
    Pending = "Pending",
    Running = "Running",
    Success = "Success",
    Failed = "Failed",
    Skipped = "Skipped",
    SuccessWithWarning = "SuccessWithWarning",
    Canceled = "Canceled",
}

export enum ActivityLogEntryCategory {
    Trace = "Trace",
    Verbose = "Verbose",
    Info = "Info",
    Highlight = "Highlight",
    Wait = "Wait",
    Gap = "Gap",
    Alert = "Alert",
    Warning = "Warning",
    Error = "Error",
    Fatal = "Fatal",
    Planned = "Planned",
    Updated = "Updated",
    Finished = "Finished",
    Abandoned = "Abandoned",
}

export interface TaskProgress {
    progressPercentage: number;
    estimatedTimeRemaining: string;
}

// ActivityLogEntry in Octopus.Server
export interface ActivityLogElement {
    category: ActivityLogEntryCategory;
    occurredAt: string;
    messageText: string;
    detail?: string;
    percentage?: number;
}

// ActivityLogTreeNode in Octopus.Server
export interface ActivityElement {
    id: string;
    name: string;
    started: string;
    ended?: string;
    status?: ActivityStatus;
    children: ActivityElement[];
    showAtSummaryLevel: boolean;
    logElements: ActivityLogElement[];
    progressPercentage: number;
    progressMessage: string;
}

export interface ServerTaskDetails {
    task: ServerTask;
    progress: TaskProgress;
    physicalLogSize: number;
    activityLogs: ActivityElement[];
}
