import { memo } from "react";

interface ChairProps {
  x: number;
  y: number;
  isDark?: boolean;
}

export const Chair = memo(function Chair({ x, y, isDark = false }: ChairProps) {
  const seat = isDark ? "#d97706" : "#fbbf24";
  const back = isDark ? "#ea580c" : "#f97316";

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Backrest (top-down view – arc shape) */}
      <path
        d="M -12 -14 Q 0 -20 12 -14"
        fill="none"
        stroke={back}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Seat cushion */}
      <circle r={14} fill={seat} opacity={0.85} />
    </g>
  );
});
