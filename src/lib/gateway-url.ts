const DEFAULT_PROXY_PATH = "/gateway-ws";
const TOKEN_QUERY_PARAM = "token";

interface BrowserLocationLike {
  host: string;
  protocol: string;
}

interface ResolveGatewayWebSocketUrlOptions {
  preferSameOriginProxy?: boolean;
}

interface GatewayConnectionConfig {
  url: string;
  token: string;
}

function getWebSocketOrigin(location: BrowserLocationLike) {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}`;
}

function formatParsedUrl(parsed: URL, original: string) {
  const serialized = parsed.toString();
  if (/^[a-z]+:\/\/[^/?#]+(?:\?[^#]*)?(?:#.*)?$/i.test(original)) {
    return serialized.replace(/\/$/, "");
  }
  return serialized;
}

export function normalizeGatewayAccessUrl(configuredUrl: string | undefined) {
  if (!configuredUrl || configuredUrl.startsWith("/")) {
    return { url: configuredUrl, token: "" };
  }

  try {
    const parsed = new URL(configuredUrl);
    const token = parsed.searchParams.get(TOKEN_QUERY_PARAM) ?? "";
    parsed.searchParams.delete(TOKEN_QUERY_PARAM);

    if (parsed.protocol === "http:") {
      parsed.protocol = "ws:";
    } else if (parsed.protocol === "https:") {
      parsed.protocol = "wss:";
    }

    return { url: formatParsedUrl(parsed, configuredUrl), token };
  } catch {
    return { url: configuredUrl, token: "" };
  }
}

export function resolveGatewayConnectionConfig(
  configuredUrl: string | undefined,
  configuredToken: string | undefined,
  location: BrowserLocationLike,
  options: ResolveGatewayWebSocketUrlOptions = {},
): GatewayConnectionConfig {
  const parsed = normalizeGatewayAccessUrl(configuredUrl);

  if (options.preferSameOriginProxy) {
    return {
      url: `${getWebSocketOrigin(location)}${DEFAULT_PROXY_PATH}`,
      token: configuredToken || parsed.token,
    };
  }

  if (!parsed.url) {
    return {
      url: `${getWebSocketOrigin(location)}${DEFAULT_PROXY_PATH}`,
      token: configuredToken || parsed.token,
    };
  }

  if (parsed.url.startsWith("/")) {
    return {
      url: `${getWebSocketOrigin(location)}${parsed.url}`,
      token: configuredToken || parsed.token,
    };
  }

  return {
    url: parsed.url,
    token: configuredToken || parsed.token,
  };
}

export function resolveGatewayWebSocketUrl(
  configuredUrl: string | undefined,
  location: BrowserLocationLike,
  options: ResolveGatewayWebSocketUrlOptions = {},
) {
  return resolveGatewayConnectionConfig(configuredUrl, "", location, options).url;
}

export function getDefaultGatewayProxyPath() {
  return DEFAULT_PROXY_PATH;
}
