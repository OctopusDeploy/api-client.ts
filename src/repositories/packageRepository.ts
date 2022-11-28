import type { PackageResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import type { AllArgs } from "./basicRepository";
import { BasicRepository } from "./basicRepository";

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

export enum OverwriteMode {
    "FailIfExists" = "FailIfExists",
    "OverwriteExisting" = "OverwriteExisting",
    "IgnoreIfExists" = "IgnoreIfExists",
}

export class PackageRepository extends BasicRepository<PackageResource, PackageResource, PackageListArgs, AllArgs, PackageGetArgs> {
    constructor(client: Client) {
        super("Packages", client);
    }

    deleteMany(packageIds: string[]) {
        return this.client.del(this.client.getLink("PackagesBulk"), null, { ids: packageIds });
    }
    upload(pkg: File, overwriteMode: OverwriteMode = OverwriteMode.FailIfExists) {
        const fd = new FormData();
        fd.append("fileToUpload", pkg);
        return this.client.post<PackageResource>(this.client.getLink("PackageUpload"), fd, { overwriteMode });
    }
    getNotes(packages: PackageNote[]) {
        const packageIds = packages.reduce(
            (result, item) =>
                result +
                (result.length === 0 ? "" : ",") +
                encodeURIComponent(item.FeedId) +
                ":" +
                encodeURIComponent(item.PackageId) +
                ":" +
                encodeURIComponent(item.Version),
            ""
        );
        return this.client.get<PackageNotesList>(this.client.getLink("PackageNotesList"), { packageIds });
    }
}
