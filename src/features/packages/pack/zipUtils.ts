import AdmZip from "adm-zip";
import fs from "fs";
import { glob } from "glob";
import path from "path";
import { promisify } from "util";
import { Logger } from "../../../logger";

const globp = promisify(glob);

/**
 * Creates a Zip file with a given filename from the inputFilePatterns.
 *
 * @param {string} basePath The base path for the input files.
 * @param {string[]} inputFilePatterns Array of input file patterns, relative to the basePath. Specific files and globbing patterns are both supported.
 * @param {string} outputFolder The folder to write the resulting Zip file to.
 * @param {string} zipFilename The name of the Zip file to create.
 * @param {Logger} logger Logger implementation for writing debug and info messages
 * @param {number} compressionLevel Optional override for the compression level. Defaults to 8 if not specified.
 * @param {boolean} overwrite Whether to overwrite the Zip file if it already exists. Defaults to true if not specified.
 */
export async function doZip(
    basePath: string,
    inputFilePatterns: string[],
    outputFolder: string,
    zipFilename: string,
    logger: Logger,
    compressionLevel?: number,
    overwrite?: boolean,
    logAddedFiles?: boolean
): Promise<void> {
    const archivePath = path.resolve(outputFolder, zipFilename);
    logger.info?.(`Writing to package: ${archivePath}...`);

    const initialWorkingDirectory = process.cwd();
    process.chdir(path.resolve(initialWorkingDirectory, basePath));

    const zip = new AdmZip();

    const files = await expandGlobs(inputFilePatterns);
    for (const file of files) {
        if (logAddedFiles === true) {
            logger.info?.(`Adding file: ${file}...`);
        } else {
            logger.debug?.(`Adding file: ${file}...`);
        }

        if (fs.lstatSync(file).isDirectory()) {
            zip.addFile(`${file}/`, Buffer.from([0x00]));
        } else {
            const dirName = path.dirname(file);
            zip.addLocalFile(file, dirName === "." ? "" : dirName);
        }
    }

    if (compressionLevel) {
        logger.info?.(`Overriding compression level: ${compressionLevel}`);
    }
    setCompressionLevel(zip, compressionLevel || 8);

    process.chdir(initialWorkingDirectory);

    await zip.writeZipPromise(archivePath, { overwrite: overwrite || true });
}

const setCompressionLevel = (zip: AdmZip, level: number): void => {
    const entries = zip.getEntries();
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry) {
            entry.header.method = level;
        }
    }
};

async function expandGlobs(filePatterns: string[]): Promise<string[]> {
    const files: string[] = [];

    for (const filePattern of filePatterns) {
        for (const fileName of filePattern.split(",")) {
            if (glob.hasMagic(fileName)) {
                const filePaths = await globp(fileName);
                for (const filePath of filePaths) {
                    files.push(filePath);
                }
            } else {
                files.push(fileName);
            }
        }
    }

    return files;
}
