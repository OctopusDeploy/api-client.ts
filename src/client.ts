import ApiClient from "./apiClient";
import { ClientConfiguration } from "./clientConfiguration";
import type { ClientErrorResponseDetails } from "./clientErrorResponseDetails";
import type { ClientRequestDetails } from "./clientRequestDetails";
import type { ClientResponseDetails } from "./clientResponseDetails";
import { Logger } from "./logger";
import { Resolver, RouteArgs } from "./resolver";
import { Callback, SubscriptionRecord } from "./subscriptionRecord";
import { ServerInformation } from "./serverInformation";
import { isSpaceScopedOperation } from "./spaceScopedOperation";
import { resolveSpaceId } from "./spaceResolver";
import { isSpaceScopedArgs } from "./spaceScopedArgs";
import { isSpaceScopedRequest } from "./spaceScopedRequest";
import { apiLocation } from "./apiLocation";

interface RootResource {
    Application: string;
    Version: string;
    ApiVersion: string;
    InstallationId: string;
}

// The Octopus Client implements the low-level semantics of the Octopus Deploy REST API
export class Client {
    requestSubscriptions = new SubscriptionRecord<ClientRequestDetails>();
    responseSubscriptions = new SubscriptionRecord<ClientResponseDetails>();
    errorSubscriptions = new SubscriptionRecord<ClientErrorResponseDetails>();
    private readonly logger: Logger;
    private serverInformation?: ServerInformation | null;

    public static async create(configuration: ClientConfiguration): Promise<Client> {
        if (!configuration.instanceURL) {
            throw new Error("The host is not specified");
        }

        const resolver = new Resolver(configuration.instanceURL);
        const client = new Client(resolver, configuration);
        await client.getServerInformation();
        return client;
    }

    onRequestCallback?: (details: ClientRequestDetails) => void = undefined;
    onResponseCallback?: (details: ClientResponseDetails) => void = undefined;
    onErrorResponseCallback?: (details: ClientErrorResponseDetails) => void = undefined;

    debug = (message: string) => {
        this.logger.debug && this.logger.debug(message);
    };

    info = (message: string) => {
        this.logger.info && this.logger.info(message);
    };

    warn = (message: string) => {
        this.logger.warn && this.logger.warn(message);
    };

    error = (message: string, error: Error | undefined = undefined) => {
        this.logger.error && this.logger.error(message, error);
    };

    private constructor(private readonly resolver: Resolver, private readonly configuration: ClientConfiguration) {
        this.configuration = configuration;
        this.logger = configuration.logging || {
            debug: (message) => null,
            info: (message) => null,
            warn: (message) => null,
            error: (message, err) => null,
        };
        this.resolver = resolver;
    }

    subscribeToRequests = (registrationName: string, callback: Callback<ClientRequestDetails>) => {
        return this.requestSubscriptions.subscribe(registrationName, callback);
    };

    subscribeToResponses = (registrationName: string, callback: Callback<ClientResponseDetails>) => {
        return this.responseSubscriptions.subscribe(registrationName, callback);
    };

    subscribeToErrors = (registrationName: string, callback: (details: ClientErrorResponseDetails) => void) => {
        return this.errorSubscriptions.subscribe(registrationName, callback);
    };

    setOnRequestCallback = (callback: (details: ClientRequestDetails) => void) => {
        this.onRequestCallback = callback;
    };

    setOnResponseCallback = (callback: (details: ClientResponseDetails) => void) => {
        this.onResponseCallback = callback;
    };

    setOnErrorResponseCallback = (callback: (details: ClientErrorResponseDetails) => void) => {
        this.onErrorResponseCallback = callback;
    };

    resolve = (path: string, uriTemplateParameters?: RouteArgs) => this.resolver.resolve(path, uriTemplateParameters);

    get<TResource>(path: string | undefined, args?: RouteArgs): Promise<TResource> {
        if (path === undefined) throw new Error("path parameter was not");

        const url = this.resolveUrl(path, args);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return this.dispatchRequest("GET", url) as Promise<TResource>;
    }

    getRaw(path: string, args?: RouteArgs, customHeaders?: { [key:string]: string } ): Promise<string> {
        const url = this.resolve(path, args);

        return new Promise((resolve, reject) => {
            new ApiClient({
                configuration: this.configuration,
                url: url,
                method: "GET",
                error: (e) => reject(e),
                raw: true,
                success: (data) => resolve(data),
                onRequestCallback: (r) => this.onRequest(r),
                onResponseCallback: (r) => this.onResponse(r),
                onErrorResponseCallback: (r) => this.onErrorResponse(r),
                headers: customHeaders,
            }).execute();
        });
    }

