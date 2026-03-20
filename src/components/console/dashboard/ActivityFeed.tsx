import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOfficeStore } from "@/store/office-store";

export function ActivityFeed() {
  const { t } = useTranslation("common");
  const eventHistory = useOfficeStore((s) => s.eventHistory).slice(0, 10);

  return (
    <div className="rounded-xl border border-nexus-border bg-white p-5 shadow-sm dark:bg-brand-obsidian/40 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-500">
          <Activity className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-stellar uppercase">
          Live Intelligence Feed
        </h3>
      </div>

      <div className="space-y-3">
        {eventHistory.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 italic">
            {t("empty.noEvents")}
          </p>
        ) : (
          eventHistory.map((item, i) => (
            <div
              key={`${item.timestamp}-${i}`}
              className="group relative flex items-start gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-nexus-border hover:bg-white/50 dark:hover:bg-white/5"
            >
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,242,255,0.6)]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-gray-900 dark:text-cyan-400">
                    {item.agentName}
                  </span>
                  <span className="shrink-0 text-[10px] text-gray-400 font-medium">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {item.summary}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
