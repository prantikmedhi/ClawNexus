import { Bot, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AgentDetailHeader } from "@/components/console/agents/AgentDetailHeader";
import { AgentDetailTabs } from "@/components/console/agents/AgentDetailTabs";
import { AgentListPanel } from "@/components/console/agents/AgentListPanel";
import { CreateAgentDialog } from "@/components/console/agents/CreateAgentDialog";
import { DeleteAgentDialog } from "@/components/console/agents/DeleteAgentDialog";
import { useAgentsStore } from "@/store/console-stores/agents-store";
import { useResponsive } from "@/hooks/useResponsive";

export function AgentsPage() {
  const { t } = useTranslation("console");
  const { isMobile } = useResponsive();
  const { selectedAgentId, agents, fetchAgents, selectAgent } = useAgentsStore();
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  if (isMobile) {
    // Mobile: single panel at a time
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("agents.title")}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("agents.description")}</p>
        </div>

        {selectedAgent ? (
          <div className="space-y-4">
            <button
              onClick={() => selectAgent(null)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </button>
            <AgentDetailHeader agent={selectedAgent} />
            <AgentDetailTabs agent={selectedAgent} />
          </div>
        ) : (
          <>
            <AgentListPanel />
          </>
        )}

        <CreateAgentDialog />
        <DeleteAgentDialog />
      </div>
    );
  }

  // Desktop: side-by-side layout
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("agents.title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("agents.description")}</p>
      </div>

      <div className="flex gap-6">
        <AgentListPanel />

        <div className="min-w-0 flex-1">
          {selectedAgent ? (
            <div className="space-y-4">
              <AgentDetailHeader agent={selectedAgent} />
              <AgentDetailTabs agent={selectedAgent} />
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              <Bot className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("agents.selectAgent")}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {t("agents.selectAgentDesc")}
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateAgentDialog />
      <DeleteAgentDialog />
    </div>
  );
}
