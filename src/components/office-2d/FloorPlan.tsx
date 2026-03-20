import { useMemo } from "react";
import { SpeechBubbleOverlay } from "@/components/overlays/SpeechBubble";
import type { VisualAgent } from "@/gateway/types";
import {
  SVG_WIDTH,
  SVG_HEIGHT,
  OFFICE,
  ZONES,
  ZONE_COLORS,
  ZONE_COLORS_DARK,
} from "@/lib/constants";
import { calculateDeskSlots, calculateMeetingSeatsSvg } from "@/lib/position-allocator";
import { useOfficeStore } from "@/store/office-store";
import { AgentAvatar } from "./AgentAvatar";
import { ConnectionLine } from "./ConnectionLine";
import { DeskUnit } from "./DeskUnit";
import { MeetingTable, Sofa, Plant, CoffeeCup, Chair } from "./furniture";
import { ZoneLabel } from "./ZoneLabel";

export function FloorPlan() {
  const agents = useOfficeStore((s) => s.agents);
  const links = useOfficeStore((s) => s.links);
  const theme = useOfficeStore((s) => s.theme);

  const agentList = Array.from(agents.values());
  const isDark = theme === "dark";

  const deskAgents = useMemo(
    () => agentList.filter((a) => a.zone === "desk" && !a.isSubAgent && !a.movement && a.confirmed),
    [agentList],
  );
  const hotDeskAgents = useMemo(
    () => agentList.filter((a) => a.zone === "hotDesk" && !a.movement),
    [agentList],
  );
  const loungeAgents = useMemo(
    () => agentList.filter((a) => a.zone === "lounge" && !a.movement),
    [agentList],
  );
  const meetingAgents = useMemo(
    () => agentList.filter((a) => a.zone === "meeting" && !a.movement),
    [agentList],
  );
  const walkingAgents = useMemo(
    () => agentList.filter((a) => a.movement !== null),
    [agentList],
  );
  const corridorAgents = useMemo(
    () => agentList.filter((a) => a.zone === "corridor" && !a.movement),
    [agentList],
  );

  const maxSubAgents = useOfficeStore((s) => s.maxSubAgents);

  const deskSlots = useMemo(
    () => calculateDeskSlots(ZONES.desk, deskAgents.length, Math.max(deskAgents.length, 4)),
    [deskAgents.length],
  );

  const hotDeskSlots = useMemo(
    () =>
      calculateDeskSlots(
        ZONES.hotDesk,
        hotDeskAgents.length,
        Math.max(hotDeskAgents.length, maxSubAgents),
      ),
    [hotDeskAgents.length, maxSubAgents],
  );

  const meetingCenter = {
    x: ZONES.meeting.x + ZONES.meeting.width / 2,
    y: ZONES.meeting.y + ZONES.meeting.height / 2,
  };

  const meetingTableRadius = Math.min(
    60 + meetingAgents.length * 8,
    Math.min(ZONES.meeting.width, ZONES.meeting.height) / 2 - 40,
  );

  const meetingSeats = useMemo(
    () => calculateMeetingSeatsSvg(meetingAgents.length, meetingCenter, meetingTableRadius + 36),
    [meetingAgents.length, meetingCenter.x, meetingCenter.y, meetingTableRadius],
  );

  return (
    <div className="relative h-full w-full bg-transparent">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="building-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="12" />
            <feOffset dx="0" dy="10" result="offsetblur" />
            <feFlood floodColor="#000" floodOpacity={0.2} />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="orange-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="soft-shadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>

          {/* Vibrant Orange Industrial Floor Patterns */}
          <pattern id="industrial-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fed7aa" strokeWidth="0.5" opacity={0.3} />
          </pattern>

          <pattern id="carpet-weave" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 2 2" stroke="#ffedd5" strokeWidth="0.5" opacity={0.2} />
          </pattern>

          <pattern id="polished-obsidian" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="#fffaf5" />
            <rect x="10" y="10" width="80" height="80" fill="#fff7ed" rx={2} />
            <rect x="15" y="15" width="70" height="70" fill="none" stroke="#fed7aa" strokeWidth="0.5" opacity={0.2} />
          </pattern>

          {/* Vibrant Gradients */}
          <linearGradient id="floor-grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>

          <radialGradient id="nexus-hologram-grad">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Layer 0: Building shell (outer wall) ── */}
        <rect
          x={OFFICE.x}
          y={OFFICE.y}
          width={OFFICE.width}
          height={OFFICE.height}
          rx={OFFICE.cornerRadius}
          fill="url(#floor-grad-orange)"
          stroke="#f97316"
          strokeWidth={OFFICE.wallThickness}
          filter="url(#building-shadow)"
        />

        {/* ── Layer 2: Zone floor fills ── */}
        {Object.entries(ZONES).map(([key, zone]) => {
          let fill = "url(#industrial-grid)";
          if (key === "meeting") fill = "url(#carpet-weave)";
          if (key === "lounge") fill = "url(#polished-obsidian)";
          if (key === "hotDesk") fill = "url(#industrial-grid)";

          return (
            <rect
              key={`floor-${key}`}
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={fill}
              opacity={0.8}
            />
          );
        })}

        {/* ── Layer 3: Internal partition walls ── */}
        <PartitionWalls isDark={isDark} />

        {/* ── Layer 4: Door openings (overlaid on partitions) ── */}
        <DoorOpenings isDark={isDark} />

        {/* Zone labels */}
        {Object.entries(ZONES).map(([key, zone]) => (
          <ZoneLabel key={`label-${key}`} zone={zone} zoneKey={key as keyof typeof ZONES} />
        ))}

        {/* ── Layer 5: Furniture – Desk zone ── */}
        <DeskZoneFurniture deskSlots={deskSlots} deskAgents={deskAgents} />

        {/* ── Layer 5: Furniture – Meeting zone ── */}
        <MeetingTable
          x={meetingCenter.x}
          y={meetingCenter.y}
          radius={meetingTableRadius}
          isDark={isDark}
        />
        <MeetingChairs
          seats={meetingSeats}
          meetingAgentCount={meetingAgents.length}
          isDark={isDark}
        />

        {/* ── Layer 5: Furniture – Hot desk zone ── */}
        <HotDeskZoneFurniture slots={hotDeskSlots} agents={hotDeskAgents} />

        {/* ── Layer 5: Furniture – Lounge zone (incl. reception + entrance) ── */}
        <LoungeDecor isDark={isDark} />

        {/* ── Layer 5a: Lounge idle agents ── */}
        {loungeAgents.map((agent) => (
          <AgentAvatar key={`lounge-${agent.id}`} agent={agent} />
        ))}

        {/* ── Layer 5b: Main entrance door on outer wall ── */}
        <EntranceDoor isDark={isDark} />

        {/* ── Layer 6: Collaboration lines ── */}
        {links.map((link) => {
          const source = agents.get(link.sourceId);
          const target = agents.get(link.targetId);
          if (!source || !target) return null;
          return (
            <ConnectionLine
              key={`${link.sourceId}-${link.targetId}`}
              x1={source.position.x}
              y1={source.position.y}
              x2={target.position.x}
              y2={target.position.y}
              strength={link.strength}
            />
          );
        })}

        {/* ── Layer 7: Meeting agents (seated) ── */}
        {meetingAgents.map((agent, i) => {
          const seat = meetingSeats[i];
          if (!seat) return null;
          return <AgentAvatar key={agent.id} agent={{ ...agent, position: seat }} />;
        })}

        {/* ── Layer 7b: Unconfirmed agents at entrance (semi-transparent) ── */}
        {corridorAgents.map((agent) => (
          <AgentAvatar key={`corridor-${agent.id}`} agent={agent} />
        ))}

        {/* ── Layer 8: Walking agents (above all zones, in corridor) ── */}
        {walkingAgents.map((agent) => (
          <AgentAvatar key={`walk-${agent.id}`} agent={agent} />
        ))}
      </svg>

      {agentList
        .filter((agent) => agent.speechBubble)
        .map((agent) => (
          <SpeechBubbleOverlay key={`bubble-${agent.id}`} agent={agent} />
        ))}
    </div>
  );
}

