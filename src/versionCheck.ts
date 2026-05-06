import { lt, valid } from "semver";
import type { Client } from "./client";

// Local development builds of Octopus report a version of "0.0.0" (optionally with a
// prerelease tag like "-local" or build metadata). Treat those as "latest" so version
// gates do not block developers running against a locally-built server.
export function isLocalOctopusVersion(version: string): boolean {
    return /^0\.0\.0(?:[-+].*)?$/.test(version);
}

// Returns true when the running server's version satisfies the minimum, OR when the
// running server is a local development build.
export function isServerVersionAtLeast(serverVersion: string, minimumVersion: string): boolean {
    if (isLocalOctopusVersion(serverVersion)) return true;
    if (!valid(serverVersion)) return false;
    return !lt(serverVersion, minimumVersion);
}

// Looks up the running server's version and throws a uniform error if it is too old.
// `featureDescription` is the snippet that fills the "<FEATURE>" slot in the error
// template (e.g. "creating releases using the Executions API").
export async function ensureServerVersionAtLeast(client: Client, minimumVersion: string, featureDescription: string): Promise<void> {
    const serverInformation = await client.getServerInformation();
    if (isServerVersionAtLeast(serverInformation.version, minimumVersion)) return;

    const message = `The Octopus instance doesn't support ${featureDescription}, it will need to be upgraded to at least ${minimumVersion} in order to access this API.`;
    client.error?.(message);
    throw new Error(message);
}
