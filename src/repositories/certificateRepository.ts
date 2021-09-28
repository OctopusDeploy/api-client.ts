import type { CertificateResource } from "@octopusdeploy/message-contracts";
import { BasicRepository, ListArgs } from "./basicRepository";
import type { Client } from "../client";

type CertificateRepositoryListArgs = {
    archived?: boolean;
    firstResult?: string;
    orderBy?: string;
    search?: string;
    tenant?: string;
} & ListArgs;

const SelfSignedEndpoint = "/generate";

export class CertificateRepository extends BasicRepository<CertificateResource, CertificateResource, CertificateRepositoryListArgs> {
    constructor(client: Client) {
        super("Certificates", client);
    }

    createSelfSigned(resource: CertificateResource, args?: {}): Promise<CertificateResource> {
        return this.client.create<CertificateResource, CertificateResource>(this.client.getLink("Certificates") + SelfSignedEndpoint, resource, args!).then((r) => this.notifySubscribersToDataModifications(r));
    }

    async listForTenant(tenantId: string) {
        // We need all the certs for the drop-down, but we need them filtered by tenant
        // certificates/all is cached, and so does not support filtering by tenant.
        const certificates = (await this.list({ tenant: tenantId, take: this.takeAll })).Items;
        return certificates;
    }

    names(projectId: string, projectEnvironmentsFilter: any) {
        return this.client.get(this.client.getLink("VariableNames"), {
            project: projectId,
            projectEnvironmentsFilter: projectEnvironmentsFilter ? projectEnvironmentsFilter.join(",") : projectEnvironmentsFilter,
        });
    }

    saveSelfSigned(resource: CertificateResource): Promise<CertificateResource> {
        if (isExistingResource(resource)) {
            return this.modify(resource);
        } else {
            return this.createSelfSigned(resource);
        }

        function isExistingResource(r: CertificateResource): r is CertificateResource {
            return !!(r as CertificateResource).Links && !!(r as CertificateResource).Id;
        }
    }
}