/* ═══ Sub-components ═══ */

/** Internal partition walls between zones — double-line architectural style */
function PartitionWalls({ isDark }: { isDark: boolean }) {
  const wallColor = isDark ? "#92400e" : "#ea580c";
  const fillColor = isDark ? "#7c2d12" : "#fed7aa";
  const wallW = 4;
  const cw = OFFICE.corridorWidth;
  const midX = OFFICE.x + (OFFICE.width - cw) / 2;
  const midY = OFFICE.y + (OFFICE.height - cw) / 2;

  // Render walls as filled rectangles for a proper architectural look
  const walls = [
    // Vertical walls (left of corridor)
    { x: midX - wallW / 2, y: OFFICE.y, w: wallW, h: midY - OFFICE.y },
    { x: midX - wallW / 2, y: midY + cw, w: wallW, h: OFFICE.y + OFFICE.height - midY - cw },
    // Vertical walls (right of corridor)
    { x: midX + cw - wallW / 2, y: OFFICE.y, w: wallW, h: midY - OFFICE.y },
    { x: midX + cw - wallW / 2, y: midY + cw, w: wallW, h: OFFICE.y + OFFICE.height - midY - cw },
    // Horizontal walls (above corridor)
    { x: OFFICE.x, y: midY - wallW / 2, w: midX - OFFICE.x, h: wallW },
    { x: midX + cw, y: midY - wallW / 2, w: OFFICE.x + OFFICE.width - midX - cw, h: wallW },
    // Horizontal walls (below corridor)
    { x: OFFICE.x, y: midY + cw - wallW / 2, w: midX - OFFICE.x, h: wallW },
    { x: midX + cw, y: midY + cw - wallW / 2, w: OFFICE.x + OFFICE.width - midX - cw, h: wallW },
  ];

  return (
    <g>
      {walls.map((w, i) => (
        <rect
          key={`wall-${i}`}
          x={w.x}
          y={w.y}
          width={w.w}
          height={w.h}
          fill={fillColor}
          stroke={wallColor}
          strokeWidth={0.5}
        />
      ))}
    </g>
  );
}

