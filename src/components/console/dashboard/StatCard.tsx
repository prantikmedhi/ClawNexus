import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
  color?: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  progress,
  color = "text-orange-600",
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-orange-200/50 bg-white/40 p-4 shadow-sm backdrop-blur-md dark:border-orange-800/30 dark:bg-orange-950/20">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-orange-800/70 dark:text-orange-300/70">{title}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-orange-50">{value}</div>
      {subtitle && <p className="mt-1 text-xs text-orange-700/60 dark:text-orange-400/60">{subtitle}</p>}
      {progress != null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-orange-200/50 dark:bg-orange-900/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all shadow-[0_0_8px_rgba(249,115,22,0.4)]"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
