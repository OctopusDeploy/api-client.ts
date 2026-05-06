import { isLocalOctopusVersion, isServerVersionAtLeast, ensureServerVersionAtLeast } from "./versionCheck";
import type { Client } from "./client";

describe("isLocalOctopusVersion", () => {
    test.each([
        ["0.0.0", true],
        ["0.0.0-local", true],
        ["0.0.0-local-build.5", true],
        ["0.0.0+sha1234", true],
        ["0.0.0-alpha+sha1234", true],
        ["0.0.1", false],
        ["0.0.10", false],
        ["1.0.0", false],
        ["2022.3.5512", false],
        ["", false],
    ])("isLocalOctopusVersion(%s) === %s", (version, expected) => {
        expect(isLocalOctopusVersion(version as string)).toBe(expected);
    });
});

describe("isServerVersionAtLeast", () => {
    const min = "2022.3.5512";

    test("returns true when server version is greater than minimum", () => {
        expect(isServerVersionAtLeast("2023.1.0", min)).toBe(true);
    });

    test("returns true when server version equals minimum", () => {
        expect(isServerVersionAtLeast("2022.3.5512", min)).toBe(true);
    });

    test("returns false when server version is below minimum", () => {
        expect(isServerVersionAtLeast("2022.3.5511", min)).toBe(false);
        expect(isServerVersionAtLeast("2021.1.0", min)).toBe(false);
    });

    test("returns true for local development versions regardless of minimum", () => {
        expect(isServerVersionAtLeast("0.0.0", min)).toBe(true);
        expect(isServerVersionAtLeast("0.0.0-local", min)).toBe(true);
        expect(isServerVersionAtLeast("0.0.0+sha1234", min)).toBe(true);
    });

    test("returns false for invalid version strings", () => {
        expect(isServerVersionAtLeast("not-a-version", min)).toBe(false);
        expect(isServerVersionAtLeast("", min)).toBe(false);
    });
});

describe("ensureServerVersionAtLeast", () => {
    const min = "2022.3.5512";
    const feature = "creating releases using the Executions API";
    const expectedMessage =
        `The Octopus instance doesn't support creating releases using the Executions API, ` +
        `it will need to be upgraded to at least 2022.3.5512 in order to access this API.`;

    function stubClient(version: string): { client: Client; errorCalls: string[] } {
        const errorCalls: string[] = [];
        const client = {
            getServerInformation: async () => ({ version, installationId: "test" }),
            error: (msg: string) => errorCalls.push(msg),
        } as unknown as Client;
        return { client, errorCalls };
    }

    test("resolves silently when server version satisfies minimum", async () => {
        const { client, errorCalls } = stubClient("2022.3.5512");
        await expect(ensureServerVersionAtLeast(client, min, feature)).resolves.toBeUndefined();
        expect(errorCalls).toEqual([]);
    });

    test("resolves silently for local development versions", async () => {
        const { client, errorCalls } = stubClient("0.0.0-local");
        await expect(ensureServerVersionAtLeast(client, min, feature)).resolves.toBeUndefined();
        expect(errorCalls).toEqual([]);
    });

    test("throws and logs identical message when server version is too old", async () => {
        const { client, errorCalls } = stubClient("2022.3.5511");
        await expect(ensureServerVersionAtLeast(client, min, feature)).rejects.toThrow(expectedMessage);
        expect(errorCalls).toEqual([expectedMessage]);
    });

    test("does not throw if client.error is undefined", async () => {
        const client = {
            getServerInformation: async () => ({ version: "2022.3.5511", installationId: "test" }),
            error: undefined,
        } as unknown as Client;
        await expect(ensureServerVersionAtLeast(client, min, feature)).rejects.toThrow(expectedMessage);
    });
});
