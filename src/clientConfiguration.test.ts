import { ClientConfiguration } from "./clientConfiguration";
import { Logger } from "./logger";

export const EnvironmentVariables = {
    API_KEY: "OCTOPUS_TEST_API_KEY",
    URI: "OCTOPUS_TEST_URI",
} as const;

export function processConfiguration(configuration?: ClientConfiguration): ClientConfiguration {
    const apiKey = process.env[EnvironmentVariables.API_KEY] || "";
    const host = process.env[EnvironmentVariables.URI] || "";

    const logger: Logger = {
        debug: (message) => console.log(message),
        info: (message) => console.log(message),
        warn: (message) => console.warn(message),
        error: (message, err) => {
            if (err !== undefined) {
                console.error(err.message);
            } else {
                console.error(message);
            }
        }
    }

    if (!configuration) {
        return {
            apiKey: apiKey,
            instanceUri: host,
            autoConnect: true,
            logging: logger
        };
    }

    return {
        apiKey: !configuration.apiKey || configuration.apiKey.length === 0 ? apiKey : configuration.apiKey,
        instanceUri: !configuration.instanceUri || configuration.instanceUri.length === 0 ? host : configuration.instanceUri,
        autoConnect: configuration.autoConnect === undefined ? true : configuration.autoConnect,
        logging: logger
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
