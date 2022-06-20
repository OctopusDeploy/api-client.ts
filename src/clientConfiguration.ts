import { Agent } from "https";
import { EnvironmentVariables } from "./environmentVariables";
import { Logger } from "./logger";

export interface ClientConfiguration {
    agent?: Agent;
    apiKey: string;
    apiUri: string;
    autoConnect?: boolean;
    space?: string;
    logging?: Logger;
}

export function processConfiguration(configuration?: ClientConfiguration): ClientConfiguration {
    const apiKey = process.env[EnvironmentVariables.ApiKey];
    const host = process.env[EnvironmentVariables.Host];
    const space = process.env[EnvironmentVariables.Space];

    if (!configuration) {
        return {
            apiKey: apiKey || "",
            apiUri: host || "",
            autoConnect: true,
            space: space,
        };
    }

    return {
        apiKey: !configuration.apiKey || configuration.apiKey.length === 0 ? apiKey || "" : configuration.apiKey,
        apiUri: !configuration.apiUri || configuration.apiUri.length === 0 ? host || "" : configuration.apiUri,
        space: !configuration.space || configuration.space.length === 0 ? space || "" : configuration.space,
    };
}
