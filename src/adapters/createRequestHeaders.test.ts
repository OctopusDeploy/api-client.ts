import { ClientConfiguration } from "../clientConfiguration";
import { createRequestHeaders } from "./createRequestHeaders";

describe("createRequestHeaders", () => {
    test("when api key is provided it is put into the correct request header", () => {
        const configuration: ClientConfiguration = {
            instanceURL: "https://my.octopus.app",
            userAgentApp: "createRequestHeader-tests",
            apiKey: "api-key",
        };

        const headers = createRequestHeaders(configuration);

        expect(headers).toEqual({
            "Accept-Encoding": "gzip,deflate,compress",
            "X-Octopus-ApiKey": "api-key",
        });
    });

    test("when an access token is provided it is put into the correct request header", () => {
        const configuration: ClientConfiguration = {
            instanceURL: "https://my.octopus.app",
            userAgentApp: "createRequestHeader-tests",
            accessToken: "access-token",
        };

        const headers = createRequestHeaders(configuration);

        expect(headers).toEqual({
            "Accept-Encoding": "gzip,deflate,compress",
            Authorization: "Bearer access-token",
        });
    });

    test("when neither an access token or api key is provided then the correct api key header is filled in for backward compatibility", () => {
        const configuration: ClientConfiguration = {
            instanceURL: "https://my.octopus.app",
            userAgentApp: "createRequestHeader-tests",
        };

        const headers = createRequestHeaders(configuration);

        expect(headers).toEqual({
            "Accept-Encoding": "gzip,deflate,compress",
            "X-Octopus-ApiKey": "",
        });
    });
});
