import { ZipPackageBuilder } from "./zipPackageBuilder";
import fs from "fs";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";
import { Logger } from "../../../logger";

describe("Can create a Zip packages", () => {
    const logger: Logger = {
        debug: (m) => console.log(m),
        info: (m) => console.log(m),
    };

    test("Can create with a single specific file", async () => {
        const tmpFolder = os.tmpdir();

        fs.writeFileSync(path.join(tmpFolder, "ZipPackagingTest.txt"), "Some test content to add to the zip archive");
        const zipPackageBuilder = new ZipPackageBuilder();
        await zipPackageBuilder.pack({
            packageId: "TestPackage",
            version: "1.0.1",
            basePath: tmpFolder,
            inputFilePatterns: ["ZipPackagingTest.txt"],
            outputFolder: tmpFolder,
            overwrite: true,
            logger,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestPackage.1.0.1.zip`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("ZipPackagingTest.txt");
        expect(entry).not.toBeNull();
    });

    test("Can create with wildcarded files", async () => {
        const tmpFolder = os.tmpdir();

        const zipPackageBuilder = new ZipPackageBuilder();
        await zipPackageBuilder.pack({
            packageId: "TestPackageA",
            version: "1.1.1",
            basePath: "src/features/packages/pack",
            inputFilePatterns: ["*.ts"],
            outputFolder: tmpFolder,
            overwrite: true,
            logger,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestPackageA.1.1.1.zip`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("zipPackageBuilder.test.ts");
        expect(entry).not.toBeNull();
    });

    test("Can create with multiples and wildcarded directories", async () => {
        const tmpFolder = os.tmpdir();

        const zipPackageBuilder = new ZipPackageBuilder();
        await zipPackageBuilder.pack({
            packageId: "TestPackageWild",
            version: "1.1.1",
            basePath: "src",
            inputFilePatterns: ["features/basicRepository.ts", "features/packages/**/*", "features/projects/**/*"],
            outputFolder: tmpFolder,
            overwrite: true,
            logger,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestPackageWild.1.1.1.zip`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        let entry = zip.getEntry("features/basicRepository.ts");
        expect(entry).not.toBeNull();
        entry = zip.getEntry("features/packages/pack/zipPackageBuilder.test.ts");
        expect(entry).not.toBeNull();
        entry = zip.getEntry("features/projects/index.ts");
        expect(entry).not.toBeNull();
    });

    test("Can create with '.' as the basePath", async () => {
        const tmpFolder = os.tmpdir();

        const zipPackageBuilder = new ZipPackageBuilder();
        await zipPackageBuilder.pack({
            packageId: "TestPackageDot",
            version: "1.1.1",
            basePath: ".",
            inputFilePatterns: ["src/features/basicRepository.ts", "src/features/packages/**/*", "src/features/projects/**/*"],
            outputFolder: tmpFolder,
            overwrite: true,
            logger,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestPackageDot.1.1.1.zip`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        let entry = zip.getEntry("src/features/basicRepository.ts");
        expect(entry).not.toBeNull();
        entry = zip.getEntry("src/features/packages/pack/zipPackageBuilder.test.ts");
        expect(entry).not.toBeNull();
        entry = zip.getEntry("src/features/projects/index.ts");
        expect(entry).not.toBeNull();
    });

    test("Can create zip file with dot-files included", async () => {
        const tmpFolder = os.tmpdir();
        fs.writeFileSync(path.join(tmpFolder, ".dotfile"), "Some test content to add to the zip archive");

        const zipPackageBuilder = new ZipPackageBuilder();
        await zipPackageBuilder.pack({
            packageId: "TestPackageDot",
            version: "1.1.1",
            basePath: tmpFolder,
            inputFilePatterns: ["**/*"],
            outputFolder: tmpFolder,
            overwrite: true,
            logger,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestPackageDot.1.1.1.zip`);
        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry(".dotfile");
        expect(entry).not.toBeNull();
    });
});
