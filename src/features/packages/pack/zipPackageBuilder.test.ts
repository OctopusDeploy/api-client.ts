import { ZipPackageBuilder } from "./zipPackageBuilder";
import fs from "fs";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";

describe("Can create a Zip packages", () => {
    test("Can create with a single specific file", async () => {
        const tmpFolder = os.tmpdir();

        fs.writeFileSync(path.join(tmpFolder, "ZipPackagingTest.txt"), "Some test content to add to the zip archive");
        const zipPackageBuilder = new ZipPackageBuilder();
        await zipPackageBuilder.pack({
            packageId: "TestPackage",
            version: "1.0.1",
            inputFilePatterns: [path.join(tmpFolder, "ZipPackagingTest.txt")],
            outputFolder: tmpFolder,
            overwrite: true,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestPackage.1.0.1.zip`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("ZipPackagingTest.txt");
        expect(entry).not.toBeNull();
    });

    test("Can create with wildcarded files", async () => {
        const tmpFolder = os.tmpdir();

        fs.writeFileSync(path.join(tmpFolder, "ZipPackagingTest1.txt"), "Some test content to add to the zip archive AAA");
        const zipPackageBuilder = new ZipPackageBuilder();
        await zipPackageBuilder.pack({
            packageId: "TestPackageA",
            version: "1.1.1",
            inputFilePatterns: ["src/features/packages/pack/*.ts"],
            outputFolder: tmpFolder,
            overwrite: true,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestPackageA.1.1.1.zip`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("zipPackageBuilder.ts");
        expect(entry).not.toBeNull();
    });
});
