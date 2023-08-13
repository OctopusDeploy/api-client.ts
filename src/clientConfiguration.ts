import { Agent } from "https";
import { Logger } from "./logger";

export interface ClientConfiguration {
    userAgentApp: string;
    httpsAgent?: Agent;
    apiKey?: string;
    accessToken?: string;
    instanceURL: string;
    logging?: Logger;
}
