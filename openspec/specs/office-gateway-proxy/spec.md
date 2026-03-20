# office-gateway-proxy Specification

## Purpose
Ensure ClawNexus Office exposes a same-origin WebSocket bridge so remote browsers can reach OpenClaw Gateway through Office without requiring direct Gateway network exposure.
## Requirements
### Requirement: Office SHALL proxy Gateway WebSocket traffic
The Office production server SHALL expose a same-origin WebSocket endpoint that accepts browser connections and forwards them to the configured upstream OpenClaw Gateway WebSocket address.

#### Scenario: Browser connects through Office proxy
- **WHEN** a browser opens the Office WebSocket proxy endpoint
- **THEN** the Office server forwards the connection to the configured upstream Gateway WebSocket address and relays frames bidirectionally

#### Scenario: Upstream Gateway is local-only
- **WHEN** the upstream Gateway address is `ws://localhost:18789`
- **THEN** external browsers can still use Office without directly connecting to the Gateway process

#### Scenario: Upstream connection fails
- **WHEN** the Office server cannot establish or maintain the upstream Gateway WebSocket connection
- **THEN** the proxy connection SHALL close cleanly and surface a connection failure to the browser client

### Requirement: Frontend SHALL use the Office-hosted proxy endpoint
The Office frontend SHALL bootstrap Gateway connectivity through the Office-hosted WebSocket proxy endpoint rather than assuming the browser can directly reach the upstream Gateway address.

#### Scenario: Runtime config is injected by Office server
- **WHEN** the Office server renders the production HTML shell
- **THEN** the frontend receives runtime configuration that points Gateway connectivity at the Office-hosted proxy endpoint

#### Scenario: Browser accesses Office from a remote host
- **WHEN** a user opens Office via a LAN or WAN hostname or IP address
- **THEN** the frontend connects back to the same Office origin for Gateway traffic instead of using `ws://localhost:18789`

### Requirement: Proxy connectivity SHALL preserve the existing control flow
The Office frontend and production server SHALL route Gateway traffic through the Office-hosted proxy without changing the existing authentication token flow or requiring browsers to learn the upstream Gateway address.

#### Scenario: Frontend bootstraps against Office origin
- **WHEN** the frontend receives runtime configuration from the Office server
- **THEN** it uses the Office-hosted proxy endpoint while preserving the existing token-based connection handshake

#### Scenario: Operators inspect a remote deployment
- **WHEN** Office is opened from a non-local hostname or IP address
- **THEN** browser Gateway traffic still resolves against the Office origin instead of the upstream Gateway host
