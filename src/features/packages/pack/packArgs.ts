import { Logger } from "../../../logger";

export type PackArgs = {
    packageId: string;
    version: string;
    basePath: string;
    inputFilePatterns: string[];
    outputFolder: string;
    overwrite?: boolean;
    logger: Logger;
    logAddedFiles?: boolean;
};
