## Context

OpenClaw Office already ships a small Node.js production server in `bin/openclaw-office.js` that serves built assets and injects runtime configuration into `index.html`. The frontend currently reads the injected `gatewayUrl` or falls back to `ws://localhost:18789`, which only works when the browser itself can reach the Gateway directly.

The desired deployment model keeps OpenClaw Gateway bound to `ws://localhost:18789` on the host machine, while exposing only Office to the network. Operators also want a simple installation and startup experience, with startup-time Gateway address configuration that persists automatically across restarts.

This change is cross-cutting because it affects the production server runtime, frontend bootstrap behavior, and runtime configuration persistence. It also introduces a security-sensitive traffic path that later lightweight authentication can sit in front of.

## Goals / Non-Goals

**Goals:**
- Allow external browsers to use Office without direct network access to the Gateway process.
- Keep the default upstream Gateway target aligned with the existing OpenClaw local default: `ws://localhost:18789`.
- Add a production WebSocket proxy endpoint hosted by Office and make the frontend use that endpoint.
- Accept a configurable upstream Gateway address from startup parameters and persist it automatically for subsequent runs.
- Preserve the current one-command installation and startup model.

**Non-Goals:**
- Do not migrate the app to Next.js or any SSR framework.
- Do not change Gateway bind behavior, authentication flow, or wire protocol.
- Do not add the lightweight authentication feature itself in this change.
- Do not redesign the broader frontend routing, build pipeline, or developer experience beyond what is required for the proxy path.

## Decisions

### Reuse the existing Node.js production server as the proxy host

The Office server in `bin/openclaw-office.js` will become the single public process responsible for serving static assets and proxying WebSocket traffic to Gateway.

Rationale:
- It preserves the existing installation model and CLI entrypoint.
- It avoids introducing a second mandatory runtime such as Nginx or a new framework server.
- It keeps future authentication and access control in the same process boundary that users already expose publicly.

Alternatives considered:
- Nginx/Caddy sidecar: operationally valid, but adds an external dependency and weakens the “npm install and run” requirement.
- Next.js migration: technically possible, but disproportionate for a static admin UI that only needs a small BFF/proxy layer.
- Browser-direct WebSocket to Gateway: incompatible with the requirement to keep Gateway local-only.

### Use a same-origin Office proxy endpoint for browser connections

The frontend will stop defaulting to a browser-visible upstream address. Instead, runtime config will provide a same-origin WebSocket path, and the production server will expose that path and forward upgrade traffic to the configured Gateway upstream.

Rationale:
- Browsers can always reach the Office origin they loaded from.
- The upstream Gateway address remains private to the server process and does not need to be exposed to clients.
- This creates a stable integration point for future authentication and policy checks.

Alternatives considered:
- Keep injecting the upstream Gateway URL directly: fails when Gateway is local-only and leaks internal topology.
- Compute a host-relative upstream URL in the browser: still requires Gateway to bind publicly.

### Persist the upstream Gateway address in a local Office runtime config file

The production server will resolve the upstream Gateway address from CLI args first, then environment, then persisted Office runtime config, finally falling back to `ws://localhost:18789`. When a CLI or env value is provided and differs from the persisted value, Office will write the new value to the runtime config automatically.

Rationale:
- Operators get a simple “set once, reuse later” workflow.
- CLI remains the highest-precedence control surface.
- Persistence belongs to Office, not Gateway, which matches the deployment boundary.

Alternatives considered:
- Environment variables only: stateless but inconvenient for repeated local installs and restarts.
- Frontend-managed local storage: wrong trust boundary and unavailable to the server-side proxy.
- Reuse Gateway config files: couples Office deployment to Gateway internals and violates the requirement to avoid Gateway changes.

### Keep development-mode behavior minimally changed

This change targets the production Office server first. Vite dev proxy behavior may be aligned for convenience, but the required contract is that production builds work without external proxies.

Rationale:
- The user requirement is specifically about publicly exposed Office with a local-only Gateway.
- Minimizing dev-only changes reduces unrelated surface area in the proposal.

## Risks / Trade-offs

- [Proxy implementation complexity] -> Use a well-understood Node WebSocket proxy flow with explicit upgrade handling, connection cleanup, and upstream failure propagation.
- [Persisted config drift from operator intent] -> Define a clear precedence order (CLI > env > persisted file > default) and log the effective upstream source at startup.
- [Future auth coupling] -> Keep proxy routing and auth checks separated so lightweight authentication can wrap the same endpoint later without redesign.
- [Server-only feature gap in development] -> Keep the spec scoped to production behavior and treat any dev alignment as optional follow-up.
- [Single-process failure domain] -> Accept that Office becomes the public edge process; mitigate with simple logging and deterministic startup behavior rather than adding new infrastructure now.

## Migration Plan

1. Add persisted runtime config loading/writing to the Office server.
2. Add a same-origin WebSocket proxy endpoint on the Office server that forwards to the resolved upstream Gateway address.
3. Update the frontend bootstrap path to connect through the Office proxy endpoint in production mode.
4. Verify Office can be started once with an explicit upstream address and restarted without repeating the parameter.
5. Rollback by deploying the previous Office build, which removes the proxy endpoint and falls back to direct Gateway configuration.

## Open Questions

- The persisted runtime config file path should be chosen to match Office packaging expectations without overlapping Gateway-owned files.
- HTTP proxying is out of scope unless later Office features require non-WebSocket Gateway calls at the server boundary.

## Advanced Design Notes

- Keep the public boundary at Office, not Gateway, so topology and security posture stay simple for operators.
- Resolve effective Gateway configuration once, expose its provenance for debugging, and keep token handling unchanged.
- Model proxy lifecycle as paired downstream and upstream states to avoid leaks, half-open sockets, and confusing retries.

## Verification Strategy

- Unit-test config precedence, persistence, and source reporting.
- Integration-test bidirectional frame relay and close or error propagation.
- Smoke-test the packaged Office build for both localhost Gateway defaults and operator-provided upstream overrides.
