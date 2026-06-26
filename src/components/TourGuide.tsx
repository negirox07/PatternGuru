import { useState, useEffect, useRef, CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronLeft, X, Sparkles, Navigation2 } from "lucide-react";
import { ThemeMode } from "../types";

export interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface TourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export default function TourGuide({ isOpen, onClose, theme }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    {
      selector: "none",
      title: "Welcome to PatternGuru! 🎓✨",
      content: "Let's take a quick, 1-minute interactive tour to master Creational, Structural, and Behavioral software design patterns like a senior engineer.",
    },
    {
      selector: "#tour-sidebar",
      title: "Comprehensive Pattern Catalog",
      content: "Browse Gang of Four design patterns grouped by category. Keep track of your favorites, study history, and progress logs.",
      position: "right",
    },
    {
      selector: "#tour-search",
      title: "Instant Smart Search",
      content: "Press 'Ctrl + K' or click here to instantly filter and query patterns by name, category, or real-world problem intent.",
      position: "bottom",
    },
    {
      selector: "#tour-language",
      title: "Polyglot Language Engine",
      content: "Seamlessly cycle the global code display between TypeScript, Python, Java, C++, and C# with pristine modern implementations.",
      position: "bottom",
    },
    {
      selector: "#tour-compare",
      title: "Side-by-Side Code Compare",
      content: "Toggle comparison mode to inspect and evaluate multiple patterns simultaneously, matching structure and code structures.",
      position: "bottom",
    },
    {
      selector: "#tour-print",
      title: "Pristine PDF Documentation Export",
      content: "Instantly compile active design pattern guidelines into clean, high-fidelity PDF documentation. Action controls, navigation rails, sidebars, and ads are hidden cleanly from the output.",
      position: "bottom",
    },
    {
      selector: "#tour-notes",
      title: "Personal Scratchpad Notes",
      content: "Write down custom notes, thoughts, or project-specific implementations for each pattern. Your notes auto-save instantly to localStorage!",
      position: "top",
    },
    {
      selector: "#tour-voice",
      title: "Voice-Activated Assistant",
      content: "Enable 'Voice Controls' to navigate the app hands-free! Try saying commands like 'go to singleton', 'toggle theme', or 'open quiz'.",
      position: "top",
    },
    {
      selector: "#tour-quiz-btn",
      title: "Mastery Challenges & Quizzes",
      content: "Test your skills with randomized knowledge challenge quizzes to reinforce key terms, class diagrams, and GoF concepts.",
      position: "right",
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeStep = steps[currentStep];

  const updatePositions = () => {
    if (!isOpen || activeStep.selector === "none") {
      setCoords(null);
      return;
    }

    const element = document.querySelector(activeStep.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCoords(rect);
        return;
      }
    }
    setCoords(null);
  };

  // Re-calculate positions when step changes, window resizes, or page scrolls
  useEffect(() => {
    if (!isOpen) return;

    // Small timeout to allow state/layout rendering to settle
    const timer = setTimeout(() => {
      updatePositions();
    }, 150);

    window.addEventListener("resize", updatePositions);
    // Listen to capture scroll events anywhere in the app to reposition spotlight
    window.addEventListener("scroll", updatePositions, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [currentStep, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("design-patterns-tour-completed", "true");
    onClose();
  };

  const isHighContrast = theme === "high-contrast";

  // Calculate Popover Position Style
  const getPopoverStyle = (): CSSProperties => {
    if (!coords) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
      };
    }

    const pad = 16;
    const cardWidth = 320;
    const position = activeStep.position || "bottom";

    const style: CSSProperties = {
      position: "fixed",
      zIndex: 100,
      width: `${cardWidth}px`,
    };

    if (position === "bottom") {
      style.top = `${coords.bottom + pad}px`;
      style.left = `${Math.max(16, Math.min(window.innerWidth - cardWidth - 16, coords.left + (coords.width / 2) - (cardWidth / 2)))}px`;
    } else if (position === "top") {
      // Offset card height safely
      style.top = `${coords.top - pad - 210}px`;
      style.left = `${Math.max(16, Math.min(window.innerWidth - cardWidth - 16, coords.left + (coords.width / 2) - (cardWidth / 2)))}px`;
    } else if (position === "right") {
      style.left = `${coords.right + pad}px`;
      style.top = `${coords.top + (coords.height / 2) - 100}px`;
      // Check screen edge overflow
      if ((coords.right + pad + cardWidth) > window.innerWidth) {
        style.left = `${coords.left - cardWidth - pad}px`;
      }
    } else if (position === "left") {
      style.left = `${coords.left - cardWidth - pad}px`;
      style.top = `${coords.top + (coords.height / 2) - 100}px`;
      if (coords.left - cardWidth - pad < 16) {
        style.left = `${coords.right + pad}px`;
      }
    }

    // Secondary vertical bounds protection
    const topVal = parseFloat(style.top as string) || 0;
    if (topVal < 16) {
      style.top = "16px";
    } else if (topVal + 220 > window.innerHeight) {
      style.top = `${window.innerHeight - 240}px`;
    }

    return style;
  };

  // Spotlight Box shadow overlay layout
  const getSpotlightStyle = (): CSSProperties => {
    if (!coords) return { display: "none" };
    return {
      position: "fixed",
      top: `${coords.top - 6}px`,
      left: `${coords.left - 6}px`,
      width: `${coords.width + 12}px`,
      height: `${coords.height + 12}px`,
      borderRadius: "12px",
      boxShadow: "0 0 0 9999px rgba(8, 10, 18, 0.72)",
      pointerEvents: "none",
      zIndex: 90,
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none">
      {/* Dark/Transparent Backdrop behind popover (active when no spotlight) */}
      {!coords && (
        <div 
          className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-40" 
          onClick={handleComplete}
        />
      )}

      {/* Spotlight highlight cut-out frame */}
      {coords && (
        <div 
          style={getSpotlightStyle()} 
          className="border-2 border-indigo-500/85 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
        />
      )}

      {/* Popover Step Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={getPopoverStyle()}
          ref={stepsContainerRef}
          className={`p-5 rounded-2xl shadow-2xl border flex flex-col gap-4 ${
            isHighContrast
              ? "bg-black border-2 border-white text-white shadow-none"
              : "bg-[#0F111A] border-slate-800 text-slate-100"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-indigo-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-400">
                Tour Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={handleComplete}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Skip Tour Guide"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-base leading-snug tracking-tight mb-1">
              {activeStep.title}
            </h4>
            <p className="text-xs text-slate-350 dark:text-slate-400 leading-relaxed font-medium">
              {activeStep.content}
            </p>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3.5 mt-1">
            <button
              onClick={handleComplete}
              className="text-xs font-semibold text-slate-450 hover:text-slate-300 transition-colors"
            >
              Skip
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-800 hover:bg-slate-900 transition-all text-slate-300"
                >
                  <ChevronLeft size={13} />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-650/20"
              >
                <span>{currentStep === steps.length - 1 ? "Finish" : "Next"}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
