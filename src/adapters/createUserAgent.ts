import { getAiAgentUserAgentToken } from "../aiAgent";
import type { ClientConfiguration } from "../clientConfiguration";

export function createUserAgent(configuration: ClientConfiguration, env?: Record<string, string | undefined>): string {
    // The agent is appended last so everything before it is unchanged: Octopus Server matches on the start of this header,
    // e.g. "ts-octopusdeploy octopus-mcp-server" for the local MCP server.
    return ["ts-octopusdeploy", configuration.userAgentApp, getAiAgentUserAgentToken(configuration.aiAgent, env)].filter((part) => !!part).join(" ");
}
