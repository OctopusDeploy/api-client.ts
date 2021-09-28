import type { AllArgs } from "./basicRepository";
import { BasicRepository } from "./basicRepository";
import type { PackageResource } from "@octopusdeploy/message-contracts";
import { PackageFromBuiltInFeedResource, ResourceCollection } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export type PackageListArgs = {
    take?: number;
    skip?: number;
    filter?: string;
    nuGetPackageId?: string;
    includeNotes?: boolean;
    latest?: boolean;
};

export interface PackageNoteResult {
    Succeeded: boolean;
    Notes: string;
    FailureReason: string;
}

export interface PackageNote {
    PackageId: string;
    Version: string;
    FeedId: string;
    Notes: PackageNoteResult;
}

interface PackageNotesList {
    Packages: PackageNote[];
}

type PackageGetArgs = {
    includeNotes?: boolean;
};

export class PackageRepository extends BasicRepository<PackageResource, PackageResource, PackageListArgs, AllArgs, PackageGetArgs> {
    constructor(client: Client) {
        super("Packages", client);
    }

    deleteMany(packageIds: string[]) {
        return this.client.del(this.client.getLink("PackagesBulk"), null, { ids: packageIds });
    }
    upload(pkg: File, replace: boolean) {
        const fd = new FormData();
        fd.append("fileToUpload", pkg);
        return this.client.post<PackageResource>(this.client.getLink("PackageUpload"), fd, { replace });
    }
    getNotes(packages: PackageNote[]) {
        const packageIds = packages.reduce((result, item) => result + (result.length === 0 ? "" : ",") + encodeURIComponent(item.FeedId) + ":" + encodeURIComponent(item.PackageId) + ":" + encodeURIComponent(item.Version), "");
        return this.client.get<PackageNotesList>(this.client.getLink("PackageNotesList"), { packageIds });
    }
}