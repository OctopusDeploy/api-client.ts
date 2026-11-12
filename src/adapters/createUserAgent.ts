import { getAiAgentUserAgentToken } from "../aiAgent";
import type { ClientConfiguration } from "../clientConfiguration";

export function createUserAgent(configuration: ClientConfiguration, env?: Record<string, string | undefined>): string {
    return ["ts-octopusdeploy", getAiAgentUserAgentToken(configuration.aiAgent, env), configuration.userAgentApp].filter((part) => !!part).join(" ");
}
