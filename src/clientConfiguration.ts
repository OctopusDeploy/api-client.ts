import { Agent } from "https";
import { Logger } from "./logger";

export interface ClientConfiguration {
    agent?: Agent;
    apiKey: string;
    instanceURL: string;
    autoConnect?: boolean;
    space?: string;
    logging?: Logger;
}