/** Door openings cut into partition walls */
function DoorOpenings({ isDark }: { isDark: boolean }) {
  const cw = OFFICE.corridorWidth;
  const midX = OFFICE.x + (OFFICE.width - cw) / 2;
  const midY = OFFICE.y + (OFFICE.height - cw) / 2;
  const doorWidth = 40;
  const doorColor = isDark ? ZONE_COLORS_DARK.corridor : ZONE_COLORS.corridor;
  const arcColor = isDark ? "#f97316" : "#ea580c";

  // Door positions: where walls meet corridor, centered on each wall segment
  const doors = [
    // Top wall doors (into corridor)
    { cx: (OFFICE.x + midX) / 2, cy: midY, horizontal: true },
    { cx: (midX + cw + OFFICE.x + OFFICE.width) / 2, cy: midY, horizontal: true },
    // Bottom wall doors
    { cx: (OFFICE.x + midX) / 2, cy: midY + cw, horizontal: true },
    { cx: (midX + cw + OFFICE.x + OFFICE.width) / 2, cy: midY + cw, horizontal: true },
    // Left wall doors
    { cx: midX, cy: (OFFICE.y + midY) / 2, horizontal: false },
    { cx: midX + cw, cy: (OFFICE.y + midY) / 2, horizontal: false },
    // Right wall doors (below corridor)
    { cx: midX, cy: (midY + cw + OFFICE.y + OFFICE.height) / 2, horizontal: false },
    { cx: midX + cw, cy: (midY + cw + OFFICE.y + OFFICE.height) / 2, horizontal: false },
  ];

  return (
    <g>
      {doors.map((d, i) => {
        const half = doorWidth / 2;
        if (d.horizontal) {
          return (
            <g key={`door-${i}`}>
              {/* Erase wall segment */}
              <rect x={d.cx - half} y={d.cy - 3} width={doorWidth} height={6} fill={doorColor} />
              {/* Door swing arc */}
              <path
                d={`M ${d.cx - half} ${d.cy} A ${half} ${half} 0 0 1 ${d.cx + half} ${d.cy}`}
                fill="none"
                stroke={arcColor}
                strokeWidth={0.8}
                strokeDasharray="3 2"
                opacity={0.5}
              />
            </g>
          );
        }
        return (
          <g key={`door-${i}`}>
            <rect x={d.cx - 3} y={d.cy - half} width={6} height={doorWidth} fill={doorColor} />
            <path
              d={`M ${d.cx} ${d.cy - half} A ${half} ${half} 0 0 1 ${d.cx} ${d.cy + half}`}
              fill="none"
              stroke={arcColor}
              strokeWidth={0.8}
              strokeDasharray="3 2"
              opacity={0.5}
            />
          </g>
        );
      })}
    </g>
  );
}

