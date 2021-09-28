/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import URI = require("urijs");
import URITemplate = require("urijs/src/URITemplate");

// The Resolver is used to take URI's like "/api/foo/bar" and turn them into
// fully qualified URI's depending on the Octopus
// server we are talking to (e.g.,
// http://your-octopus/api/foo/bar or perhaps even, http://your-octopus/vdir1/vdir2/api/foo/bar).

// Only very specific types are supported, so let's constrain what can be passed in to stop people making mistakes
type RouteParameterSimpleTypes = string | number | boolean;
type RouteParameter = RouteParameterSimpleTypes | RouteParameterSimpleTypes[] | undefined | null;
type RouteArgLookup = { [key: string]: RouteParameter };
export type RouteArgs<TOther extends RouteArgLookup = RouteArgLookup> = Pick<TOther, keyof TOther> | TOther;

class Resolver {
    private baseUri: string;
    private rootUri: string;
    constructor(baseUri: string) {
        this.baseUri = baseUri;
        this.baseUri = this.baseUri.endsWith("/") ? this.baseUri : this.baseUri + "/";

        const lastIndexOfMandatorySegment = this.baseUri.lastIndexOf("/api/");
        if (lastIndexOfMandatorySegment >= 1) {
            this.baseUri = this.baseUri.substring(0, lastIndexOfMandatorySegment);
        } else {
            if (this.baseUri.endsWith("/api")) {
                this.baseUri = this.baseUri.substring(0, -4);
            }
        }

        this.baseUri = this.baseUri.endsWith("/") ? this.baseUri.substring(0, this.baseUri.length - 1) : this.baseUri;

        const parsed = URI(this.baseUri);
        this.rootUri = parsed.scheme() + "://" + parsed.authority();
        this.rootUri = this.rootUri.endsWith("/") ? this.rootUri.substring(0, this.rootUri.length - 1) : this.rootUri;
    }
    resolve(path: string, uriTemplateParameters?: RouteArgs): string {
        if (!path) {
            throw new Error("The link is not set to a value");
        }

        if (path.startsWith("~/")) {
            path = path.substring(1, path.length);
            path = this.baseUri + path;
        } else {
            path = this.rootUri + path;
        }

        const template = new URITemplate(path);
        const result = (template as any).expand(uriTemplateParameters || {});

        return result;
    }
}

export default Resolver;
