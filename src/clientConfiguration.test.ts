import { ClientConfiguration, processConfiguration } from "./clientConfiguration";

describe("configuration", () => {
    test("undefined", async () => {
        let configuration = processConfiguration();
        expect(configuration.apiKey).not.toBeNull();
        expect(configuration.apiUri).not.toBeNull();
        expect(configuration.space).toBeUndefined();

        configuration = processConfiguration(undefined);
        expect(configuration.apiKey).not.toBeNull();
        expect(configuration.apiUri).not.toBeNull();
        expect(configuration.space).toBeUndefined();
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
