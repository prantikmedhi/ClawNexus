import { memo } from "react";

interface MeetingTableProps {
  x: number;
  y: number;
  radius?: number;
  isDark?: boolean;
}

export const MeetingTable = memo(function MeetingTable({
  x,
  y,
  radius = 80,
  isDark = false,
}: MeetingTableProps) {
  const frame = isDark ? "#b45309" : "#f97316";

  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#soft-shadow)">
      {/* Table Structure */}
      <circle
        r={radius + 4}
        fill={frame}
        opacity={0.8}
      />
      <circle
        r={radius}
        fill={isDark ? "#0f172a" : "#fff"}
        stroke={frame}
        strokeWidth={2}
      />
      
      {/* Glass Surface Overlay */}
      <circle
        r={radius - 2}
        fill="white"
        fillOpacity={0.05}
      />

      {/* Holographic Nexus Node (Center) */}
      <g>
        <circle
          r={radius * 0.4}
          fill="url(#nexus-hologram-grad)"
          className="animate-pulse"
        />
        {/* Hologram Ring */}
        <circle
          r={radius * 0.25}
          fill="none"
          stroke="#f97316"
          strokeWidth={0.5}
          strokeDasharray="4 2"
          opacity={0.4}
          className="animate-spin"
          style={{ transformOrigin: 'center', animationDuration: '10s' }}
        />
        {/* Core Node */}
        <circle
          r={4}
          fill="#f97316"
          filter="url(#orange-glow)"
        />
      </g>
    </g>
  );
});
