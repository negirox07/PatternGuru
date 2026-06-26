import { useState, useEffect, useRef } from "react";
import { DesignPattern, ThemeMode } from "../types";
import { getNote, saveNote } from "../utils/browserDb";
import { 
  Copy, Check, BookOpen, AlertTriangle, HelpCircle, 
  CheckCircle, ArrowRight, CornerDownRight, FileCode2,
  ChevronRight, Sparkles, MessageSquareWarning, Code2,
  Box, Layers, Landmark, Clock, Eye, FileText, Bookmark, StickyNote,
  Sliders, Printer
} from "lucide-react";
import SyntaxHighlighter from "./SyntaxHighlighter";
import PatternQuizView from "./PatternQuizView";
import AdSenseUnit from "./AdSenseUnit";
import { patternQuizzes } from "../data/quizzes";
import { getAverageRating } from "../utils/ratings";


interface PatternViewProps {
  pattern: DesignPattern;
  allPatterns: DesignPattern[];
  onNavigate: (patternId: string) => void;
  theme: ThemeMode;
  globalLanguage: string;
  setGlobalLanguage: (lang: string) => void;
  favoriteIds: string[];
  onToggleFavorite: (patternId: string) => void;
  userRating: number;
  onRatePattern: (patternId: string, rating: number) => void;
}

const fontSizeClasses: Record<string, string> = {
  sm: "text-xs md:text-sm",
  base: "text-sm md:text-base",
  lg: "text-base md:text-lg",
  xl: "text-lg md:text-xl",
};

const lineHeightClasses: Record<string, string> = {
  tight: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
};

