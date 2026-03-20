## ADDED Requirements

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

### Scenario: Effective Gateway source is observable
- **WHEN** Office resolves the upstream Gateway address at startup
- **THEN** operators can determine whether the final value came from CLI input, environment configuration, persisted state, or the default fallback
