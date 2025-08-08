import type { MonitorErrorResource } from "./monitorErrorResource";

export interface GetResourceEventsRequest {
    SessionId: string;
}

export interface GetResourceEventsResponse {
    Events: KubernetesEventResource[];
    IsSessionCompleted: boolean;
    Error: MonitorErrorResource | null;
}

export interface KubernetesEventResource {
    firstObservedTime: Date;
    lastObservedTime: Date;
    count: number;
    action: string;
    reason: string;
    note: string;
    reportingController: string;
    reportingInstance: string;
    type: string;
    manifest: string;
}
