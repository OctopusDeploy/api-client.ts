import {ClientConfiguration} from "../../clientConfiguration";
import {open} from "fs/promises";
import {blob} from "stream/consumers";
import path from "path";
import {OverwriteMode} from "../../repositories/packageRepository";
import {connect} from "../connect";

export async function pushPackage(configuration: ClientConfiguration, space: string, packages: string[], overwriteMode: OverwriteMode = OverwriteMode.FailIfExists): Promise<void> {
    const [repository] = await connect(configuration, space);

    const tasks: Promise<void>[] = [];

    for (const packagePath of packages) {
        tasks.push(uploadPackage(packagePath));
    }

    await Promise.all(tasks);

    console.log("Packages uploaded");

    async function uploadPackage(filePath: string) {
        const fileHandle = await open(filePath, "r");
        const data = await blob(fileHandle.createReadStream());
        const fileName = path.basename(filePath);

        console.log(`Uploading ${fileName} package`);
        await repository.packages.upload(new File([data], fileName),  overwriteMode);
    }
}