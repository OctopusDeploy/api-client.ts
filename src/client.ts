import type {
    GlobalRootLinks,
    PagingCollection,
    OctopusError,
    RootResource,
    SpaceRootLinks,
    SpaceResource,
    SpaceRootResource,
} from "@octopusdeploy/message-contracts";
import ApiClient from "./apiClient";
import { ClientConfiguration } from "./clientConfiguration";
import type { ClientErrorResponseDetails } from "./clientErrorResponseDetails";
import type { ClientRequestDetails } from "./clientRequestDetails";
import type { ClientResponseDetails } from "./clientResponseDetails";
import { ClientSession } from "./clientSession";
import Environment from "./environment";
import { Logger } from "./logger";
import { resolveSpaceId, isSpaceScopedOperation } from "./operations";
import { Resolver, RouteArgs } from "./resolver";
import { Callback, SubscriptionRecord } from "./subscriptionRecord";

const apiLocation = "~/api";

export type GlobalAndSpaceRootLinks = keyof GlobalRootLinks | keyof SpaceRootLinks;

// The Octopus Client implements the low-level semantics of the Octopus Deploy REST API
export class Client {
    requestSubscriptions = new SubscriptionRecord<ClientRequestDetails>();
    responseSubscriptions = new SubscriptionRecord<ClientResponseDetails>();
    errorSubscriptions = new SubscriptionRecord<ClientErrorResponseDetails>();
    private readonly logger: Logger;

    public static async create(configuration: ClientConfiguration): Promise<Client> {
        if (!configuration.instanceUri) {
            throw new Error("The host is not specified");
        }

        const resolver = new Resolver(configuration.instanceUri);
        const client = new Client(null, resolver, null, null, null, configuration);
        if (configuration.autoConnect) {
            try {
                await client.connect((message, error) => {
                    client.debug(`Attempting to connect to API endpoint...`);
                });
            } catch (error: unknown) {
                if (error instanceof Error) client.error("Could not connect", error);
                throw error;
            }
            if (configuration.space !== undefined && configuration.space !== "") {
                try {
                    await client.switchToSpace(configuration.space);
                } catch (error: unknown) {
                    if (error instanceof Error) client.error("Could not switch to space", error);
                    throw error;
                }
            }
        }
        return client;
    }

    onRequestCallback: (details: ClientRequestDetails) => void = undefined!;
    onResponseCallback: (details: ClientResponseDetails) => void = undefined!;
    onErrorResponseCallback: (details: ClientErrorResponseDetails) => void = undefined!;

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