export default function PatternView({ 
  pattern, 
  allPatterns, 
  onNavigate, 
  theme, 
  globalLanguage, 
  setGlobalLanguage,
  favoriteIds,
  onToggleFavorite,
  userRating,
  onRatePattern
}: PatternViewProps) {
  const [activeLang, setActiveLang] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"standard" | "raw">("standard");
  const [rawCopied, setRawCopied] = useState<boolean>(false);

  const isFavorited = favoriteIds.includes(pattern.id);

  const [readerSettings, setReaderSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("design-patterns-reader-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          wpm: parsed.wpm ?? 200,
          fontSize: parsed.fontSize ?? "base",
          lineHeight: parsed.lineHeight ?? "relaxed"
        };
      }
    } catch (e) {
      console.error("Failed to parse reader settings:", e);
    }
    return {
      wpm: 200,
      fontSize: "base",
      lineHeight: "relaxed"
    };
  });

  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const updateReaderSetting = <K extends keyof typeof readerSettings>(
    key: K,
    value: typeof readerSettings[K]
  ) => {
    setReaderSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem("design-patterns-reader-settings", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save reader settings:", e);
      }
      return next;
    });
  };

  const [note, setNote] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<number | null>(null);
  const [relatedFilter, setRelatedFilter] = useState<'all' | 'category' | 'complexity'>('all');

  // Load note when pattern changes (from localStorage & IndexedDB migration fallback)
  useEffect(() => {
    // Clear any pending saves
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    
    const localSaved = localStorage.getItem(`design-patterns-note-${pattern.id}`);
    if (localSaved !== null) {
      setNote(localSaved);
    } else {
      getNote(pattern.id)
        .then((savedNote) => {
          setNote(savedNote);
          if (savedNote) {
            localStorage.setItem(`design-patterns-note-${pattern.id}`, savedNote);
          }
        })
        .catch((e) => {
          console.error("Failed to load note from IndexedDB:", e);
          setNote("");
        });
    }
      
    setSaveStatus("idle");
    setRelatedFilter("all");
  }, [pattern.id]);

  const handleNoteChange = (text: string) => {
    setNote(text);
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(`design-patterns-note-${pattern.id}`, text);
        
        // Sync with IndexedDB as a backup
        saveNote(pattern.id, text).catch((e) => {
          console.error("Failed to sync note to IndexedDB:", e);
        });

        setSaveStatus("saved");
        
        // Return to idle state after showing "saved" status
        setTimeout(() => {
          setSaveStatus((current) => current === "saved" ? "idle" : current);
        }, 1500);
      } catch (e) {
        console.error("Failed to save note to localStorage:", e);
        setSaveStatus("idle");
      }
    }, 800);
  };

  // Set active language based on global preference or default first snippet on pattern/global change
  useEffect(() => {
    if (pattern.snippets.length > 0) {
      const hasGlobalLang = pattern.snippets.some(s => s.language === globalLanguage);
      if (hasGlobalLang) {
        setActiveLang(globalLanguage);
      } else {
        setActiveLang(pattern.snippets[0].language);
      }
    }
    setViewMode("standard");
  }, [pattern, globalLanguage]);

  const activeSnippet = pattern.snippets.find(s => s.language === activeLang);

  const handleCopy = () => {
    if (!activeSnippet) return;
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHighContrast = theme === "high-contrast";

  // Word count & estimated reading time calculation based on reading speed (WPM)
  const getReadTime = (p: DesignPattern, wpm: number = 200) => {
    const textParts = [
      p.title,
      p.tagline,
      p.intent,
      p.problem,
      p.solution,
      p.analogy,
      ...(p.pros || []),
      ...(p.cons || [])
    ];
    const totalText = textParts.join(" ");
    const wordCount = totalText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / wpm));
  };

  const readTime = getReadTime(pattern, readerSettings.wpm);

  const textFontSize = fontSizeClasses[readerSettings.fontSize] || "text-sm md:text-base";
  const textLineHeight = lineHeightClasses[readerSettings.lineHeight] || "leading-relaxed";
  const readerTextClass = `${textFontSize} ${textLineHeight}`;

  // Category badge color utilities
  const categoryBadge = (category: string) => {
    switch (category) {
      case "creational":
        return isHighContrast
          ? "border-2 border-white text-white bg-black"
          : "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300";
      case "structural":
        return isHighContrast
          ? "border-2 border-white text-white bg-black"
          : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
      case "behavioral":
        return isHighContrast
          ? "border-2 border-white text-white bg-black"
          : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Difficulty badge color utilities
  const difficultyBadge = (difficulty: "Beginner" | "Intermediate" | "Advanced") => {
    if (isHighContrast) {
      return "border border-white text-white bg-black";
    }
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30";
      case "Intermediate":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30";
      case "Advanced":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200 dark:border-slate-800";
    }
  };

  const getRawMarkdown = (p: DesignPattern) => {
    const prosText = p.pros && p.pros.length > 0
      ? `### Benefits & Pros\n${p.pros.map(pro => `- ${pro}`).join("\n")}`
      : "";
    const consText = p.cons && p.cons.length > 0
      ? `### Liabilities & Cons\n${p.cons.map(con => `- ${con}`).join("\n")}`
      : "";

    return `# ${p.title} (${p.category.toUpperCase()} Pattern)

> ${p.tagline}

**Difficulty:** ${p.difficulty} | **Category:** ${p.category} | **Read Time:** ${readTime} min

## Core Intent
${p.intent}

## Real-World Analogy
${p.analogy}

## Problem Context
${p.problem}

## Solution & Implementation
${p.solution}

${prosText}

${consText}

## Code Snippets
${p.snippets.map(snippet => `### ${snippet.language.toUpperCase()}
\`\`\`${snippet.language}
${snippet.code}
\`\`\``).join("\n\n")}`;
  };

  return (
    <article 
      className="max-w-4xl mx-auto py-8 px-4 md:px-8 font-sans pb-24"
      aria-labelledby="pattern-title"
    >
      {/* Pattern Title & Meta */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-100 dark:border-slate-900 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${categoryBadge(pattern.category)}`}>
              {pattern.category} Pattern
            </span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">GoF Catalog</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Clock size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500 dark:text-indigo-400"} />
              <span>{readTime} min read</span>
            </div>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${difficultyBadge(pattern.difficulty)}`}>
              {pattern.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleFavorite(pattern.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isHighContrast
                  ? isFavorited
                    ? "bg-yellow-300 text-black border-white"
                    : "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                  : isFavorited
                    ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/15 hover:bg-rose-600 hover:border-rose-600"
                    : theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-450 hover:border-slate-700 hover:bg-slate-850"
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50"
              }`}
              title={isFavorited ? "Remove from Bookmarks" : "Add to Bookmarks"}
              aria-label={isFavorited ? "Remove from Bookmarks" : "Add to Bookmarks"}
            >
              <Bookmark size={14} className={isFavorited ? "fill-current text-white dark:text-white" : ""} />
              <span>{isFavorited ? "Bookmarked" : "Bookmark"}</span>
            </button>

            {/* Export PDF / Print button */}
            <button
              id="tour-print"
              onClick={() => window.print()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border print:hidden ${
                isHighContrast
                  ? "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                  : theme === "dark"
                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-slate-700 hover:bg-slate-850"
                    : "bg-slate-50 border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50"
              }`}
              title="Print Pattern or Export clean PDF documentation"
              aria-label="Export PDF / Print Pattern"
            >
              <Printer size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500 dark:text-indigo-400"} />
              <span>PDF / Print</span>
            </button>

            {/* Reader Settings Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isHighContrast
                    ? showSettingsDropdown
                      ? "bg-yellow-300 text-black border-white"
                      : "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                    : showSettingsDropdown
                      ? "bg-indigo-655 text-white border-indigo-600 shadow-md shadow-indigo-600/15"
                      : theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-slate-700 hover:bg-slate-850"
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                }`}
                title="Reader Typography & Reading Speed Settings"
                aria-label="Reader Typography & Reading Speed Settings"
                aria-expanded={showSettingsDropdown}
              >
                <Sliders size={14} />
                <span>Format</span>
              </button>

              {showSettingsDropdown && (
                <>
                  {/* Backdrop for easy dismiss */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSettingsDropdown(false)} 
                  />
                  
                  {/* Dropdown Card */}
                  <div className={`absolute right-0 mt-2 w-72 z-50 p-4 rounded-2xl shadow-2xl border flex flex-col gap-4 animate-fadeIn ${
                    isHighContrast
                      ? "bg-black border-2 border-white text-white"
                      : theme === "dark"
                        ? "bg-[#111322]/95 backdrop-blur-md border-slate-850 text-slate-100"
                        : "bg-white/95 backdrop-blur-md border-slate-100 text-slate-800"
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800/80">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-450 dark:text-slate-500">
                        Reader Options
                      </span>
                      <button
                        onClick={() => setShowSettingsDropdown(false)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isHighContrast 
                            ? "hover:bg-white hover:text-black" 
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Done
                      </button>
                    </div>

                    {/* 1. Reading Speed (WPM) Slider */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-650 dark:text-slate-300">Reading Speed</span>
                        <span className={isHighContrast ? "text-yellow-300" : "text-indigo-500 dark:text-indigo-400"}>
                          {readerSettings.wpm} WPM
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="450"
                        step="25"
                        value={readerSettings.wpm}
                        onChange={(e) => updateReaderSetting("wpm", parseInt(e.target.value))}
                        className={`w-full cursor-pointer accent-indigo-600 ${isHighContrast ? "accent-yellow-300" : ""}`}
                        aria-label="Reading speed in words per minute"
                      />
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal font-medium">
                        Changes Estimated Read Time calculation.
                      </span>
                    </div>

                    {/* 2. Font Size (Buttons) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-655 dark:text-slate-300">Font Size</span>
                      <div className="grid grid-cols-4 gap-1">
                        {(["sm", "base", "lg", "xl"] as const).map((sz) => {
                          const isActive = readerSettings.fontSize === sz;
                          return (
                            <button
                              key={`fs-${sz}`}
                              onClick={() => updateReaderSetting("fontSize", sz)}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                isActive
                                  ? isHighContrast
                                    ? "bg-yellow-300 text-black border-yellow-300"
                                    : "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : isHighContrast
                                    ? "bg-black text-white border-white hover:bg-yellow-300 hover:text-black"
                                    : theme === "dark"
                                      ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                                      : "bg-slate-50 border-slate-200/60 text-slate-650 hover:bg-slate-100 hover:text-slate-800"
                              }`}
                            >
                              <span className={sz === "sm" ? "text-[10px]" : sz === "base" ? "text-xs" : sz === "lg" ? "text-sm" : "text-base"}>
                                Aa
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Line Height (Buttons) */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-slate-655 dark:text-slate-300">Line Spacing</span>
                      <div className="grid grid-cols-3 gap-1">
                        {(["tight", "normal", "relaxed"] as const).map((lh) => {
                          const isActive = readerSettings.lineHeight === lh;
                          return (
                            <button
                              key={`lh-${lh}`}
                              onClick={() => updateReaderSetting("lineHeight", lh)}
                              className={`py-1.5 rounded-lg text-xs font-bold transition-all border capitalize ${
                                isActive
                                  ? isHighContrast
                                    ? "bg-yellow-300 text-black border-yellow-300"
                                    : "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : isHighContrast
                                    ? "bg-black text-white border-white hover:bg-yellow-300 hover:text-black"
                                    : theme === "dark"
                                      ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                                      : "bg-slate-50 border-slate-200/60 text-slate-650 hover:bg-slate-100 hover:text-slate-800"
                              }`}
                            >
                              {lh}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* View Raw / Rich Article button */}
            <button
              onClick={() => setViewMode(prev => prev === "standard" ? "raw" : "standard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isHighContrast
                  ? "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                  : viewMode === "raw"
                    ? theme === "dark"
                      ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30"
                      : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                    : theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {viewMode === "raw" ? (
                <>
                  <Eye size={14} />
                  <span>Rich Article</span>
                </>
              ) : (
                <>
                  <FileText size={14} />
                  <span>View Raw Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <h1 
          id="pattern-title" 
          className="text-3xl md:text-5xl font-black tracking-tight mb-4"
        >
          {pattern.title}
        </h1>

        {/* Pattern Tags */}
        {pattern.tags && pattern.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {pattern.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors border ${
                  isHighContrast
                    ? "border-white bg-black text-white hover:bg-yellow-300 hover:text-black"
                    : theme === "dark"
                      ? "bg-indigo-950/20 text-indigo-300 border-indigo-900/30 hover:bg-indigo-950/40"
                      : "bg-indigo-50/50 text-indigo-750 border-indigo-100 hover:bg-indigo-50"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Pattern Rating Section */}
        {(() => {
          const ratingInfo = getAverageRating(pattern.id, userRating);
          return (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 ${
              isHighContrast
                ? "border-white bg-black text-white"
                : theme === "dark"
                  ? "bg-[#0F111A]/80 border-slate-900/80"
                  : "bg-slate-50 border-slate-100"
            }`}>
              <div className="flex items-center gap-3.5 flex-wrap">
                {/* Combined Community Rating */}
                <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-4 shrink-0">
                  <span className="text-lg font-black text-slate-850 dark:text-slate-100">
                    {ratingInfo.average}
                  </span>
                  <div className="flex items-center text-amber-500 text-sm tracking-tighter">
                    {"★".repeat(Math.round(ratingInfo.average))}
                    {"☆".repeat(5 - Math.round(ratingInfo.average))}
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider ml-1">
                    ({ratingInfo.count} reviews)
                  </span>
                </div>

                {/* User Interaction */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Your Rating:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = userRating >= star;
                      return (
                        <button
                          key={star}
                          onClick={() => onRatePattern(pattern.id, star)}
                          className={`transition-all duration-150 transform hover:scale-125 focus:outline-none ${
                            isFilled
                              ? "text-amber-500 hover:text-amber-400 text-xl cursor-pointer"
                              : "text-slate-300 dark:text-slate-700 hover:text-amber-300 text-xl cursor-pointer"
                          }`}
                          title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                  {userRating > 0 && (
                    <button
                      onClick={() => onRatePattern(pattern.id, 0)}
                      className="text-[10px] font-bold text-slate-450 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-450 ml-1 underline cursor-pointer transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium italic sm:text-right shrink-0">
                {userRating > 0 ? "Thank you for rating!" : "Click stars to cast your vote."}
              </span>
            </div>
          );
        })()}
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl border-l-4 border-blue-500 pl-4 py-1">
          {pattern.tagline}
        </p>
      </header>

      {viewMode === "raw" ? (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText size={18} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Raw Markdown Source
              </h2>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getRawMarkdown(pattern));
                setRawCopied(true);
                setTimeout(() => setRawCopied(false), 2000);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border ${
                isHighContrast
                  ? "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                  : theme === "dark"
                    ? "bg-[#0F111A] border-slate-900/80 text-slate-300 hover:bg-slate-900 hover:border-slate-800"
                    : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700"
              }`}
            >
              {rawCopied ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span>Copied Markdown!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isHighContrast
              ? "bg-black border-2 border-white"
              : theme === "dark"
                ? "bg-[#06080E] border-slate-900/80"
                : "bg-slate-50 border-slate-200"
          }`}>
            <SyntaxHighlighter 
              code={getRawMarkdown(pattern)} 
              language="markdown" 
              theme={theme} 
            />
          </div>
        </div>
      ) : (
        <>
          {/* Grid: Intent & Analogy */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Intent Card */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isHighContrast
            ? "bg-black border-2 border-white text-white"
            : theme === "dark"
              ? "bg-[#0F111A] border-slate-900/80 shadow-lg shadow-black/25 hover:border-indigo-900/40"
              : "bg-slate-50 border-slate-100"
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Core Intent
            </h2>
          </div>
          <p className={`${readerTextClass} text-slate-700 dark:text-slate-300/90`}>
            {pattern.intent}
          </p>
        </div>

        {/* Real-World Analogy Card */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isHighContrast
            ? "bg-black border-2 border-white text-white"
            : theme === "dark"
              ? "bg-[#0F111A] border-slate-900/80 shadow-lg shadow-black/25 hover:border-amber-900/40"
              : "bg-slate-50 border-slate-100"
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className={isHighContrast ? "text-yellow-300" : "text-amber-500"} />
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Real-World Analogy
            </h2>
          </div>
          <p className={`${readerTextClass} text-slate-700 dark:text-slate-300/90`}>
            {pattern.analogy}
          </p>
        </div>
      </section>

      {/* Grid: Problem & Solution Details */}
      <section className="grid grid-cols-1 gap-6 mb-8">
        {/* Problem Card */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isHighContrast
            ? "bg-black border-2 border-white text-white"
            : theme === "dark"
              ? "bg-gradient-to-br from-[#1a0c0e]/80 to-[#0F111A] border-red-950/40 shadow-md hover:border-red-900/30"
              : "bg-red-50/50 border-red-100"
        }`}>
          <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400/90">
            <MessageSquareWarning size={18} />
            <h2 className="font-bold text-sm uppercase tracking-wider">
              The Problem
            </h2>
          </div>
          <p className={`${readerTextClass} whitespace-pre-line text-slate-700 dark:text-slate-300/90`}>
            {pattern.problem}
          </p>
        </div>

        {/* Solution Card */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isHighContrast
            ? "bg-black border-2 border-white text-white"
            : theme === "dark"
              ? "bg-gradient-to-br from-[#0c1a14]/80 to-[#0F111A] border-emerald-950/40 shadow-md hover:border-emerald-900/30"
              : "bg-emerald-50/50 border-emerald-100"
        }`}>
          <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400/90">
            <CheckCircle size={18} />
            <h2 className="font-bold text-sm uppercase tracking-wider">
              The Solution
            </h2>
          </div>
          <p className={`${readerTextClass} whitespace-pre-line text-slate-700 dark:text-slate-300/90`}>
            {pattern.solution}
          </p>
        </div>
      </section>

      {/* UML ASCII Diagram */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Code2 size={18} className="text-slate-400 dark:text-indigo-400/60" />
          <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">
            UML Class Diagram
          </h2>
        </div>
        <div className={`p-6 rounded-2xl border font-mono text-xs md:text-sm overflow-x-auto select-none ${
          isHighContrast
            ? "bg-black border-2 border-white text-white"
            : theme === "dark"
              ? "bg-[#06080E] border-slate-900/80 text-slate-300/90 shadow-inner"
              : "bg-slate-900 border-slate-950 text-slate-300"
        }`}>
          <pre>{pattern.diagram}</pre>
        </div>
      </section>

      {/* Code Snippets Section */}
      <section className="mb-8" aria-labelledby="code-section-title">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCode2 size={18} className="text-indigo-500" />
            <h2 id="code-section-title" className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Interactive Code Snippet
            </h2>
          </div>
          
          {/* Fast Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border ${
              isHighContrast
                ? "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                : theme === "dark"
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200"
            }`}
            aria-label="Copy active code snippet to clipboard"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Frame */}
        <div className={`rounded-2xl border overflow-hidden ${
          isHighContrast
            ? "bg-black border-2 border-white"
            : theme === "dark"
              ? "bg-[#06080E] border-slate-900/80"
              : "bg-slate-50 border-slate-200"
        }`}>
          {/* Language tabs */}
          <div className={`flex items-center border-b px-2 md:px-4 py-2 overflow-x-auto gap-1.5 ${
            isHighContrast 
              ? "border-white" 
              : "border-slate-100 dark:border-slate-900/80 bg-[#0F111A]/40"
          }`}>
            {pattern.snippets.map((snippet) => {
              const isActive = snippet.language === activeLang;
              const displayLabel = 
                snippet.language === "typescript" ? "TypeScript" :
                snippet.language === "python" ? "Python" :
                snippet.language === "java" ? "Java" :
                snippet.language === "cpp" ? "C++" :
                snippet.language === "csharp" ? "C#" : snippet.language;

              return (
                <button
                  key={snippet.language}
                  onClick={() => setGlobalLanguage(snippet.language)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                    isActive
                      ? isHighContrast
                        ? "bg-white text-black font-extrabold"
                        : theme === "dark"
                          ? "bg-indigo-600 text-white shadow shadow-indigo-900/30"
                          : "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>

          {/* Syntax Highlighted Content */}
          {activeSnippet && (
            <SyntaxHighlighter 
              code={activeSnippet.code} 
              language={activeSnippet.language} 
              theme={theme} 
            />
          )}
        </div>
      </section>

      {/* Pros & Cons list */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pros */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isHighContrast
            ? "bg-black border-2 border-white text-white"
            : theme === "dark"
              ? "bg-[#0F111A] border-slate-900/80 shadow-lg shadow-black/20 hover:border-emerald-950/60"
              : "bg-emerald-50/10 border-slate-100"
        }`}>
          <h3 className="font-bold text-base mb-4 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle size={18} />
            <span>Pros / Advantages</span>
          </h3>
          <ul className={`flex flex-col gap-2.5 ${textFontSize} ${textLineHeight} text-slate-600 dark:text-slate-300`}>
            {pattern.pros.map((pro, index) => (
              <li key={index} className="flex items-start gap-2">
                <ChevronRight size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isHighContrast
            ? "bg-black border-2 border-white text-white"
            : theme === "dark"
              ? "bg-[#0F111A] border-slate-900/80 shadow-lg shadow-black/20 hover:border-red-950/60"
              : "bg-red-50/10 border-slate-100"
        }`}>
          <h3 className="font-bold text-base mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>Cons / Trade-offs</span>
          </h3>
          <ul className={`flex flex-col gap-2.5 ${textFontSize} ${textLineHeight} text-slate-600 dark:text-slate-300`}>
            {pattern.cons.map((con, index) => (
              <li key={index} className="flex items-start gap-2">
                <ChevronRight size={16} className="text-red-500 shrink-0 mt-0.5" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Personal Notes / Implementation thoughts */}
      <section id="tour-notes" className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900/60">
        <div className={`p-6 rounded-2xl border transition-all duration-300 ${
          isHighContrast
            ? "bg-black border-2 border-white text-white"
            : theme === "dark"
              ? "bg-[#0F111A] border-slate-900/80 shadow-lg shadow-black/20 focus-within:border-indigo-500/45"
              : "bg-slate-50/50 border-slate-100/80 shadow-sm focus-within:border-indigo-500/35"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${
                isHighContrast
                  ? "text-yellow-300"
                  : "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400"
              }`}>
                <StickyNote size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-850 dark:text-slate-100 leading-tight">
                  Personal Implementation Notes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Write down your thoughts, real-world examples, or custom design details.
                </p>
              </div>
            </div>

            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-semibold self-start sm:self-center">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-slate-450 dark:text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                  <Check size={14} />
                  <span>Saved in localStorage</span>
                </span>
              )}
              {saveStatus === "idle" && note && (
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  Auto-saved
                </span>
              )}
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder={`e.g., Use this pattern when designing our database initialization module or configuration manager to ensure only one instance is shared across the server...`}
            rows={4}
            className={`w-full p-4 rounded-xl text-sm font-medium outline-none transition-all resize-y ${
              isHighContrast
                ? "bg-black border border-white text-white focus:border-yellow-300"
                : theme === "dark"
                  ? "bg-[#090a10] border border-slate-900/60 text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                  : "bg-white border border-slate-200/85 text-slate-800 placeholder-slate-400 focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20"
            }`}
            aria-label="Personal notes for this design pattern"
          />
        </div>
      </section>

      {/* Interactive Quiz Section */}
      <section className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900/60">
        <PatternQuizView 
          quiz={patternQuizzes[pattern.id]} 
          theme={theme} 
          patternTitle={pattern.title} 
        />
      </section>

      {/* Main Content Horizontal Banner Ad Unit */}
      <AdSenseUnit
        slot="7440931404"
        className="mt-10"
        style={{ display: "block" }}
        format="auto"
      />
        </>
      )}

      {/* Related Patterns Suggestions Grid */}
      <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Related Patterns & Recommendations
            </h3>
          </div>
          
          <div className={`flex items-center p-1 rounded-xl border self-start md:self-auto ${
            isHighContrast
              ? "border-white bg-black"
              : "border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50"
          }`}>
            <button
              onClick={() => setRelatedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                relatedFilter === 'all'
                  ? isHighContrast
                    ? "bg-white text-black font-extrabold"
                    : theme === "dark"
                      ? "bg-indigo-600 text-white shadow shadow-indigo-950/40"
                      : "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRelatedFilter('category')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                relatedFilter === 'category'
                  ? isHighContrast
                    ? "bg-white text-black font-extrabold"
                    : theme === "dark"
                      ? "bg-indigo-600 text-white shadow shadow-indigo-950/40"
                      : "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Same Category
            </button>
            <button
              onClick={() => setRelatedFilter('complexity')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                relatedFilter === 'complexity'
                  ? isHighContrast
                    ? "bg-white text-black font-extrabold"
                    : theme === "dark"
                      ? "bg-indigo-600 text-white shadow shadow-indigo-950/40"
                      : "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Same Complexity
            </button>
          </div>
        </div>

        {(() => {
          // Calculate dynamic suggestions
          let combined: DesignPattern[] = [];

          if (relatedFilter === 'all') {
            const suggestions: DesignPattern[] = [];
            // 1. Add explicit related patterns
            pattern.relatedPatterns.forEach(id => {
              const p = allPatterns.find(item => item.id === id);
              if (p && p.id !== pattern.id && !suggestions.some(s => s.id === p.id)) {
                suggestions.push(p);
              }
            });

            // 2. Add patterns from same structural category as fallback
            const sameCategoryPatterns = allPatterns.filter(
              p => p.category === pattern.category && p.id !== pattern.id && !suggestions.some(s => s.id === p.id)
            );

            // Combine them: explicit first, then fill with same category
            combined = [...suggestions, ...sameCategoryPatterns].slice(0, 3);
          } else if (relatedFilter === 'category') {
            combined = allPatterns.filter(
              p => p.category === pattern.category && p.id !== pattern.id
            ).slice(0, 3);
          } else if (relatedFilter === 'complexity') {
            combined = allPatterns.filter(
              p => p.difficulty === pattern.difficulty && p.id !== pattern.id
            ).slice(0, 3);
          }

          if (combined.length === 0) return null;

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {combined.map((s) => {
                const isExplicit = pattern.relatedPatterns.includes(s.id);
                
                // Icon selection
                let CatIcon = BookOpen;
                if (s.category === "creational") CatIcon = Box;
                if (s.category === "structural") CatIcon = Layers;
                if (s.category === "behavioral") CatIcon = Landmark;

                // Color mappings based on category
                let cardHoverBorder = "";
                let badgeColor = "";
                let iconColor = "";

                if (isHighContrast) {
                  cardHoverBorder = "hover:border-yellow-300";
                  badgeColor = "border border-white text-white bg-black";
                  iconColor = "text-white";
                } else if (s.category === "creational") {
                  cardHoverBorder = "hover:border-purple-500/40 dark:hover:border-purple-400/30";
                  badgeColor = "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";
                  iconColor = "text-purple-500 dark:text-purple-400";
                } else if (s.category === "structural") {
                  cardHoverBorder = "hover:border-indigo-500/40 dark:hover:border-indigo-400/30";
                  badgeColor = "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-indigo-300";
                  iconColor = "text-indigo-500 dark:text-indigo-400";
                } else {
                  cardHoverBorder = "hover:border-amber-500/40 dark:hover:border-amber-400/30";
                  badgeColor = "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
                  iconColor = "text-amber-500 dark:text-amber-400";
                }

                // Determine dynamic match label
                let matchLabel = "Category Match";
                if (relatedFilter === "complexity") {
                  matchLabel = `Complexity Match`;
                } else if (relatedFilter === "category") {
                  matchLabel = `Category Match`;
                } else if (isExplicit) {
                  matchLabel = "Direct Link";
                }

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate(s.id);
                      // Scroll page to top when navigating to a related pattern
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`text-left flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 outline-none focus-visible:ring-2 ${
                      isHighContrast
                        ? "bg-black border-white text-white hover:bg-zinc-950 focus-visible:ring-yellow-300"
                        : theme === "dark"
                          ? `bg-[#0F111A] border-slate-900/80 text-slate-100 ${cardHoverBorder} shadow-lg shadow-black/20 focus-visible:ring-indigo-500/40`
                          : `bg-slate-50 border-slate-100 text-slate-850 ${cardHoverBorder} shadow-sm focus-visible:ring-blue-500/40`
                    } group`}
                  >
                    <div>
                      {/* Badge line */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {s.category}
                        </span>
                        
                        <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isHighContrast
                            ? "border border-zinc-700 text-zinc-400"
                            : relatedFilter === "complexity"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400"
                              : isExplicit
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                        }`}>
                          {matchLabel}
                        </span>
                      </div>

                      {/* Header Title with Icon */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <CatIcon size={18} className={`shrink-0 mt-0.5 ${iconColor}`} />
                        <h4 className="font-bold text-base tracking-tight group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">
                          {s.title}
                        </h4>
                      </div>

                      {/* Tagline */}
                      <p className="text-xs text-slate-500 dark:text-slate-400/90 leading-relaxed line-clamp-3">
                        {s.tagline}
                      </p>
                    </div>

                    {/* Bottom call to action */}
                    <div className={`flex items-center gap-1.5 mt-5 text-xs font-semibold ${
                      isHighContrast
                        ? "text-yellow-300"
                        : theme === "dark"
                          ? "text-indigo-400 group-hover:text-indigo-300"
                          : "text-blue-600 group-hover:text-blue-700"
                    }`}>
                      <span>Explore Pattern</span>
                      <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </section>
    </article>
  );
}
