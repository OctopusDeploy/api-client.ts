import { PackArgs } from "./packArgs";
import { doZip } from "./zipUtils";

type ZipPackArgs = {
    compressionLevel?: number;
} & PackArgs;

export class ZipPackageBuilder {
    async pack(args: ZipPackArgs): Promise<string> {
        const archiveFilename = `${args.packageId}.${args.version}.zip`;
        await doZip(args.inputFilePatterns, args.outputFolder, archiveFilename, args.compressionLevel, args.overwrite);
        return archiveFilename;
    }
}
