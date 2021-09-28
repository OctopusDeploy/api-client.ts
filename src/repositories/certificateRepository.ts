/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { CertificateResource } from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

type CertificateRepositoryListArgs = {
    archived?: boolean;
    firstResult?: string;
    orderBy?: string;
    search?: string;
    skip?: number;
    take?: number;
    tenant?: string;
};

const CollectionLinkName = "Certificates";
const SelfSignedEndpoint = "/generate";

class CertificateRepository extends BasicRepository<CertificateResource, CertificateResource, CertificateRepositoryListArgs> {
    constructor(client: Client) {
        super(CollectionLinkName, client);
    }

    names(projectId: string, projectEnvironmentsFilter: any) {
        return this.client.get(this.client.getLink("VariableNames"), {
            project: projectId,
            projectEnvironmentsFilter: projectEnvironmentsFilter ? projectEnvironmentsFilter.join(",") : projectEnvironmentsFilter,
        });
    }

    async listForTenant(tenantId: string) {
        // We need all the certs for the drop-down, but we need them filtered by tenant
        // certificates/all is cached, and so does not support filtering by tenant.
        const certificates = (await this.list({ tenant: tenantId, take: this.takeAll })).Items;
        return certificates;
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

    createSelfSigned(resource: CertificateResource, args?: {}): Promise<CertificateResource> {
        return this.client.create<CertificateResource, CertificateResource>(this.client.getLink(CollectionLinkName) + SelfSignedEndpoint, resource, args!).then((r) => this.notifySubscribersToDataModifications(r));
    }
}

export default CertificateRepository;
