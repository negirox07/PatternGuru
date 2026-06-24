import { X } from "lucide-react";
import { KeyboardShortcut, ThemeMode } from "../types";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
  theme: ThemeMode;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts,
  theme
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const isHighContrast = theme === "high-contrast";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 transform scale-100 transition-all border ${
          isHighContrast
            ? "bg-black border-4 border-white text-white"
            : theme === "dark"
              ? "bg-[#0F111A] border-slate-900 text-slate-100"
              : "bg-white border-slate-200 text-slate-800"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-200 dark:border-slate-900">
          <h2 id="shortcuts-title" className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Keyboard Shortcuts Guide
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isHighContrast
                ? "border-2 border-white text-white hover:bg-white hover:text-black"
                : "hover:bg-slate-100 dark:hover:bg-slate-900"
            }`}
            aria-label="Close shortcuts guide"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400/80 mb-6 font-medium">
          Use the following keyboard shortcuts to control and navigate through the design patterns manual seamlessly.
        </p>

        <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
          {shortcuts.map((shortcut, index) => (
            <div 
              key={index} 
              className={`flex items-center justify-between pb-3 border-b last:border-b-0 ${
                isHighContrast 
                  ? "border-white/40" 
                  : "border-slate-100 dark:border-slate-900"
              }`}
            >
              <span className="text-sm font-medium">{shortcut.description}</span>
              <div className="flex items-center gap-1.5">
                {shortcut.keys.map((key, keyIdx) => (
                  <kbd 
                    key={keyIdx}
                    className={`px-2 py-1 text-xs font-semibold rounded font-mono border-b-2 shadow-sm ${
                      isHighContrast
                        ? "bg-white text-black border-zinc-500"
                        : theme === "dark"
                          ? "bg-slate-900 text-slate-200 border-slate-800 border-b-slate-950"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                    }`}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isHighContrast
                ? "bg-white text-black hover:bg-yellow-300 border-2 border-white font-bold"
                : theme === "dark"
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow shadow-indigo-950/50"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow"
            }`}
          >
            Got it, close menu
          </button>
        </div>
      </div>
    </div>
  );
}
