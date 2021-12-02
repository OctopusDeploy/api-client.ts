import URI from "urijs";
import { curry } from "lodash";
import Resolver from "./resolver";

export type LocationProps = Pick<Location, "pathname" | "host" | "protocol" | "href">;

export const getQueryValue = (key: string, location: string): string | undefined => {
    let result: string | undefined;
    URI(location).hasQuery(key, (value: string) => {
        result = value;
    });
    return result;
};

export const getServerEndpoint = (location: LocationProps = window.location): string => {
    return getQueryValue("octopus.server", location.href) || determineServerEndpoint(location);
};

export const getResolver = (base: string): ((path: string, uriTemplateParameters?: any) => string) => {
    const resolver = new Resolver(base);
    return resolver.resolve.bind(resolver);
};

export const determineServerEndpoint = (location: LocationProps) => {
    let endpoint = ensureSuffix("//", "" + location.protocol) + location.host;
    let path = ensurePrefix("/", location.pathname);

    if (path.length >= 1) {
        const lastSegmentIndex = path.lastIndexOf("/");
        if (lastSegmentIndex >= 0) {
            path = path.substring(0, lastSegmentIndex + 1);
        }
    }

    endpoint = endpoint + path;
    return endpoint;
};

export const ensurePrefix = curry((prefix: string, value: string) => (!value.startsWith(prefix) ? `${prefix}${value}` : value));
export const ensureSuffix = curry((suffix: string, value: string) => (!value.endsWith(suffix) ? `${value}${suffix}` : value));

export const typeSafeHasOwnProperty = <T extends {}>(target: T, key: keyof T) => {
    return target.hasOwnProperty(key);
};

export const isPropertyDefinedAndNotNull = <T extends {}>(target: T, key: keyof T) => {
    return typeSafeHasOwnProperty(target, key) && target[key] !== null && target[key] !== undefined;
};
