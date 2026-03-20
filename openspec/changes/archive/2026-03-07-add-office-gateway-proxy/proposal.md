## Why

OpenClaw Office currently expects browsers to connect to the Gateway directly, with a default of `ws://localhost:18789`. That prevents external access when Gateway intentionally stays bound to `localhost`, and it forces operators to expose or reconfigure Gateway instead of keeping Office as the single public entry point.

## What Changes

- Add a built-in Node.js reverse proxy to the Office production server so browsers can connect to Office over HTTP/WebSocket while Office forwards Gateway traffic to a locally reachable Gateway endpoint.
- Make the Office frontend use an Office-hosted WebSocket path for Gateway access instead of assuming the browser can reach `ws://localhost:18789` directly.
- Add startup configuration for the upstream Gateway address, defaulting to `ws://localhost:18789`, and persist operator-provided values automatically for future restarts.
- Keep the scope limited to proxying and persisted Gateway address management; do not change Gateway behavior, transport protocol, or broader Office feature flows.

## Capabilities

### New Capabilities
- `office-gateway-proxy`: Provide a production-grade Office-hosted WebSocket proxy endpoint that forwards browser traffic to the configured upstream Gateway.
- `office-gateway-settings`: Persist and reuse the configured upstream Gateway address so Office can be installed and restarted with a stable runtime configuration.

### Modified Capabilities

None.

## Impact

- Affects the production Office server entrypoint in `bin/openclaw-office.js`.
- Affects frontend Gateway connection bootstrapping in `src/App.tsx` and related runtime config injection.
- Introduces local configuration persistence for the Office server installation/runtime.
- May require tests around proxy connection handling, persisted config resolution, and frontend URL selection.

## Operational Risks

- Proxy loops, stale persisted Gateway URLs, or mixed-origin assumptions can make the feature appear healthy while breaking operator access.
- Startup precedence must remain explainable so debugging a bad Gateway target does not require code inspection.
- The frontend and production server must evolve together or the deployment story regresses silently.

## Acceptance Indicators

- A remote browser can operate Office while Gateway remains bound to localhost.
- Persisted overrides survive restart and are superseded cleanly by stronger config sources.
- Connection failures surface quickly and in a way operators can act on.
