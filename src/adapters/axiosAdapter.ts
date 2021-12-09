import type { Adapter, AdapterResponse } from "../adapter";
import type { AxiosRequestConfig, Method } from "axios";
import { ClientOptions } from "../clientOptions";
import { AdapterError } from '../adapter';
import axios from 'axios';

export class AxiosAdapter<TResource> implements Adapter<TResource> {
    public async execute (options: ClientOptions): Promise<TResource & AdapterResponse> {
        try {
            const config: AxiosRequestConfig = {
                httpsAgent: options.configuration.agent,
                url: options.url,
                method: options.method as Method,
                data: options.requestBody,
                headers: {
                    "X-Octopus-ApiKey": options.configuration.apiKey ?? ''
                },
                responseType: "json", 
            };
            if (typeof XMLHttpRequest === 'undefined') {
                if (config.headers) {
                    config.headers["User-Agent"] = "ts-octopusdeploy";
                }
            }
            const response = await axios.request<TResource>(config);
            
            return {
                ...response.data,
                statusCode: response.status
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new AdapterError(error.response.status, error.message);
            } else {
                throw error;
            }
        }
    }
}
