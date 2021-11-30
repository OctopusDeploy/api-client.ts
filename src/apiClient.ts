import type { ClientOptions } from "./clientOptions";
import { OctopusError } from "@octopusdeploy/message-contracts";
import { ResponseDetails } from "./responseDetails";
import { ClientErrorResponseDetails } from "./clientErrorResponseDetails";

export default class ApiClient<TResource> {
    options: ClientOptions;

    constructor(options: ClientOptions) {
        this.options = options;
    }

    async execute() {
        try {
            if (typeof XMLHttpRequest === 'undefined') {
                const got = (await import('got')).default;
                try {
                    const response = await got({
                        agent: {
                            https: this.options.configuration.agent
                        },
                        body: JSON.stringify(this.options.requestBody),
                        retry: {
                            limit: 0
                        },
                        headers: {
                            "User-Agent": "node-octopusdeploy",
                            "X-Octopus-ApiKey": this.options.configuration.apiKey
                        },
                        method: this.options.method as any,
                        url: this.options.url,
                    }).json<TResource>();
                    this.handleSuccess(response);
                } catch (error) {
                    if (error instanceof got.RequestError) {
                        this.handleError(error);
                    } else {
                        console.error(error);
                    }
                }
            }
            else {
                const ky = (await (import('ky'))).default;
                const response = await ky(this.options.url, {
                    body: JSON.stringify(this.options.requestBody),
                    retry: {
                        limit: 0,
                    },
                    headers: {
                        "User-Agent": "browser-octopusdeploy",
                        "X-Octopus-ApiKey": this.options.configuration.apiKey
                    },
                    method: this.options.method as any,
                }).json<TResource>();
                this.handleSuccess(response);
            }
        }
        catch (error) {
            throw new Error (error);
        }
    }

    private handleSuccess = (response) => {
        if (this.options.onResponseCallback) {
            const details: ResponseDetails = {
                method: this.options.method as any,
                url: this.options.url,
                statusCode: response.statusCode,
            };
            this.options.onResponseCallback(details);
        }
        this.options.success(deserialize(JSON.stringify(response), this.options.raw));
    };

    private handleError = async (requestError) => {
        const err = generateOctopusError(requestError);
        if (this.options.onErrorResponseCallback) {
            const details: ClientErrorResponseDetails = {
                method: this.options.method as any,
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

const generateOctopusError = (requestError) => {
    if (requestError.code) {
        const code = requestError.code;
        return new OctopusError(parseInt(code), requestError.message);
    }
    return new OctopusError(0, requestError.message);
};