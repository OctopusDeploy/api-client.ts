import { ClientConfiguration } from "../clientConfiguration";
import { createUserAgent } from "./createUserAgent";

describe("createUserAgent", () => {
    const configuration: ClientConfiguration = {
        instanceURL: "https://my.octopus.app",
        userAgentApp: "GitHubActions (release;deploy;v3)",
    };

    test("is unchanged when no agent is detected", () => {
        expect(createUserAgent(configuration, {})).toBe("ts-octopusdeploy GitHubActions (release;deploy;v3)");
    });

    test("places the agent between the library and the requesting app", () => {
        expect(createUserAgent(configuration, { CLAUDECODE: "1" })).toBe("ts-octopusdeploy AIAgent/ClaudeCode GitHubActions (release;deploy;v3)");
    });

    test("uses the caller-supplied agent", () => {
        expect(createUserAgent({ ...configuration, aiAgent: "claude-code" }, {})).toBe("ts-octopusdeploy AIAgent/ClaudeCode GitHubActions (release;deploy;v3)");
    });

    test("omits an empty requesting app", () => {
        expect(createUserAgent({ ...configuration, userAgentApp: "" }, {})).toBe("ts-octopusdeploy");
    });
});
