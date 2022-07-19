import { SpaceResource } from "@octopusdeploy/message-contracts";
import { readFile } from "fs";
import path from "path";
import { OverwriteMode } from "../../repositories/packageRepository";
import { connect } from "../connect";

export async function pushPackage(space: SpaceResource, packages: string[], overwriteMode: OverwriteMode = OverwriteMode.FailIfExists): Promise<void> {
    const [repository] = await connect(space);

    const tasks: Promise<void>[] = [];

    for (const packagePath of packages) {
        tasks.push(uploadPackage(packagePath));
    }

    await Promise.all(tasks);

    console.log("Packages uploaded");

    async function uploadPackage(filePath: string) {
        const buffer = await new Promise<Buffer>((res, rej) => {
            readFile(filePath, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data);
                }
            });
        });

        const fileName = path.basename(filePath);

        console.log(`Uploading package, ${fileName}...`);
        await repository.packages.upload(new File([buffer], fileName), overwriteMode);
    }
}
