import { Package } from "./package";
import { promises as fs } from "fs";
import path from "path";
import FormData from "form-data";
import { OverwriteMode } from "../overwriteMode";
import { ListArgs } from "../basicRepository";
import { Client } from "../../client";
import { spaceScopedRoutePrefix } from "../../spaceScopedRoutePrefix";
import { ResourceCollection } from "../../resourceCollection";
import { resolveSpaceId } from "../../spaceResolver";

type PackagesListArgs = {
    nuGetPackageId?: string;
    filter?: string;
    latest?: boolean;
    includeNotes?: boolean;
} & ListArgs;

export class PackageRepository {
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async get(packageId: string): Promise<Package> {
        if (!packageId) {
            throw new Error("Package Id was not provided");
        }
        const response = await this.client.request<Package>(`${spaceScopedRoutePrefix}/packages{/packageId}`, {
            spaceName: this.spaceName,
            packageId,
        });
        return response;
    }

    async list(args?: PackagesListArgs): Promise<ResourceCollection<Package>> {
        const response = await this.client.request<ResourceCollection<Package>>(
            `${spaceScopedRoutePrefix}/packages{/id}{?nuGetPackageId,filter,latest,skip,take,includeNotes}`,
            {
                spaceName: this.spaceName,
                ...args,
            }
        );
        return response;
    }

    async push(packages: string[], overwriteMode: OverwriteMode = OverwriteMode.FailIfExists): Promise<void> {
        const spaceId = await resolveSpaceId(this.client, this.spaceName);

        const tasks: Promise<void>[] = [];

        for (const packagePath of packages) {
            tasks.push(this.packageUpload(spaceId, packagePath, overwriteMode));
        }

        const rejectedTasks: unknown[] = [];

        const completedTasks = await Promise.allSettled(tasks);
        for (const t of completedTasks) {
            if (t.status != "rejected") {
                rejectedTasks.push(t.reason);
            }
        }

        if (rejectedTasks.length > 0) {
            throw new Error(`${rejectedTasks}`);
        }


        this.client.info("Packages uploaded");
    }

    private async packageUpload(spaceId: string, filePath: string, overwriteMode: OverwriteMode) {
        const fileName = path.basename(filePath);

        this.client.info(`Uploading package, ${fileName}...`);
        await this.upload(spaceId, filePath, fileName, overwriteMode);
    }

    private async upload(spaceId: string, filePath: string, fileName: string, overwriteMode: OverwriteMode) {
        const fd = new FormData();
        const data = await fs.readFile(filePath);
        fd.append("fileToUpload", data, fileName);
        return this.client.post<Package>(`${spaceScopedRoutePrefix}/packages/raw{?overwriteMode}`, fd, { overwriteMode, spaceId });
    }
}
