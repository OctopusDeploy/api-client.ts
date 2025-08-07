import type {
    BeginResourceEventsSessionResponse,
    GetContainerLogsResponse,
    GetLiveStatusResponse,
    GetResourceEventsResponse,
    GetResourceManifestResponse,
    GetResourceResponse,
} from ".";
import { Client, resolveSpaceId } from "../..";
import type { BeginContainerLogsSessionResponse } from "./containerLogsSession";

export class ObservabilityRepository {
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async getLiveStatus(projectId: string, environmentId: string, tenantId?: string, summaryOnly: boolean = false): Promise<GetLiveStatusResponse> {
        const queryParams = summaryOnly ? "?summaryOnly=true" : "";

        if (tenantId === undefined) {
            return this.client.get<GetLiveStatusResponse>(
                `~/api/spaces/{spaceId}/projects/{projectId}/environments/{environmentId}/untenanted/livestatus${queryParams}`,
                { spaceId: await resolveSpaceId(this.client, this.spaceName), projectId: projectId, environmentId: environmentId }
            );
        }

        return this.client.get<GetLiveStatusResponse>(
            `~/api/spaces/{spaceId}/projects/{projectId}/environments/{environmentId}/tenants/{tenantId}/livestatus${queryParams}`,
            {
                projectId: projectId,
                environmentId: environmentId,
                tenantId: tenantId,
            }
        );
    }

    async getResource(
        projectId: string,
        environmentId: string,
        tenantId: string | undefined,
        machineId: string,
        resourceId: string
    ): Promise<GetResourceResponse> {
        if (tenantId === undefined) {
            return this.client.get<GetResourceResponse>(
                "~/api/spaces/{spaceId}/projects/{projectId}/environments/{environmentId}/untenanted/machines/{machineId}/resources/{desiredOrKubernetesMonitoredResourceId}",
                {
                    spaceId: await resolveSpaceId(this.client, this.spaceName),
                    projectId: projectId,
                    environmentId: environmentId,
                    machineId: machineId,
                    desiredOrKubernetesMonitoredResourceId: resourceId,
                }
            );
        }

        return this.client.get<GetResourceResponse>(
            "~/api/spaces/{spaceId}/projects/{projectId}/environments/{environmentId}/tenants/{tenantId}/machines/{machineId}/resources/{desiredOrKubernetesMonitoredResourceId}",
            {
                spaceId: await resolveSpaceId(this.client, this.spaceName),
                projectId: projectId,
                environmentId: environmentId,
                tenantId: tenantId,
                machineId: machineId,
                desiredOrKubernetesMonitoredResourceId: resourceId,
            }
        );
    }

    async getResourceManifest(
        projectId: string,
        environmentId: string,
        tenantId: string | undefined,
        machineId: string,
        resourceId: string
    ): Promise<GetResourceManifestResponse> {
        if (tenantId === undefined) {
            return this.client.get<GetResourceManifestResponse>(
                "~/api/spaces/{spaceId}/projects/{projectId}/environments/{environmentId}/untenanted/machines/{machineId}/resources/{desiredOrKubernetesMonitoredResourceId}/manifest",
                {
                    spaceId: await resolveSpaceId(this.client, this.spaceName),
                    projectId: projectId,
                    environmentId: environmentId,
                    machineId: machineId,
                    desiredOrKubernetesMonitoredResourceId: resourceId,
                }
            );
        }

        return this.client.get<GetResourceManifestResponse>(
            "~/api/spaces/{spaceId}/projects/{projectId}/environments/{environmentId}/tenants/{tenantId}/machines/{machineId}/resources/{desiredOrKubernetesMonitoredResourceId}/manifest",
            {
                spaceId: await resolveSpaceId(this.client, this.spaceName),
                projectId: projectId,
                environmentId: environmentId,
                tenantId: tenantId,
                machineId: machineId,
                desiredOrKubernetesMonitoredResourceId: resourceId,
            }
        );
    }

    async beginContainerLogsSession(
        projectId: string,
        environmentId: string,
        tenantId: string | undefined,
        machineId: string,
        resourceId: string,
        podName: string,
        containerName: string,
        showPreviousContainer: boolean
    ): Promise<BeginContainerLogsSessionResponse> {
        return this.client.post<BeginContainerLogsSessionResponse>(
            "~/api/spaces/{spaceId}/observability/logs/sessions",
            {
                projectId: projectId,
                environmentId: environmentId,
                tenantId: tenantId,
                machineId: machineId,
                podName: podName,
                containerName: containerName,
                showPreviousContainer: showPreviousContainer,
                desiredOrKubernetesMonitoredResourceId: resourceId,
            },
            { spaceId: await resolveSpaceId(this.client, this.spaceName) }
        );
    }

    async getContainerLogs(sessionId: string): Promise<GetContainerLogsResponse> {
        return this.client.get<GetContainerLogsResponse>("~/api/spaces/{spaceId}/observability/logs/sessions/{sessionId}", {
            spaceId: await resolveSpaceId(this.client, this.spaceName),
            sessionId,
        });
    }

    async beginResourceEventsSession(
        projectId: string,
        environmentId: string,
        tenantId: string | undefined,
        machineId: string,
        resourceId: string
    ): Promise<BeginResourceEventsSessionResponse> {
        return this.client.post<BeginResourceEventsSessionResponse>(
            "~/api/spaces/{spaceId}/observability/events/sessions",
            {
                projectId: projectId,
                environmentId: environmentId,
                tenantId: tenantId,
                machineId: machineId,
                desiredOrKubernetesMonitoredResourceId: resourceId,
            },
            { spaceId: await resolveSpaceId(this.client, this.spaceName) }
        );
    }

    async getResourceEvents(sessionId: string): Promise<GetResourceEventsResponse> {
        return this.client.get<GetResourceEventsResponse>("~/api/spaces/{spaceId}/observability/events/sessions/{sessionId}", {
            spaceId: await resolveSpaceId(this.client, this.spaceName),
            sessionId,
        });
    }
}
