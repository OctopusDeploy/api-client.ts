import type { RawAxiosRequestHeaders } from "axios";
import { ClientConfiguration } from "../clientConfiguration";
import { ClientOptions } from "../clientOptions";
import { forEach } from "lodash";

export function createRequestHeaders(clientOptions: ClientOptions): RawAxiosRequestHeaders {
    const configuration = clientOptions.configuration;
    const headers: RawAxiosRequestHeaders = {
        "Accept-Encoding": "gzip,deflate,compress", // HACK: required for https://github.com/axios/axios/issues/5346 -- this line can be removed once this bug has been fixed
    };
    if (configuration.apiKey) {
        headers["X-Octopus-ApiKey"] = configuration.apiKey;
    }
    if (configuration.accessToken) {
        headers["Authorization"] = `Bearer ${configuration.accessToken}`;
    }
    if (!configuration.accessToken && !configuration.apiKey) {
        // Backward compatibility: Add the api key header in with a blank value
        headers["X-Octopus-ApiKey"] = "";
    }

    if (clientOptions.headers) {
        for (const k of Object.keys(clientOptions.headers)) {
            headers[k] = clientOptions.headers[k];
        }
    }

    return headers;
}
