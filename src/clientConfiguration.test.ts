import { ClientConfiguration } from "./clientConfiguration";

export const EnvironmentVariables = {
    API_KEY: "OCTOPUS_TEST_API_KEY",
    URI: "OCTOPUS_TEST_URI",
} as const;

export function processConfiguration(configuration?: ClientConfiguration): ClientConfiguration {
    const apiKey = process.env[EnvironmentVariables.API_KEY] || "";
    const host = process.env[EnvironmentVariables.URI] || "";

    if (!configuration) {
        return {
            apiKey: apiKey,
            instanceUri: host,
            autoConnect: true,
        };
    }

    return {
        apiKey: !configuration.apiKey || configuration.apiKey.length === 0 ? apiKey : configuration.apiKey,
        instanceUri: !configuration.instanceUri || configuration.instanceUri.length === 0 ? host : configuration.instanceUri,
        autoConnect: configuration.autoConnect === undefined ? true : configuration.autoConnect,
    };
}

describe("configuration", () => {
    jest.setTimeout(10000);

    test("undefined", async () => {
        let configuration = processConfiguration();
        expect(configuration.apiKey).not.toBeNull();
        expect(configuration.instanceUri).not.toBeNull();
        expect(configuration.space).not.toBeNull();

        configuration = processConfiguration(undefined);
        expect(configuration.apiKey).not.toBeNull();
        expect(configuration.instanceUri).not.toBeNull();
        expect(configuration.space).not.toBeNull();
    });

    test("blank", async () => {
        const configuration: ClientConfiguration = {
            apiKey: "",
            instanceUri: "",
            space: "",
        };
        expect(configuration.apiKey).not.toBeNull();
        expect(configuration.instanceUri).not.toBeNull();
        expect(configuration.space).not.toBeNull();
    });
});
