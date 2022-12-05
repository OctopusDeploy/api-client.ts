import { OctopusError } from "./octopusError";
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

    async execute() {
        try {
            const response = await this.adapter.execute(this.options);
            this.handleSuccess(response);
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

    private handleSuccess = (response: AdapterResponse<TResource>) => {
        if (this.options.onResponseCallback) {
            const details: ResponseDetails = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
                method: this.options.method as any,
                url: this.options.url,
                statusCode: response.statusCode,
            };
            this.options.onResponseCallback(details);
        }

        let responseText: string = "";

        if (this.options.raw) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            responseText = response.data as unknown as string;
        } else {
            responseText = JSON.stringify(response.data);
            if (responseText && responseText.length > 0) {
                responseText = JSON.parse(responseText);
            }
        }

        this.options.success(responseText);
    };

    private handleError = (requestError: AdapterError) => {
        const err = generateOctopusError(requestError);
        if (this.options.onErrorResponseCallback) {
            const details: ClientErrorResponseDetails = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
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

const generateOctopusError = (requestError: AdapterError) => {
    if (requestError.code) {
        const code = requestError.code;
        return new OctopusError(code, requestError.message);
    }
    return new OctopusError(0, requestError.message);
};
