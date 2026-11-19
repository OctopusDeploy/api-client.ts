import { getAiAgentUserAgentToken } from "./aiAgent";

describe("getAiAgentUserAgentToken", () => {
    test("returns undefined when no agent is detected", () => {
        expect(getAiAgentUserAgentToken(undefined, {})).toBeUndefined();
    });

    test("detects an agent from a vendor variable", () => {
        expect(getAiAgentUserAgentToken(undefined, { CLAUDECODE: "1" })).toBe("AIAgent/ClaudeCode");
    });

    test.each([
        ["CURSOR_EXTENSION_HOST_ROLE", "agent-exec", "AIAgent/Cursor"],
        ["CURSOR_EXTENSION_HOST_ROLE", "user", undefined],
        ["AGENT", "amp", "AIAgent/Amp"],
        ["AGENT", "teamcity-agent-01", undefined],
    ])("requires a matching value for %s=%s", (variable, value, expected) => {
        expect(getAiAgentUserAgentToken(undefined, { [variable]: value })).toBe(expected);
    });

    test.each(["CURSOR_TRACE_ID", "COPILOT_GITHUB_TOKEN"])("ignores %s, which is set without an agent", (variable) => {
        expect(getAiAgentUserAgentToken(undefined, { [variable]: "1" })).toBeUndefined();
    });

    test("the first known agent wins when agents are nested", () => {
        expect(getAiAgentUserAgentToken(undefined, { CURSOR_AGENT: "1", CLAUDECODE: "1" })).toBe("AIAgent/ClaudeCode");
    });

    test.each([
        ["claude-code_2-1-322_agent", "AIAgent/ClaudeCode"],
        ["Claude Code", "AIAgent/ClaudeCode"],
        ["github_copilot_vscode_agent", "AIAgent/GitHubCopilot"],
        ["devin@1", "AIAgent/Devin"],
        ["custom-agent@2.0", "AIAgent/Other"],
        ["amplitude-mcp", "AIAgent/Other"],
    ])("maps AI_AGENT=%s to %s", (value, expected) => {
        expect(getAiAgentUserAgentToken(undefined, { AI_AGENT: value })).toBe(expected);
    });

    test("AI_AGENT takes precedence over vendor variables", () => {
        expect(getAiAgentUserAgentToken(undefined, { CURSOR_AGENT: "1", AI_AGENT: "claude-code_2-1-322_agent" })).toBe("AIAgent/ClaudeCode");
    });

    test("an unrecognised AI_AGENT falls back to the vendor name", () => {
        expect(getAiAgentUserAgentToken(undefined, { GEMINI_CLI: "1", AI_AGENT: "gcli" })).toBe("AIAgent/GeminiCLI");
    });

    test.each([
        ["  evil) agent\r\nX-Injected: 1 ", "AIAgent/Other"],
        [" \t ", undefined],
    ])("never includes the raw AI_AGENT value (%j)", (value, expected) => {
        expect(getAiAgentUserAgentToken(undefined, { AI_AGENT: value })).toBe(expected);
    });

    describe("caller-supplied agent", () => {
        test("takes precedence over AI_AGENT and vendor variables", () => {
            expect(getAiAgentUserAgentToken("cursor-vscode", { AI_AGENT: "claude-code", CLAUDECODE: "1" })).toBe("AIAgent/Cursor");
        });

        test("falls back to AI_AGENT when not recognised, and reports as Other when nothing is", () => {
            expect(getAiAgentUserAgentToken("some-mcp-client", { AI_AGENT: "claude-code" })).toBe("AIAgent/ClaudeCode");
            expect(getAiAgentUserAgentToken("some-mcp-client", {})).toBe("AIAgent/Other");
        });
    });
});
