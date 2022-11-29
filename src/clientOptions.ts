import type { ClientConfiguration } from "./clientConfiguration";
import type { ClientErrorResponseDetails } from "./clientErrorResponseDetails";
import type { ClientRequestDetails } from "./clientRequestDetails";
import type { ClientResponseDetails } from "./clientResponseDetails";
import type { ServerInformation } from "./serverInformation";

export interface ClientOptions {
    configuration: ClientConfiguration;
    url: string;
    method?: string;
    success: (data: PromiseLike<string> | string) => void;
    error: (error: Error) => void;
    raw?: boolean;
    requestBody?: any;
    nonStale?: boolean;
    onRequestCallback: (details: ClientRequestDetails) => void;
    onResponseCallback: (details: ClientResponseDetails) => void;
    onErrorResponseCallback: (details: ClientErrorResponseDetails) => void;
}
