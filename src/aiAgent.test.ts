import { getAiAgentUserAgentToken } from "./aiAgent";

describe("getAiAgentUserAgentToken", () => {
    test("returns undefined when no agent is detected", () => {
        expect(getAiAgentUserAgentToken(undefined, {})).toBeUndefined();
    });

    test.each([
        ["CLAUDECODE", "1", "AIAgent/ClaudeCode"],
        ["CLAUDE_CODE_ENTRYPOINT", "cli", "AIAgent/ClaudeCode"],
        ["CURSOR_AGENT", "1", "AIAgent/Cursor"],
        ["CURSOR_EXTENSION_HOST_ROLE", "agent-exec", "AIAgent/Cursor"],
        ["CODEX_SANDBOX", "seatbelt", "AIAgent/Codex"],
        ["CODEX_THREAD_ID", "abc", "AIAgent/Codex"],
        ["GEMINI_CLI", "1", "AIAgent/GeminiCLI"],
        ["COPILOT_CLI", "1", "AIAgent/GitHubCopilot"],
        ["OPENCODE", "1", "AIAgent/OpenCode"],
        ["OPENCODE_CLIENT", "cli", "AIAgent/OpenCode"],
        ["ANTIGRAVITY_AGENT", "1", "AIAgent/Antigravity"],
        ["GOOSE_TERMINAL", "1", "AIAgent/Goose"],
        ["AGENT", "goose", "AIAgent/Goose"],
        ["AGENT", "amp", "AIAgent/Amp"],
        ["CLINE_ACTIVE", "true", "AIAgent/Cline"],
        ["ROO_CODE_TASK_ID", "abc", "AIAgent/RooCode"],
        ["AUGMENT_AGENT", "1", "AIAgent/Augment"],
        ["QWEN_CODE", "1", "AIAgent/QwenCode"],
        ["DROID_CLI", "1", "AIAgent/FactoryDroid"],
        ["KIMI_CLI", "1", "AIAgent/KimiCLI"],
        ["TRAE_AI_SHELL_ID", "abc", "AIAgent/Trae"],
        ["OR_APP_NAME", "aider", "AIAgent/Aider"],
        ["OR_APP_NAME", "OpenHands", "AIAgent/OpenHands"],
    ])("detects %s=%s as %s", (variable, value, expected) => {
        expect(getAiAgentUserAgentToken(undefined, { [variable]: value })).toBe(expected);
    });

    test.each([
        ["CURSOR_EXTENSION_HOST_ROLE", "user"],
        ["OPENCODE", "0"],
        ["AGENT", "teamcity-agent-01"],
        ["OR_APP_NAME", "SomethingElse"],
    ])("requires a matching value for %s", (variable, value) => {
        expect(getAiAgentUserAgentToken(undefined, { [variable]: value })).toBeUndefined();
    });

    test.each(["CURSOR_TRACE_ID", "COPILOT_GITHUB_TOKEN", "GOOSE_PROVIDER", "REPL_ID", "ZED_TERM"])("ignores %s, which is set without an agent", (variable) => {
        expect(getAiAgentUserAgentToken(undefined, { [variable]: "1" })).toBeUndefined();
    });

    test("the first known agent wins when agents are nested", () => {
        expect(getAiAgentUserAgentToken(undefined, { CURSOR_AGENT: "1", CLAUDECODE: "1" })).toBe("AIAgent/ClaudeCode");
    });

    test.each([
        ["claude-code_2-1-322_agent", "AIAgent/ClaudeCode"],
        ["claude-code", "AIAgent/ClaudeCode"],
        ["Claude-Code", "AIAgent/ClaudeCode"],
        ["cursor-cli", "AIAgent/Cursor"],
        ["github_copilot_vscode_agent", "AIAgent/GitHubCopilot"],
        ["github-copilot-cli", "AIAgent/GitHubCopilot"],
        ["devin@1", "AIAgent/Devin"],
        ["custom-agent@2.0", "AIAgent/Other"],
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
        test("is mapped to a known name", () => {
            expect(getAiAgentUserAgentToken("claude-code", {})).toBe("AIAgent/ClaudeCode");
        });

        test("takes precedence over AI_AGENT and vendor variables", () => {
            expect(getAiAgentUserAgentToken("cursor-vscode", { AI_AGENT: "claude-code", CLAUDECODE: "1" })).toBe("AIAgent/Cursor");
        });

        test("falls back to AI_AGENT, then vendor variables, when not recognised", () => {
            expect(getAiAgentUserAgentToken("some-mcp-client", { AI_AGENT: "claude-code" })).toBe("AIAgent/ClaudeCode");
            expect(getAiAgentUserAgentToken("some-mcp-client", { CLAUDECODE: "1" })).toBe("AIAgent/ClaudeCode");
        });

        test("reports as Other when nothing is recognised", () => {
            expect(getAiAgentUserAgentToken("some-mcp-client", {})).toBe("AIAgent/Other");
        });

        test("matches names containing spaces", () => {
            expect(getAiAgentUserAgentToken("Claude Code", {})).toBe("AIAgent/ClaudeCode");
        });
    });
});
