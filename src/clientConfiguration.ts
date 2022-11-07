import { Agent } from "https";
import { Logger } from "./logger";

export interface ClientConfiguration {
    agent?: Agent;
    apiKey: string;
    apiUri: string;
    autoConnect?: boolean;
    space?: string;
    logging?: Logger;
}
