import { Radio, Wrench, Clock, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    path: "/channels",
    icon: Radio,
    titleKey: "console:channels.title",
    descKey: "console:channels.description",
  },
  {
    path: "/skills",
    icon: Wrench,
    titleKey: "console:skills.title",
    descKey: "console:skills.description",
  },
  {
    path: "/cron",
    icon: Clock,
    titleKey: "console:cron.title",
    descKey: "console:cron.description",
  },
  {
    path: "/settings",
    icon: Settings,
    titleKey: "console:settings.title",
    descKey: "console:settings.description",
  },
];

export function QuickNavGrid() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.path}
          type="button"
          onClick={() => navigate(item.path)}
          className="flex flex-col items-start gap-2 rounded-lg border border-orange-200/50 bg-white/40 p-4 text-left shadow-sm backdrop-blur-md transition-all hover:scale-[1.02] hover:border-orange-400 hover:bg-white/60 dark:border-orange-800/30 dark:bg-orange-950/20 dark:hover:border-orange-600 dark:hover:bg-orange-900/30"
        >
          <item.icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-orange-50">
              {t(item.titleKey)}
            </div>
            <div className="mt-0.5 text-xs text-orange-800/60 dark:text-orange-300/60 line-clamp-2">
              {t(item.descKey)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
