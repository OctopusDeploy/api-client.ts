import { ClientConfiguration } from "./clientConfiguration";
import { EnvironmentVariables } from "./environmentVariables.test";

export function processConfiguration(configuration?: ClientConfiguration): ClientConfiguration {
    const apiKey = process.env[EnvironmentVariables.ApiKey] || "";
    const host = process.env[EnvironmentVariables.URL] || "";

    if (!configuration) {
        return {
            apiKey: apiKey,
            apiUri: host,
            autoConnect: true,
        };
    }

    return {
        apiKey: !configuration.apiKey || configuration.apiKey.length === 0 ? apiKey : configuration.apiKey,
        apiUri: !configuration.apiUri || configuration.apiUri.length === 0 ? host : configuration.apiUri,
        autoConnect: configuration.autoConnect === undefined ? true : configuration.autoConnect,
    };
}

describe("configuration", () => {
    jest.setTimeout(10000);

    test("undefined", async () => {
        let configuration = processConfiguration();
        expect(configuration.apiKey).not.toBeNull();
        expect(configuration.apiUri).not.toBeNull();
        expect(configuration.space).not.toBeNull();

        configuration = processConfiguration(undefined);
        expect(configuration.apiKey).not.toBeNull();
        expect(configuration.apiUri).not.toBeNull();
        expect(configuration.space).not.toBeNull();
    });

    test("blank", async () => {
        const configuration: ClientConfiguration = {
            apiKey: "",
            apiUri: "",
            space: "",
        };
        expect(configuration.apiKey).not.toBeNull();
        expect(configuration.apiUri).not.toBeNull();
        expect(configuration.space).not.toBeNull();
    });
});
