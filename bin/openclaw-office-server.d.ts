import type { Server as HttpServer, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";

export const MIME_TYPES: Record<string, string>;

export interface OfficeServerConfig {
  gatewayUrl: string;
  browserGatewayUrl: string;
  token: string;
  port?: number;
  host?: string;
  gatewayUrlSource?: string;
  tokenSource?: string;
}

export function createRuntimeConfigScript(config: {
  browserGatewayUrl: string;
  token: string;
}): string;
export function formatStartupSummary(config: OfficeServerConfig): string;
export function proxyWebSocketUpgrade(
  req: IncomingMessage,
  downstreamSocket: Duplex,
  downstreamHead: Buffer,
  config: OfficeServerConfig,
): void;
export function createOfficeServer(options: {
  config: OfficeServerConfig;
  distDir: string;
  createHttpServer?: typeof import("node:http").createServer;
}): {
  server: HttpServer;
  getIndexHtml: () => Promise<string>;
};
