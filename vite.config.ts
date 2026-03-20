import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { Duplex } from "node:stream";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8"));
const RUNTIME_CONNECTION_PATH = "/__clawnexus/connection";
const GATEWAY_PROXY_PATH = "/gateway-ws";

function normalizeGatewayTarget(rawTarget: string) {
  try {
    const parsed = new URL(rawTarget);
    parsed.searchParams.delete("token");
    if (parsed.protocol === "http:") {
      parsed.protocol = "ws:";
    } else if (parsed.protocol === "https:") {
      parsed.protocol = "wss:";
    }
    return parsed.toString();
  } catch {
    return rawTarget;
  }
}

function resolveGatewayTarget(mode: string) {
  const env = loadEnv(mode, process.cwd(), "");
  return normalizeGatewayTarget(env.VITE_GATEWAY_URL || "ws://localhost:18789");
}

function toGatewayOrigin(target: string) {
  const url = new URL(target);
  const protocol = url.protocol === "wss:" ? "https:" : "http:";
  return `${protocol}//${url.host}`;
}

function toUpstreamHttpUrl(gatewayUrl: string) {
  const upstreamUrl = new URL(gatewayUrl);
  if (upstreamUrl.protocol === "ws:") {
    upstreamUrl.protocol = "http:";
  } else if (upstreamUrl.protocol === "wss:") {
    upstreamUrl.protocol = "https:";
  }
  return upstreamUrl;
}

function buildSocketErrorResponse(statusCode: number, message: string) {
  return `HTTP/1.1 ${statusCode} ${message}\r\nConnection: close\r\n\r\n`;
}

function serializeUpgradeResponse(
  statusCode: number,
  statusMessage: string,
  headers: Record<string, string | string[] | undefined>,
) {
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

function pipeProxySockets(
  downstreamSocket: Duplex,
  upstreamSocket: Duplex,
  downstreamHead: Buffer,
  upstreamHead: Buffer,
) {
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

function proxyGatewayUpgrade(
  req: IncomingMessage,
  downstreamSocket: Duplex,
  downstreamHead: Buffer,
  gatewayTarget: string,
) {
  const pathname = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname;
  if (pathname !== GATEWAY_PROXY_PATH) {
    return false;
  }

  const upstreamUrl = toUpstreamHttpUrl(gatewayTarget);
  const requestImpl = upstreamUrl.protocol === "https:" ? httpsRequest : httpRequest;
  const upstreamReq = requestImpl(upstreamUrl, {
    method: "GET",
    headers: {
      ...req.headers,
      host: upstreamUrl.host,
      origin: toGatewayOrigin(gatewayTarget),
      connection: "Upgrade",
      upgrade: "websocket",
    },
  });

  let settled = false;
  const fail = (statusCode: number, message: string) => {
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
  return true;
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf-8")) as {
    mode?: "local" | "remote";
    gatewayUrl?: string;
  };
}

export default defineConfig(({ mode }) => {
  const defaultGatewayTarget = resolveGatewayTarget(mode);
  let currentGatewayTarget = defaultGatewayTarget;

  return {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "clawnexus-dev-connection",
        configureServer(server) {
          server.httpServer?.on("upgrade", (req, socket, head) => {
            proxyGatewayUpgrade(req, socket, head, currentGatewayTarget);
          });

          server.middlewares.use(async (req, res, next) => {
            const pathname = (req.url ?? "").split("?")[0];
            if (pathname !== RUNTIME_CONNECTION_PATH) {
              next();
              return;
            }

            if (req.method === "GET") {
              const mode = currentGatewayTarget === defaultGatewayTarget ? "local" : "remote";
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({
                  mode,
                  gatewayUrl: currentGatewayTarget,
                }),
              );
              return;
            }

            if (req.method === "POST") {
              try {
                const body = await readJsonBody(req);
                if (body.mode === "local") {
                  currentGatewayTarget = defaultGatewayTarget;
                } else if (body.mode === "remote" && body.gatewayUrl) {
                  currentGatewayTarget = normalizeGatewayTarget(body.gatewayUrl);
                } else {
                  res.statusCode = 400;
                  res.end("Invalid connection config payload");
                  return;
                }

                res.statusCode = 204;
                res.end();
                return;
              } catch {
                res.statusCode = 400;
                res.end("Invalid JSON payload");
                return;
              }
            }

            res.statusCode = 405;
            res.end("Method Not Allowed");
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5180,
    },
  };
});
