export const DEFAULT_GATEWAY_URL: string;
export const DEFAULT_PORT: number;
export const DEFAULT_HOST: string;
export const DEFAULT_PROXY_PATH: string;

export interface ParsedArgs {
  token: string;
  gatewayUrl: string;
  port: number;
  host: string;
  help?: boolean;
}

export interface ResolvedConfig {
  token: string;
  tokenSource: string;
  gatewayUrl: string;
  gatewayUrlSource: string;
  port: number;
  host: string;
  officeConfigPath: string;
  browserGatewayUrl: string;
  shouldPersistGatewayUrl: boolean;
}

export function getOfficeConfigPath(homeDir?: string): string;
export function parseArgs(argv?: string[]): ParsedArgs;
export function printHelp(): void;
export function readTokenFromConfig(
  homeDir?: string,
): { token: string; source: string } | null;
export function readPersistedOfficeConfig(
  configPath?: string,
): { gatewayUrl: string } | null;
export function writePersistedOfficeConfig(gatewayUrl: string, configPath?: string): void;
export function normalizeGatewayAccessUrl(rawGatewayUrl: string): {
  gatewayUrl: string;
  token: string;
};
export function resolveConfig(options?: {
  argv?: string[];
  env?: NodeJS.ProcessEnv | Record<string, string>;
  homeDir?: string;
}): ResolvedConfig;
