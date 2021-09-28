/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CertificateConfigurationResource, CertificateResource, CertificateUsageResource } from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

class CertificateConfigurationRepository extends BasicRepository<CertificateConfigurationResource, CertificateConfigurationResource> {
    constructor(client: Client) {
        super("CertificateConfiguration", client);
    }
    global() {
        return this.get("certificate-global");
    }
    export(certificate: CertificateResource, exportOptions: any) {
        return this.client.get(certificate.Links["Export"], exportOptions);
    }
    archive(certificate: CertificateResource) {
        return this.client.post(certificate.Links["Archive"]);
    }
    unarchive(certificate: CertificateResource) {
        return this.client.post(certificate.Links["Unarchive"]);
    }
    usage(certificate: CertificateResource) {
        return this.client.get<CertificateUsageResource>(certificate.Links["Usages"]);
    }
    replace(certificate: CertificateResource, newCertificateData: any, newPassword: any) {
        return this.client.post(certificate.Links["Replace"], {
            certificateData: newCertificateData,
            password: newPassword,
        });
    }
}

export default CertificateConfigurationRepository;
