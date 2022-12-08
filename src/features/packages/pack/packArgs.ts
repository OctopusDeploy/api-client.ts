export type PackArgs = {
    packageId: string;
    version: string;
    inputFilePatterns: string[];
    outputFolder: string;
    overwrite?: boolean;
};
