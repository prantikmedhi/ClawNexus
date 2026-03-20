# ClawNexus Office — Technical Documentation

> Professional visual monitoring and management frontend for the [OpenClaw](https://github.com/openclaw/openclaw) Multi-Agent system.

---

## Table of Contents

1. [Objective & Purpose](#1-objective--purpose)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Directory Structure](#4-directory-structure)
5. [Gateway Layer](#5-gateway-layer)
6. [State Management](#6-state-management)
7. [Component Layer](#7-component-layer)
8. [Hooks](#8-hooks)
9. [Utility Library](#9-utility-library)
10. [Data Flow](#10-data-flow)
11. [Key Patterns & Design Decisions](#11-key-patterns--design-decisions)
12. [Internationalization](#12-internationalization)
13. [Testing](#13-testing)
14. [Development & Build](#14-development--build)

---

## 1. Objective & Purpose

ClawNexus Office is a real-time frontend dashboard for monitoring and managing AI agent collaboration. It connects to the **OpenClaw Gateway** via WebSocket and renders a **virtual office metaphor** where each AI agent occupies a desk, walks between zones, and communicates visually.

### What it does

- **Visualizes AI agents** as characters in a 2D isometric floor plan (SVG) and optionally a 3D scene (React Three Fiber)
- **Streams real-time events** — lifecycle, tool calls, speech bubbles, errors — from the Gateway via WebSocket
- **Exposes a management console** for agents, channels, skills, cron jobs, and system configuration
- **Provides a chat interface** to talk directly with any agent and view streamed responses
- **Tracks metrics** — token usage, cost, activity heatmap — per agent and globally

### Core metaphor

| Real World     | ClawNexus Metaphor                         |
| -------------- | ------------------------------------------ |
| AI agent       | Employee avatar at a desk                  |
| Tool call      | Character animation + tool panel popup     |
| Text stream    | Speech bubble above avatar                 |
| Collaboration  | Animated line between avatars              |
| Meeting        | Agents walk to a shared meeting table      |
| Sub-agent      | Spawned character from a parent            |

---

## 2. Tech Stack

| Category         | Technology                                       |
| ---------------- | ------------------------------------------------ |
| Language         | TypeScript 5.8 (ESM, strict mode, no `any`)      |
| UI Framework     | React 19                                         |
| Build Tool       | Vite 6                                           |
| State Management | Zustand 5 + Immer 10                             |
| Styling          | Tailwind CSS 4                                   |
| 2D Rendering     | SVG + CSS Animations                             |
| 3D Rendering     | React Three Fiber (R3F) + @react-three/drei      |
| Routing          | React Router 7 (HashRouter)                      |
| Charts           | Recharts                                         |
| Markdown         | react-markdown (GFM)                             |
| i18n             | i18next + react-i18next                          |
| Testing          | Vitest + @testing-library/react + fake-indexeddb |
| Linting/Format   | Oxlint + Oxfmt                                   |
| Real-time        | Native WebSocket API                             |
| Persistence      | localStorage + IndexedDB                         |
| Node Requirement | >= 22                                            |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   React App                      │
│                                                  │
│  ┌──────────────┐     ┌─────────────────────┐   │
│  │  Office View  │     │   Console Pages     │   │
│  │  (2D / 3D)   │     │  /dashboard /agents │   │
│  │              │     │  /channels /skills  │   │
│  │  FloorPlan   │     │  /cron /settings    │   │
│  │  AgentAvatar │     │                     │   │
│  │  ChatDockBar │     │                     │   │
│  └──────┬───────┘     └──────────┬──────────┘   │
│         │                        │               │
│  ┌──────▼────────────────────────▼──────────┐   │
│  │           Zustand Stores                 │   │
│  │  office-store  │  console-stores/*       │   │
│  └──────┬─────────────────────┬─────────────┘   │
│         │                     │                  │
│  ┌──────▼─────────────────────▼─────────────┐   │
│  │         Gateway Adapter Layer            │   │
│  │  WsAdapter (real)  │  MockAdapter (dev)  │   │
│  └──────┬────────────────────────────────────┘   │
│         │                                        │
│  ┌──────▼────────────┐                           │
│  │  GatewayWsClient  │                           │
│  │  GatewayRpcClient │                           │
│  └──────┬────────────┘                           │
└─────────┼───────────────────────────────────────┘
          │ WebSocket
┌─────────▼───────────┐
│  OpenClaw Gateway   │
│  ws://localhost:18789│
└─────────────────────┘
```

**Separation of concerns:**

- `gateway/` — All WebSocket communication, protocol parsing, and event handling
- `store/` — Application state, mutations, and derived computations
- `components/` — Pure rendering and user interactions
- `hooks/` — Side effects that bridge gateway → store
- `lib/` — Stateless utility functions

---

## 4. Directory Structure

```
src/
├── main.tsx                        # Entry: ReactDOM.createRoot with HashRouter
├── App.tsx                         # Route definitions + gateway connection bootstrap
│
├── i18n/                           # Internationalization
│   ├── index.ts                    # i18next initialization
│   └── locales/en/                 # English translation files (by namespace)
│
├── gateway/                        # Gateway communication layer
│   ├── types.ts                    # Protocol frame types + VisualAgent types
│   ├── ws-client.ts                # WebSocket client (reconnect, frame routing)
│   ├── rpc-client.ts               # Promise-based RPC wrapper over WsClient
│   ├── event-parser.ts             # AgentEventPayload → ParsedAgentEvent
│   ├── adapter.ts                  # GatewayAdapter interface definition
│   ├── adapter-types.ts            # Data types for all adapter methods
│   ├── adapter-provider.ts         # Singleton adapter factory (waitForAdapter)
│   ├── ws-adapter.ts               # WsAdapter: real WebSocket implementation
│   ├── mock-adapter.ts             # MockAdapter: simulated data (VITE_MOCK=true)
│   ├── clawhub-client.ts           # ClawHub marketplace API client
│   └── mock-adapter.test.ts        # Tests for MockAdapter
│
├── store/                          # Zustand state stores
│   ├── office-store.ts             # Main office state (agents, links, metrics, UI)
│   ├── agent-reducer.ts            # Applies ParsedAgentEvent onto VisualAgent
│   ├── meeting-manager.ts          # Detects meeting groups + calculates seats
│   ├── metrics-reducer.ts          # Computes GlobalMetrics from agent state
│   ├── toast-store.ts              # Toast notification queue (max 5)
│   └── console-stores/             # Per-feature isolated stores
│       ├── agents-store.ts
│       ├── channels-store.ts
│       ├── chat-dock-store.ts
│       ├── config-store.ts
│       ├── cron-store.ts
│       ├── dashboard-store.ts
│       ├── settings-store.ts
│       ├── skills-store.ts
│       ├── clawhub-store.ts
│       └── agent-session-cleanup.ts
│
├── components/
│   ├── layout/                     # AppShell, ConsoleLayout, Sidebar, TopBar
│   ├── office-2d/                  # SVG floor plan components
│   │   ├── FloorPlan.tsx           # Root 1200×700 SVG canvas
│   │   ├── AgentAvatar.tsx         # Avatar + status ring + walk animation
│   │   ├── ConnectionLine.tsx      # Collaboration link SVG paths
│   │   ├── DeskUnit.tsx            # Desk + chair unit
│   │   ├── ZoneLabel.tsx           # Zone text labels
│   │   └── furniture/              # Desk, Chair, MeetingTable, Sofa, Plant, CoffeeCup
│   ├── office-3d/                  # R3F 3D scene (optional)
│   ├── chat/                       # Chat dock bar + dialog
│   │   ├── ChatDockBar.tsx
│   │   ├── ChatDialog.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MarkdownContent.tsx
│   │   ├── AgentSelector.tsx
│   │   └── ChatTimelineDrawer.tsx
│   ├── console/                    # All console page components
│   │   ├── agents/
│   │   ├── channels/
│   │   ├── skills/
│   │   ├── cron/
│   │   ├── dashboard/
│   │   ├── settings/
│   │   ├── shared/                 # EmptyState, LoadingState, ErrorState, StatusBadge
│   │   └── pages/                  # Route page components
│   ├── panels/                     # Right-sidebar panels
│   │   ├── AgentDetailPanel.tsx
│   │   ├── MetricsPanel.tsx        # Token chart, cost pie, activity heatmap
│   │   ├── EventTimeline.tsx
│   │   ├── SubAgentPanel.tsx
│   │   └── NetworkGraph.tsx
│   ├── overlays/
│   │   └── SpeechBubble.tsx        # HTML overlay rendered above SVG
│   └── shared/
│       ├── Avatar.tsx              # Colored initial avatar
│       ├── SvgAvatar.tsx           # Procedurally generated face SVG
│       ├── ToastContainer.tsx
│       ├── ConnectionSetupDialog.tsx
│       └── WorkspaceCustomization.tsx
│
├── hooks/
│   ├── useGatewayConnection.ts     # Main hook: connects WS, wires events → store
│   ├── useSubAgentPoller.ts        # Polls sessions.list() to detect sub-agents
│   ├── useUsagePoller.ts           # Polls usage.status() for token history
│   ├── useResponsive.ts            # Viewport breakpoints
│   └── useSidebarLayout.ts         # Sidebar collapse state
│
├── lib/
│   ├── constants.ts                # SVG geometry, zones, colors, avatar constants
│   ├── position-allocator.ts       # Deterministic desk/seat position assignment
│   ├── movement-animator.ts        # Walk path planning + interpolation
│   ├── avatar-generator.ts         # Hash-based avatar color + SVG face generation
│   ├── event-throttle.ts           # High-frequency event batching
│   ├── local-persistence.ts        # IndexedDB wrapper for event history
│   ├── gateway-url.ts              # WS URL resolution + same-origin proxy
│   ├── connection-preferences.ts   # localStorage preferences (mode, token)
│   ├── runtime-connection-api.ts   # POST /__clawnexus/connection for runtime switching
│   ├── config-patch-helpers.ts     # Config extraction + patch helpers
│   ├── provider-types.ts           # LLM provider type definitions
│   ├── cron-presets.ts             # Preset cron schedules
│   ├── channel-schemas.ts          # Channel config validation schemas
│   ├── uuid.ts                     # UUID v4 generation
│   ├── view-models.ts              # Derived view state computations
│   ├── webgl-detect.ts             # WebGL capability detection
│   └── message-utils.ts            # Message ID generation, text extraction
│
└── styles/
    └── globals.css                 # Tailwind imports + global overrides
```

---

## 5. Gateway Layer

The gateway layer is the boundary between the React app and the OpenClaw Gateway process. It handles WebSocket lifecycle, protocol framing, authentication, RPC, and event parsing.

### 5.1 WebSocket Client (`ws-client.ts`)

`GatewayWsClient` manages a single WebSocket connection with automatic reconnection.

**Reconnection policy:**
- Base delay: 1 second
- Max delay: 30 seconds (exponential backoff + 1s jitter)
- Max attempts: 20 before marking permanent error

**Connection states:** `connecting` → `connected` → `reconnecting` | `disconnected` | `error`

**Key methods:**

```typescript
connect(url: string, token: string): void
disconnect(): void
onEvent(eventName: string, handler): UnsubscribeFn
onStatusChange(handler): UnsubscribeFn
send(data: unknown): void
isConnected(): boolean
```

Frames are routed by `id` (matched to pending RPC handlers) or `event` (dispatched to registered listeners).

### 5.2 RPC Client (`rpc-client.ts`)

`GatewayRpcClient` wraps `GatewayWsClient` with a request-response promise pattern.

- Generates UUID request IDs automatically
- Default timeout: 10 seconds
- Throws `RpcError` on failure: `{ code: number; message: string }`

```typescript
request<T>(method: string, params?: unknown, timeoutMs?: number): Promise<T>
```

### 5.3 Authentication Flow

```
1. WS connect → Gateway sends   { event: "connect.challenge", data: { nonce } }
2. Client sends                 { method: "connect", client.id, scopes, auth.token }
3. Gateway responds             { event: "hello-ok", version, snapshot }
```

The snapshot contains the current health state (agent list), presence, and session defaults.

### 5.4 Event Parser (`event-parser.ts`)

`parseAgentEvent(payload)` converts raw `AgentEventPayload` → `ParsedAgentEvent`.

**Stream type mapping:**

| `stream`    | `data` field         | Result status  | UI action           |
| ----------- | -------------------- | -------------- | ------------------- |
| `lifecycle` | `phase: "start"`     | `working`      | Loading animation   |
| `lifecycle` | `phase: "thinking"`  | `thinking`     | Thinking indicator  |
| `lifecycle` | `phase: "end"`       | `idle`         | Clear activity      |
| `tool`      | `phase: "start"`     | `tool_calling` | Tool popup          |
| `tool`      | `phase: "end"`       | `thinking`     | Clear tool          |
| `assistant` | `text: "..."`        | `speaking`     | Speech bubble       |
| `error`     | `message: "..."`     | `error`        | Red indicator       |

Tool call history is capped at the last 10 per agent.

### 5.5 Adapter Pattern

The **`GatewayAdapter` interface** abstracts all communication behind a unified async API:

```
GatewayAdapter
├── Chat:     chatHistory / chatSend / chatAbort
├── Sessions: sessionsList / sessionsPreview / sessionsDelete
├── Channels: channelsStatus / channelsLogout / webLoginStart / webLoginWait
├── Skills:   skillsStatus / skillsInstall / skillsUpdate
├── Cron:     cronList / cronAdd / cronUpdate / cronRemove / cronRun
├── Agents:   agentsList / agentsCreate / agentsUpdate / agentsDelete
├── Tools:    toolsCatalog
├── Config:   configGet / configPatch / configWrite / configSchema
├── Status:   statusGet / statusSubscribe / updateRun
├── Files:    agentFilesList / agentFileGet / agentFileSet
└── Usage:    usageStatus
```

**`WsAdapter`** — real implementation that translates adapter calls into RPC requests and wires WebSocket events to a broadcast handler.

**`MockAdapter`** — simulated implementation for development (`VITE_MOCK=true`). Generates fake agent events on timers with no Gateway required.

**`adapter-provider.ts`** — singleton factory:

```typescript
initAdapter(mode: "ws" | "mock", deps?): Promise<GatewayAdapter>
getAdapter(): GatewayAdapter
waitForAdapter(timeoutMs?: number): Promise<GatewayAdapter>
```

Console stores use `waitForAdapter()` to safely handle startup race conditions.

---

## 6. State Management

All application state is managed with **Zustand 5 + Immer**. Immer's `enableMapSet()` allows direct mutation of `Map` and `Set` within draft updates.

### 6.1 Office Store (`office-store.ts`)

The largest store; owns the entire office visualization state.

**Key state:**

```typescript
agents: Map<string, VisualAgent>        // All agents by ID
links: CollaborationLink[]              // Inter-agent connections
globalMetrics: GlobalMetrics            // Active count, collaboration heat
connectionStatus: ConnectionStatus      // WS connection state
selectedAgentId: string | null          // Right-sidebar selection
eventHistory: EventHistoryItem[]        // Last 200 events
theme: "light" | "dark"
bloomEnabled: boolean                   // 3D bloom effect
tokenHistory: TokenSnapshot[]           // Time-series token data
agentCosts: Record<string, number>
customization: { floorColor, showBeams }
```

**Notable behaviors:**

- **Unconfirmed agents** — Events from unknown `agentId` create an "unconfirmed" placeholder at the corridor entrance. The agent is confirmed and moved to a desk when the health snapshot includes it. Auto-cleanup after 5 seconds if never confirmed.
- **Lounge pre-fill** — Placeholder agents occupy the lounge at startup to give visual feedback before real data arrives.
- **Zone migration timers** — Moving between desk ↔ hotDesk uses debounced 500ms timers to avoid flicker.
- **Removal TTL** — Removed agent IDs are cached for 30 seconds to prevent re-insertion from delayed events.

### 6.2 Agent Reducer (`agent-reducer.ts`)

`applyEventToAgent(agent, parsed)` mutates the `VisualAgent` draft directly (Immer-safe):

- Updates `agent.status` and `lastActiveAt`
- Sets / clears `currentTool` based on `clearTool` / `tool` flags
- Sets / clears `speechBubble` based on `clearSpeech` / `text` flags
- Increments `toolCallCount` and appends to `toolHistory` (cap: 10)
- Tracks `runId`

### 6.3 Meeting Manager (`meeting-manager.ts`)

`detectMeetingGroups(links)` — Analyses `CollaborationLink.strength` to find collaboration clusters:
- Threshold: 0.3 strength
- 2+ agents sharing a `sessionKey`
- Maximum 3 concurrent meetings

`calculateMeetingSeats(groupSize)` — Equi-angular positioning around a table center.

`applyMeetingGathering()` — Triggers walk animations to move grouped agents, throttled 500ms.

### 6.4 Metrics Reducer (`metrics-reducer.ts`)

`computeMetrics(agents, prev)`:
- Counts active (non-idle, non-offline) vs total real agents (excludes placeholders and unconfirmed)
- `collaborationHeat = (activeCount / totalCount) * 100`
- Preserves `tokenRate` and `totalTokens` from previous state

### 6.5 Console Stores

Each console page has an isolated Zustand store with its own fetch logic, loading states, and error handling:

| Store                    | Owns                                                    |
| ------------------------ | ------------------------------------------------------- |
| `agents-store`           | Agent list, selected agent, tabs (Files/Tools/Skills…)  |
| `channels-store`         | Channel list, config dialogs, WhatsApp QR login flow    |
| `skills-store`           | Installed skills, ClawHub marketplace, install options  |
| `cron-store`             | Cron tasks, add/edit dialogs                            |
| `dashboard-store`        | Stats, channel/skill summary, usage info                |
| `config-store`           | Full config snapshot, schema, restart lifecycle         |
| `settings-store`         | Theme, language, provider management UI state           |
| `clawhub-store`          | ClawHub skill catalog, installation flow                |
| `chat-dock-store`        | Messages, streaming state, session management           |
| `toast-store`            | Global toast queue (max 5)                              |

---

## 7. Component Layer

### 7.1 Layout

**`AppShell`** — Top-level wrapper for the office view. Initializes event history from IndexedDB, syncs theme, and houses `TopBar`, `Sidebar`, `WorkspaceCustomization`, and the content outlet.

**`ConsoleLayout`** — Mirror of `AppShell` for console route pages (`/dashboard`, `/agents`, etc.).

**`Sidebar`** — Collapsible navigation drawer with agent list and route links.

**`TopBar`** — Connection status indicator, theme toggle, language selector.

### 7.2 Office 2D (`office-2d/`)

**`FloorPlan.tsx`** — Root `<svg width="1200" height="700">` canvas.

- Defines 4 zones: **desk**, **meeting**, **hotDesk**, **lounge** (+ corridor)
- Renders layers in order: background → zone fills → furniture → agent avatars → collaboration lines → HTML overlays
- Memoizes agent groupings by zone (desk, hotDesk, lounge, meeting, walking, corridor)
- Custom SVG filters: `building-shadow`, `orange-glow`, `soft-shadow`
- Carpet weave and industrial grid patterns for visual depth

**`AgentAvatar.tsx`** — Individual agent circle with:
- Status color ring (idle → grey, thinking → blue, tool → orange, speaking → green, error → red)
- Walk animation via `requestAnimationFrame` (bob effect during movement)
- Selection highlight ring
- Hover state for tooltip
- Fully memoized

**`ConnectionLine.tsx`** — SVG `<path>` connecting two agents.
- Width and opacity scaled by `link.strength`
- Animated dashes for active collaboration

**Furniture components** (`furniture/`) — Pure SVG: `Desk`, `Chair`, `MeetingTable`, `Sofa`, `Plant`, `CoffeeCup`. All themeable.

### 7.3 Chat (`chat/`)

**`ChatDockBar.tsx`** — Bottom-docked input bar:
- `TextareaAutosize` for multi-line input
- Send, abort, and expand-to-dialog controls
- `AgentSelector` dropdown for choosing target agent
- Composition event handling (IME-safe)

**`ChatDialog.tsx`** — Full-size expandable chat window with scrollable message list.

**`MessageBubble.tsx`** — Individual message with role styling, timestamp, and Markdown content.

**`ChatTimelineDrawer.tsx`** — Slide-out event history sidebar.

### 7.4 Panels (`panels/`)

Right-sidebar panels shown when an agent is selected:

- **`AgentDetailPanel`** — Agent status, zone, tool call count, expandable sections
- **`MetricsPanel`** — Recharts: `TokenLineChart` (line), `CostPieChart` (pie), `ActivityHeatmap` (grid)
- **`EventTimeline`** — Chronological event log for the selected agent
- **`SubAgentPanel`** — Sub-agent hierarchy and parent link
- **`NetworkGraph`** — Collaboration force-graph visualization

### 7.5 Console Pages

**Agents console:**
- `AgentListPanel` — Searchable list
- `AgentDetailTabs` — Overview / Files / Tools / Skills / Channels / Cron
- `CreateAgentDialog`, `DeleteAgentDialog`

**Channels console:**
- `ChannelCard`, `ChannelConfigDialog`, `ChannelStatsBar`
- `WhatsAppQrFlow` — QR code-based authentication

**Skills console:**
- `SkillCard` (installed) + `MarketplaceSkillCard` (ClawHub)
- `InstallOptionsDialog`, `ClawHubInstallDialog`, `SkillDetailDialog`

**Cron console:**
- `CronTaskCard`, `CronTaskDialog` (add/edit), `CronStatsBar`

**Settings console:**
- `AppearanceSection` — Theme, language
- `GatewaySection` — URL, token, proxy
- `ProvidersSection` — LLM provider add/edit/model editor
- `UpdateSection`, `AboutSection`, `DeveloperSection`, `AdvancedSection`

**Shared:** `EmptyState`, `LoadingState`, `ErrorState`, `ConfirmDialog`, `StatusBadge`

### 7.6 Overlays & Shared

**`SpeechBubble.tsx`** — Rendered as a React portal above the SVG canvas. Displays streaming Markdown text for speaking agents.

**`SvgAvatar.tsx`** — Procedurally generated face: face shape (round/square/oval), hair style (5 options), eye style (3 options), all hash-deterministic from `agentId`.

**`ConnectionSetupDialog.tsx`** — Initial setup wizard for Gateway connection mode (local/remote), URL, and token input.

---

## 8. Hooks

### `useGatewayConnection.ts`

The main orchestration hook called from `App.tsx`:

1. Reads connection preferences from `localStorage`
2. Creates `GatewayWsClient` and `GatewayRpcClient`
3. Calls `initAdapter("ws" | "mock")`
4. Registers event handlers:
   - `agent` → `processAgentEvent()` via `EventThrottle`
   - `health` → `initAgents(summaries)`
   - `presence`, `heartbeat`, `shutdown` → store updates
5. Fetches Gateway config (`maxSubAgents`, `agentToAgent`)
6. Spawns `useSubAgentPoller` and `useUsagePoller`
7. Returns `{ wsClient, rpcClient }`

### `useSubAgentPoller.ts`

Polls `sessions.list()` on a configurable interval to detect sub-agent spawning and cleanup. Updates `office-store` with new or removed sub-agents.

### `useUsagePoller.ts`

Polls `usage.status()` periodically, appending `TokenSnapshot` records to `tokenHistory` in the store for the line chart.

### `useResponsive.ts`

Returns `{ isMobile, isTablet, isDesktop }` based on `window.innerWidth` breakpoints with a `resize` listener.

### `useSidebarLayout.ts`

Manages sidebar collapse state and responsive auto-collapse behavior.

---

## 9. Utility Library

### `constants.ts`

Single source of truth for all layout geometry:

```typescript
SVG_WIDTH = 1200
SVG_HEIGHT = 700

ZONES = {
  desk:    { x, y, width, height }
  meeting: { x, y, width, height }
  hotDesk: { x, y, width, height }
  lounge:  { x, y, width, height }
}

ZONE_COLORS        // Light theme palette
ZONE_COLORS_DARK   // Dark theme palette
STATUS_COLORS      // Status → hex color map
```

### `position-allocator.ts`

**Deterministic position assignment** — no randomness, consistent across reconnects:

- `allocatePosition(agentId, isSubAgent, occupied)` — Hash `agentId` to a grid slot. Falls back to nearest free slot.
- Desk grid: 4×4 slots; HotDesk grid: 3×3 slots
- `allocateMeetingPositions(n, center)` — Equi-angular N seats around a center point

### `movement-animator.ts`

**Path planning through the corridor:**

- `planWalkPath(from, to, fromZone, toZone)` — Generates waypoints: exit zone via door → traverse corridor → enter target zone
- `calculateWalkDuration(distance)` — Returns ms based on constant walking speed
- `interpolatePathPosition(path, elapsed)` — Linear interpolation along waypoints

### `avatar-generator.ts`

**All generation is deterministic from `agentId`:**

- `generateAvatar(agentId, agentName?)` — Returns `{ initials, backgroundColor, textColor }` using a 12-color palette and luminance-based contrast
- `generateSvgAvatar(agentId)` — Returns SVG markup for a face with hash-chosen: face shape, hair style (5 options), eye style (3 options), skin/hair/shirt color

### `event-throttle.ts`

Batches high-frequency events (e.g., rapid tool calls) over a configurable window. Prevents React re-render storms. Falls through immediately for critical state transitions.

### `local-persistence.ts`

IndexedDB wrapper for `EventHistoryItem` storage. Persists event history across page reloads. Used to restore timeline view on mount.

### `gateway-url.ts`

Resolves the correct WebSocket URL:
- Same-origin → proxy through `/gateway-ws` (configured in Vite dev plugin)
- Remote → direct `ws://` or `wss://` connection
- Converts `http://` ↔ `ws://` protocols automatically

### `runtime-connection-api.ts`

Communicates with the custom Vite plugin endpoint `/__clawnexus/connection` to switch Gateway connection at runtime without a page reload.

---

## 10. Data Flow

### Initialization Sequence

```
main.tsx
  └─ App.tsx
      └─ useGatewayConnection()
          ├─ GatewayWsClient.connect(url, token)
          │   └─ WS opens → challenge/response auth
          ├─ initAdapter("ws" | "mock")
          │   └─ WsAdapter.init() OR MockAdapter.init()
          ├─ wsClient.onEvent("health")
          │   └─ office-store.initAgents(summaries)
          │       ├─ createVisualAgent() for each
          │       ├─ allocatePosition() → deterministic desk slot
          │       └─ prefillLoungePlaceholders()
          └─ wsClient.onEvent("agent")
              └─ EventThrottle → processAgentEvent()
```

### Event Processing Pipeline

```
Raw WS frame (agent event)
  │
  ▼
EventThrottle.push(event)
  │  (batch or immediate)
  ▼
office-store.processAgentEvent(event)
  ├─ event-parser.parseAgentEvent(event)
  │   └─ → ParsedAgentEvent { status, text, tool, clearTool, clearSpeech, … }
  ├─ Look up agent (or create unconfirmed)
  ├─ agent-reducer.applyEventToAgent(agent, parsed)
  │   └─ Mutate status, speech, tool, metrics counters
  ├─ Update runId → agentId mapping
  ├─ Append to eventHistory (cap 200)
  ├─ Check collaboration link strength → maybe moveToMeeting()
  └─ metrics-reducer.computeMetrics()
```

### Chat Flow

```
User types → ChatDockBar
  ├─ Resolve target agentId from AgentSelector
  ├─ Build sessionKey: "agent:{agentId}:main"
  ├─ adapter.chatSend({ sessionKey, message, idempotencyKey })
  └─ WS events fire: { event: "chat", state: "delta" | "final" | "error" }
      └─ chat-dock-store processes delta stream
          ├─ Append/update message
          ├─ Set isStreaming flag
          └─ On "final": mark complete, persist to history
```

### Agent Walking Animation

```
office-store.startMovement(agentId, toZone)
  ├─ movement-animator.planWalkPath(from, to)
  │   └─ Waypoints: current → zone door → corridor → target door → seat
  └─ Set agent.movement = { path, elapsed: 0, duration }

requestAnimationFrame loop (AgentAvatar.tsx)
  └─ office-store.tickMovement(agentId, deltaTime)
      ├─ elapsed += deltaTime
      ├─ interpolatePathPosition(path, elapsed)
      │   └─ → { x, y }
      ├─ Update agent.position
      └─ If elapsed >= duration: completeMovement(agentId)
```

---

## 11. Key Patterns & Design Decisions

### Deterministic Generation

Agent positions, avatar colors, and SVG face features are all derived by hashing `agentId`. This ensures that an agent always appears in the same desk with the same face across reconnects and sessions.

### Unconfirmed Agent Handling

When an event arrives for an unknown agent (e.g., an agent started before the frontend connected), ClawNexus creates an "unconfirmed" placeholder at the corridor entrance. When the health snapshot confirms the agent, it is moved to its real desk. If no confirmation arrives within 5 seconds, the placeholder is removed. This prevents invisible events while gracefully handling race conditions.

### Adapter Pattern with Waiters

Console pages are decoupled from WebSocket initialization by the `waitForAdapter()` async waiter. Pages don't mount their data-fetching logic until the adapter is ready, safely handling the startup race between route navigation and WebSocket auth.

### Zone-Based Routing Through Corridor

The office has 4 named zones + a corridor hub. All inter-zone movement routes through the corridor. `planWalkPath` generates waypoints: exit current zone through its door → traverse corridor center → enter target zone through its door → arrive at seat. This keeps animations realistic regardless of which zones are adjacent.

### Meeting Detection

`detectMeetingGroups()` monitors `CollaborationLink` strength every 500ms (throttled). When 2+ agents share a `sessionKey` with strength > 0.3, they are moved to a meeting table. Maximum 3 concurrent meetings. Agents return to their desks when the session ends.

### Event History & Memory Limits

| Resource           | Limit                  | Why                          |
| ------------------ | ---------------------- | ---------------------------- |
| Event history      | 200 items              | Prevent IndexedDB bloat      |
| Tool call history  | 10 per agent           | Sidebar display cap          |
| Toasts             | 5 concurrent           | Prevent UI overflow          |
| Removed agent TTL  | 30 seconds             | Prevent re-insertion         |
| Collaboration link | 60 second timeout      | Stale connection cleanup     |
| WS reconnect       | 20 attempts            | Prevent infinite retry loops |

### Theming

Theme (`light` | `dark`) is persisted to `localStorage`. Zone colors, status colors, and furniture SVGs all switch via theme-aware constants. Tailwind CSS 4 dark mode classes handle component-level theming.

### Connection Setup

First-run setup is handled by `ConnectionSetupDialog`, which lets users choose local or remote mode and enter URL + token. The choice is persisted via `connection-preferences.ts`. At runtime, the connection can be changed via the Settings page, which POSTs to `/__clawnexus/connection` (a custom Vite plugin endpoint) to reconfigure the proxy without a page reload.

---

## 12. Internationalization

**Framework:** i18next + react-i18next

**Namespaces:**

| Namespace  | Covers                                          |
| ---------- | ----------------------------------------------- |
| `common`   | General UI, error messages, status labels        |
| `layout`   | Navigation, sidebar, top bar                    |
| `office`   | Floor plan, zones, agent states                 |
| `panels`   | Detail panels, metrics charts                   |
| `chat`     | Chat dock, messages, streaming states           |
| `console`  | All console pages, dialogs, form labels         |

**Usage in React components:**
```typescript
const { t } = useTranslation("office")
t("zones.desk")
```

**Usage outside React:**
```typescript
import i18n from "@/i18n"
i18n.t("common:status.idle")
```

**Rule:** All user-visible strings must go through i18n. Technical identifiers, CSS classes, and import paths are excluded.

---

## 13. Testing

**Framework:** Vitest + @testing-library/react

**Environment:** jsdom with `fake-indexeddb` for IndexedDB simulation.

**Test file locations:** Co-located with source, e.g., `src/gateway/mock-adapter.test.ts`.

**Mock adapter tests** cover:
- Event emission (agent lifecycle, tool calls, assistant text, errors)
- Chat send/abort/history
- Sessions, channels, skills, cron, agents CRUD

**Required test coverage:**
- `store/` reducers and actions
- `gateway/event-parser.ts`
- `gateway/mock-adapter.ts`

**Component tests:** Key user interactions (send message, select agent, open dialogs) tested with `@testing-library/react`.

**Running tests:**
```bash
pnpm test           # Single run
pnpm test:watch     # Watch mode
pnpm typecheck      # TypeScript strict check
```

---

## 14. Development & Build

### Prerequisites

1. **Node.js >= 22**, pnpm
2. **OpenClaw Gateway** running at `ws://localhost:18789`
3. **Gateway token** — write to `.env.local`:
   ```
   VITE_GATEWAY_TOKEN=<token from: openclaw config get gateway.auth.token>
   ```
4. **Device auth bypass** (Gateway 2026.2.15+):
   ```bash
   openclaw config set gateway.controlUi.dangerouslyDisableDeviceAuth true
   ```

### Environment Variables

| Variable              | Default                      | Purpose                          |
| --------------------- | ---------------------------- | -------------------------------- |
| `VITE_GATEWAY_TOKEN`  | —                            | Gateway authentication token     |
| `VITE_MOCK`           | `false`                      | Use MockAdapter instead of WS    |
| `VITE_GATEWAY_URL`    | `ws://localhost:18789`       | Gateway WebSocket URL            |

### Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on http://localhost:5180
pnpm build            # TypeScript check + Vite production build → dist/
pnpm preview          # Serve dist/ for local preview
pnpm test             # Run Vitest
pnpm test:watch       # Vitest watch mode
pnpm typecheck        # tsc --noEmit strict check
pnpm lint             # Oxlint check
pnpm format           # Oxfmt format
pnpm check            # lint + format check (CI gate)
```

### Vite Dev Plugin

The `clawnexus-dev-connection` Vite plugin adds two endpoints:
- `GET /__clawnexus/connection` — Returns current Gateway URL and mode
- `POST /__clawnexus/connection` — Updates the active proxy target at runtime
- `ws /gateway-ws` — WebSocket reverse proxy to the Gateway

This allows the frontend to connect to the Gateway without CORS issues during development.

### Production Build

`pnpm build` outputs a static site to `dist/`. This can be:
- Served by any static file server
- Embedded in the OpenClaw distribution as a built artifact
- Run via the CLI binary: `clawnexus-office` (entry: `bin/openclaw-office.js`)

### Code Quality Gates (before merging)

- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm check` — zero lint/format issues
- [ ] `pnpm test` — all tests pass
- [ ] No `any` types introduced
- [ ] All new user-visible strings added to i18n locale files
- [ ] Files under 500 lines (split if exceeded)

---

*Documentation generated from source code analysis. For protocol-level details, refer to the OpenClaw main repository source files listed in [CLAUDE.md](CLAUDE.md).*
