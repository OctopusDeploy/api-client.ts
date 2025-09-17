import type { MonitorErrorResource } from "./monitorErrorResource";

export interface GetContainerLogsRequest {
    SessionId: string;
}

export interface GetContainerLogsResponse {
    Logs: ContainerLogLineResource[];
    IsSessionCompleted: boolean;
    Error: MonitorErrorResource | null;
}

export interface ContainerLogLineResource {
    Timestamp: Date;
    LogLevel: string;
}
