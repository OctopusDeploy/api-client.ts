import { Agent } from "https";
import { Logger } from "./logger";

export interface ClientConfiguration {
    userAgentApp: string;
    httpsAgent?: Agent;
    apiKey: string;
    instanceURL: string;
    autoConnect?: boolean;
    space?: string;
    logging?: Logger;
}
