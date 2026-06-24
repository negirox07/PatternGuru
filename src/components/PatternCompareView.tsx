import { useState, useEffect } from "react";
import { DesignPattern, ThemeMode } from "../types";
import { 
  GitCompare, ArrowLeftRight, CheckCircle2, XCircle, 
  Sparkles, BookOpen, Code2, AlertTriangle, ChevronDown, 
  BookOpenCheck, ShieldCheck, Milestone, Lightbulb
} from "lucide-react";
import SyntaxHighlighter from "./SyntaxHighlighter";

interface PatternCompareViewProps {
  activePatternId: string;
  allPatterns: DesignPattern[];
  theme: ThemeMode;
  globalLanguage: string;
  setGlobalLanguage: (lang: string) => void;
  onNavigate: (patternId: string) => void;
}

export default function PatternCompareView({
  activePatternId,
  allPatterns,
  theme,
  globalLanguage,
  setGlobalLanguage,
  onNavigate
}: PatternCompareViewProps) {
  const isHighContrast = theme === "high-contrast";

  // State for the selected patterns to compare
  const [leftId, setLeftId] = useState<string>(activePatternId);
  const [rightId, setRightId] = useState<string>("");

  // Auto-set left ID if active pattern changes externally
  useEffect(() => {
    if (activePatternId) {
      setLeftId(activePatternId);
    }
  }, [activePatternId]);

  // Smart Right preselection: find a related pattern, or the next pattern
  useEffect(() => {
    const leftPattern = allPatterns.find((p) => p.id === leftId);
    if (!leftPattern) return;

    // Check if there are related patterns and pick one that is different from leftId
    const related = leftPattern.relatedPatterns?.find((id) => id !== leftId && allPatterns.some((p) => p.id === id));
    
    if (related) {
      setRightId(related);
    } else {
      // Find the next pattern in the list or the first pattern that is not leftId
      const nextPat = allPatterns.find((p) => p.id !== leftId);
      if (nextPat) {
        setRightId(nextPat.id);
      }
    }
  }, [leftId, allPatterns]);

  const leftPattern = allPatterns.find((p) => p.id === leftId) || allPatterns[0];
  const rightPattern = allPatterns.find((p) => p.id === rightId) || allPatterns[1] || allPatterns[0];

  // Helper to group patterns by category
  const groupedPatterns = {
    creational: allPatterns.filter((p) => p.category === "creational"),
    structural: allPatterns.filter((p) => p.category === "structural"),
    behavioral: allPatterns.filter((p) => p.category === "behavioral")
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "typescript": return "TypeScript";
      case "python": return "Python";
      case "java": return "Java";
      case "cpp": return "C++";
      default: return lang;
    }
  };

  // Safe fetch of snippet in active language or fallback
  const getPatternSnippet = (pattern: DesignPattern, lang: string) => {
    if (!pattern) return null;
    const match = pattern.snippets.find((s) => s.language === lang);
    return match || pattern.snippets[0] || null;
  };

  const leftSnippet = getPatternSnippet(leftPattern, globalLanguage);
  const rightSnippet = getPatternSnippet(rightPattern, globalLanguage);

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Selector bar */}
      <section className={`p-4 md:p-6 rounded-2xl border transition-all ${
        isHighContrast
          ? "bg-black border-2 border-white"
          : theme === "dark"
            ? "bg-[#0F111A] border-slate-900/80 shadow-lg shadow-black/25"
            : "bg-slate-50 border-slate-100"
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className={`p-2 rounded-xl ${
              isHighContrast
                ? "bg-white text-black"
                : "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20"
            }`}>
              <GitCompare size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg md:text-xl tracking-tight">Compare Design Patterns</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyze and compare architectural concepts and implementation models side-by-side.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Left Pattern dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <label htmlFor="compare-left" className="sr-only">Compare left pattern</label>
              <select
                id="compare-left"
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
                className={`w-full sm:w-56 appearance-none pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer ${
                  isHighContrast
                    ? "bg-black border-white text-white focus:border-yellow-300"
                    : theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-indigo-500"
                      : "bg-white border-slate-200 text-slate-800 shadow-sm focus:border-indigo-400"
                }`}
              >
                <optgroup label="Creational Patterns" className="font-semibold bg-white dark:bg-[#0c0e17]">
                  {groupedPatterns.creational.map((p) => (
                    <option key={`left-${p.id}`} value={p.id}>{p.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Structural Patterns" className="font-semibold bg-white dark:bg-[#0c0e17]">
                  {groupedPatterns.structural.map((p) => (
                    <option key={`left-${p.id}`} value={p.id}>{p.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Behavioral Patterns" className="font-semibold bg-white dark:bg-[#0c0e17]">
                  {groupedPatterns.behavioral.map((p) => (
                    <option key={`left-${p.id}`} value={p.id}>{p.title}</option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center justify-center">
              <ArrowLeftRight size={16} className="text-slate-400 dark:text-slate-650" />
            </div>

            {/* Right Pattern dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <label htmlFor="compare-right" className="sr-only">Compare right pattern</label>
              <select
                id="compare-right"
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
                className={`w-full sm:w-56 appearance-none pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer ${
                  isHighContrast
                    ? "bg-black border-white text-white focus:border-yellow-300"
                    : theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-indigo-500"
                      : "bg-white border-slate-200 text-slate-800 shadow-sm focus:border-indigo-400"
                }`}
              >
                <optgroup label="Creational Patterns" className="font-semibold bg-white dark:bg-[#0c0e17]">
                  {groupedPatterns.creational.map((p) => (
                    <option key={`right-${p.id}`} value={p.id} disabled={p.id === leftId}>{p.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Structural Patterns" className="font-semibold bg-white dark:bg-[#0c0e17]">
                  {groupedPatterns.structural.map((p) => (
                    <option key={`right-${p.id}`} value={p.id} disabled={p.id === leftId}>{p.title}</option>
                  ))}
                </optgroup>
                <optgroup label="Behavioral Patterns" className="font-semibold bg-white dark:bg-[#0c0e17]">
                  {groupedPatterns.behavioral.map((p) => (
                    <option key={`right-${p.id}`} value={p.id} disabled={p.id === leftId}>{p.title}</option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN - Pattern A */}
        <div className="space-y-6">
          {/* Header Card */}
          <div className={`p-6 rounded-2xl border ${
            isHighContrast
              ? "bg-black border-2 border-white"
              : theme === "dark"
                ? "bg-[#0F111A] border-slate-900/80 shadow-md"
                : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isHighContrast
                  ? "bg-white text-black"
                  : leftPattern.category === "creational"
                    ? "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20"
                    : leftPattern.category === "structural"
                      ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                      : "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20"
              }`}>
                {leftPattern.category}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isHighContrast
                  ? "border border-white text-white"
                  : leftPattern.difficulty === "Beginner"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : leftPattern.difficulty === "Intermediate"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-rose-500/10 text-rose-500"
              }`}>
                {leftPattern.difficulty}
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-2">
              <span className="text-indigo-500 dark:text-indigo-400">A.</span>
              <span>{leftPattern.title}</span>
            </h3>
            {leftPattern.tags && leftPattern.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {leftPattern.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      isHighContrast
                        ? "border-white bg-black text-white"
                        : theme === "dark"
                          ? "bg-indigo-950/25 text-indigo-300 border-indigo-900/30"
                          : "bg-indigo-50/50 text-indigo-750 border-indigo-100"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
              "{leftPattern.tagline}"
            </p>
          </div>

          {/* Quick Stats side comparison block */}
          <div className="space-y-4">
            {/* Intent Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Sparkles size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
                <span>Intent</span>
              </h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                {leftPattern.intent}
              </p>
            </div>

            {/* Problem Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Milestone size={14} className={isHighContrast ? "text-yellow-300" : "text-rose-500"} />
                <span>Problem Solved</span>
              </h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {leftPattern.problem}
              </p>
            </div>

            {/* Analogy Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Lightbulb size={14} className={isHighContrast ? "text-yellow-300" : "text-amber-500"} />
                <span>Real-World Analogy</span>
              </h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                {leftPattern.analogy}
              </p>
            </div>

            {/* Diagram Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <BookOpenCheck size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
                <span>UML Structural Diagram</span>
              </h4>
              <pre className={`p-4 rounded-xl font-mono text-[10px] md:text-xs overflow-x-auto leading-relaxed border ${
                isHighContrast
                  ? "bg-black border-white text-white"
                  : theme === "dark"
                    ? "bg-[#06080E] border-slate-900/60 text-slate-300"
                    : "bg-white border-slate-200 text-slate-700"
              }`}>
                {leftPattern.diagram}
              </pre>
            </div>

            {/* Pros & Cons side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pros */}
              <div className={`p-5 rounded-2xl border ${
                isHighContrast
                  ? "bg-black border-2 border-white"
                  : theme === "dark"
                    ? "bg-[#0F111A] border-slate-900/80"
                    : "bg-emerald-50/10 border-slate-100"
              }`}>
                <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Pros</span>
                </h5>
                <ul className="space-y-2">
                  {leftPattern.pros.map((pro, index) => (
                    <li key={`left-pro-${index}`} className="text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className={`p-5 rounded-2xl border ${
                isHighContrast
                  ? "bg-black border-2 border-white"
                  : theme === "dark"
                    ? "bg-[#0F111A] border-slate-900/80"
                    : "bg-rose-50/10 border-slate-100"
              }`}>
                <h5 className="font-bold text-xs uppercase tracking-wider text-rose-500 dark:text-rose-450 mb-3 flex items-center gap-1.5">
                  <XCircle size={14} />
                  <span>Cons</span>
                </h5>
                <ul className="space-y-2">
                  {leftPattern.cons.map((con, index) => (
                    <li key={`left-con-${index}`} className="text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-rose-500 mt-0.5 shrink-0">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Code Snippet Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <Code2 size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
                  <span>Code Implementation</span>
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isHighContrast
                    ? "bg-white text-black"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {getLanguageLabel(globalLanguage)}
                </span>
              </div>
              
              {leftSnippet ? (
                <div className={`rounded-xl border overflow-hidden ${
                  isHighContrast
                    ? "bg-black border-white"
                    : theme === "dark"
                      ? "bg-[#06080E] border-slate-900/80"
                      : "bg-white border-slate-200/80"
                }`}>
                  <SyntaxHighlighter 
                    code={leftSnippet.code} 
                    language={leftSnippet.language} 
                    theme={theme} 
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  No snippet available for {getLanguageLabel(globalLanguage)}.
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate(leftPattern.id)}
                className={`text-xs font-bold underline px-3 py-1.5 rounded transition-all ${
                  isHighContrast
                    ? "text-yellow-300 hover:text-white"
                    : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                }`}
              >
                Go to Full {leftPattern.title} Guide →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Pattern B */}
        <div className="space-y-6">
          {/* Header Card */}
          <div className={`p-6 rounded-2xl border ${
            isHighContrast
              ? "bg-black border-2 border-white"
              : theme === "dark"
                ? "bg-[#0F111A] border-slate-900/80 shadow-md"
                : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isHighContrast
                  ? "bg-white text-black"
                  : rightPattern.category === "creational"
                    ? "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20"
                    : rightPattern.category === "structural"
                      ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                      : "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20"
              }`}>
                {rightPattern.category}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isHighContrast
                  ? "border border-white text-white"
                  : rightPattern.difficulty === "Beginner"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : rightPattern.difficulty === "Intermediate"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-rose-500/10 text-rose-500"
              }`}>
                {rightPattern.difficulty}
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2 flex items-center gap-2">
              <span className="text-indigo-500 dark:text-indigo-400">B.</span>
              <span>{rightPattern.title}</span>
            </h3>
            {rightPattern.tags && rightPattern.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {rightPattern.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      isHighContrast
                        ? "border-white bg-black text-white"
                        : theme === "dark"
                          ? "bg-indigo-950/25 text-indigo-300 border-indigo-900/30"
                          : "bg-indigo-50/50 text-indigo-750 border-indigo-100"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
              "{rightPattern.tagline}"
            </p>
          </div>

          {/* Quick Stats side comparison block */}
          <div className="space-y-4">
            {/* Intent Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Sparkles size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
                <span>Intent</span>
              </h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                {rightPattern.intent}
              </p>
            </div>

            {/* Problem Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Milestone size={14} className={isHighContrast ? "text-yellow-300" : "text-rose-500"} />
                <span>Problem Solved</span>
              </h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {rightPattern.problem}
              </p>
            </div>

            {/* Analogy Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <Lightbulb size={14} className={isHighContrast ? "text-yellow-300" : "text-amber-500"} />
                <span>Real-World Analogy</span>
              </h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                {rightPattern.analogy}
              </p>
            </div>

            {/* Diagram Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <BookOpenCheck size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
                <span>UML Structural Diagram</span>
              </h4>
              <pre className={`p-4 rounded-xl font-mono text-[10px] md:text-xs overflow-x-auto leading-relaxed border ${
                isHighContrast
                  ? "bg-black border-white text-white"
                  : theme === "dark"
                    ? "bg-[#06080E] border-slate-900/60 text-slate-300"
                    : "bg-white border-slate-200 text-slate-700"
              }`}>
                {rightPattern.diagram}
              </pre>
            </div>

            {/* Pros & Cons side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pros */}
              <div className={`p-5 rounded-2xl border ${
                isHighContrast
                  ? "bg-black border-2 border-white"
                  : theme === "dark"
                    ? "bg-[#0F111A] border-slate-900/80"
                    : "bg-emerald-50/10 border-slate-100"
              }`}>
                <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Pros</span>
                </h5>
                <ul className="space-y-2">
                  {rightPattern.pros.map((pro, index) => (
                    <li key={`right-pro-${index}`} className="text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className={`p-5 rounded-2xl border ${
                isHighContrast
                  ? "bg-black border-2 border-white"
                  : theme === "dark"
                    ? "bg-[#0F111A] border-slate-900/80"
                    : "bg-rose-50/10 border-slate-100"
              }`}>
                <h5 className="font-bold text-xs uppercase tracking-wider text-rose-500 dark:text-rose-450 mb-3 flex items-center gap-1.5">
                  <XCircle size={14} />
                  <span>Cons</span>
                </h5>
                <ul className="space-y-2">
                  {rightPattern.cons.map((con, index) => (
                    <li key={`right-con-${index}`} className="text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-rose-500 mt-0.5 shrink-0">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Code Snippet Card */}
            <div className={`p-6 rounded-2xl border ${
              isHighContrast
                ? "bg-black border-2 border-white"
                : theme === "dark"
                  ? "bg-[#0F111A] border-slate-900/80"
                  : "bg-slate-50/60 border-slate-100"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <Code2 size={14} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
                  <span>Code Implementation</span>
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isHighContrast
                    ? "bg-white text-black"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {getLanguageLabel(globalLanguage)}
                </span>
              </div>
              
              {rightSnippet ? (
                <div className={`rounded-xl border overflow-hidden ${
                  isHighContrast
                    ? "bg-black border-white"
                    : theme === "dark"
                      ? "bg-[#06080E] border-slate-900/80"
                      : "bg-white border-slate-200/80"
                }`}>
                  <SyntaxHighlighter 
                    code={rightSnippet.code} 
                    language={rightSnippet.language} 
                    theme={theme} 
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  No snippet available for {getLanguageLabel(globalLanguage)}.
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate(rightPattern.id)}
                className={`text-xs font-bold underline px-3 py-1.5 rounded transition-all ${
                  isHighContrast
                    ? "text-yellow-300 hover:text-white"
                    : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                }`}
              >
                Go to Full {rightPattern.title} Guide →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
