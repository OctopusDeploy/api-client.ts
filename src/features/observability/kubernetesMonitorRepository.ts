import { resolveSpaceId, SpaceScopedBasicRepository, spaceScopedRoutePrefix, type Client, type ListArgs } from "../..";

export interface RegisterKubernetesMonitorResponse {
    Resource: KubernetesMonitor;
}
export interface GetKubernetesMonitorResponse {
    Resource: KubernetesMonitor;
}

export interface KubernetesMonitor {
    Id: string;
    InstallationId: string;
    MachineId: string;
    SpaceId: string;
}

export interface NewKubernetesMonitor {
    InstallationId: string;
    MachineId: string;
}

export class KubernetesMonitorRepository {
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async registerKubernetesMonitor(installationId: string, machineId: string): Promise<RegisterKubernetesMonitorResponse> {
        return this.client.post<RegisterKubernetesMonitorResponse>(
            "~/api/spaces/{spaceId}/observability/kubernetes-monitors",
            {
                installationId: installationId,
                machineId: machineId,
            },
            { spaceId: await resolveSpaceId(this.client, this.spaceName) }
        );
    }

    async getById(id: string): Promise<GetKubernetesMonitorResponse> {
        return this.client.get<GetKubernetesMonitorResponse>("~/api/spaces/{spaceId}/observability/kubernetes-monitors/{id}", {
            spaceId: await resolveSpaceId(this.client, this.spaceName),
            id: id,
        });
    }

    async deleteById(id: string): Promise<unknown> {
        return this.client.del("~/api/spaces/{spaceId}/observability/kubernetes-monitors/{id}", {
            spaceId: await resolveSpaceId(this.client, this.spaceName),
            id: id,
        });
    }
}
