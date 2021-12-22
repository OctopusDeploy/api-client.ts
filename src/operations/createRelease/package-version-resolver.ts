import glob from "glob";
import path from "path";
import { SemVer, valid } from "semver";
import { PackageIdentity } from "./package-identity";
import { Client } from "../../client";

const WildCard = "*";

function packageKey(stepNameOrPackageId: string, referenceName: string) {
    return `${stepNameOrPackageId}:${referenceName}`.toLowerCase();
}

export interface IPackageVersionResolver {
    addFolder(folderPath: string): void;

    add(stepNameOrPackageId: string, packageReferenceName: string | undefined, packageVersion: string): void;

    setDefault(packageVersion: string): void;

    resolveVersion(stepName: string, packageId: string, packageReferenceName: string | undefined): string | undefined;
}

export class PackageVersionResolver implements IPackageVersionResolver {
    static readonly SupportedZipFilePatterns = ["*.zip", "*.tgz", "*.tar.gz", "*.tar.Z", "*.tar.bz2", "*.tar.bz", "*.tbz", "*.tar", "*.nupkg"];

    readonly stepNameToVersion = new Map<string, string>();
    defaultVersion: string | undefined;

    constructor(private readonly client: Client) {}

    async addFolder(folderPath: string) {
        const retrievePackages = async (pattern: string): Promise<string[]> => {
            return new Promise((resolve, reject) => {
                glob(`${folderPath}/**/${pattern}`, { }, (err, matches) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(matches);
                });
            });
        };
        this.client.debug(`Using package versions from '${folderPath}' folder`);
        const files = await retrievePackages(`*(${PackageVersionResolver.SupportedZipFilePatterns.map((v) => v).join("|")})`);
        for (const file of files) {
            this.client.debug(`Package file: ${file}`);
            const packageIdentity = this.tryParseIdAndVersion(file);
            if (packageIdentity) {
                this.add(packageIdentity.id, undefined, packageIdentity.version);
            }
        }
    }

    add3(stepNameOrPackageIdAndVersion: string) {
        const split = stepNameOrPackageIdAndVersion.split(/[:=/]+/);
        if (split.length < 2)
            throw new Error(`The package argument '${stepNameOrPackageIdAndVersion}' does not use expected format of : {Step Name}:{Version}`);

        const stepNameOrPackageId = split[0];
        const packageReferenceName = split.length > 2 ? split[1] : WildCard;
        const version = split.length > 2 ? split[2] : split[1];

        if (!stepNameOrPackageId || !version)
            throw new Error(`The package argument '${stepNameOrPackageIdAndVersion}' does not use expected format of : {Step Name}:{Version}`);

        this.add(stepNameOrPackageId, packageReferenceName, version);
    }

    addPackage(stepNameOrPackageId: string, packageVersion: string) {
        this.add(stepNameOrPackageId, "", packageVersion);
    }

    add(stepNameOrPackageId: string, packageReferenceName: string | undefined, packageVersion: string) {
        // Double wild card == default value
        if (stepNameOrPackageId === WildCard && packageReferenceName === WildCard) {
            this.setDefault(packageVersion);
            return;
        }

        const key = packageKey(stepNameOrPackageId, packageReferenceName ?? WildCard);
        const current = this.stepNameToVersion.get(key);
        if (current !== undefined) {
            const newVersion = new SemVer(packageVersion);
            const currentVersion = new SemVer(current);
            if (newVersion.compare(currentVersion) < 0) return;
        }

        this.stepNameToVersion.set(key, packageVersion);
    }

    setDefault(packageVersion: string) {
        if (valid(packageVersion) === null) {
            throw new Error("Invalid package version");
        }
        this.defaultVersion = packageVersion;
    }

    tryParseIdAndVersion(filename: string): PackageIdentity | undefined {
        let idAndVersion = path.basename(filename, path.extname(filename));
        const tarExtension = path.extname(idAndVersion);
        if (
            tarExtension.localeCompare(".tar", undefined, {
                sensitivity: "accent",
            }) === 0
        ) {
            idAndVersion = path.basename(idAndVersion, tarExtension);
        }

        const packageIdPattern = /(?<packageId>(\w+([_.-]\w+)*?))/;
        const semanticVersionPattern = new RegExp(
            "(?<semanticVersion>(\\d+(.\\d+){0,3}" + // Major Minor Patch
                "(-[0-9A-Za-z-]+(.[0-9A-Za-z-]+)*)?)" + // Pre-release identifiers
                "(\\+[0-9A-Za-z-]+(.[0-9A-Za-z-]+)*)?)"
        ); // Build Metadata

        const match = new RegExp(`^${packageIdPattern.source}\\.${semanticVersionPattern.source}$`).exec(idAndVersion);
        const packageIdMatch = match?.groups?.packageId;
        const versionMatch = match?.groups?.semanticVersion;

        if (!packageIdMatch || !versionMatch) {
            return;
        }

        const packageId = packageIdMatch;

        if (!valid(versionMatch)) {
            return;
        }

        return new PackageIdentity(packageId, versionMatch);
    }

    resolveVersion(stepName: string, packageId: string, packageReferenceName: string | undefined) {
        const identifiers = [stepName, packageId];
        return (
            identifiers
                .map((id) => packageKey(id, packageReferenceName ?? ""))
                .map((key) => this.stepNameToVersion.get(key) ?? undefined)
                .find((version) => version !== undefined) ??
            identifiers
                .flatMap((id) => [packageKey(WildCard, packageReferenceName ?? ""), packageKey(id, WildCard)])
                .map((key) => this.stepNameToVersion.get(key) ?? undefined)
                .find((version) => version !== undefined) ??
            this.defaultVersion
        );
    }
}
