import { memo } from "react";

interface DeskProps {
  x: number;
  y: number;
  isDark?: boolean;
}

export const Desk = memo(function Desk({ x, y, isDark = false }: DeskProps) {
  const surface = isDark ? "#3e2723" : "#ffedd5";
  const frame = isDark ? "#d97706" : "#fbbf24";
  const monitor = "#1a0f00";
  const glow = "#f97316";

  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#soft-shadow)">
      {/* Desk frame / L-shape leg */}
      <rect x={-50} y={45} width={100} height={10} fill={frame} rx={2} />
      
      {/* L-shaped desk top */}
      <path
        d="M -55 -10 L 45 -10 Q 55 -10 55 0 L 55 50 Q 55 60 45 60 L -45 60 Q -55 60 -55 50 Z"
        fill={surface}
        stroke={frame}
        strokeWidth={1}
      />
      
      {/* Side segment of L-desk */}
      <path
        d="M 55 0 L 85 0 Q 95 0 95 10 L 95 40 Q 95 50 85 50 L 55 50 Z"
        fill={surface}
        stroke={frame}
        strokeWidth={1}
      />

      {/* Monitor cluster (Dual monitor) */}
      <g filter="url(#orange-glow)">
        {/* Main Monitor */}
        <rect x={-25} y={0} width={40} height={22} rx={2} fill={monitor} stroke={glow} strokeWidth={0.5} />
        <rect x={-23} y={2} width={36} height={18} rx={1} fill={glow} opacity={0.15} />
        
        {/* Side Monitor */}
        <g transform="rotate(-20, 35, 15)">
          <rect x={20} y={5} width={30} height={20} rx={2} fill={monitor} stroke={glow} strokeWidth={0.5} />
          <rect x={22} y={7} width={26} height={16} rx={1} fill={glow} opacity={0.1} />
        </g>
      </g>

      {/* Keyboard & Mouse area */}
      <rect x={-15} y={32} width={30} height={10} rx={2} fill="#7c2d12" opacity={0.3} />
      <rect x={22} y={35} width={8} height={12} rx={4} fill="#7c2d12" opacity={0.3} />

      {/* Orange task light hint */}
      <circle cx={-40} cy={10} r={2} fill={glow} filter="url(#orange-glow)" />
    </g>
  );
});
