import { createServer } from "node:http";
import { access, readFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { networkInterfaces } from "node:os";
import { extname, join } from "node:path";

const RUNTIME_CONNECTION_PATH = "/__openclaw/connection";

export const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
};

export function createRuntimeConfigScript(config) {
  const runtimeConfig = JSON.stringify({
    gatewayUrl: config.browserGatewayUrl,
    gatewayToken: config.token,
  });
  return `<script>window.__OPENCLAW_CONFIG__=${runtimeConfig};</script>`;
}

export function formatStartupSummary(config) {
  const lines = [
    "",
    "  \x1b[36m\u{1F3E2} OpenClaw Office\x1b[0m",
    "",
    `  \x1b[32m\u{27A1}\x1b[0m  Local:   \x1b[36mhttp://localhost:${config.port}\x1b[0m`,
  ];

  if (config.host === "0.0.0.0") {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          lines.push(`  \x1b[32m\u{27A1}\x1b[0m  Network: \x1b[36mhttp://${net.address}:${config.port}\x1b[0m`);
        }
      }
    }
  }

  lines.push("");
  lines.push(
    `  \x1b[32m\u{27A1}\x1b[0m  Gateway: \x1b[33m${config.gatewayUrl}\x1b[0m \x1b[90m(from ${config.gatewayUrlSource})\x1b[0m`,
  );
  lines.push(
    `  \x1b[32m\u{27A1}\x1b[0m  Proxy:   \x1b[36m${config.browserGatewayUrl}\x1b[0m`,
  );

  if (config.token) {
    lines.push(
      `  \x1b[32m\u{2713}\x1b[0m  Token:   \x1b[32mloaded\x1b[0m \x1b[90m(from ${config.tokenSource})\x1b[0m`,
    );
  } else {
    lines.push(`  \x1b[33m\u{26A0}\x1b[0m  Token:   \x1b[33mnot found\x1b[0m`);
    lines.push("");
    lines.push("  \x1b[90mTo connect to Gateway, provide a token:\x1b[0m");
    lines.push("  \x1b[90m  openclaw-office --token <your-token>\x1b[0m");
    lines.push("  \x1b[90m  or install openclaw CLI and the token will be auto-detected\x1b[0m");
  }

  lines.push("");
  lines.push("  Press \x1b[1mCtrl+C\x1b[0m to stop");
  lines.push("");

  return lines.join("\n");
}

function buildSocketErrorResponse(statusCode, message) {
  return `HTTP/1.1 ${statusCode} ${message}\r\nConnection: close\r\n\r\n`;
}

function toUpstreamHttpUrl(gatewayUrl) {
  const upstreamUrl = new URL(gatewayUrl);
  if (upstreamUrl.protocol === "ws:") {
    upstreamUrl.protocol = "http:";
  } else if (upstreamUrl.protocol === "wss:") {
    upstreamUrl.protocol = "https:";
  } else if (upstreamUrl.protocol !== "http:" && upstreamUrl.protocol !== "https:") {
    throw new Error(`Unsupported Gateway protocol: ${upstreamUrl.protocol}`);
  }
  return upstreamUrl;
}

function toUpstreamOrigin(gatewayUrl) {
  return toUpstreamHttpUrl(gatewayUrl).origin;
}

function serializeUpgradeResponse(statusCode, statusMessage, headers) {
  const lines = [`HTTP/1.1 ${statusCode} ${statusMessage}`];
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        lines.push(`${key}: ${item}`);
      }
      continue;
    }
    lines.push(`${key}: ${value}`);
  }
  lines.push("\r\n");
  return lines.join("\r\n");
}

function pipeProxySockets(downstreamSocket, upstreamSocket, downstreamHead, upstreamHead) {
  if (downstreamHead.length > 0) {
    upstreamSocket.write(downstreamHead);
  }
  if (upstreamHead.length > 0) {
    downstreamSocket.write(upstreamHead);
  }

  downstreamSocket.pipe(upstreamSocket);
  upstreamSocket.pipe(downstreamSocket);

  const closeBoth = () => {
    if (!downstreamSocket.destroyed) {
      downstreamSocket.destroy();
    }
    if (!upstreamSocket.destroyed) {
      upstreamSocket.destroy();
    }
  };

  downstreamSocket.on("error", closeBoth);
  upstreamSocket.on("error", closeBoth);
  downstreamSocket.on("close", closeBoth);
  upstreamSocket.on("close", closeBoth);
}

