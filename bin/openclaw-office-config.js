import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const DEFAULT_GATEWAY_URL = "ws://localhost:18789";
export const DEFAULT_PORT = 5180;
export const DEFAULT_HOST = "0.0.0.0";
export const DEFAULT_PROXY_PATH = "/gateway-ws";
const TOKEN_QUERY_PARAM = "token";

export function getOfficeConfigPath(homeDir = homedir()) {
  return join(homeDir, ".openclaw", "openclaw-office.json");
}

export function parseArgs(argv = process.argv.slice(2)) {
  const result = { token: "", gatewayUrl: "", port: 0, host: "" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if ((arg === "--token" || arg === "-t") && next) {
      result.token = next;
      i++;
    } else if ((arg === "--gateway" || arg === "-g") && next) {
      result.gatewayUrl = next;
      i++;
    } else if ((arg === "--port" || arg === "-p") && next) {
      result.port = parseInt(next, 10);
      i++;
    } else if (arg === "--host" && next) {
      result.host = next;
      i++;
    } else if (arg === "--help" || arg === "-h") {
      result.help = true;
    }
  }
  return result;
}

export function printHelp() {
  console.log(`
  \x1b[36mOpenClaw Office\x1b[0m — Visual monitoring frontend for OpenClaw

  \x1b[1mUsage:\x1b[0m
    openclaw-office [options]

  \x1b[1mOptions:\x1b[0m
    -t, --token <token>      Gateway auth token
    -g, --gateway <url>      Gateway WebSocket URL (default: ws://localhost:18789)
    -p, --port <port>        Server port (default: 5180, or PORT env)
    --host <host>            Bind address (default: 0.0.0.0)
    -h, --help               Show this help

  \x1b[1mGateway URL persistence:\x1b[0m
    The upstream Gateway URL is resolved in this order:
    1. --gateway flag
    2. OPENCLAW_GATEWAY_URL environment variable
    3. Persisted Office config at ~/.openclaw/openclaw-office.json
    4. Default ws://localhost:18789

  \x1b[1mToken auto-detection:\x1b[0m
    The token is resolved in this order:
    1. --token flag
    2. OPENCLAW_GATEWAY_TOKEN environment variable
    3. Auto-read from ~/.openclaw/openclaw.json

  \x1b[1mExamples:\x1b[0m
    openclaw-office
    openclaw-office --token <token>
    openclaw-office --gateway ws://gateway.example.com:18789
    PORT=3000 openclaw-office
`);
}

export function readTokenFromConfig(homeDir = homedir()) {
  const candidates = [
    join(homeDir, ".openclaw", "openclaw.json"),
    join(homeDir, ".clawdbot", "clawdbot.json"),
  ];

  for (const filePath of candidates) {
    try {
      const raw = readFileSync(filePath, "utf-8");
      const config = JSON.parse(raw);
      const token = config?.gateway?.auth?.token;
      if (token && typeof token === "string") {
        return { token, source: filePath };
      }
    } catch {
      // file not found or parse error
    }
  }

  return null;
}

export function readPersistedOfficeConfig(configPath = getOfficeConfigPath()) {
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const raw = readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    const gatewayUrl = parsed?.gatewayUrl;
    if (typeof gatewayUrl !== "string" || gatewayUrl.length === 0) {
      return null;
    }
    return { gatewayUrl };
  } catch {
    return null;
  }
}

export function writePersistedOfficeConfig(
  gatewayUrl,
  configPath = getOfficeConfigPath(),
) {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify({ gatewayUrl }, null, 2)}\n`, "utf-8");
}

function formatParsedUrl(parsed, original) {
  const serialized = parsed.toString();
  if (/^[a-z]+:\/\/[^/?#]+(?:\?[^#]*)?(?:#.*)?$/i.test(original)) {
    return serialized.replace(/\/$/, "");
  }
  return serialized;
}

export function normalizeGatewayAccessUrl(rawGatewayUrl) {
  if (!rawGatewayUrl) {
    return { gatewayUrl: rawGatewayUrl, token: "" };
  }

  try {
    const parsed = new URL(rawGatewayUrl);
    const token = parsed.searchParams.get(TOKEN_QUERY_PARAM) ?? "";
    parsed.searchParams.delete(TOKEN_QUERY_PARAM);

    if (parsed.protocol === "http:") {
      parsed.protocol = "ws:";
    } else if (parsed.protocol === "https:") {
      parsed.protocol = "wss:";
    }

    return { gatewayUrl: formatParsedUrl(parsed, rawGatewayUrl), token };
  } catch {
    return { gatewayUrl: rawGatewayUrl, token: "" };
  }
}

export function resolveConfig({
  argv = process.argv.slice(2),
  env = process.env,
  homeDir = homedir(),
} = {}) {
  const args = parseArgs(argv);
  const officeConfigPath = getOfficeConfigPath(homeDir);
  const persisted = readPersistedOfficeConfig(officeConfigPath);

  let token = "";
  let tokenSource = "";

  if (args.token) {
    token = args.token;
    tokenSource = "command line --token";
  } else if (env.OPENCLAW_GATEWAY_TOKEN) {
    token = env.OPENCLAW_GATEWAY_TOKEN;
    tokenSource = "OPENCLAW_GATEWAY_TOKEN env";
  } else {
    const fromFile = readTokenFromConfig(homeDir);
    if (fromFile) {
      token = fromFile.token;
      tokenSource = fromFile.source;
    }
  }

  let gatewayUrl = DEFAULT_GATEWAY_URL;
  let gatewayUrlSource = "default";
  if (persisted?.gatewayUrl) {
    gatewayUrl = persisted.gatewayUrl;
    gatewayUrlSource = officeConfigPath;
  }
  if (env.OPENCLAW_GATEWAY_URL) {
    gatewayUrl = env.OPENCLAW_GATEWAY_URL;
    gatewayUrlSource = "OPENCLAW_GATEWAY_URL env";
  }
  if (args.gatewayUrl) {
    gatewayUrl = args.gatewayUrl;
    gatewayUrlSource = "command line --gateway";
  }

  const normalizedGateway = normalizeGatewayAccessUrl(gatewayUrl);
  gatewayUrl = normalizedGateway.gatewayUrl || gatewayUrl;

  if (!token && normalizedGateway.token) {
    token = normalizedGateway.token;
    tokenSource = `${gatewayUrlSource} token query`;
  }

  const port = args.port || parseInt(env.PORT || `${DEFAULT_PORT}`, 10);
  const host = args.host || env.HOST || DEFAULT_HOST;
  const shouldPersistGatewayUrl =
    !!gatewayUrl &&
    (gatewayUrlSource === "command line --gateway" || gatewayUrlSource === "OPENCLAW_GATEWAY_URL env") &&
    gatewayUrl !== persisted?.gatewayUrl;

  return {
    token,
    tokenSource,
    gatewayUrl,
    gatewayUrlSource,
    port,
    host,
    officeConfigPath,
    browserGatewayUrl: DEFAULT_PROXY_PATH,
    shouldPersistGatewayUrl,
  };
}
