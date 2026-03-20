import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { normalizeGatewayAccessUrl } from "@/lib/gateway-url";
import type { ConnectionPreference } from "@/lib/connection-preferences";

interface ConnectionSetupDialogProps {
  initialPreference?: ConnectionPreference | null;
  onSubmit: (preference: ConnectionPreference) => Promise<void> | void;
  submitting: boolean;
  error: string | null;
}

export function ConnectionSetupDialog({
  initialPreference,
  onSubmit,
  submitting,
  error,
}: ConnectionSetupDialogProps) {
  const { t } = useTranslation("common");
  const [mode, setMode] = useState<ConnectionPreference["mode"]>(initialPreference?.mode ?? "local");
  const [gatewayUrlInput, setGatewayUrlInput] = useState(initialPreference?.gatewayUrl ?? "");
  const [gatewayTokenInput, setGatewayTokenInput] = useState(initialPreference?.gatewayToken ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const extractedTokenRef = useRef("");

  useEffect(() => {
    const normalized = normalizeGatewayAccessUrl(gatewayUrlInput.trim());
    if (
      normalized.token &&
      (gatewayTokenInput.length === 0 || gatewayTokenInput === extractedTokenRef.current)
    ) {
      setGatewayTokenInput(normalized.token);
    }
    extractedTokenRef.current = normalized.token;
  }, [gatewayUrlInput, gatewayTokenInput]);

  const handleSubmit = async () => {
    if (mode === "local") {
      setValidationError(null);
      await onSubmit({
        mode,
        gatewayUrl: "",
        gatewayToken: "",
      });
      return;
    }

    const normalized = normalizeGatewayAccessUrl(gatewayUrlInput.trim());
    const gatewayUrl = (normalized.url ?? "").trim();
    const gatewayToken = gatewayTokenInput.trim() || normalized.token;

    if (!gatewayUrl) {
      setValidationError(t("connectionSetup.validation.gatewayUrlRequired"));
      return;
    }

    if (!gatewayToken) {
      setValidationError(t("connectionSetup.validation.gatewayTokenRequired"));
      return;
    }

    setValidationError(null);
    await onSubmit({
      mode,
      gatewayUrl,
      gatewayToken,
    });
  };

  const normalized = normalizeGatewayAccessUrl(gatewayUrlInput.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <form
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-600 dark:text-orange-400">
            {t("connectionSetup.eyebrow")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
            {t("connectionSetup.title")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {t("connectionSetup.description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ModeCard
            active={mode === "local"}
            title={t("connectionSetup.local.title")}
            description={t("connectionSetup.local.description")}
            onClick={() => setMode("local")}
          />
          <ModeCard
            active={mode === "remote"}
            title={t("connectionSetup.remote.title")}
            description={t("connectionSetup.remote.description")}
            onClick={() => setMode("remote")}
          />
        </div>

        {mode === "remote" && (
          <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/40">
            <Field
              label={t("connectionSetup.remote.gatewayUrlLabel")}
              hint={t("connectionSetup.remote.gatewayUrlHint")}
              value={gatewayUrlInput}
              onChange={setGatewayUrlInput}
              placeholder={t("connectionSetup.remote.gatewayUrlPlaceholder")}
              autoComplete="url"
            />
            <Field
              label={t("connectionSetup.remote.gatewayTokenLabel")}
              hint={
                normalized.token
                  ? t("connectionSetup.remote.gatewayTokenExtracted")
                  : t("connectionSetup.remote.gatewayTokenHint")
              }
              value={gatewayTokenInput}
              onChange={setGatewayTokenInput}
              placeholder={t("connectionSetup.remote.gatewayTokenPlaceholder")}
              type="password"
              autoComplete="current-password"
            />
          </div>
        )}

        {(validationError || error) && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            {validationError || error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {t("connectionSetup.footer")}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-w-36 items-center justify-center rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? t("connectionSetup.actions.connecting") : t("connectionSetup.actions.continue")}
          </button>
        </div>
      </form>
    </div>
  );
}

function ModeCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? "border-orange-500 bg-orange-50 shadow-sm dark:border-orange-400 dark:bg-orange-950/30"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        <span
          className={`mt-1 h-4 w-4 rounded-full border ${
            active
              ? "border-orange-500 bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.18)]"
              : "border-slate-300 bg-transparent dark:border-slate-600"
          }`}
        />
      </div>
    </button>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "password";
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
      />
      <span className="mt-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</span>
    </label>
  );
}
