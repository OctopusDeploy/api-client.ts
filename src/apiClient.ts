import got, { Response, Method, RequestError } from "got";
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
            const response: Response<TResource> = await got<TResource>({
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
                method: this.options.method as Method,
                url: this.options.url,
            }).json();
            this.handleSuccess(response);
        }
        catch (error) {
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