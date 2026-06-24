import { useState, useEffect, useRef } from "react";
import { designPatterns } from "./data/patterns";
import Sidebar from "./components/Sidebar";
import PatternView from "./components/PatternView";
import PatternCompareView from "./components/PatternCompareView";
import SearchBar from "./components/SearchBar";
import VoiceController from "./components/VoiceController";
import KeyboardShortcutsModal from "./components/KeyboardShortcutsModal";
import { ThemeMode, KeyboardShortcut } from "./types";
import { 
  Menu, Sun, Moon, Eye, Keyboard, Volume2, Sparkles, 
  BookOpen, Command, Laptop, Globe, Compass, ArrowUp, Code2,
  X, CheckCircle, ArrowRight, GitCompare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCookie, setCookie } from "./utils/cookies";

export default function App() {
  const [activePatternId, setActivePatternId] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem("design-patterns-active-pattern-id");
      return saved || "singleton";
    } catch {
      return "singleton";
    }
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Standard preference detection
    const saved = localStorage.getItem("design-patterns-theme");
    if (saved === "light" || saved === "dark" || saved === "high-contrast") {
      return saved as ThemeMode;
    }
    return "dark";
  });
  const [globalLanguage, setGlobalLanguage] = useState<string>(() => {
    const saved = localStorage.getItem("design-patterns-language");
    return saved || "typescript";
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFinishedToast, setShowFinishedToast] = useState(false);
  const [toastDismissedForPattern, setToastDismissedForPattern] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("design-patterns-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCompareMode, setIsCompareMode] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem("design-patterns-compare-mode");
      return saved === "true";
    } catch {
      return false;
    }
  });

  const [visitCount, setVisitCount] = useState<number>(1);
  const [lastActivePatternCookie, setLastActivePatternCookie] = useState<string>("");

  // Cookie Tracking on Mount
  useEffect(() => {
    // 1. Visit counter cookie
    const visitsStr = getCookie("pattern-research-visits");
    let currentVisits = visitsStr ? parseInt(visitsStr, 10) : 0;
    currentVisits += 1;
    setCookie("pattern-research-visits", currentVisits.toString(), 365);
    setVisitCount(currentVisits);

    // 2. Initial last active pattern cookie
    const lastActive = getCookie("last-active-pattern");
    if (lastActive) {
      setLastActivePatternCookie(lastActive);
    }
  }, []);

  // Update sessionStorage and Cookie when activePatternId changes
  useEffect(() => {
    try {
      sessionStorage.setItem("design-patterns-active-pattern-id", activePatternId);
      
      const pattern = designPatterns.find(p => p.id === activePatternId);
      if (pattern) {
        // Save to cookie (valid for 30 days)
        setCookie("last-active-pattern", pattern.title, 30);
        setLastActivePatternCookie(pattern.title);
      }
    } catch (e) {
      console.error(e);
    }
  }, [activePatternId]);

  // Update sessionStorage when isCompareMode changes
  useEffect(() => {
    try {
      sessionStorage.setItem("design-patterns-compare-mode", isCompareMode ? "true" : "false");
    } catch (e) {
      console.error(e);
    }
  }, [isCompareMode]);

  const handleNavigateFromCompare = (patternId: string) => {
    setActivePatternId(patternId);
    setIsCompareMode(false);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRestoringScrollRef = useRef(false);

  // Save favorite patterns to localStorage
  useEffect(() => {
    localStorage.setItem("design-patterns-favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const handleToggleFavorite = (patternId: string) => {
    setFavoriteIds((prev) => 
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
  };

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("design-patterns-language", globalLanguage);
  }, [globalLanguage]);

  // Save theme to localStorage and apply CSS class variables
  useEffect(() => {
    localStorage.setItem("design-patterns-theme", theme);
    const root = document.documentElement;
    root.classList.remove("dark", "high-contrast");
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "high-contrast") {
      root.classList.add("high-contrast");
    }
  }, [theme]);

  // Monitor scroll for Scroll-to-Top visibility, scroll progress, and triggering finished toast
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Update Scroll-to-Top button visibility
      if (scrollTop > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      // Calculate horizontal scroll progress
      const maxScroll = scrollHeight - clientHeight;
      const percentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setScrollProgress(percentage);

      // Persist scroll percentage for each pattern in localStorage
      if (!isRestoringScrollRef.current) {
        try {
          localStorage.setItem(`design-pattern-scroll-${activePatternId}`, percentage.toString());
        } catch (e) {
          console.error("Failed to save scroll percentage:", e);
        }
      }

      // Trigger "Finished!" toast when scrolling near the end
      if (!toastDismissedForPattern && maxScroll > 80 && scrollTop + clientHeight >= scrollHeight - 35) {
        setShowFinishedToast(true);
      }
    };

    container.addEventListener("scroll", handleScroll);
    // Initial evaluation
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [activePatternId, toastDismissedForPattern]);

  // Reset scroll position or restore saved progress, and finished toast when pattern changes
  useEffect(() => {
    setShowFinishedToast(false);
    setToastDismissedForPattern(false);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      
      // Get saved scroll percentage for the pattern
      let savedPercentStr = null;
      try {
        savedPercentStr = localStorage.getItem(`design-pattern-scroll-${activePatternId}`);
      } catch (e) {
        console.error("Failed to get saved scroll percentage:", e);
      }
      
      const savedPercent = savedPercentStr ? parseFloat(savedPercentStr) : 0;
      
      if (savedPercent > 0) {
        isRestoringScrollRef.current = true;
        // Delay slightly to let the pattern content render first to compute correct heights
        const timer = setTimeout(() => {
          const { scrollHeight, clientHeight } = container;
          const maxScroll = scrollHeight - clientHeight;
          if (maxScroll > 0) {
            const targetScrollTop = (savedPercent / 100) * maxScroll;
            container.scrollTop = targetScrollTop;
            setScrollProgress(savedPercent);
          } else {
            container.scrollTop = 0;
            setScrollProgress(0);
          }
          
          setTimeout(() => {
            isRestoringScrollRef.current = false;
          }, 50);
        }, 100);
        
        return () => clearTimeout(timer);
      } else {
        container.scrollTop = 0;
        setScrollProgress(0);
        isRestoringScrollRef.current = false;
      }
    }
  }, [activePatternId]);

  // Keyboard Navigation & Action Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If user typing inside input/textarea fields, ignore shortcuts
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Cycle themes with 't'
      if (key === "t") {
        e.preventDefault();
        setTheme((prev) => (prev === "light" ? "dark" : prev === "dark" ? "high-contrast" : "light"));
      } 
      // Cycle global language with 'l'
      else if (key === "l") {
        e.preventDefault();
        const langs = ["typescript", "python", "java", "cpp", "csharp"];
        setGlobalLanguage((prev) => {
          const idx = langs.indexOf(prev);
          const nextIdx = (idx + 1) % langs.length;
          return langs[nextIdx];
        });
      }
      // Toggle comparison mode with 'c'
      else if (key === "c") {
        e.preventDefault();
        setIsCompareMode((prev) => !prev);
      }
      // Toggle high contrast theme with 'h'
      else if (key === "h") {
        e.preventDefault();
        setTheme((prev) => (prev === "high-contrast" ? "dark" : "high-contrast"));
      } 
      // Open Keyboard Guide with '?' (Shift + /)
      else if (e.key === "?" || e.key === "/") {
        if (e.shiftKey || e.key === "?") {
          e.preventDefault();
          setHelpModalOpen(true);
        }
      } 
      // Close overlays with 'Escape'
      else if (e.key === "Escape") {
        setHelpModalOpen(false);
        setMobileSidebarOpen(false);
      } 
      // Navigation: Next pattern with 'ArrowDown'
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = designPatterns.findIndex((p) => p.id === activePatternId);
        if (currentIndex < designPatterns.length - 1) {
          setActivePatternId(designPatterns[currentIndex + 1].id);
        }
      } 
      // Navigation: Previous pattern with 'ArrowUp'
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = designPatterns.findIndex((p) => p.id === activePatternId);
        if (currentIndex > 0) {
          setActivePatternId(designPatterns[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [activePatternId]);

  const activePattern = designPatterns.find((p) => p.id === activePatternId) || designPatterns[0];
  const currentPatternIndex = designPatterns.findIndex((p) => p.id === activePattern.id);
  const nextPattern = currentPatternIndex < designPatterns.length - 1 ? designPatterns[currentPatternIndex + 1] : null;

  const shortcutsList: KeyboardShortcut[] = [
    { keys: ["Ctrl", "K"], description: "Activate fast pattern search", action: "Search focus" },
    { keys: ["C"], description: "Toggle side-by-side design pattern comparison", action: "Toggle Compare" },
    { keys: ["ArrowDown"], description: "Navigate to next design pattern", action: "Next page" },
    { keys: ["ArrowUp"], description: "Navigate to previous design pattern", action: "Previous page" },
    { keys: ["T"], description: "Cycle visual themes (Light ⇆ Dark ⇆ High Contrast)", action: "Toggle theme" },
    { keys: ["L"], description: "Cycle global code language (TS ⇆ Py ⇆ Java ⇆ C++)", action: "Toggle language" },
    { keys: ["H"], description: "Toggle high-contrast accessibility mode directly", action: "Toggle High Contrast" },
    { keys: ["Shift", "?"], description: "Open keyboard shortcut help", action: "Show help" },
    { keys: ["Esc"], description: "Close help guides and mobile drawers", action: "Close overlay" }
  ];

  const isHighContrast = theme === "high-contrast";

  return (
    <div 
      className={`min-h-screen flex transition-colors duration-300 font-sans ${
        isHighContrast 
          ? "bg-black text-white selection:bg-yellow-300 selection:text-black" 
          : "bg-white dark:bg-[#0c0e17] text-slate-800 dark:text-slate-100 selection:bg-indigo-100 dark:selection:bg-indigo-950/65 dark:selection:text-indigo-200"
      }`}
    >
      {/* Sidebar - Desktop and Mobile sliding drawer container */}
      <Sidebar
        patterns={designPatterns}
        activeId={activePatternId}
        onSelect={setActivePatternId}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        theme={theme}
        onOpenHelp={() => setHelpModalOpen(true)}
        favoriteIds={favoriteIds}
      />

      {/* Main Content Pane */}
      <div ref={scrollContainerRef} className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header toolbar */}
        <header 
          className={`sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between border-b backdrop-blur-md relative ${
            isHighContrast
              ? "bg-black border-white"
              : "bg-white/80 dark:bg-[#0c0e17]/85 border-slate-100 dark:border-slate-900"
          }`}
        >
          {/* Subtle scroll progress bar at the bottom edge of the header */}
          <div 
            className={`absolute bottom-0 left-0 h-[3px] transition-all duration-75 ease-out ${
              isHighContrast
                ? "bg-yellow-300"
                : theme === "dark"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_1px_8px_rgba(99,102,241,0.5)]"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
            }`}
            style={{ width: `${scrollProgress}%` }}
            aria-hidden="true"
          />

          {/* Mobile hamburger menu & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className={`p-2 rounded-lg md:hidden transition-colors ${
                isHighContrast
                  ? "border-2 border-white text-white hover:bg-white hover:text-black"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
              aria-label="Open mobile navigation"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-2 md:hidden">
              <span className="font-extrabold text-sm tracking-tight">Manual</span>
            </div>
          </div>

          {/* Core Search Controller */}
          <SearchBar 
            patterns={designPatterns} 
            onSelectPattern={setActivePatternId} 
            theme={theme} 
          />

          {/* Browser Storage Telemetry Indicators */}
          <div className="hidden xl:flex items-center gap-4 text-[11px] font-bold text-slate-400 dark:text-slate-500">
            {lastActivePatternCookie && (
              <div className="flex items-center gap-1.5 border-r border-slate-100 dark:border-slate-800 pr-4">
                <span className="font-normal opacity-70 uppercase tracking-wider text-[9px]">Last studied (Cookie):</span>
                <span className={isHighContrast ? "text-yellow-300 font-extrabold" : "text-indigo-500 dark:text-indigo-400"}>
                  {lastActivePatternCookie}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="font-normal opacity-70 uppercase tracking-wider text-[9px]">Total visits (Cookie):</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isHighContrast 
                  ? "bg-white text-black font-extrabold" 
                  : "bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              }`}>
                {visitCount}
              </span>
            </div>
          </div>

          {/* Theme, Keyboard help quick controls */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Global Language Selector */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
              isHighContrast
                ? "bg-black border-white text-white"
                : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
            }`}>
              <Code2 size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
              <select
                value={globalLanguage}
                onChange={(e) => setGlobalLanguage(e.target.value)}
                className="bg-transparent font-bold text-xs outline-none cursor-pointer border-none p-0 pr-1 select-none font-sans"
                title="Global Code Language (L)"
                aria-label="Select global code language"
              >
                <option value="typescript" className="bg-white dark:bg-[#0c0e17] text-slate-800 dark:text-slate-100 font-semibold font-sans">TypeScript</option>
                <option value="python" className="bg-white dark:bg-[#0c0e17] text-slate-800 dark:text-slate-100 font-semibold font-sans">Python</option>
                <option value="java" className="bg-white dark:bg-[#0c0e17] text-slate-800 dark:text-slate-100 font-semibold font-sans">Java</option>
                <option value="cpp" className="bg-white dark:bg-[#0c0e17] text-slate-800 dark:text-slate-100 font-semibold font-sans">C++</option>
                <option value="csharp" className="bg-white dark:bg-[#0c0e17] text-slate-800 dark:text-slate-100 font-semibold font-sans">C#</option>
              </select>
            </div>

            {/* Theme Cycle Button */}
            <button
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : prev === "dark" ? "high-contrast" : "light"))}
              className={`p-2.5 rounded-xl transition-all border ${
                isHighContrast
                  ? "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
              }`}
              title="Cycle Theme (T)"
              aria-label="Cycle display theme"
            >
              {theme === "light" ? (
                <Sun size={16} />
              ) : theme === "dark" ? (
                <Moon size={16} className="text-indigo-400" />
              ) : (
                <Eye size={16} className="text-yellow-300" />
              )}
            </button>

            {/* Compare Patterns Button */}
            <button
              onClick={() => setIsCompareMode((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isCompareMode
                  ? isHighContrast
                    ? "bg-yellow-300 text-black border-white"
                    : "bg-indigo-650 text-white border-indigo-600 shadow-lg shadow-indigo-600/15"
                  : isHighContrast
                    ? "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                    : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
              }`}
              title="Compare design patterns side-by-side"
              aria-label="Compare design patterns side-by-side"
              aria-pressed={isCompareMode}
            >
              <GitCompare size={14} className={isCompareMode ? "text-white" : "text-slate-500 dark:text-indigo-400"} />
              <span className="hidden sm:inline">{isCompareMode ? "Reader Mode" : "Compare"}</span>
              <span className="sm:hidden">{isCompareMode ? "Read" : "Comp"}</span>
            </button>

            {/* Help Modals Button */}
            <button
              onClick={() => setHelpModalOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isHighContrast
                  ? "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
              }`}
              aria-label="Open keyboard shortcuts guide"
            >
              <Keyboard size={14} className="text-slate-500 dark:text-indigo-400" />
              <span>Keys</span>
            </button>
          </div>
        </header>

        {/* Content canvas container */}
        <main className="flex-1 overflow-x-hidden">
          {isCompareMode ? (
            <PatternCompareView
              activePatternId={activePatternId}
              allPatterns={designPatterns}
              theme={theme}
              globalLanguage={globalLanguage}
              setGlobalLanguage={setGlobalLanguage}
              onNavigate={handleNavigateFromCompare}
            />
          ) : (
            <PatternView
              pattern={activePattern}
              allPatterns={designPatterns}
              onNavigate={setActivePatternId}
              theme={theme}
              globalLanguage={globalLanguage}
              setGlobalLanguage={setGlobalLanguage}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </main>
      </div>

      {/* Voice Commands control panel widget */}
      <VoiceController
        onNavigate={setActivePatternId}
        onThemeChange={setTheme}
        onOpenHelp={() => setHelpModalOpen(true)}
        onCloseHelp={() => setHelpModalOpen(false)}
        theme={theme}
        availablePatternIds={designPatterns.map((p) => p.id)}
      />

      {/* Keyboard Shortcuts Help Modal Overlay */}
      <KeyboardShortcutsModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        shortcuts={shortcutsList}
        theme={theme}
      />

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-24 right-6 z-40 p-2.5 rounded-full shadow-lg transition-all duration-300 border ${
            isHighContrast
              ? "bg-black border-2 border-white text-yellow-300 hover:bg-yellow-300 hover:text-black"
              : "bg-blue-600 dark:bg-indigo-600 hover:bg-blue-700 dark:hover:bg-indigo-700 text-white border-blue-500 dark:border-indigo-500 hover:scale-105"
          }`}
          aria-label="Scroll back to top of page"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* Finished! Toast Notification */}
      <AnimatePresence>
        {showFinishedToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md z-50 p-4 rounded-2xl shadow-2xl border flex flex-col gap-3 transition-colors ${
              isHighContrast
                ? "bg-black border-2 border-white text-white"
                : theme === "dark"
                  ? "bg-[#111322]/95 backdrop-blur-md border-indigo-500/20 shadow-indigo-950/40 text-slate-100"
                  : "bg-white/95 backdrop-blur-md border-slate-200/80 shadow-slate-250 text-slate-800"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${
                  isHighContrast
                    ? "text-yellow-300"
                    : "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                }`}>
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">Finished!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    You've completed reading the <strong className={isHighContrast ? "text-yellow-300" : "text-indigo-400"}>{activePattern.title}</strong> pattern.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFinishedToast(false);
                  setToastDismissedForPattern(true);
                }}
                className={`p-1 rounded-lg transition-colors ${
                  isHighContrast
                    ? "hover:bg-white hover:text-black text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>

            {nextPattern && (
              <div className="flex items-center justify-end border-t border-slate-100 dark:border-slate-800/60 pt-3">
                <button
                  onClick={() => {
                    setActivePatternId(nextPattern.id);
                    setShowFinishedToast(false);
                  }}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isHighContrast
                      ? "bg-yellow-300 text-black border border-yellow-300 hover:bg-black hover:text-white hover:border-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/15"
                  }`}
                >
                  <span>Next Pattern: {nextPattern.title}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
