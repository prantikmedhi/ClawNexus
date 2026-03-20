import { memo } from "react";

interface SofaProps {
  x: number;
  y: number;
  rotation?: number;
  isDark?: boolean;
}

export const Sofa = memo(function Sofa({ x, y, rotation = 0, isDark = false }: SofaProps) {
  const cushion = isDark ? "#ea580c" : "#fed7aa";
  const frame = isDark ? "#d97706" : "#ca8a04";
  const accent = "#fbbf24";

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} filter="url(#soft-shadow)">
      {/* Sofa Base */}
      <rect x={-55} y={-22} width={110} height={44} rx={8} fill={frame} />
      
      {/* Main Cushion with Texture pattern (reuse carpet-weave for subtle texture) */}
      <rect x={-50} y={-18} width={100} height={36} rx={4} fill={cushion} />
      <rect x={-50} y={-18} width={100} height={36} rx={4} fill="url(#carpet-weave)" opacity={0.1} />
      
      {/* Side Arms */}
      <rect x={-55} y={-18} width={12} height={36} rx={4} fill={frame} />
      <rect x={43} y={-18} width={12} height={36} rx={4} fill={frame} />
      
      {/* Back Rest */}
      <rect x={-55} y={-25} width={110} height={10} rx={4} fill={frame} />

      {/* Orange Stitching Accent */}
      <line x1={-40} y1={18} x2={40} y2={18} stroke={accent} strokeWidth={0.5} opacity={0.3} strokeDasharray="2 1" />
    </g>
  );
});