function DeskZoneFurniture({
  deskSlots,
  deskAgents,
}: {
  deskSlots: Array<{ unitX: number; unitY: number }>;
  deskAgents: VisualAgent[];
}) {
  const agentBySlot = useMemo(() => {
    const map = new Map<number, VisualAgent>();
    for (const agent of deskAgents) {
      let hash = 0;
      for (let i = 0; i < agent.id.length; i++) {
        hash = ((hash << 5) - hash + agent.id.charCodeAt(i)) | 0;
      }
      const idx = Math.abs(hash) % deskSlots.length;
      let slot = idx;
      while (map.has(slot)) {
        slot = (slot + 1) % deskSlots.length;
      }
      map.set(slot, agent);
    }
    return map;
  }, [deskAgents, deskSlots.length]);

  return (
    <g>
      {deskSlots.map((slot, i) => (
        <DeskUnit
          key={`desk-${i}`}
          x={slot.unitX}
          y={slot.unitY}
          agent={agentBySlot.get(i) ?? null}
        />
      ))}
    </g>
  );
}

function HotDeskZoneFurniture({
  slots,
  agents,
}: {
  slots: Array<{ unitX: number; unitY: number }>;
  agents: VisualAgent[];
}) {
  return (
    <g>
      {slots.map((slot, i) => (
        <DeskUnit key={`hotdesk-${i}`} x={slot.unitX} y={slot.unitY} agent={agents[i] ?? null} />
      ))}
    </g>
  );
}

function MeetingChairs({
  seats,
  meetingAgentCount,
  isDark,
}: {
  seats: Array<{ x: number; y: number }>;
  meetingAgentCount: number;
  isDark: boolean;
}) {
  const meetingCenter = {
    x: ZONES.meeting.x + ZONES.meeting.width / 2,
    y: ZONES.meeting.y + ZONES.meeting.height / 2,
  };

  if (meetingAgentCount > 0) {
    return (
      <g>
        {seats.map((s, i) => (
          <Chair key={`mc-${i}`} x={s.x} y={s.y} isDark={isDark} />
        ))}
      </g>
    );
  }

  const emptyCount = 6;
  const emptyRadius = 100;
  return (
    <g>
      {Array.from({ length: emptyCount }, (_, i) => {
        const angle = (2 * Math.PI * i) / emptyCount - Math.PI / 2;
        return (
          <Chair
            key={`mc-empty-${i}`}
            x={Math.round(meetingCenter.x + Math.cos(angle) * emptyRadius)}
            y={Math.round(meetingCenter.y + Math.sin(angle) * emptyRadius)}
            isDark={isDark}
          />
        );
      })}
    </g>
  );
}

function LoungeDecor({ isDark }: { isDark: boolean }) {
  const lz = ZONES.lounge;
  const cx = lz.x + lz.width / 2;

  const wallColor = isDark ? "#92400e" : "#ea580c";
  const deskColor = isDark ? "#b45309" : "#f97316";
  const deskTop = isDark ? "#d97706" : "#fbbf24";
  const logoBg = isDark ? "#3e2723" : "#fed7aa";
  // Logo backdrop wall — centered horizontally, at ~55% from top
  const bgWallW = 200;
  const bgWallH = 36;
  const bgWallY = lz.y + lz.height * 0.52;
  const bgWallYOffset = bgWallH / 2;

  // Reception desk — arc in front of logo wall
  const deskW = 160;
  const deskH = 24;
  const deskY = bgWallY + bgWallH + 14;

  return (
    <g>
      {/* ── Upper lounge area: sofas & coffee ── */}
      <Sofa x={lz.x + 100} y={lz.y + 60} rotation={0} isDark={isDark} />
      <Sofa x={lz.x + 280} y={lz.y + 60} rotation={0} isDark={isDark} />
      <Sofa x={lz.x + 100} y={lz.y + 140} rotation={180} isDark={isDark} />
      <CoffeeCup x={lz.x + 190} y={lz.y + 100} />
      <CoffeeCup x={lz.x + 100} y={lz.y + 100} />
      <Sofa x={lz.x + 440} y={lz.y + 100} rotation={90} isDark={isDark} />

      {/* ── Logo backdrop wall ── */}
      <rect
        x={cx - bgWallW / 2}
        y={bgWallY}
        width={bgWallW}
        height={bgWallH}
        rx={4}
        fill={logoBg}
      />
      {/* Wall top accent strip */}
      <rect
        x={cx - bgWallW / 2}
        y={bgWallY}
        width={bgWallW}
        height={3}
        rx={1.5}
        fill={isDark ? "#f97316" : "#ea580c"}
      />
      {/* "ClawNexus" logo text with orange glow */}
      <g style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))' : 'none' }}>
        <text
          x={cx}
          y={bgWallY + bgWallYOffset + 18}
          textAnchor="middle"
          fill={isDark ? "#fbbf24" : "#ea580c"}
          fontSize={16}
          fontWeight={800}
          fontFamily="var(--font-nexus)"
          letterSpacing="0.2em"
          style={{ textShadow: isDark ? '0 0 10px rgba(249, 115, 22, 0.6)' : 'none' }}
        >
          CLAWNEXUS
        </text>
        <text
          x={cx}
          y={bgWallY + bgWallYOffset + 32}
          textAnchor="middle"
          fill={isDark ? "#f97316" : "#b45309"}
          fontSize={8}
          fontWeight={600}
          fontFamily="var(--font-nexus)"
          letterSpacing="0.4em"
          opacity={0.8}
        >
          STRATEGIC MONITORING
        </text>
      </g>


      {/* ── Reception desk (rounded front) ── */}
      <rect
        x={cx - deskW / 2}
        y={deskY}
        width={deskW}
        height={deskH}
        rx={12}
        fill={deskColor}
        stroke={wallColor}
        strokeWidth={1}
      />
      {/* Desk surface highlight */}
      <rect
        x={cx - deskW / 2 + 4}
        y={deskY + 3}
        width={deskW - 8}
        height={deskH - 6}
        rx={9}
        fill={deskTop}
        opacity={0.5}
      />

      {/* Decorative plants flanking reception */}
      <Plant x={cx - bgWallW / 2 - 30} y={bgWallY + bgWallH / 2} />
      <Plant x={cx + bgWallW / 2 + 30} y={bgWallY + bgWallH / 2} />

      {/* Side plants near entrance */}
      <Plant x={lz.x + 40} y={lz.y + lz.height - 50} />
      <Plant x={lz.x + lz.width - 40} y={lz.y + lz.height - 50} />

      {/* Digital Visitor Log (Holographic Interface) */}
      <g transform={`translate(${lz.x + lz.width / 2 - 100}, ${lz.y + lz.height - 60})`} filter="url(#orange-glow)">
        <rect x={0} y={0} width={40} height={50} rx={2} fill="#0f172a" stroke="#f97316" strokeWidth={0.5} opacity={0.8} />
        <path d="M 5 10 H 35 M 5 20 H 25 M 5 30 H 35" stroke="#f97316" strokeWidth={0.5} opacity={0.5} />
        <circle cx={30} cy={40} r={3} fill="#f97316" className="animate-pulse" />
      </g>
    </g>
  );
}

