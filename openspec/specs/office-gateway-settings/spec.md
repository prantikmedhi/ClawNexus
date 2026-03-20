# office-gateway-settings Specification

## Purpose
Define how ClawNexus Office resolves, persists, and reuses the upstream OpenClaw Gateway WebSocket address so deployment remains predictable across restarts and environments.
## Requirements
### Requirement: Office SHALL support configurable upstream Gateway addresses
The Office production server SHALL allow operators to set the upstream Gateway WebSocket address through startup configuration while defaulting to `ws://localhost:18789` when no explicit value is available.

#### Scenario: No explicit Gateway address is configured
- **WHEN** Office starts without a CLI-provided, environment-provided, or persisted upstream Gateway address
- **THEN** Office uses `ws://localhost:18789` as the upstream Gateway WebSocket address

#### Scenario: Operator provides a Gateway address at startup
- **WHEN** Office starts with an explicit upstream Gateway WebSocket address
- **THEN** Office uses that address for new proxy connections

### Requirement: Office SHALL persist upstream Gateway address changes
The Office production server SHALL automatically persist operator-provided upstream Gateway WebSocket addresses so the same value is reused on subsequent restarts until it is replaced.

#### Scenario: CLI-provided address updates persisted config
- **WHEN** Office starts with a CLI-provided upstream Gateway WebSocket address that differs from the persisted value
- **THEN** Office stores the new address and reuses it on later starts that do not provide an explicit override

#### Scenario: Environment-provided address updates persisted config
- **WHEN** Office starts with an environment-provided upstream Gateway WebSocket address and no CLI override
- **THEN** Office stores that address and reuses it on later starts that do not provide an explicit override

#### Scenario: Persisted address is reused
- **WHEN** Office restarts without CLI or environment overrides and a persisted upstream Gateway WebSocket address exists
- **THEN** Office uses the persisted address for proxy connections

### Requirement: Office SHALL make Gateway source resolution debuggable
The Office production server SHALL make the effective upstream Gateway WebSocket address and its winning configuration source discoverable enough for operators to diagnose misconfiguration quickly.

#### Scenario: Startup selects an explicit override
- **WHEN** Office starts with a CLI-provided or environment-provided Gateway address
- **THEN** the server reports the effective address and whether it came from CLI or environment configuration

#### Scenario: Startup falls back to stored or default configuration
- **WHEN** Office starts without a stronger explicit override
- **THEN** the server reports whether the effective address came from persisted configuration or the built-in default
