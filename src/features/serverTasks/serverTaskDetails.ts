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
    ProgressPercentage: number;
    EstimatedTimeRemaining: string;
}

// ActivityLogEntry in Octopus.Server
export interface ActivityLogElement {
    Category: ActivityLogEntryCategory;
    OccurredAt: string;
    MessageText: string;
    Detail?: string;
    Percentage?: number;
}

// ActivityLogTreeNode in Octopus.Server
export interface ActivityElement {
    Id: string;
    Name: string;
    Started: string;
    Ended?: string;
    Status?: ActivityStatus;
    Children: ActivityElement[];
    ShowAtSummaryLevel: boolean;
    LogElements: ActivityLogElement[];
    ProgressPercentage: number;
    ProgressMessage: string;
}

export interface ServerTaskDetails {
    Task: ServerTask;
    Progress: TaskProgress;
    PhysicalLogSize: number;
    ActivityLogs: ActivityElement[];
}