/** Main entrance door cut into the bottom outer wall of lounge zone */
function EntranceDoor({ isDark }: { isDark: boolean }) {
  const lz = ZONES.lounge;
  const doorCX = lz.x + lz.width / 2;
  const doorY = OFFICE.y + OFFICE.height;
  const doorW = 70;
  const half = doorW / 2;

  const bgColor = isDark ? ZONE_COLORS_DARK.lounge : ZONE_COLORS.lounge;
  const arcColor = isDark ? "#f97316" : "#ea580c";
  const matColor = isDark ? "#d97706" : "#f97316";
  const textColor = isDark ? "#fbbf24" : "#ea580c";

  return (
    <g>
      {/* Erase outer wall segment to create door opening */}
      <rect
        x={doorCX - half - 2}
        y={doorY - OFFICE.wallThickness - 1}
        width={doorW + 4}
        height={OFFICE.wallThickness + 4}
        fill={bgColor}
      />
      {/* Door frame posts */}
      <rect x={doorCX - half - 3} y={doorY - 10} width={3} height={12} rx={1} fill={arcColor} />
      <rect x={doorCX + half} y={doorY - 10} width={3} height={12} rx={1} fill={arcColor} />
      {/* Double-door swing arcs */}
      <path
        d={`M ${doorCX - half} ${doorY} A ${half} ${half} 0 0 0 ${doorCX} ${doorY - half}`}
        fill="none"
        stroke={arcColor}
        strokeWidth={0.8}
        strokeDasharray="4 3"
        opacity={0.5}
      />
      <path
        d={`M ${doorCX + half} ${doorY} A ${half} ${half} 0 0 1 ${doorCX} ${doorY - half}`}
        fill="none"
        stroke={arcColor}
        strokeWidth={0.8}
        strokeDasharray="4 3"
        opacity={0.5}
      />
      {/* Welcome mat */}
      <rect
        x={doorCX - 30}
        y={doorY - 18}
        width={60}
        height={12}
        rx={3}
        fill={matColor}
        opacity={0.5}
      />
      {/* "ENTRANCE" label outside */}
      <text
        x={doorCX}
        y={doorY + 14}
        textAnchor="middle"
        fill={textColor}
        fontSize={9}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.15em"
      >
        ENTRANCE
      </text>
    </g>
  );
}
