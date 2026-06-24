import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Search, CornerDownLeft, Sparkles, X } from "lucide-react";
import { DesignPattern, ThemeMode } from "../types";

interface SearchBarProps {
  patterns: DesignPattern[];
  onSelectPattern: (patternId: string) => void;
  theme: ThemeMode;
}

export default function SearchBar({ patterns, onSelectPattern, theme }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DesignPattern[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl/Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update search results on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = patterns.filter((pattern) => {
      return (
        pattern.title.toLowerCase().includes(lowerQuery) ||
        pattern.tagline.toLowerCase().includes(lowerQuery) ||
        pattern.intent.toLowerCase().includes(lowerQuery) ||
        pattern.category.toLowerCase().includes(lowerQuery) ||
        pattern.problem.toLowerCase().includes(lowerQuery) ||
        pattern.solution.toLowerCase().includes(lowerQuery)
      );
    });

    setResults(filtered);
    setFocusedIndex(-1);
  }, [query, patterns]);

  const handleSelect = (patternId: string) => {
    onSelectPattern(patternId);
    setQuery("");
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        handleSelect(results[focusedIndex].id);
      } else if (results.length > 0) {
        handleSelect(results[0].id);
      }
    }
  };

  const isHighContrast = theme === "high-contrast";

  return (
    <div className="relative w-full max-w-lg font-sans">
      {/* Search Input Container */}
      <div 
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all duration-200 ${
          isHighContrast
            ? "bg-black border-2 border-white focus-within:border-yellow-300"
            : theme === "dark"
              ? "bg-[#0F111A] border-slate-900 text-slate-100 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
              : "bg-slate-50 border-slate-200 text-slate-800 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10"
        }`}
      >
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search patterns, keywords, categories... (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
          aria-label="Search design patterns"
          aria-expanded={isOpen && results.length > 0}
          aria-autocomplete="list"
        />
        
        {query ? (
          <button 
            onClick={() => { setQuery(""); setResults([]); }}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="Clear search query"
          >
            <X size={14} className="text-slate-400" />
          </button>
        ) : (
          <kbd className={`hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded font-semibold border ${
            isHighContrast 
              ? "bg-black text-white border-white" 
              : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
          }`}>
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div 
          ref={resultsRef}
          className={`absolute left-0 right-0 top-full mt-2 z-40 rounded-xl shadow-2xl border max-h-80 overflow-y-auto transition-all ${
            isHighContrast
              ? "bg-black border-2 border-white text-white"
              : theme === "dark"
                ? "bg-[#090D16] border-slate-900 text-slate-100 shadow-indigo-950/20"
                : "bg-white border-slate-100 text-slate-800"
          }`}
        >
          {results.length > 0 ? (
            <div className="p-2 flex flex-col gap-1">
              <span className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Found {results.length} patterns
              </span>
              {results.map((pattern, index) => {
                const isFocused = index === focusedIndex;
                const categoryColor =
                  pattern.category === "creational"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                    : pattern.category === "structural"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

                return (
                  <button
                    key={pattern.id}
                    onClick={() => handleSelect(pattern.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all group ${
                      isFocused
                        ? isHighContrast
                          ? "bg-yellow-300 text-black border-2 border-white"
                          : "bg-blue-50 dark:bg-[#121824]"
                        : isHighContrast
                          ? "hover:bg-zinc-900"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{pattern.title}</span>
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${categoryColor}`}>
                          {pattern.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                        {pattern.tagline}
                      </span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                      <CornerDownLeft size={14} className="text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 flex flex-col items-center gap-1.5">
              <Sparkles size={20} className="text-slate-500" />
              <p className="text-sm font-medium">No results matched your query.</p>
              <p className="text-xs text-slate-500">Try searching for other words or names.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
