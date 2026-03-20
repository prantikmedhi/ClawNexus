import { Home, Bot, Radio, Puzzle, Clock, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { RestartBanner } from "@/components/shared/RestartBanner";
import { TopBar } from "./TopBar";

export function ConsoleLayout() {
  const { t } = useTranslation("layout");
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarNavItems = [
    { path: "/dashboard", labelKey: "consoleNav.dashboard", icon: Home },
    { path: "/agents", labelKey: "consoleNav.agents", icon: Bot },
    { path: "/channels", labelKey: "consoleNav.channels", icon: Radio },
    { path: "/skills", labelKey: "consoleNav.skills", icon: Puzzle },
    { path: "/cron", labelKey: "consoleNav.cron", icon: Clock },
    { path: "/settings", labelKey: "consoleNav.settings", icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen w-screen flex-col bg-gradient-to-br from-orange-50 to-orange-100/50 text-slate-900 dark:from-orange-950/20 dark:to-orange-900/10 dark:text-orange-50">
      <RestartBanner />
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <nav className="flex w-52 shrink-0 flex-col border-r border-orange-200/50 bg-white/40 py-3 backdrop-blur-md dark:border-orange-800/30 dark:bg-orange-950/20">
          {sidebarNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`mx-2 flex items-center gap-2.5 rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "border-l-orange-500 bg-orange-50 font-medium text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                    : "border-l-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
