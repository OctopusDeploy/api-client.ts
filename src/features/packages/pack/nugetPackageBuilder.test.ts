import { NuGetPackageBuilder } from "./nugetPackageBuilder";
import fs from "fs";
import os from "os";
import path from "path";
import AdmZip from "adm-zip";

describe("Can create a NuGet packages", () => {
    test("Can create with a single specific file", async () => {
        const tmpFolder = os.tmpdir();

        fs.writeFileSync(path.join(tmpFolder, "NuGetPackagingTest.txt"), "Some test content to add to the zip archive");
        const packageBuilder = new NuGetPackageBuilder();
        await packageBuilder.pack({
            packageId: "TestNuGetPackage",
            version: "1.0.1",
            inputFilePatterns: [path.join(tmpFolder, "NuGetPackagingTest.txt")],
            outputFolder: tmpFolder,
            overwrite: true,
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
            inputFilePatterns: ["src/features/packages/pack/*.ts"],
            outputFolder: tmpFolder,
            overwrite: true,
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
            inputFilePatterns: ["src/features/packages/pack/*.ts"],
            outputFolder: tmpFolder,
            overwrite: true,
            nuspecArgs: {
                description: "This is a test NuGet Package",
                authors: ["Test AuthorA", "Test AuthorB"],
            },
        });

        const expectedPackageFile = path.join(tmpFolder, `TestNuGetPackageWithSpec.1.0.0.nupkg`);

        expect(fs.existsSync(expectedPackageFile)).toBe(true);
        const zip = new AdmZip(expectedPackageFile);
        const entry = zip.getEntry("TestNuGetPackageWithSpec.nuspec");
        expect(entry).not.toBeNull();
    });
});
