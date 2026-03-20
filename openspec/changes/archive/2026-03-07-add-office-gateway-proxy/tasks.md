## 1. Runtime configuration persistence

- [x] 1.1 Add Office runtime config loading with precedence `CLI > env > persisted file > default ws://localhost:18789` in the production server entrypoint
- [x] 1.2 Persist operator-provided upstream Gateway addresses automatically when CLI or environment values are supplied
- [x] 1.3 Log the effective upstream Gateway address and its config source at startup without changing existing token handling

## 2. Production WebSocket proxy

- [x] 2.1 Add a same-origin WebSocket proxy endpoint to the production Office server and forward upgrade traffic to the resolved upstream Gateway address
- [x] 2.2 Relay frames and lifecycle events bidirectionally, including clean shutdown when either downstream or upstream closes or errors
- [x] 2.3 Add automated coverage for config resolution and WebSocket proxy behavior using the existing test stack where practical

## 3. Frontend runtime integration

- [x] 3.1 Change runtime config injection so the frontend receives the Office-hosted Gateway proxy endpoint instead of the upstream Gateway address
- [x] 3.2 Update frontend Gateway bootstrap logic to consume the Office proxy endpoint while preserving existing token usage and connection flow
- [x] 3.3 Verify the packaged Office build works when Gateway stays local-only at `ws://localhost:18789` and when operators override the upstream Gateway address

## Advanced Execution Notes

- Keep the implementation order aligned to configuration, then proxying, then frontend consumption so each layer has a stable contract.
- Re-run packaged build smoke tests after each phase to catch environment-specific regressions early.
- Capture evidence for restart persistence, same-origin endpoint selection, and close or error handling before archiving work.
