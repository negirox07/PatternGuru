import { useState, useEffect } from "react";
import { Layers, Box, HelpCircle, Laptop, Landmark, ShieldCheck, HelpCircle as HelpIcon, CheckSquare, Settings, Bookmark, Clock, Award } from "lucide-react";
import { DesignPattern, ThemeMode } from "../types";
import AdSenseUnit from "./AdSenseUnit";
import { AD_SLOTS } from "../adsConfig";
import { getAverageRating } from "../utils/ratings";

interface SidebarProps {
  patterns: DesignPattern[];
  activeId: string;
  onSelect: (patternId: string) => void;
  isOpen: boolean; // Mobile toggle state
  onClose: () => void; // Close mobile drawer
  theme: ThemeMode;
  onOpenHelp: () => void;
  onOpenQuiz: () => void;
  favoriteIds: string[];
  userRatings: Record<string, number>;
}

export default function Sidebar({
  patterns,
  activeId,
  onSelect,
  isOpen,
  onClose,
  theme,
  onOpenHelp,
  onOpenQuiz,
  favoriteIds,
  userRatings
}: SidebarProps) {
  const isHighContrast = theme === "high-contrast";

  const favoritePatterns = patterns.filter((p) => favoriteIds.includes(p.id));

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!activeId) return;
    try {
      const saved = localStorage.getItem("design-patterns-recently-viewed");
      let list: string[] = saved ? JSON.parse(saved) : [];
      
      // Filter out activeId if already there, then insert at the beginning
      list = list.filter((id) => id !== activeId);
      list.unshift(activeId);
      
      // Limit to 5 items
      list = list.slice(0, 5);
      
      localStorage.setItem("design-patterns-recently-viewed", JSON.stringify(list));
      setRecentlyViewedIds(list);
    } catch (e) {
      console.error("Failed to update recently viewed:", e);
    }
  }, [activeId]);

  const recentlyViewedPatterns = recentlyViewedIds
    .map((id) => patterns.find((p) => p.id === id))
    .filter((p): p is DesignPattern => p !== undefined);

  // Group patterns by category
  const categories = {
    creational: {
      name: "Creational Patterns",
      desc: "Object creation mechanisms",
      icon: Box,
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      items: patterns.filter((p) => p.category === "creational")
    },
    structural: {
      name: "Structural Patterns",
      desc: "Assembling classes & objects",
      icon: Layers,
      color: "text-blue-500 dark:text-indigo-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      items: patterns.filter((p) => p.category === "structural")
    },
    behavioral: {
      name: "Behavioral Patterns",
      desc: "Algorithms & communication",
      icon: Landmark,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      items: patterns.filter((p) => p.category === "behavioral")
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full font-sans select-none">
      {/* Brand Header */}
      <div className={`p-6 border-b flex flex-col gap-1.5 ${
        isHighContrast 
          ? "border-white" 
          : "border-slate-100 dark:border-slate-900"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shadow-md ${
            isHighContrast 
              ? "bg-white text-black" 
              : theme === "dark"
                ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-indigo-900/30"
                : "bg-blue-600 text-white"
          }`}>
            <ShieldCheck size={20} className="animate-pulse" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            PatternGuru
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400/80">
          Gang of Four (GoF) Interactive Guide
        </p>
      </div>

      {/* Categories Navigation */}
      <nav 
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-6"
        aria-label="Design Pattern Categories"
      >
        {/* Favorites / Bookmarks Section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <div className="flex items-center gap-2">
              <Bookmark size={16} className={isHighContrast ? "text-white" : "text-rose-500 dark:text-rose-450"} />
              <span className="font-bold text-[10px] uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Bookmarks
              </span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isHighContrast
                ? "bg-white text-black"
                : theme === "dark"
                  ? "bg-slate-900 text-slate-400 border border-slate-800"
                  : "bg-slate-100 text-slate-500"
            }`}>
              {favoritePatterns.length}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {favoritePatterns.length > 0 ? (
              favoritePatterns.map((item) => {
                const isActive = item.id === activeId;
                const ratingInfo = getAverageRating(item.id, userRatings[item.id]);
                return (
                  <button
                    key={`fav-${item.id}`}
                    onClick={() => {
                      onSelect(item.id);
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-between group ${
                      isActive
                        ? isHighContrast
                          ? "bg-yellow-300 text-black font-extrabold border-2 border-white"
                          : theme === "dark"
                            ? "bg-gradient-to-r from-rose-600 to-indigo-650 text-white shadow-lg shadow-rose-950/40 border border-rose-500/30"
                            : "bg-rose-600 text-white shadow-sm shadow-rose-200"
                        : isHighContrast
                          ? "hover:bg-zinc-900 hover:text-yellow-300"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="truncate mr-1">{item.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                        isActive
                          ? isHighContrast ? "text-black" : "text-rose-100"
                          : "text-amber-500 dark:text-amber-450"
                      }`}>
                        ★ {ratingInfo.average}
                      </span>
                      {!isActive && (
                        <span className={`w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                          isHighContrast ? "bg-yellow-300" : "bg-rose-500"
                        }`} />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={`p-3 rounded-xl border text-center ${
                isHighContrast
                  ? "border-dashed border-white text-zinc-400"
                  : "border-dashed border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500"
              }`}>
                <p className="text-[11px] leading-normal font-medium">
                  Pin patterns using the bookmark button in any article.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <div className="flex items-center gap-2">
              <Clock size={16} className={isHighContrast ? "text-white" : "text-indigo-500 dark:text-indigo-400"} />
              <span className="font-bold text-[10px] uppercase tracking-wider text-slate-450 dark:text-slate-500">
                Recently Viewed
              </span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isHighContrast
                ? "bg-white text-black"
                : theme === "dark"
                  ? "bg-slate-900 text-slate-400 border border-slate-800"
                  : "bg-slate-100 text-slate-500"
            }`}>
              {recentlyViewedPatterns.length}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {recentlyViewedPatterns.length > 0 ? (
              recentlyViewedPatterns.map((item) => {
                const isActive = item.id === activeId;
                const ratingInfo = getAverageRating(item.id, userRatings[item.id]);
                return (
                  <button
                    key={`recent-${item.id}`}
                    onClick={() => {
                      onSelect(item.id);
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-between group ${
                      isActive
                        ? isHighContrast
                          ? "bg-yellow-300 text-black font-extrabold border-2 border-white"
                          : theme === "dark"
                            ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg shadow-indigo-950/40 border border-indigo-500/30"
                            : "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                        : isHighContrast
                          ? "hover:bg-zinc-900 hover:text-yellow-300"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="truncate mr-1">{item.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                        isActive
                          ? isHighContrast ? "text-black" : "text-indigo-100"
                          : "text-amber-500 dark:text-amber-450"
                      }`}>
                        ★ {ratingInfo.average}
                      </span>
                      {!isActive && (
                        <span className={`w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                          isHighContrast ? "bg-yellow-300" : "bg-indigo-500"
                        }`} />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={`p-3 rounded-xl border text-center ${
                isHighContrast
                  ? "border-dashed border-white text-zinc-400"
                  : "border-dashed border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500"
              }`}>
                <p className="text-[11px] leading-normal font-medium">
                  Your navigation history will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {Object.entries(categories).map(([key, cat]) => {
          const Icon = cat.icon;
          return (
            <div key={key} className="flex flex-col gap-1.5">
              {/* Category Header */}
              <div className="flex items-center justify-between px-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={isHighContrast ? "text-white" : cat.color} />
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {cat.name}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isHighContrast
                    ? "bg-white text-black"
                    : theme === "dark"
                      ? "bg-slate-900 text-slate-400 border border-slate-800"
                      : "bg-slate-100 text-slate-500"
                }`}>
                  {cat.items.length}
                </span>
              </div>

              {/* Category Items */}
              <div className="flex flex-col gap-0.5">
                {cat.items.map((item) => {
                  const isActive = item.id === activeId;
                  const ratingInfo = getAverageRating(item.id, userRatings[item.id]);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelect(item.id);
                        onClose(); // Close mobile sidebar if open
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-between group ${
                        isActive
                          ? isHighContrast
                            ? "bg-yellow-300 text-black font-extrabold border-2 border-white"
                            : theme === "dark"
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950/40 border border-indigo-500/30"
                              : "bg-blue-600 text-white shadow-sm shadow-blue-200"
                          : isHighContrast
                            ? "hover:bg-zinc-900 hover:text-yellow-300"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/60"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="truncate mr-1">{item.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                          isActive
                            ? isHighContrast ? "text-black" : "text-indigo-100"
                            : "text-amber-500 dark:text-amber-450"
                        }`}>
                          ★ {ratingInfo.average}
                        </span>
                        {!isActive && (
                          <span className={`w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                            isHighContrast ? "bg-yellow-300" : "bg-indigo-500"
                          }`} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className={`p-4 border-t flex flex-col gap-2 ${
        isHighContrast 
          ? "border-white" 
          : "border-slate-100 dark:border-slate-900"
      }`}>
        <button
          id="tour-quiz-btn"
          onClick={() => {
            onOpenQuiz();
            onClose(); // Close mobile drawer if open
          }}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isHighContrast
              ? "bg-black border border-white text-white hover:bg-zinc-900"
              : theme === "dark"
                ? "text-indigo-400 hover:text-indigo-300 bg-indigo-950/20 hover:bg-indigo-950/45 border border-indigo-900/40"
                : "text-indigo-700 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-50/90 border border-indigo-100/50 shadow-sm"
          }`}
        >
          <Award size={16} className={isHighContrast ? "text-white" : "text-indigo-500"} />
          <span>Knowledge Quiz (Q)</span>
        </button>

        <button
          onClick={onOpenHelp}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isHighContrast
              ? "bg-black border border-white text-white hover:bg-zinc-900"
              : theme === "dark"
                ? "text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-900 border border-slate-900"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <HelpIcon size={16} className="text-slate-500 dark:text-slate-400" />
          <span>Keyboard Guide (?)</span>
        </button>

        {/* Sidebar Ad Unit */}
        {/* format="fluid" needs a data-ad-layout-key from AdSense to ever fill;
            a plain responsive unit is the right fit for a fixed-width sidebar. */}
        <AdSenseUnit
          slot={AD_SLOTS.sidebar}
          className="mt-4 my-2 px-1"
          style={{ display: "block" }}
          format="auto"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Panel */}
      <aside 
        id="tour-sidebar"
        className={`hidden md:block w-72 h-screen border-r shrink-0 transition-colors ${
          isHighContrast
            ? "bg-black border-white text-white"
            : theme === "dark"
              ? "bg-[#090D16] border-slate-900 text-slate-100"
              : "bg-white border-slate-100 text-slate-800"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Slider */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop overlay */}
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer body */}
          <div 
            className={`relative w-72 h-full shadow-2xl flex flex-col z-50 animate-slide-in ${
              isHighContrast
                ? "bg-black text-white border-r border-white"
                : theme === "dark"
                  ? "bg-[#090D16] text-slate-100 border-r border-slate-900"
                  : "bg-white text-slate-800"
            }`}
            role="navigation"
            aria-label="Mobile Navigation Drawer"
          >
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
