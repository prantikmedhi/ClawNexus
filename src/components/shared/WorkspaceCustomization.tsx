import { useState } from "react";
import { Sliders, Zap, X, Settings, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOfficeStore } from "@/store/office-store";

const FLOOR_COLORS = ["#1e293b", "#0f172a", "#1a1a1a", "#2e1065", "#064e3b"];

export function WorkspaceCustomization() {
  const { t } = useTranslation("office");
  const customization = useOfficeStore((s) => s.customization);
  const setCustomization = useOfficeStore((s) => s.setCustomization);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-64 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              <Sliders className="h-4 w-4 text-orange-500" />
              {t("customization.title")}
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Floor Color */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Palette size={12} />
                {t("customization.floorColor")}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {FLOOR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCustomization({ floorColor: color })}
                    className={`h-7 w-7 rounded-full border-2 transition-all duration-300 ${
                      customization.floorColor === color
                        ? "border-orange-500 scale-125 shadow-lg shadow-blue-500/20"
                        : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                  <Zap className={`h-4 w-4 transition-colors ${customization.showBeams ? "text-yellow-400" : "text-gray-300"}`} />
                  {t("customization.showBeams")}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={customization.showBeams}
                  onChange={(e) => setCustomization({ showBeams: e.target.checked })}
                />
                <div className={`w-9 h-5 rounded-full transition-all duration-300 relative ${customization.showBeams ? "bg-orange-500 shadow-inner" : "bg-gray-200 dark:bg-gray-700"}`}>
                  <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${customization.showBeams ? "translate-x-4" : ""}`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen 
            ? "bg-gray-900 text-white rotate-90" 
            : "bg-orange-500 text-white hover:bg-orange-500"
        }`}
      >
        {isOpen ? <X size={24} /> : <Settings size={24} className="animate-spin-slow" />}
      </button>
    </div>
  );
}
