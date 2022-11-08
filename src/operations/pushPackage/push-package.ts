import { PackageResource, SpaceResource } from "@octopusdeploy/message-contracts";
import { promises as fs } from "fs";
const { readFile } = fs;
import path from "path";
import { Client, resolveSpaceId } from "../..";
import { OverwriteMode } from "../../repositories/packageRepository";

export async function pushPackage(
    client: Client,
    spaceName: string,
    packages: string[],
    overwriteMode: OverwriteMode = OverwriteMode.FailIfExists): Promise<void> {

    const spaceId = await resolveSpaceId(client, spaceName);

    const tasks: Promise<void>[] = [];

    for (const packagePath of packages) {
        tasks.push(uploadPackage(packagePath));
    }

    await Promise.all(tasks);

    client.info("Packages uploaded");

    async function uploadPackage(filePath: string) {
        const buffer = await readFile(filePath);
        const fileName = path.basename(filePath);

        client.info(`Uploading package, ${fileName}...`);
        await upload(new File([buffer], fileName), overwriteMode);
    }

    async function upload(pkg: File, overwriteMode: OverwriteMode) {
        const fd = new FormData();
        fd.append("fileToUpload", pkg);
        return client.post<PackageResource>(`~/api/{spaceId}/packages/raw{?overwriteMode}`, fd, { overwriteMode, spaceId });
    }
}
