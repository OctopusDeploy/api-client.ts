import { ClientConfiguration } from "../clientConfiguration";
import { createUserAgent } from "./createUserAgent";

describe("createUserAgent", () => {
    const configuration: ClientConfiguration = {
        instanceURL: "https://my.octopus.app",
        userAgentApp: "octopus-mcp-server/1.2.3 (claude-code/2.1.42)",
    };

    test("is unchanged when no agent is detected", () => {
        expect(createUserAgent(configuration, {})).toBe("ts-octopusdeploy octopus-mcp-server/1.2.3 (claude-code/2.1.42)");
    });

    test("keeps the existing header and appends the agent", () => {
        const withoutAgent = createUserAgent(configuration, {});
        expect(createUserAgent(configuration, { CLAUDECODE: "1" })).toBe(`${withoutAgent} (ai-agent=ClaudeCode)`);
    });

    test("uses the caller-supplied agent", () => {
        expect(createUserAgent({ ...configuration, aiAgent: "claude-code" }, {})).toBe(
            "ts-octopusdeploy octopus-mcp-server/1.2.3 (claude-code/2.1.42) (ai-agent=ClaudeCode)"
        );
    });

    test("ignores a caller-supplied agent that isn't a string", () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const aiAgent = 42 as unknown as string;
        expect(createUserAgent({ ...configuration, aiAgent }, {})).toBe("ts-octopusdeploy octopus-mcp-server/1.2.3 (claude-code/2.1.42)");
    });
});
