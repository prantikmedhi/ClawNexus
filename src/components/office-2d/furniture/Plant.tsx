import { memo } from "react";

interface PlantProps {
  x: number;
  y: number;
}

export const Plant = memo(function Plant({ x, y }: PlantProps) {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#soft-shadow)">
      {/* Pot - Terracotta with shadow */}
      <path d="M -10 0 L -12 18 Q -12 22 -8 22 L 8 22 Q 12 22 12 18 L 10 0 Z" fill="#7c2d12" stroke="#431407" strokeWidth={0.5} />
      <path d="M -10 0 L 10 0 L 11 4 L -11 4 Z" fill="#9a3412" />

      {/* Soil */}
      <ellipse cx={0} cy={0} rx={9} ry={3} fill="#1a0f00" />

      {/* Detailed Leaves */}
      <g>
        <path d="M 0 0 Q -15 -20 -5 -35 Q 5 -20 0 0" fill="#166534" stroke="#064e3b" strokeWidth={0.5} />
        <path d="M 0 0 Q 15 -18 20 -30 Q 10 -15 0 0" fill="#15803d" stroke="#064e3b" strokeWidth={0.5} />
        <path d="M 0 0 Q -20 -10 -25 -20 Q -10 -5 0 0" fill="#14532d" stroke="#064e3b" strokeWidth={0.5} />
        <path d="M 0 0 Q 5 -25 10 -40 Q 15 -25 0 0" fill="#22c55e" stroke="#166534" strokeWidth={0.5} opacity={0.8} />
      </g>
    </g>
  );
});
