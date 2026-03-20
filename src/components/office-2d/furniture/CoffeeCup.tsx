import { memo } from "react";

interface CoffeeCupProps {
  x: number;
  y: number;
}

export const CoffeeCup = memo(function CoffeeCup({ x, y }: CoffeeCupProps) {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#soft-shadow)">
      {/* Glossy Saucer */}
      <ellipse cx={0} cy={4} rx={10} ry={4} fill="#f1f5f9" />
      <ellipse cx={0} cy={4} rx={8} ry={3} fill="none" stroke="#e2e8f0" strokeWidth={0.5} />

      {/* Ceramic Cup Body */}
      <path d="M -6 -4 L -7 6 Q -7 10 -3 10 L 3 10 Q 7 10 7 6 L 6 -4 Z" fill="#ffffff" stroke="#f1f5f9" strokeWidth={0.5} />
      
      {/* Dark Espresso with crema hint */}
      <ellipse cx={0} cy={-2} rx={5} ry={2} fill="#271b12" />
      <ellipse cx={1} cy={-2.5} rx={2} ry={1} fill="#92400e" opacity={0.3} />

      {/* Modern Square Handle */}
      <path d="M 6 0 L 10 0 L 10 6 L 6 6" fill="none" stroke="#f1f5f9" strokeWidth={1} />
      
      {/* Animated Rising Steam */}
      <g opacity={0.5}>
        <path d="M -1 -7 Q 2 -12 -1 -17" fill="none" stroke="#cbd5e1" strokeWidth={0.8} className="animate-pulse">
           <animate attributeName="d" values="M -1 -7 Q 2 -12 -1 -17; M -1 -7 Q -2 -12 1 -17; M -1 -7 Q 2 -12 -1 -17" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M 2 -5 Q -1 -9 2 -13" fill="none" stroke="#cbd5e1" strokeWidth={0.6} opacity={0.6}>
           <animate attributeName="d" values="M 2 -5 Q -1 -9 2 -13; M 2 -5 Q 1 -9 -2 -13; M 2 -5 Q -1 -9 2 -13" dur="4s" repeatCount="indefinite" />
        </path>
      </g>
    </g>
  );
});