    private constructor(
        readonly session: ClientSession | null,
        private readonly resolver: Resolver,
        private rootDocument: RootResource | null,
        public spaceId: string | null,
        private spaceRootDocument: SpaceRootResource | null,
        private readonly configuration: ClientConfiguration
    ) {
        this.configuration = configuration;
        this.logger = configuration.logging || {
            debug: (message) => {},
            info: (message) => {},
            warn: (message) => {},
            error: (message, err) => {},
        };
        this.resolver = resolver;
        this.rootDocument = rootDocument;
        this.spaceRootDocument = spaceRootDocument;
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

    connect(progressCallback: (message: string, error?: OctopusError) => void): Promise<void> {
        progressCallback("Checking credentials...");

        return new Promise((resolve, reject) => {
            if (this.rootDocument) {
                resolve();
                return;
            }

            const attempt = (success: any, fail: any) => {
                this.get(apiLocation).then((root) => {
                    success(root);
                }, fail);
            };

            const onSuccess = (root: RootResource) => {
                this.rootDocument = root;
                resolve();
            };

            const onFail = (err: OctopusError) => {
                progressCallback("Unable to connect.", err);
                reject(err);
            };

            attempt(onSuccess, onFail);
        });
    }

    disconnect() {
        this.rootDocument = null;
        this.spaceId = null;
        this.spaceRootDocument = null;
    }

    async forSpace(spaceId: string): Promise<Client> {
        const spaceRootResource = await this.get<SpaceRootResource>(this.rootDocument!.Links["SpaceHome"], { spaceId });
        return new Client(this.session, this.resolver, this.rootDocument, spaceId, spaceRootResource, this.configuration);
    }

    forSystem(): Client {
        return new Client(this.session, this.resolver, this.rootDocument, null, null, this.configuration);
    }

    async switchToSpace(spaceIdOrName: string): Promise<void> {
        if (this.rootDocument === null) {
            throw new Error(
                "Root document is null; this document is required for the API client. Please ensure that the API endpoint is accessible along with its root document."
            );
        }

        const spaceList = await this.get<PagingCollection<SpaceResource>>(this.rootDocument.Links["Spaces"]);
        const uppercaseSpaceIdOrName = spaceIdOrName.toUpperCase();
        var spaceResources = spaceList.Items.filter(
            (s: SpaceResource) => s.Name.toUpperCase() === uppercaseSpaceIdOrName || s.Id.toUpperCase() === uppercaseSpaceIdOrName
        );

        if (spaceResources.length == 1) {
            const spaceResource = spaceResources[0];
            this.spaceId = spaceResource.Id;
            this.spaceRootDocument = await this.get<SpaceRootResource>(spaceResource.Links["SpaceHome"]);
            return;
        }

        throw new Error(`Unable to uniquely identify a space using '${spaceIdOrName}'.`);
    }

    switchToSystem(): void {
        this.spaceId = null;
        this.spaceRootDocument = null;
    }

    get<TResource>(path: string | undefined, args?: RouteArgs): Promise<TResource> {
        if (path === undefined) return {} as Promise<TResource>;

        const url = this.resolveUrlWithSpaceId(path, args);
        return this.dispatchRequest("GET", url) as Promise<TResource>;
    }

    getRaw(path: string, args?: RouteArgs): Promise<string> {
        const url = this.resolve(path, args);

        return new Promise((resolve, reject) => {
            new ApiClient({
                configuration: this.configuration,
                session: this.session,
                url: url,
                method: "GET",
                error: (e) => reject(e),
                raw: true,
                success: (data) => resolve(data),
                tryGetServerInformation: () => this.tryGetServerInformation(),
                getAntiForgeryTokenCallback: () => this.getAntiforgeryToken(),
                onRequestCallback: (r) => this.onRequest(r),
                onResponseCallback: (r) => this.onResponse(r),
                onErrorResponseCallback: (r) => this.onErrorResponse(r),
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

    async do<TReturn>(path: string, command?: any, args?: RouteArgs): Promise<TReturn> {
        if (isSpaceScopedOperation(command)) {
            var spaceId = await resolveSpaceId(this, command.spaceName);
            args = { spaceId: spaceId, ...args};
            command = { spaceId: spaceId, ...command };
        }

        const url = this.resolveUrlWithSpaceId(path, args);
        return this.dispatchRequest("POST", url, command, true) as Promise<TReturn>;
    }

    post<TReturn>(path: string, resource?: any, args?: RouteArgs): Promise<TReturn> {
        const url = this.resolveUrlWithSpaceId(path, args);
        return this.dispatchRequest("POST", url, resource) as Promise<TReturn>;
    }

    create<TNewResource, TResource>(path: string, resource: TNewResource, args: RouteArgs): Promise<TResource> {
        const url = this.resolve(path, args);
        return new Promise((resolve, reject) => {
            this.dispatchRequest("POST", url, resource).then((result: any) => {
                const selfLink = result.Links?.Self;
                if (selfLink) {
                    const result2 = this.get<TResource>(selfLink);
                    resolve(result2);
                    return;
                }
                resolve(result);
            }, reject);
        });
    }

    update<TResource>(path: string, resource: TResource, args?: RouteArgs): Promise<TResource> {
        const url = this.resolve(path, args);
        return new Promise((resolve, reject) => {
            this.dispatchRequest("PUT", url, resource).then((result: any) => {
                const selfLink = result.Links?.Self;
                if (selfLink) {
                    const result2 = this.get<TResource>(selfLink);
                    resolve(result2);
                    return;
                }
                resolve(result);
            }, reject);
        });
    }

    del(path: string, resource?: any, args?: RouteArgs) {
        const url = this.resolve(path, args);
        return this.dispatchRequest("DELETE", url, resource);
    }

    put<TResource>(path: string, resource?: TResource, args?: RouteArgs): Promise<TResource> {
        const url = this.resolveUrlWithSpaceId(path, args);
        return this.dispatchRequest("PUT", url, resource) as Promise<TResource>;
    }

    getAntiforgeryToken() {
        if (!this.isConnected()) {
            return null;
        }

        const installationId = this.getGlobalRootDocument()!.InstallationId;
        if (!installationId) {
            return null;
        }

        // If we have come this far we know we are on a version of Octopus Server which supports anti-forgery tokens
        const antiforgeryCookieName = "Octopus-Csrf-Token_" + installationId;
        const antiforgeryCookies = document.cookie
            .split(";")
            .filter((c) => {
                return c.trim().indexOf(antiforgeryCookieName) === 0;
            })
            .map((c) => {
                return c.trim();
            });

        if (antiforgeryCookies && antiforgeryCookies.length === 1) {
            const antiforgeryToken = antiforgeryCookies[0].split("=")[1];
            return antiforgeryToken;
        } else {
            if (Environment.isInDevelopmentMode()) {
                return "FAKE TOKEN USED FOR DEVELOPMENT";
            }
            return null;
        }
    }

    resolveLinkTemplate(link: GlobalAndSpaceRootLinks, args: any) {
        return this.resolve(this.getLink(link), args);
    }

    getServerInformation() {
        if (!this.isConnected()) {
            throw new Error("The Octopus Client has not connected. THIS SHOULD NOT HAPPEN! Please notify support.");
        }
        return {
            version: this.rootDocument!.Version,
        };
    }

    tryGetServerInformation() {
        return this.rootDocument
            ? {
                  version: this.rootDocument.Version,
                  installationId: this.rootDocument.InstallationId,
              }
            : null;
    }

    throwIfClientNotConnected() {
        if (!this.isConnected()) {
            const errorMessage = `Can't get the link from the client, because the client has not yet been connected.`;
            throw new Error(errorMessage);
        }
    }

    getSystemLink<T>(linkGetter: (links: GlobalRootLinks) => T): T {
        this.throwIfClientNotConnected();
        const link = linkGetter(this.rootDocument!.Links);
        if (link === null) {
            const errorMessage = `Can't get the link for ${name} from the client, because it could not be found in the root document.`;
            throw new Error(errorMessage);
        }
        return link;
    }

    getLink(name: GlobalAndSpaceRootLinks): string {
        this.throwIfClientNotConnected();

        const spaceLinkExists = this.spaceRootDocument && this.spaceRootDocument.Links !== undefined && this.spaceRootDocument.Links[name];
        const link = spaceLinkExists ? this.spaceRootDocument!.Links[name] : this.rootDocument!.Links[name];
        if (!link) {
            const errorMessage = `Can't get the link for ${name} from the client, because it could not be found in the root document or the space root document.`;
            throw new Error(errorMessage);
        }
        return link;
    }

    private dispatchRequest(method: any, url: string, requestBody?: any, useCamelCase: boolean = false) {
        return new Promise((resolve, reject) => {
            new ApiClient({
                configuration: this.configuration,
                session: this.session,
                error: (e) => reject(e),
                method: method,
                url: url,
                requestBody,
                success: (data) => resolve(data),
                tryGetServerInformation: () => this.tryGetServerInformation(),
                getAntiForgeryTokenCallback: () => this.getAntiforgeryToken(),
                onRequestCallback: (r) => this.onRequest(r),
                onResponseCallback: (r) => this.onResponse(r),
                onErrorResponseCallback: (r) => this.onErrorResponse(r),
            }).execute(useCamelCase);
        });
    }

    isConnected() {
        return this.rootDocument !== null;
    }

    private getArgsWithSpaceId(args: RouteArgs) {
        return this.spaceId ? { spaceId: this.spaceId, ...args } : args;
    }

    private getGlobalRootDocument() {
        if (!this.isConnected()) {
            throw new Error("The Octopus Client has not connected.");
        }

        return this.rootDocument;
    }

    resolveUrlWithSpaceId(path: string, args?: RouteArgs): string {
        return this.resolve(path, this.getArgsWithSpaceId(args!));
    }
}
