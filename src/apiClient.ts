import { OctopusError } from "@octopusdeploy/message-contracts";
import type { Adapter, AdapterResponse } from "./adapter";
import { AdapterError } from "./adapter";
import { AxiosAdapter } from "./adapters/axiosAdapter";
import { ClientErrorResponseDetails } from "./clientErrorResponseDetails";
import type { ClientOptions } from "./clientOptions";
import { ResponseDetails } from "./responseDetails";

export default class ApiClient<TResource> {
    options: ClientOptions;
    adapter: Adapter<TResource>;

    constructor(options: ClientOptions) {
        this.options = options;
        this.adapter = new AxiosAdapter<TResource>();
    }

    async execute(useCamelCase: boolean = false) {
        try {
            const response = await this.adapter.execute(this.options);
            this.handleSuccess(response, useCamelCase);
        } catch (error: unknown) {
            if (error instanceof AdapterError) {
                this.handleError(error);
            } else if (error instanceof Error) {
                this.options.error(error);
            } else {
                this.options.error(Error(`An unknown error occurred: ${error}`));
            }
        }
    }

    private handleSuccess = (response: AdapterResponse<TResource>, useCamelCase: boolean) => {
        if (this.options.onResponseCallback) {
            const details: ResponseDetails = {
                method: this.options.method as any,
                url: this.options.url,
                statusCode: response.statusCode,
            };
            this.options.onResponseCallback(details);
        }

        let responseText: string = "";

        if (this.options.raw) {
            responseText = response.data as unknown as string;
        } else {
            responseText = JSON.stringify(response.data);
            if (responseText && responseText.length > 0) {
                responseText = JSON.parse(responseText, (_, val) => {
                    if (Array.isArray(val) || typeof val !== "object" || !useCamelCase) {
                        return val;
                    }
                    return Object.entries(val).reduce((a, [key, val]) => {
                        const b = a as any;
                        const field = key[0].toLowerCase() + key.substring(1);
                        b[field] = val;
                        return a;
                    }, {});
                });
            }
        }

        this.options.success(responseText);
    };

    private handleError = (requestError: AdapterError) => {
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

const generateOctopusError = (requestError: AdapterError) => {
    if (requestError.code) {
        const code = requestError.code;
        return new OctopusError(code, requestError.message);
    }
    return new OctopusError(0, requestError.message);
};
