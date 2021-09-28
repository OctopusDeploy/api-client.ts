import type {
    CertificateConfigurationResource,
    CertificateResource,
    CertificateUsageResource
} from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

export class CertificateConfigurationRepository extends BasicRepository<CertificateConfigurationResource, CertificateConfigurationResource> {
    constructor(client: Client) {
        super("CertificateConfiguration", client);
    }

    archive(certificate: CertificateResource) {
        return this.client.post(certificate.Links["Archive"]);
    }

    export(certificate: CertificateResource, exportOptions: any) {
        return this.client.get(certificate.Links["Export"], exportOptions);
    }

    global() {
        return this.get("certificate-global");
    }

    replace(certificate: CertificateResource, newCertificateData: any, newPassword: any) {
        return this.client.post(certificate.Links["Replace"], {
            certificateData: newCertificateData,
            password: newPassword,
        });
    }

    usage(certificate: CertificateResource) {
        return this.client.get<CertificateUsageResource>(certificate.Links["Usages"]);
    }

    unarchive(certificate: CertificateResource) {
        return this.client.post(certificate.Links["Unarchive"]);
    }
}