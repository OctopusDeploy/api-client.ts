import type { Adapter, AdapterResponse } from "../adapter";
import { ClientOptions } from "../clientOptions";
import { AdapterError } from '../adapter';

export class KyAdapter<TResource> implements Adapter<TResource> {
    public async execute (options: ClientOptions): Promise<TResource & AdapterResponse> {
        const ky = (await import('ky'));
        try {
          const response = await ky.default(options.url, {
              body: JSON.stringify(options.requestBody),
              retry: {
                  limit: 0,
              },
              headers: {
                  "User-Agent": "browser-octopusdeploy",
                  "X-Octopus-ApiKey": options.configuration.apiKey
              },
              method: options.method,
          }).json();
          return {
            ...response as TResource,
            statusCode: (response as Response).status
          }
        } catch (error) {
            if (error instanceof ky.HTTPError) {
                throw new AdapterError(error.response.status.toString(), error.message);
            } else {
                console.error(error);
            }
        }
    }
}
