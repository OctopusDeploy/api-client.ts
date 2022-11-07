import { Agent } from "https";
import { Logger } from "./logger";

export interface ClientConfiguration {
    agent?: Agent;
    apiKey: string;
    instanceUri: string;
    autoConnect?: boolean;
    space?: string;
    logging?: Logger;
}
