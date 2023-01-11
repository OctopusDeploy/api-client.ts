import { PackArgs } from "./packArgs";
import { doZip } from "./zipUtils";

export type ZipPackArgs = {
    compressionLevel?: number;
} & PackArgs;

export class ZipPackageBuilder {
    async pack(args: ZipPackArgs): Promise<string> {
        const archiveFilename = `${args.packageId}.${args.version}.zip`;
        await doZip(args.basePath, args.inputFilePatterns, args.outputFolder, archiveFilename, args.logger, args.compressionLevel, args.overwrite);
        return archiveFilename;
    }
}
