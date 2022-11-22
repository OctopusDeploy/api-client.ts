import { PackageResource } from "@octopusdeploy/message-contracts";
import { promises as fs } from "fs";
import path from "path";
import FormData from "form-data";
import { Client, resolveSpaceId } from "../..";
import { OverwriteMode } from "../../repositories/packageRepository";

export async function packagePush(
    client: Client,
    spaceName: string,
    packages: string[],
    overwriteMode: OverwriteMode = OverwriteMode.FailIfExists
): Promise<void> {
    const spaceId = await resolveSpaceId(client, spaceName);

    const tasks: Promise<void>[] = [];

    for (const packagePath of packages) {
        tasks.push(packageUpload(packagePath));
    }

    await Promise.all(tasks);

    client.info("Packages uploaded");

    async function packageUpload(filePath: string) {
        const fileName = path.basename(filePath);

        client.info(`Uploading package, ${fileName}...`);
        await upload(filePath, fileName, overwriteMode);
    }

    async function upload(filePath: string, fileName: string, overwriteMode: OverwriteMode) {
        const fd = new FormData();
        const data = await fs.readFile(filePath);
        fd.append("fileToUpload", data, fileName);
        return client.post<PackageResource>(`~/api/{spaceId}/packages/raw{?overwriteMode}`, fd, { overwriteMode, spaceId });
    }
}
