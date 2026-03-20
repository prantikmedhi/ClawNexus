import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EventHistoryItem } from "@/gateway/types";
import { useOfficeStore } from "@/store/office-store";

const ROWS = 10;
const COLS = 24;
const CELL_W = 10;
const CELL_H = 14;

const COLOR_SCALE_LIGHT = [
  { max: 0, color: "#f1f5f9" },
  { max: 5, color: "#bae6fd" },
  { max: 10, color: "#38bdf8" },
  { max: Infinity, color: "#0284c7" },
];

const COLOR_SCALE_DARK = [
  { max: 0, color: "#1e293b" },
  { max: 5, color: "#0c4a6e" },
  { max: 10, color: "#075985" },
  { max: Infinity, color: "#0ea5e9" },
];

function getColor(count: number, isDark: boolean): string {
  const scale = isDark ? COLOR_SCALE_DARK : COLOR_SCALE_LIGHT;
  for (const s of scale) {
    if (count <= s.max) return s.color;
  }
  return scale[scale.length - 1].color;
}

function buildHeatmapData(eventHistory: EventHistoryItem[]): { agentId: string; agentName: string; counts: number[] }[] {
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const byAgent = new Map<string, { name: string; counts: number[] }>();

  for (const e of eventHistory) {
    const hoursAgo = (now - e.timestamp) / hourMs;
    if (hoursAgo < 0 || hoursAgo >= COLS) continue;
    const colIdx = 23 - Math.min(23, Math.floor(hoursAgo));
    let entry = byAgent.get(e.agentId);
    if (!entry) {
      entry = { name: e.agentName, counts: new Array(COLS).fill(0) };
      byAgent.set(e.agentId, entry);
    }
    entry.counts[colIdx]++;
  }

  return Array.from(byAgent.entries())
    .map(([agentId, { name, counts }]) => ({ agentId, agentName: name, counts }))
    .sort((a, b) => b.counts.reduce((s, c) => s + c, 0) - a.counts.reduce((s, c) => s + c, 0))
    .slice(0, ROWS);
}

export function ActivityHeatmap() {
  const { t } = useTranslation(["panels", "common"]);
  const eventHistory = useOfficeStore((s) => s.eventHistory);
  const theme = useOfficeStore((s) => s.theme);
  const isDark = theme === "dark";
  const [tooltip, setTooltip] = useState<{ agentName: string; hour: string; count: number; x: number; y: number } | null>(null);

  const rows = useMemo(() => buildHeatmapData(eventHistory), [eventHistory]);

  if (rows.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-500 dark:text-gray-400 font-medium">
        {t("common:empty.noActivityData")}
      </div>
    );
  }

  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  return (
    <div className="relative p-2">
      <svg width="100%" height={ROWS * CELL_H + 20} className="overflow-visible" preserveAspectRatio="xMinYMin meet" viewBox={`0 0 ${COLS * CELL_W + 65} ${ROWS * CELL_H + 20}`}>
        {rows.map((row, ri) => (
          <g key={row.agentId} transform={`translate(0, ${ri * CELL_H})`}>
            <text
              x={0}
              y={CELL_H / 2 + 3}
              fontSize={10}
              className="fill-gray-600 dark:fill-gray-400 font-medium"
            >
              {row.agentName.length > 12 ? `${row.agentName.slice(0, 10)}…` : row.agentName}
            </text>
            {row.counts.map((count, ci) => {
              const hourStart = now - (COLS - ci) * hourMs;
              const hourStr = `${new Date(hourStart).getHours()}:00`;
              return (
                <rect
                  key={ci}
                  x={60 + ci * CELL_W}
                  y={0}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  rx={2}
                  ry={2}
                  fill={getColor(count, isDark)}
                  className="transition-all duration-200 hover:scale-110 origin-center cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({
                      agentName: row.agentName,
                      hour: hourStr,
                      count,
                      x: rect.left,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </g>
        ))}
      </svg>
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl border border-white/40 bg-white/80 p-3 shadow-xl backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/80 animate-in fade-in zoom-in-95"
          style={{ left: tooltip.x - 40, top: tooltip.y - 65 }}
        >
          <div className="text-[10px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider">{tooltip.hour}</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{tooltip.agentName}</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            {tooltip.count} {t("activityHeatmap.eventsUnit")}
          </div>
        </div>
      )}
    </div>
  );
}
