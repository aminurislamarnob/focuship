import { API_ORIGIN } from "@/lib/focuship-api";
import { SITE_NAME } from "@/lib/site";

/**
 * How a listener connects an AI assistant to Focuship (ADR 0004). One place, so the
 * landing page, the account card and llms.txt all quote the same URL and steps.
 */

/** The connector URL an AI client is pointed at. */
export const MCP_URL = `${API_ORIGIN || "https://api.focuship.app"}/mcp`;

export const MCP_TITLE = `Use ${SITE_NAME} from your AI assistant`;

export const MCP_DESCRIPTION =
  `Connect ${SITE_NAME} to Claude, ChatGPT, Cursor or Claude Code. ` +
  "Your assistant can design mixes, hand you a link that opens them, and manage your presets, favorites and focus timer.";

export interface McpStep {
  client: string;
  steps: string[];
  /** A snippet to copy, where the client is configured by file or command. */
  snippet?: { language: string; code: string };
}

export const MCP_CLIENTS: McpStep[] = [
  {
    client: "Claude",
    steps: [
      "Open Settings, then Connectors.",
      "Choose Add custom connector.",
      `Paste the connector URL and confirm.`,
      `Sign in to ${SITE_NAME} when the consent screen appears, then choose Allow.`,
    ],
  },
  {
    client: "ChatGPT",
    steps: [
      "Open Settings, then Apps & Connectors.",
      "Choose Create, or Add custom connector in developer mode.",
      "Paste the connector URL, leave authentication as OAuth, and confirm.",
      `Sign in to ${SITE_NAME} and choose Allow.`,
    ],
  },
  {
    client: "Cursor or VS Code",
    steps: [
      "Open your MCP settings and edit mcp.json.",
      "Add the entry below, then reload the window.",
      "Your editor opens a browser window to finish signing in.",
    ],
    snippet: {
      language: "json",
      code: `{
  "mcpServers": {
    "focuship": {
      "url": "${MCP_URL}"
    }
  }
}`,
    },
  },
  {
    client: "Claude Code",
    steps: ["Run the command below, then follow the sign-in link it prints."],
    snippet: {
      language: "bash",
      code: `claude mcp add --transport http focuship ${MCP_URL}`,
    },
  },
];

/** What an assistant can do once it is connected, in the listener's words. */
export const MCP_CAPABILITIES = [
  "Turn a description like “rainy café, low brown noise” into a mix, and hand you a link that opens it ready to play.",
  "Search all 64 sounds and the built-in presets, and explain what is in any of them.",
  "Save, rename, share and delete your presets, and keep your favorites tidy.",
  "Read and change your focus timer lengths and volume, which sync to the app.",
];

export const MCP_LIMITS = [
  "It cannot play or stop sound on your devices: your browser does that, which is why you get a link.",
  "It cannot delete your Focuship account.",
  `It only ever sees your own library, and only after you approve it on a ${SITE_NAME} consent screen.`,
];

export const MCP_EXAMPLE_PROMPTS = [
  "Build me a rainy café mix for deep work and save it as “Monday mornings”.",
  "What’s in my “Thunder desk” preset? Make it a bit calmer and share the new one.",
  "Set my focus sessions to 50 minutes with 10-minute breaks.",
  "I’m editing audio, so no music or voices — what should I play?",
];
