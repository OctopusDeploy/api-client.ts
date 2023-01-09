import { NuGetPackageBuilder } from "./nugetPackageBuilder";
import fs from "fs";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";
import { Logger } from "../../../logger";

describe("Can create a NuGet packages", () => {
    const logger: Logger = {
        debug: (m) => console.log(m),
        info: (m) => console.log(m),
    };

    test("Can create with a single specific file", async () => {
        const tmpFolder = os.tmpdir();

        fs.writeFileSync(path.join(tmpFolder, "NuGetPackagingTest.txt"), "Some test content to add to the zip archive");
        const packageBuilder = new NuGetPackageBuilder();
        await packageBuilder.pack({
            packageId: "TestNuGetPackage",
            version: "1.0.1",
            basePath: tmpFolder,
            inputFilePatterns: ["NuGetPackagingTest.txt"],
            outputFolder: tmpFolder,
            overwrite: true,
            logger,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestNuGetPackage.1.0.1.nupkg`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("NuGetPackagingTest.txt");
        expect(entry).not.toBeNull();
    });

    test("Can create with wildcarded files", async () => {
        const tmpFolder = os.tmpdir();

        fs.writeFileSync(path.join(tmpFolder, "NuGetPackagingTest1.txt"), "Some test content to add to the NuGet archive AAA");
        const packageBuilder = new NuGetPackageBuilder();
        await packageBuilder.pack({
            packageId: "TestNuGetPackageA",
            version: "1.1.1",
            basePath: "src/features/packages/pack",
            inputFilePatterns: ["*.ts"],
            outputFolder: tmpFolder,
            overwrite: true,
            logger,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestNuGetPackageA.1.1.1.nupkg`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("nugetPackageBuilder.ts");
        expect(entry).not.toBeNull();
    });

    test("Can create with wildcarded files and a nuspec", async () => {
        const tmpFolder = os.tmpdir();

        fs.writeFileSync(path.join(tmpFolder, "NuGetPackagingTest1.txt"), "Some test content to add to the NuGet archive AAA");
        const packageBuilder = new NuGetPackageBuilder();
        await packageBuilder.pack({
            packageId: "TestNuGetPackageWithSpec",
            version: "1.0.0",
            basePath: "src/features/packages/pack",
            inputFilePatterns: ["*.ts"],
            outputFolder: tmpFolder,
            overwrite: true,
            nuspecArgs: {
                description: "This is a test NuGet Package",
                authors: ["Test AuthorA", "Test AuthorB"],
            },
            logger,
        });

        const expectedPackageFile = path.join(tmpFolder, `TestNuGetPackageWithSpec.1.0.0.nupkg`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("TestNuGetPackageWithSpec.nuspec");
        expect(entry).not.toBeNull();
    });

    test("Can create with a package in a relative folder", async () => {
        const tmpFolder = os.tmpdir();

        fs.writeFileSync(path.join(tmpFolder, "NuGetPackagingTest.txt"), "Some test content to add to the zip archive");
        const packageBuilder = new NuGetPackageBuilder();
        await packageBuilder.pack({
            packageId: "TestNuGetPackageRel",
            version: "1.0.1",
            basePath: tmpFolder,
            inputFilePatterns: ["NuGetPackagingTest.txt"],
            outputFolder: "RelativeFolderTest",
            overwrite: true,
            logger,
        });

        const expectedPackageFile = path.join("RelativeFolderTest", "TestNuGetPackageRel.1.0.1.nupkg");

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("NuGetPackagingTest.txt");
        expect(entry).not.toBeNull();
        await fs.rmSync("RelativeFolderTest", { recursive: true, force: true });
    });
});
