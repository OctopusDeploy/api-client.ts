import type { Adapter, AdapterResponse } from "../adapter";
import { AdapterError } from '../adapter';
import { ClientOptions } from "../clientOptions";
import type { Response, Method } from 'got';

export class GotAdapter<TResource> implements Adapter<TResource> {
    public async execute (options: ClientOptions): Promise<TResource & AdapterResponse> {
        const got = (await import('got')).default;
        try {
            const response = await got({
                agent: {
                    https: options.configuration.agent
                },
                body: JSON.stringify(options.requestBody),
                retry: {
                    limit: 0
                },
                headers: {
                    "User-Agent": "node-octopusdeploy",
                    "X-Octopus-ApiKey": options.configuration.apiKey
                },
                method: options.method as Method,
                url: options.url,
            }).json();
            return {
                ...response as TResource,
                statusCode: (response as Response).statusCode,
            }
        } catch (error) {
            if (error instanceof got.RequestError) {
                throw new AdapterError(error.code, error.message);
            } else {
                console.error(error);
            }
        }
    }
}