    onRequest(clientRequestDetails: ClientRequestDetails) {
        const details = {
            url: clientRequestDetails.url,
            method: clientRequestDetails.method,
        };

        if (this.onRequestCallback) {
            this.onRequestCallback(details);
        }

        this.requestSubscriptions.notifyAll(details);
    }

    onResponse(clientResponseDetails: ClientResponseDetails) {
        const details = {
            url: clientResponseDetails.url,
            method: clientResponseDetails.method,
            statusCode: clientResponseDetails.statusCode,
        };

        if (this.onResponseCallback) {
            this.onResponseCallback(details);
        }
        this.responseSubscriptions.notifyAll(details);
    }

    onErrorResponse(clientErrorResponseDetails: ClientErrorResponseDetails) {
        const details = {
            url: clientErrorResponseDetails.url,
            method: clientErrorResponseDetails.method,
            statusCode: clientErrorResponseDetails.statusCode,
            errorMessage: clientErrorResponseDetails.errorMessage,
            errors: clientErrorResponseDetails.errors,
        };

        if (this.onErrorResponseCallback) {
            this.onErrorResponseCallback(details);
        }

        this.errorSubscriptions.notifyAll(details);
    }

    async doCreate<TReturn>(path: string, command?: any, args?: RouteArgs): Promise<TReturn> {
        return this.doCommand<TReturn>("POST", path, command, args);
    }

    async doUpdate<TReturn>(path: string, command?: any, args?: RouteArgs): Promise<TReturn> {
        return this.doCommand<TReturn>("PUT", path, command, args);
    }

    private async doCommand<TReturn>(verb: string, path: string, command?: any, args?: RouteArgs): Promise<TReturn> {
        if (isSpaceScopedOperation(command)) {
            const spaceId = await resolveSpaceId(this, command.spaceName);
            args = { spaceId: spaceId, ...args };
            command = { spaceId: spaceId, ...command };
        }
        if (args && isSpaceScopedArgs(args)) {
            const spaceId = await resolveSpaceId(this, args.spaceName);
            args = { spaceId: spaceId, ...args };
        }

        const url = this.resolveUrl(path, args);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return this.dispatchRequest(verb, url, command) as Promise<TReturn>;
    }

    async request<TReturn>(path: string, request?: any): Promise<TReturn> {
        if (isSpaceScopedRequest(request)) {
            const spaceId = await resolveSpaceId(this, request.spaceName);
            request = { spaceId: spaceId, ...request };
        }

        const url = this.resolveUrl(path, request);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return this.dispatchRequest("GET", url, null) as Promise<TReturn>;
    }

    post<TReturn>(path: string, resource?: any, args?: RouteArgs, customHeaders: { [key: string]: string }): Promise<TReturn> {
        const url = this.resolveUrl(path, args);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return this.dispatchRequest("POST", url, resource) as Promise<TReturn>;
    }

    async del(path: string, args?: RouteArgs) {
        if (args && isSpaceScopedArgs(args)) {
            const spaceId = await resolveSpaceId(this, args.spaceName);
            args = { spaceId: spaceId, ...args };
        }
        const url = this.resolve(path, args);
        return this.dispatchRequest("DELETE", url, undefined);
    }

    async getServerInformation(): Promise<ServerInformation> {
        if (!this.serverInformation) {
            this.serverInformation = await this.tryGetServerInformation();
            if (!this.serverInformation) {
                throw new Error("The Octopus server information could not be retrieved. Please check the configured URL.");
            }
        }
        return this.serverInformation;
    }

    async tryGetServerInformation(): Promise<ServerInformation | null> {
        const rootDocument = await this.get<RootResource>(apiLocation);
        return rootDocument
            ? {
                  version: rootDocument.Version,
                  installationId: rootDocument.InstallationId,
              }
            : null;
    }

    private dispatchRequest(method: any, url: string, requestBody?: any, customHeaders?: { [key: string]: string }) {
        return new Promise((resolve, reject) => {
            new ApiClient({
                configuration: this.configuration,
                error: (e) => reject(e),
                method: method,
                url: url,
                requestBody,
                success: (data) => resolve(data),
                onRequestCallback: (r) => this.onRequest(r),
                onResponseCallback: (r) => this.onResponse(r),
                onErrorResponseCallback: (r) => this.onErrorResponse(r),
                headers: customHeaders,
            }).execute();
        });
    }

    resolveUrl(path: string, args?: RouteArgs): string {
        return this.resolve(path, args);
    }
}