export function proxyWebSocketUpgrade(req, downstreamSocket, downstreamHead, config) {
  const pathname = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname;
  if (pathname !== config.browserGatewayUrl) {
    downstreamSocket.end(buildSocketErrorResponse(404, "Not Found"));
    return;
  }

  let upstreamUrl;
  try {
    upstreamUrl = toUpstreamHttpUrl(config.gatewayUrl);
  } catch (error) {
    downstreamSocket.end(buildSocketErrorResponse(502, "Bad Gateway"));
    return;
  }

  const requestImpl = upstreamUrl.protocol === "https:" ? httpsRequest : httpRequest;
  const upstreamReq = requestImpl(upstreamUrl, {
    method: "GET",
    headers: {
      ...req.headers,
      host: upstreamUrl.host,
      origin: toUpstreamOrigin(config.gatewayUrl),
      connection: "Upgrade",
      upgrade: "websocket",
    },
  });

  let settled = false;
  const fail = (statusCode, message) => {
    if (settled) {
      return;
    }
    settled = true;
    downstreamSocket.end(buildSocketErrorResponse(statusCode, message));
  };

  upstreamReq.on("upgrade", (upstreamRes, upstreamSocket, upstreamHead) => {
    if (settled) {
      upstreamSocket.destroy();
      return;
    }
    settled = true;
    downstreamSocket.write(
      serializeUpgradeResponse(
        upstreamRes.statusCode || 101,
        upstreamRes.statusMessage || "Switching Protocols",
        upstreamRes.headers,
      ),
    );
    pipeProxySockets(downstreamSocket, upstreamSocket, downstreamHead, upstreamHead);
  });

  upstreamReq.on("response", (upstreamRes) => {
    upstreamRes.resume();
    fail(upstreamRes.statusCode || 502, upstreamRes.statusMessage || "Bad Gateway");
  });

  upstreamReq.on("error", () => {
    fail(502, "Bad Gateway");
  });

  downstreamSocket.on("error", () => {
    upstreamReq.destroy();
  });

  downstreamSocket.on("close", () => {
    upstreamReq.destroy();
  });

  upstreamReq.end();
}

async function tryReadFile(filePath) {
  try {
    await access(filePath);
    return await readFile(filePath);
  } catch {
    return null;
  }
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

export function createOfficeServer({
  config,
  distDir,
  createHttpServer = createServer,
}) {
  const configScript = createRuntimeConfigScript(config);
  const runtimeState = {
    currentGatewayUrl: config.gatewayUrl,
    defaultGatewayUrl: config.gatewayUrl,
  };
  let indexHtmlCache = null;

  async function getIndexHtml() {
    if (indexHtmlCache) {
      return indexHtmlCache;
    }
    const raw = await readFile(join(distDir, "index.html"), "utf-8");
    indexHtmlCache = raw.replace("</head>", `${configScript}\n</head>`);
    return indexHtmlCache;
  }

  const server = createHttpServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === RUNTIME_CONNECTION_PATH) {
      if (req.method === "GET") {
        const mode =
          runtimeState.currentGatewayUrl === runtimeState.defaultGatewayUrl ? "local" : "remote";
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(
          JSON.stringify({
            mode,
            gatewayUrl: runtimeState.currentGatewayUrl,
          }),
        );
        return;
      }

      if (req.method === "POST") {
        try {
          const body = await readJsonBody(req);
          if (body?.mode === "remote" && typeof body.gatewayUrl === "string" && body.gatewayUrl) {
            runtimeState.currentGatewayUrl = body.gatewayUrl;
          } else if (body?.mode === "local") {
            runtimeState.currentGatewayUrl = runtimeState.defaultGatewayUrl;
          } else {
            res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Invalid connection config payload");
            return;
          }

          res.writeHead(204);
          res.end();
          return;
        } catch {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Invalid JSON payload");
          return;
        }
      }

      res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Method Not Allowed");
      return;
    }

    if (pathname === "/" || pathname === "/index.html") {
      const html = await getIndexHtml();
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    const filePath = join(distDir, pathname);
    const content = await tryReadFile(filePath);

    if (content) {
      const ext = extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": mime });
      res.end(content);
      return;
    }

    const html = await getIndexHtml();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });

  server.on("upgrade", (req, socket, head) => {
    proxyWebSocketUpgrade(req, socket, head, {
      ...config,
      gatewayUrl: runtimeState.currentGatewayUrl,
    });
  });

  return {
    server,
    getIndexHtml,
  };
}
