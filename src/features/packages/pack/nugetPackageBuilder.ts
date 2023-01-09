import { PackArgs } from "./packArgs";
import { doZip } from "./zipUtils";
import fs from "fs";
import os from "os";
import path from "path";

type NuSpecArgs = {
    description: string;
    authors: string[];
    title?: string;
    releaseNotes?: string;
};

type NuGetPackArgs = {
    nuspecArgs?: NuSpecArgs;
} & PackArgs;

export class NuGetPackageBuilder {
    async pack(args: NuGetPackArgs): Promise<string> {
        const archiveFilename = `${args.packageId}.${args.version}.nupkg`;
        const inputFilePatterns = args.inputFilePatterns;

        if (args.nuspecArgs) {
            const nuspecFilename = `${args.packageId}.nuspec`;
            const nuspecFile = path.join(args.basePath, nuspecFilename);
            fs.writeFileSync(nuspecFile, '<?xml version="1.0" encoding="utf-8"?>\n');
            fs.appendFileSync(nuspecFile, '<package xmlns="http://schemas.microsoft.com/packaging/2010/07/nuspec.xsd">\n');
            fs.appendFileSync(nuspecFile, "    <metadata>\n");
            fs.appendFileSync(nuspecFile, `        <id>${args.packageId}</id>\n`);
            fs.appendFileSync(nuspecFile, `        <version>${args.version}</version>\n`);
            fs.appendFileSync(nuspecFile, `        <description>${args.nuspecArgs.description}</description>\n`);
            fs.appendFileSync(nuspecFile, `        <authors>${args.nuspecArgs.authors.join(",")}</authors>\n`);

            if (args.nuspecArgs.title) {
                fs.appendFileSync(nuspecFile, `        <title>${args.nuspecArgs.title}</title>\n`);
            }

            if (args.nuspecArgs.releaseNotes) {
                fs.appendFileSync(nuspecFile, `        <releaseNotes>${args.nuspecArgs.releaseNotes}</releaseNotes>\n`);
            }

            fs.appendFileSync(nuspecFile, "    </metadata>\n");
            fs.appendFileSync(nuspecFile, "</package>\n");

            // include the nuspec into the package
            inputFilePatterns.push(nuspecFilename);
        }

        await doZip(args.basePath, inputFilePatterns, args.outputFolder, archiveFilename, args.logger, 8, args.overwrite);

        return archiveFilename;
    }
}
