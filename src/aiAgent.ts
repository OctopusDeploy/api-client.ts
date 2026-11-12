// The agent list is maintained in go-octopusdeploy and ported from there; keep in sync.
// https://github.com/OctopusDeploy/go-octopusdeploy/blob/main/pkg/services/api/ai_agent_provider.go
//
// Detection relies on self-reported values, so it is suitable for analytics but must not be relied on for
// security decisions.

type EnvironmentVariables = Record<string, string | undefined>;

interface AgentRule {
    variable: string;
    // When set, the variable's value must match (case-insensitive). Otherwise any non-empty value matches.
    value?: string;
}

// The emerging cross-vendor convention for an agent to identify itself.
// https://github.com/vercel/vercel/tree/main/packages/detect-agent
const aiAgentVariable = "AI_AGENT";

const otherAgentName = "Other";

// Ordered: the first agent with a matching rule wins, so the result is deterministic when several agents'
// variables are present (e.g. one agent running another).
//
// Variables that are commonly present without an agent driving the process are deliberately excluded:
// CURSOR_TRACE_ID (any Cursor terminal), COPILOT_GITHUB_TOKEN and GOOSE_PROVIDER (user configuration),
// REPL_ID (any Replit workspace) and ZED_TERM (any Zed terminal).
const knownAgents: ReadonlyArray<{ name: string; rules: AgentRule[] }> = [
    { name: "ClaudeCode", rules: [{ variable: "CLAUDECODE" }, { variable: "CLAUDE_CODE_ENTRYPOINT" }] },
    { name: "Cursor", rules: [{ variable: "CURSOR_AGENT" }, { variable: "CURSOR_EXTENSION_HOST_ROLE", value: "agent-exec" }] },
    { name: "Codex", rules: [{ variable: "CODEX_SANDBOX" }, { variable: "CODEX_THREAD_ID" }, { variable: "CODEX_CI" }] },
    { name: "GeminiCLI", rules: [{ variable: "GEMINI_CLI" }] },
    { name: "GitHubCopilot", rules: [{ variable: "COPILOT_CLI" }, { variable: "COPILOT_AGENT" }, { variable: "GITHUB_COPILOT_CLI_MODE" }] },
    { name: "OpenCode", rules: [{ variable: "OPENCODE", value: "1" }, { variable: "OPENCODE_CLIENT" }, { variable: "OPENCODE_AI" }] },
    { name: "Antigravity", rules: [{ variable: "ANTIGRAVITY_AGENT" }] },
    { name: "Goose", rules: [{ variable: "GOOSE_TERMINAL" }, { variable: "AGENT", value: "goose" }] },
    { name: "Amp", rules: [{ variable: "AGENT", value: "amp" }] },
    { name: "Cline", rules: [{ variable: "CLINE_ACTIVE" }, { variable: "CLINE_TASK_ID" }] },
    { name: "RooCode", rules: [{ variable: "ROO_CODE_TASK_ID" }] },
    { name: "Augment", rules: [{ variable: "AUGMENT_AGENT" }] },
    { name: "QwenCode", rules: [{ variable: "QWEN_CODE" }] },
    { name: "FactoryDroid", rules: [{ variable: "DROID_CLI" }] },
    { name: "KimiCLI", rules: [{ variable: "KIMI_CLI" }] },
    { name: "Trae", rules: [{ variable: "TRAE_AI_SHELL_ID" }] },
    { name: "Aider", rules: [{ variable: "OR_APP_NAME", value: "Aider" }] },
    { name: "OpenHands", rules: [{ variable: "OR_APP_NAME", value: "OpenHands" }] },
];

// Maps the start of a normalised self-reported agent identifier to a known agent name. Vendors don't agree on a
// format (e.g. "claude-code_2-1-322_agent", "github_copilot_vscode_agent", "devin@1"), so values are lowercased
// and underscores and spaces replaced with hyphens before matching.
const agentNamePrefixes: ReadonlyArray<{ prefix: string; name: string }> = [
    { prefix: "claude-code", name: "ClaudeCode" },
    { prefix: "cursor", name: "Cursor" },
    { prefix: "codex", name: "Codex" },
    { prefix: "gemini", name: "GeminiCLI" },
    { prefix: "github-copilot", name: "GitHubCopilot" },
    { prefix: "opencode", name: "OpenCode" },
    { prefix: "antigravity", name: "Antigravity" },
    { prefix: "goose", name: "Goose" },
    { prefix: "amp", name: "Amp" },
    { prefix: "cline", name: "Cline" },
    { prefix: "augment", name: "Augment" },
    { prefix: "devin", name: "Devin" },
    { prefix: "replit", name: "Replit" },
    { prefix: "v0", name: "V0" },
];

/**
 * Returns a User-Agent token naming the AI agent driving this client (e.g. "AIAgent/ClaudeCode"), or undefined
 * when none is detected.
 *
 * Self-reported identifiers are checked first, in order: an identifier supplied by the caller (for example an MCP
 * server passing the connected client's `clientInfo.name`), then the `AI_AGENT` environment variable. If neither is
 * recognised, vendor-specific environment variables are checked. An identifier that is present but not recognised
 * reports as "AIAgent/Other". Only the normalised name is reported: raw identifiers are free-form, so they are used
 * for matching and never included in the output.
 */
export function getAiAgentUserAgentToken(callerSuppliedAgent?: string, env: EnvironmentVariables = readProcessEnvironment()): string | undefined {
    const selfReported = [callerSuppliedAgent, env[aiAgentVariable]].map((value) => value?.trim()).filter((value): value is string => !!value);

    const name =
        selfReported.map(nameFromIdentifier).find((n): n is string => n !== undefined) ??
        nameFromVendorVariables(env) ??
        (selfReported.length > 0 ? otherAgentName : undefined);

    return name ? `AIAgent/${name}` : undefined;
}

function nameFromIdentifier(identifier: string): string | undefined {
    const normalised = identifier.toLowerCase().replace(/[_\s]+/g, "-");
    return agentNamePrefixes.find((p) => normalised.startsWith(p.prefix))?.name;
}

function nameFromVendorVariables(env: EnvironmentVariables): string | undefined {
    return knownAgents.find((agent) =>
        agent.rules.some((rule) => {
            const value = env[rule.variable];
            if (!value) {
                return false;
            }
            return rule.value === undefined || value.toLowerCase() === rule.value.toLowerCase();
        })
    )?.name;
}

function readProcessEnvironment(): EnvironmentVariables {
    // The client also runs in browsers, where there is no process environment to read.
    return typeof process !== "undefined" && process.env ? process.env : {};
}
