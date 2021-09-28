import got, { Response, Method, RequestError } from "got";
import type { ClientOptions } from "./clientOptions";
import { OctopusError } from "@octopusdeploy/message-contracts";
import { ResponseDetails } from "./responseDetails";
import { ClientErrorResponseDetails } from "./clientErrorResponseDetails";
// let Agent = require('keepalive-proxy-agent')

export default class ApiClient<TResource> {
    options: ClientOptions;

    constructor(options: ClientOptions) {
        this.options = options;
    }

    async execute() {
        const body = JSON.stringify(this.options.requestBody);
        const method = this.options.method as Method;

        // NOTE: You can direct traffic through a proxy trace like Fiddler
        // Everywhere by preconfiguring the client to route traffic through a
        // proxy.
        //
        // const agent = new Agent({ proxy: { hostname: "127.0.0.1", port: 8866 } });

        try {
            const response: Response<TResource> = await got<TResource>({
                // agent: {
                //     https: agent
                // },
                body: body,
                retry: {
                    limit: 0
                },
                headers: {
                    "User-Agent": "node-octopusdeploy",
                    "X-Octopus-ApiKey": this.options.configuration.apiKey
                },
                method: method,
                url: this.options.url,
            }).json();
            this.handleSuccess(response);
        }
        catch (error) {
            console.error(error);
            if (error instanceof RequestError) {
                this.handleError(error);
            }
        }
    }

    private handleSuccess = (response: Response<TResource>) => {
        if (this.options.onResponseCallback) {
            const details: ResponseDetails = {
                method: this.options.method as Method,
                url: this.options.url,
                statusCode: response.statusCode,
            };
            this.options.onResponseCallback(details);
        }
        this.options.success(deserialize(JSON.stringify(response), this.options.raw));
    };

    private handleError = async (requestError: RequestError) => {
        const err = generateOctopusError(requestError);
        if (this.options.onErrorResponseCallback) {
            const details: ClientErrorResponseDetails = {
                method: this.options.method as Method,
                url: this.options.url,
                statusCode: err.StatusCode,
                errorMessage: err.ErrorMessage,
                errors: err.Errors,
            };
            this.options.onErrorResponseCallback(details);
        }
        this.options.error(err);
    };
}

const deserialize = (responseText?: string, raw?: boolean, forceJson: boolean = false) => {
    if (raw && !forceJson) return responseText;
    if (responseText && responseText.length) return JSON.parse(responseText);
    return null;
};

const generateOctopusError = (requestError: RequestError) => {
    if (requestError.code) {
        const code = requestError.code;
        return new OctopusError(parseInt(code), requestError.message);
    }
    return new OctopusError(0, requestError.message);
};