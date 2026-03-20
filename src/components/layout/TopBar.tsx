import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { ConnectionStatus, ThemeMode, PageId } from "@/gateway/types";
import { useOfficeStore } from "@/store/office-store";

const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";

function getStatusConfig(
  t: (key: string) => string,
): Record<ConnectionStatus, { color: string; pulse: boolean; label: string }> {
  return {
    connecting: { color: "#eab308", pulse: true, label: t("common:status.connecting") },
    connected: { color: "#22c55e", pulse: false, label: t("common:status.connected") },
    reconnecting: { color: "#f97316", pulse: true, label: t("common:status.reconnecting") },
    disconnected: { color: "#6b7280", pulse: false, label: t("common:status.disconnected") },
    error: { color: "#ef4444", pulse: false, label: t("common:status.error") },
  };
}



export function TopBar({ isMobile }: { isMobile?: boolean }) {
  const { t } = useTranslation("layout");
  const connectionStatus = useOfficeStore((s) => s.connectionStatus);
  const connectionError = useOfficeStore((s) => s.connectionError);
  const metrics = useOfficeStore((s) => s.globalMetrics);
  const theme = useOfficeStore((s) => s.theme);
  const setTheme = useOfficeStore((s) => s.setTheme);
  const currentPage = useOfficeStore((s) => s.currentPage);

  const statusCfg = getStatusConfig(t)[connectionStatus];
  const isOfficePage = currentPage === "office";

  return (
    <header className="flex h-12 shrink-0 items-center border-b border-orange-200/50 bg-gradient-to-r from-orange-50/80 to-amber-50/80 px-4 shadow-sm backdrop-blur-md dark:border-orange-900/30 dark:from-orange-900/40 dark:to-orange-950/40">
      {isOfficePage ? (
        <OfficeTopBarContent
          metrics={metrics}
          isMobile={isMobile}
        />
      ) : (
        <ConsoleTopBarContent currentPage={currentPage} />
      )}

      <div className="ml-auto flex items-center gap-3">
        <ConsoleMenu currentPage={currentPage} />
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <ConnectionIndicator
          statusCfg={statusCfg}
          connectionError={connectionError}
          connectionStatus={connectionStatus}
        />
      </div>
    </header>
  );
}

function OfficeTopBarContent({
  metrics,
  isMobile,
}: {
  metrics: { activeAgents: number; totalAgents: number; totalTokens: number };
  isMobile?: boolean;
}) {
  const { t } = useTranslation("layout");
  return (
    <>
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight brand-gradient-text">
          ClawNexus
        </h1>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          v{APP_VERSION}
        </span>
      </div>
      <div className={`mx-8 items-center gap-6 text-sm text-gray-500 dark:text-gray-400 ${isMobile ? "hidden" : "flex"}`}>
        <span>
          {t("topbar.activeCountText")}{" "}
          <strong className="text-gray-800 dark:text-gray-200">
            {metrics.activeAgents}/{metrics.totalAgents}
          </strong>
        </span>
        <span>
          {t("topbar.tokensLabel")}{" "}
          <strong className="text-gray-800 dark:text-gray-200">
            {formatTokens(metrics.totalTokens)}
          </strong>
        </span>
      </div>
    </>
  );
}

function ConsoleTopBarContent({ currentPage }: { currentPage: PageId }) {
  const { t } = useTranslation("layout");
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {t(`topbar.pageTitles.${currentPage}`, { defaultValue: t("topbar.pageTitles.fallback") })}
      </h1>
    </div>
  );
}

function ConsoleMenu({ currentPage }: { currentPage: PageId }) {
  const { t } = useTranslation("layout");
  const navigate = useNavigate();
  const isInConsole = currentPage !== "office";

  return (
    <button
      onClick={() => navigate(isInConsole ? "/" : "/dashboard")}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
        isInConsole
          ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      {isInConsole ? (
        <>
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t("topbar.office")}</span>
        </>
      ) : (
        <>
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">{t("topbar.console")}</span>
        </>
      )}
    </button>
  );
}

function ConnectionIndicator({
  statusCfg,
  connectionError,
  connectionStatus,
}: {
  statusCfg: { color: string; pulse: boolean; label: string };
  connectionError: string | null;
  connectionStatus: ConnectionStatus;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: statusCfg.color,
          animation: statusCfg.pulse ? "pulse 1.5s ease-in-out infinite" : "none",
        }}
      />
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {connectionError && connectionStatus === "error" ? connectionError : statusCfg.label}
      </span>
    </div>
  );
}



function ThemeToggle({ theme, setTheme }: { theme: ThemeMode; setTheme: (t: ThemeMode) => void }) {
  const { t } = useTranslation("layout");
  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title={theme === "light" ? t("topbar.theme.switchToDark") : t("topbar.theme.switchToLight")}
      className="ml-2 flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}k`;
  }
  return String(n);
}
