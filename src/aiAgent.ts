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

interface KnownAgent {
    name: string;
    // When set, matches the start of a normalised self-reported identifier. Vendors don't agree on a format
    // (e.g. "claude-code_2-1-322_agent", "github_copilot_vscode_agent", "devin@1"), so identifiers are lowercased
    // and runs of underscores and whitespace replaced with a single hyphen before matching.
    aiAgentPrefix?: string;
    // Vendor-specific environment variables that identify the agent.
    variables?: AgentRule[];
}

// Each agent is listed once, and can be recognised from a self-reported identifier (by prefix), from its vendor
// variables, or both. Self-reported identifiers are checked against the whole list before any vendor variables, so a
// self-reported identity wins (e.g. Claude Code running inside Cursor). Within each lookup the first match wins, so
// the result is deterministic when several agents' variables are present.
//
// Variables that are commonly present without an agent driving the process are deliberately excluded:
// CURSOR_TRACE_ID (any Cursor terminal), COPILOT_GITHUB_TOKEN and GOOSE_PROVIDER (user configuration),
// REPL_ID (any Replit workspace) and ZED_TERM (any Zed terminal).
const knownAgents: ReadonlyArray<KnownAgent> = [
    { name: "ClaudeCode", aiAgentPrefix: "claude-code", variables: [{ variable: "CLAUDECODE" }, { variable: "CLAUDE_CODE_ENTRYPOINT" }] },
    { name: "Cursor", aiAgentPrefix: "cursor", variables: [{ variable: "CURSOR_AGENT" }, { variable: "CURSOR_EXTENSION_HOST_ROLE", value: "agent-exec" }] },
    { name: "Codex", aiAgentPrefix: "codex", variables: [{ variable: "CODEX_SANDBOX" }, { variable: "CODEX_THREAD_ID" }, { variable: "CODEX_CI" }] },
    { name: "GeminiCLI", aiAgentPrefix: "gemini", variables: [{ variable: "GEMINI_CLI" }] },
    {
        name: "GitHubCopilot",
        aiAgentPrefix: "github-copilot",
        variables: [{ variable: "COPILOT_CLI" }, { variable: "COPILOT_AGENT" }, { variable: "GITHUB_COPILOT_CLI_MODE" }],
    },
    {
        name: "OpenCode",
        aiAgentPrefix: "opencode",
        variables: [{ variable: "OPENCODE", value: "1" }, { variable: "OPENCODE_CLIENT" }, { variable: "OPENCODE_AI" }],
    },
    { name: "Antigravity", aiAgentPrefix: "antigravity", variables: [{ variable: "ANTIGRAVITY_AGENT" }] },
    { name: "Goose", aiAgentPrefix: "goose", variables: [{ variable: "GOOSE_TERMINAL" }, { variable: "AGENT", value: "goose" }] },
    { name: "Amp", aiAgentPrefix: "amp", variables: [{ variable: "AGENT", value: "amp" }] },
    { name: "Cline", aiAgentPrefix: "cline", variables: [{ variable: "CLINE_ACTIVE" }, { variable: "CLINE_TASK_ID" }] },
    { name: "RooCode", variables: [{ variable: "ROO_CODE_TASK_ID" }] },
    { name: "Augment", aiAgentPrefix: "augment", variables: [{ variable: "AUGMENT_AGENT" }] },
    { name: "QwenCode", variables: [{ variable: "QWEN_CODE" }] },
    { name: "FactoryDroid", variables: [{ variable: "DROID_CLI" }] },
    { name: "KimiCLI", variables: [{ variable: "KIMI_CLI" }] },
    { name: "Trae", variables: [{ variable: "TRAE_AI_SHELL_ID" }] },
    { name: "Aider", variables: [{ variable: "OR_APP_NAME", value: "Aider" }] },
    { name: "OpenHands", variables: [{ variable: "OR_APP_NAME", value: "OpenHands" }] },
    { name: "Devin", aiAgentPrefix: "devin" },
    { name: "Replit", aiAgentPrefix: "replit" },
    { name: "V0", aiAgentPrefix: "v0" },
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
    const aiAgentNameFromEnvVar = env[aiAgentVariable];
    const selfReported = [callerSuppliedAgent, aiAgentNameFromEnvVar].map((value) => value?.trim()).filter((value): value is string => !!value);

    // Vendor variables also cover an agent that self-reports in a format that isn't recognised.
    const agent = selfReported.map(findAgentByPrefix).find((a): a is KnownAgent => a !== undefined) ?? findAgentByVariables(env);
    if (agent) {
        return `AIAgent/${agent.name}`;
    }

    return selfReported.length > 0 ? `AIAgent/${otherAgentName}` : undefined;
}

function findAgentByPrefix(identifier: string): KnownAgent | undefined {
    const normalised = identifier.toLowerCase().replace(/[_\s]+/g, "-");
    return knownAgents.find((agent) => agent.aiAgentPrefix !== undefined && matchesPrefix(normalised, agent.aiAgentPrefix));
}

// Whether the identifier starts with the prefix followed by the end of the identifier, or by a separator ("-", "@", ".")
// or digit, so a short prefix such as "amp" doesn't match an unrelated identifier such as "amplitude-mcp".
function matchesPrefix(identifier: string, prefix: string): boolean {
    if (!identifier.startsWith(prefix)) {
        return false;
    }
    const next = identifier.charAt(prefix.length);
    return next === "" || /^[-@.0-9]$/.test(next);
}

function findAgentByVariables(env: EnvironmentVariables): KnownAgent | undefined {
    return knownAgents.find((agent) =>
        (agent.variables ?? []).some((rule) => {
            const value = env[rule.variable];
            if (!value) {
                return false;
            }
            return rule.value === undefined || value.toLowerCase() === rule.value.toLowerCase();
        })
    );
}

function readProcessEnvironment(): EnvironmentVariables {
    // The client also runs in browsers, where there is no process environment to read.
    return typeof process !== "undefined" && process.env ? process.env : {};
}
