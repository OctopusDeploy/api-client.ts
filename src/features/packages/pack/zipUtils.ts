import AdmZip from "adm-zip";
import { glob } from "glob";
import path from "path";
import { promisify } from "util";

const globp = promisify(glob);

export async function doZip(
    inputFilePatterns: string[],
    outputFolder: string,
    zipFilename: string,
    compressionLevel?: number,
    overwrite?: boolean
): Promise<void> {
    const archivePath = path.join(outputFolder, zipFilename);
    const zip = new AdmZip();

    const files = await expandGlobs(inputFilePatterns);
    for (const file of files) {
        zip.addLocalFile(file);
    }

    setCompressionLevel(zip, compressionLevel || 8);
    await zip.writeZipPromise(archivePath, { overwrite: overwrite });
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
