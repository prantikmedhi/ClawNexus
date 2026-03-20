import type { AgentVisualStatus } from "@/gateway/types";
import i18n from "@/i18n";

export const SVG_WIDTH = 1200;
export const SVG_HEIGHT = 700;

// Unified office floor plan: one building shell with internal partitions
export const OFFICE = {
  x: 30,
  y: 20,
  width: SVG_WIDTH - 60,
  height: SVG_HEIGHT - 40,
  wallThickness: 6,
  cornerRadius: 18,
  corridorWidth: 28,
} as const;

const halfW = (OFFICE.width - OFFICE.corridorWidth) / 2;
const halfH = (OFFICE.height - OFFICE.corridorWidth) / 2;
const rightX = OFFICE.x + halfW + OFFICE.corridorWidth;
const bottomY = OFFICE.y + halfH + OFFICE.corridorWidth;

export const ZONES = {
  desk: { x: OFFICE.x, y: OFFICE.y, width: halfW, height: halfH, label: "Desk Area" },
  meeting: { x: rightX, y: OFFICE.y, width: halfW, height: halfH, label: "Meeting Room" },
  hotDesk: { x: OFFICE.x, y: bottomY, width: halfW, height: halfH, label: "Hot Desks" },
  lounge: { x: rightX, y: bottomY, width: halfW, height: halfH, label: "Lounge" },
} as const;

// Corridor entrance point: bottom center of the building (main entrance door)
export const CORRIDOR_ENTRANCE = {
  x: ZONES.lounge.x + ZONES.lounge.width / 2,
  y: OFFICE.y + OFFICE.height - 30,
} as const;

// Corridor center crossing point
export const CORRIDOR_CENTER = {
  x: OFFICE.x + OFFICE.width / 2,
  y: OFFICE.y + OFFICE.height / 2,
} as const;

export const ZONE_COLORS = {
  desk: "#f4f6f9",
  meeting: "#eef3fa",
  hotDesk: "#f1f3f7",
  lounge: "#f3f1f7",
  corridor: "#e8ecf1",
  wall: "#8b9bb0",
} as const;

export const ZONE_COLORS_DARK = {
  desk: "#1e293b",
  meeting: "#1a2744",
  hotDesk: "#1e2433",
  lounge: "#231e33",
  corridor: "#0f172a",
  wall: "#475569",
} as const;

export const STATUS_COLORS: Record<AgentVisualStatus, string> = {
  idle: "#22c55e",
  thinking: "#3b82f6",
  tool_calling: "#f97316",
  speaking: "#a855f7",
  spawning: "#06b6d4",
  error: "#ef4444",
  offline: "#6b7280",
};

export const STATUS_LABELS: Record<AgentVisualStatus, string> = {
  idle: "Idle",
  thinking: "Thinking",
  tool_calling: "Tool Calling",
  speaking: "Speaking",
  spawning: "Spawning",
  error: "Error",
  offline: "Offline",
};

export function getZoneLabel(zone: keyof typeof ZONES): string {
  return i18n.t(`common:zones.${zone}`);
}

export function getStatusLabel(status: AgentVisualStatus): string {
  return i18n.t(`common:agent.statusLabels.${status}`);
}

export const DESK_GRID_COLS = 4;
export const DESK_GRID_ROWS = 3;
export const DESK_MAX_AGENTS = DESK_GRID_COLS * DESK_GRID_ROWS;

export const HOT_DESK_GRID_COLS = 4;
export const HOT_DESK_GRID_ROWS = 3;

export const MIN_DESK_WIDTH = 100;
export const DEFAULT_MAX_SUB_AGENTS = 8;

// Furniture size constants (flat isometric 2D)
export const FURNITURE = {
  desk: { width: 100, height: 60 },
  chair: { size: 30 },
  meetingTable: { minRadius: 60, maxRadius: 100 },
  sofa: { width: 110, height: 50 },
  plant: { width: 28, height: 36 },
  coffeeCup: { size: 14 },
} as const;

// Desk unit (Desk + Chair + AgentAvatar)
export const DESK_UNIT = {
  width: 140,
  height: 110,
  avatarRadius: 20,
  avatarOffsetY: -8,
} as const;

// Agent Avatar
export const AVATAR = {
  radius: 20,
  selectedRadius: 24,
  strokeWidth: 3,
  nameLabelMaxChars: 12,
} as const;


