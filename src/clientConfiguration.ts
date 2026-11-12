import { Agent } from "https";
import { Logger } from "./logger";

export interface ClientConfiguration {
    userAgentApp: string;
    /**
     * Identifies the AI agent driving this client, when the caller knows it. For example, an MCP server can pass
     * the connected client's `clientInfo.name`. It is mapped to a known agent name for the User-Agent header and
     * takes precedence over agents detected from environment variables. The raw value is never sent.
     */
    aiAgent?: string;
    httpsAgent?: Agent;
    apiKey?: string;
    accessToken?: string;
    instanceURL: string;
    logging?: Logger;
}
