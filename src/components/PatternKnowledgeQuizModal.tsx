import { useState, useEffect } from "react";
import { X, Award, CheckCircle2, XCircle, RotateCcw, HelpCircle, ArrowRight, Sliders, Play, Trophy, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { DesignPattern, ThemeMode, QuizQuestion } from "../types";
import { patternQuizzes } from "../data/quizzes";
import { saveQuizAttempt, getQuizAttempts, QuizAttempt, clearQuizAttempts } from "../utils/browserDb";

interface PatternKnowledgeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  allPatterns: DesignPattern[];
}

interface QuizSessionQuestion {
  question: QuizQuestion;
  patternId: string;
  patternTitle: string;
  category: "creational" | "structural" | "behavioral";
}

export default function PatternKnowledgeQuizModal({
  isOpen,
  onClose,
  theme,
  allPatterns
}: PatternKnowledgeQuizModalProps) {
  // Navigation & Config States
  const [step, setStep] = useState<"config" | "quiz" | "summary">("config");
  const [quizSize, setQuizSize] = useState<number>(5);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "creational" | "structural" | "behavioral">("all");
  const [selectedPatternId, setSelectedPatternId] = useState<string>("all");

  // Quiz Session States
  const [questionsPool, setQuestionsPool] = useState<QuizSessionQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [sessionAnswers, setSessionAnswers] = useState<Array<{
    question: QuizSessionQuestion;
    selectedIdx: number;
    isCorrect: boolean;
  }>>([]);

  // Stats / History States
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [expandedSummaryIdx, setExpandedSummaryIdx] = useState<number | null>(null);

  const isHighContrast = theme === "high-contrast";

  // Load history on open or when step transitions to config
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, step]);

  const loadHistory = async () => {
    try {
      const list = await getQuizAttempts();
      // Filter for global/general quizzes (patternId === "global_quiz" or similar, or just all attempts)
      setHistory(list);
    } catch (e) {
      console.error("Failed to load quiz history:", e);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your entire quiz attempt history?")) {
      try {
        await clearQuizAttempts();
        setHistory([]);
      } catch (e) {
        console.error("Failed to clear quiz history:", e);
      }
    }
  };

  if (!isOpen) return null;

  // Initialize and Shuffle Quiz Session
  const handleStartQuiz = () => {
    // 1. Accumulate all available quiz questions from quizzes data
    let pool: QuizSessionQuestion[] = [];
    
    Object.entries(patternQuizzes).forEach(([patternId, quiz]) => {
      const pattern = allPatterns.find(p => p.id === patternId);
      if (!pattern) return;

      // Filter by category if selected
      if (categoryFilter !== "all" && pattern.category !== categoryFilter) return;

      // Filter by specific pattern if selected
      if (selectedPatternId !== "all" && patternId !== selectedPatternId) return;

      quiz.questions.forEach(q => {
        pool.push({
          question: q,
          patternId,
          patternTitle: pattern.title,
          category: pattern.category
        });
      });
    });

    if (pool.length === 0) {
      alert("No questions found matching your filter criteria.");
      return;
    }

    // 2. Shuffle the pooled questions
    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    // 3. Slice to desired quiz size
    const finalSessionPool = shuffled.slice(0, Math.min(quizSize, shuffled.length));

    // 4. Set states to begin quiz
    setQuestionsPool(finalSessionPool);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setSessionAnswers([]);
    setStep("quiz");
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIdx === null || isAnswered) return;

    const current = questionsPool[currentQuestionIdx];
    const isCorrect = selectedOptionIdx === current.question.correctAnswerIndex;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    setSessionAnswers(prev => [
      ...prev,
      {
        question: current,
        selectedIdx: selectedOptionIdx,
        isCorrect
      }
    ]);

    setIsAnswered(true);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIdx < questionsPool.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswered(false);
    } else {
      // Quiz completed - Save general quiz result to IndexedDB
      try {
        await saveQuizAttempt({
          patternId: "global_quiz",
          patternTitle: `Knowledge Quiz (${categoryFilter === "all" ? "All Patterns" : categoryFilter.toUpperCase()})`,
          score: correctCount,
          totalQuestions: questionsPool.length,
          completedAt: Date.now()
        });
      } catch (e) {
        console.error("Failed to save global quiz attempt:", e);
      }
      setStep("summary");
    }
  };

  const handleQuitQuiz = () => {
    if (window.confirm("Are you sure you want to exit the quiz? Your current progress will be lost.")) {
      setStep("config");
    }
  };

  const getScoreRating = (percent: number) => {
    if (percent === 100) return { title: "GoF Grandmaster!", subtitle: "Incredible! A perfect score. You have mastered Gang of Four design patterns.", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (percent >= 80) return { title: "Software Architect", subtitle: "Superb job! You clearly understand pattern structures and tradeoffs.", color: "text-indigo-500", bg: "bg-indigo-500/10" };
    if (percent >= 60) return { title: "Competent Engineer", subtitle: "Good grasp of the basics. Keep practicing to reach mastery.", color: "text-blue-500", bg: "bg-blue-500/10" };
    return { title: "Aspiring Learner", subtitle: "A nice try! Re-read the patterns reference articles and try again.", color: "text-amber-500", bg: "bg-amber-500/10" };
  };

  const percentScore = questionsPool.length > 0 ? Math.round((correctCount / questionsPool.length) * 100) : 0;
  const rating = getScoreRating(percentScore);

  // Stats calculation for the general config overview
  const totalCompleted = history.length;
  const averageScore = totalCompleted > 0 
    ? Math.round((history.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / totalCompleted) * 100)
    : 0;
  const perfectRuns = history.filter(h => h.score === h.totalQuestions).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={() => step === "config" ? onClose() : handleQuitQuiz()}
    >
      <div 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 transform scale-100 transition-all border my-8 ${
          isHighContrast
            ? "bg-black border-4 border-white text-white"
            : theme === "dark"
              ? "bg-[#0F111A] border-slate-900 text-slate-100"
              : "bg-white border-slate-200 text-slate-850"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-200 dark:border-slate-900">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg shrink-0 ${
              isHighContrast 
                ? "bg-white text-black" 
                : "bg-indigo-500/10 text-indigo-500"
            }`}>
              <Award size={20} />
            </div>
            <h2 id="quiz-modal-title" className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {step === "config" && "Design Pattern Knowledge Quiz"}
              {step === "quiz" && "Quiz Challenge"}
              {step === "summary" && "Challenge Results"}
            </h2>
          </div>
          <button
            onClick={() => step === "config" ? onClose() : handleQuitQuiz()}
            className={`p-1.5 rounded-lg transition-colors ${
              isHighContrast
                ? "border-2 border-white text-white hover:bg-white hover:text-black"
                : "hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
            aria-label="Close quiz modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: CONFIGURATION */}
        {step === "config" && (
          <div className="space-y-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Test your understanding of Gang of Four (GoF) creational, structural, and behavioral design patterns. 
              Configure your challenge options below to launch a randomized quiz session.
            </p>

            {/* Quick Stats Grid */}
            {totalCompleted > 0 && (
              <div className={`p-4 rounded-xl border ${
                isHighContrast
                  ? "border-white bg-black"
                  : "border-slate-100 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-950/20"
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} className="text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your IndexedDB Progress Stats</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center md:text-left">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase">Quizzes Done</span>
                    <span className={`text-lg font-extrabold ${isHighContrast ? "text-yellow-300" : "text-slate-900 dark:text-slate-100"}`}>
                      {totalCompleted}
                    </span>
                  </div>
                  <div className="text-center md:text-left">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase">Avg. Accuracy</span>
                    <span className={`text-lg font-extrabold ${isHighContrast ? "text-yellow-300" : "text-slate-900 dark:text-slate-100"}`}>
                      {averageScore}%
                    </span>
                  </div>
                  <div className="text-center md:text-left">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase">Perfect Runs</span>
                    <span className={`text-lg font-extrabold ${isHighContrast ? "text-yellow-300" : "text-slate-900 dark:text-slate-100"}`}>
                      {perfectRuns}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Config Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category Filter Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value as any);
                    setSelectedPatternId("all"); // Reset individual pattern selector
                  }}
                  className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none bg-transparent ${
                    isHighContrast
                      ? "border-white bg-black text-white"
                      : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-700 dark:text-slate-250 bg-slate-50 dark:bg-slate-900/60"
                  }`}
                >
                  <option value="all">All Categories (9 patterns)</option>
                  <option value="creational">Creational Patterns (3 patterns)</option>
                  <option value="structural">Structural Patterns (3 patterns)</option>
                  <option value="behavioral">Behavioral Patterns (3 patterns)</option>
                </select>
              </div>

              {/* Pattern Filter Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Specific Pattern
                </label>
                <select
                  value={selectedPatternId}
                  onChange={(e) => setSelectedPatternId(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm font-semibold outline-none bg-transparent ${
                    isHighContrast
                      ? "border-white bg-black text-white"
                      : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 text-slate-700 dark:text-slate-250 bg-slate-50 dark:bg-slate-900/60"
                  }`}
                >
                  <option value="all">Any Pattern in Category</option>
                  {allPatterns
                    .filter(p => categoryFilter === "all" || p.category === categoryFilter)
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))
                  }
                </select>
              </div>

              {/* Quiz Size Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 25].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setQuizSize(size)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        quizSize === size
                          ? isHighContrast
                            ? "bg-white border-white text-black"
                            : theme === "dark"
                              ? "bg-indigo-600 border-indigo-600 text-white shadow shadow-indigo-950/40"
                              : "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : isHighContrast
                            ? "border-white text-white hover:bg-zinc-900"
                            : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions / Utilities */}
              <div className="flex flex-col justify-end">
                {totalCompleted > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <span>{showHistory ? "Hide Attempt History" : "View Attempt History"}</span>
                      {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <span className="text-slate-300 dark:text-slate-800">|</span>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-xs font-bold text-rose-500/80 hover:text-rose-500 transition-colors"
                    >
                      Clear History
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* History List Dropdown */}
            {showHistory && history.length > 0 && (
              <div className={`p-4 rounded-xl border max-h-[180px] overflow-y-auto space-y-2 mt-4 ${
                isHighContrast
                  ? "border-white bg-black"
                  : "border-slate-250 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/40"
              }`}>
                {history.map((attempt, index) => {
                  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  const formattedDate = new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date(attempt.completedAt).toLocaleDateString();
                  return (
                    <div 
                      key={index} 
                      className={`flex justify-between items-center text-xs p-2.5 rounded-lg border ${
                        isHighContrast
                          ? "border-white"
                          : "border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {attempt.patternTitle}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {formattedDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          pct === 100
                            ? "bg-emerald-500/10 text-emerald-500"
                            : pct >= 60
                              ? "bg-indigo-500/10 text-indigo-500"
                              : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {attempt.score} / {attempt.totalQuestions} ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Start Button */}
            <div className="pt-4 border-t border-slate-150 dark:border-slate-900 flex justify-end">
              <button
                onClick={handleStartQuiz}
                className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  isHighContrast
                    ? "bg-white border-2 border-white text-black hover:bg-yellow-300 hover:border-yellow-300"
                    : theme === "dark"
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10"
                }`}
              >
                <Play size={16} />
                <span>Start Knowledge Challenge</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ACTIVE QUIZ IN PROGRESS */}
        {step === "quiz" && questionsPool.length > 0 && (
          <div>
            {/* Session Info Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full ${
                  isHighContrast
                    ? "border border-white text-white"
                    : questionsPool[currentQuestionIdx].category === "creational"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400"
                      : questionsPool[currentQuestionIdx].category === "structural"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                }`}>
                  {questionsPool[currentQuestionIdx].patternTitle}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  ({questionsPool[currentQuestionIdx].category.toUpperCase()})
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                Question {currentQuestionIdx + 1} of {questionsPool.length}
              </span>
            </div>

            {/* Interactive Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full transition-all duration-300 ease-out ${
                  isHighContrast
                    ? "bg-white"
                    : theme === "dark"
                      ? "bg-indigo-500"
                      : "bg-indigo-600"
                }`}
                style={{ width: `${((currentQuestionIdx) / questionsPool.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <h3 className={`text-lg md:text-xl font-extrabold leading-snug mb-6 ${
              isHighContrast ? "text-yellow-300" : "text-slate-900 dark:text-slate-100"
            }`}>
              {questionsPool[currentQuestionIdx].question.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {questionsPool[currentQuestionIdx].question.options.map((option, index) => {
                const isSelected = selectedOptionIdx === index;
                const isCorrect = questionsPool[currentQuestionIdx].question.correctAnswerIndex === index;
                
                let optionStyle = "";
                if (isHighContrast) {
                  if (isAnswered) {
                    if (isCorrect) optionStyle = "border-2 border-green-400 text-green-400 bg-black";
                    else if (isSelected) optionStyle = "border-2 border-red-400 text-red-400 bg-black";
                    else optionStyle = "border border-white/40 text-white/40 bg-black";
                  } else {
                    optionStyle = isSelected
                      ? "border-2 border-yellow-300 text-yellow-300 bg-black font-bold"
                      : "border border-white text-white bg-black hover:border-yellow-300";
                  }
                } else {
                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400";
                    } else if (isSelected) {
                      optionStyle = "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400";
                    } else {
                      optionStyle = "bg-slate-50/40 dark:bg-slate-900/10 border-slate-100 dark:border-slate-900 text-slate-400 dark:text-slate-600";
                    }
                  } else {
                    optionStyle = isSelected
                      ? theme === "dark"
                        ? "bg-indigo-500/15 border-indigo-500 text-indigo-300"
                        : "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : theme === "dark"
                        ? "bg-[#090b11] border-slate-800/85 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300"
                        : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-100/60 text-slate-700";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={isAnswered}
                    onClick={() => handleOptionSelect(index)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-150 flex items-start gap-3 ${optionStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAnswered && isCorrect
                        ? isHighContrast ? "bg-green-400 text-black" : "bg-emerald-500 text-white"
                        : isAnswered && isSelected
                          ? isHighContrast ? "bg-red-400 text-black" : "bg-rose-500 text-white"
                          : isSelected
                            ? isHighContrast ? "bg-yellow-300 text-black" : "bg-indigo-600 text-white"
                            : "bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 pt-0.5">{option}</span>
                    
                    {isAnswered && isCorrect && (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 self-center" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle size={18} className="text-rose-500 shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Controls footer */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                {!isAnswered ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Select an answer option to lock in your understanding of {questionsPool[currentQuestionIdx].patternTitle}.
                  </p>
                ) : (
                  <div className="space-y-1 max-w-lg">
                    <p className={`text-xs font-extrabold uppercase tracking-wider ${
                      selectedOptionIdx === questionsPool[currentQuestionIdx].question.correctAnswerIndex
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}>
                      {selectedOptionIdx === questionsPool[currentQuestionIdx].question.correctAnswerIndex ? "✓ Correct!" : "✗ Incorrect"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {questionsPool[currentQuestionIdx].question.explanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-3 justify-end">
                <button
                  onClick={handleQuitQuiz}
                  className="px-4 py-2 text-xs font-semibold hover:text-rose-500 transition-colors"
                >
                  Quit
                </button>
                {!isAnswered ? (
                  <button
                    disabled={selectedOptionIdx === null}
                    onClick={handleSubmitAnswer}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border ${
                      selectedOptionIdx === null
                        ? "opacity-50 cursor-not-allowed border-slate-250 dark:border-slate-800 text-slate-400 bg-slate-100 dark:bg-slate-900"
                        : isHighContrast
                          ? "bg-yellow-300 border-yellow-300 text-black hover:bg-white hover:border-white"
                          : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow shadow-indigo-600/10"
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border flex items-center gap-1.5 ${
                      isHighContrast
                        ? "bg-white border-white text-black hover:bg-yellow-300"
                        : "bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700 shadow shadow-slate-900/10"
                    }`}
                  >
                    <span>
                      {currentQuestionIdx < questionsPool.length - 1 ? "Next Question" : "View Results"}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SESSION COMPLETED / SUMMARY REPORT */}
        {step === "summary" && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                isHighContrast
                  ? "border-2 border-white text-yellow-300"
                  : percentScore >= 60
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
              }`}>
                <Award size={32} />
              </div>

              <h3 className={`text-2xl font-extrabold mb-1.5 ${isHighContrast ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                Challenge Completed!
              </h3>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                Great job testing your understanding of design pattern structures and concepts.
              </p>

              <div className="inline-block relative mb-4">
                <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ${
                  isHighContrast
                    ? "border-white text-yellow-300"
                    : percentScore === 100
                      ? "border-emerald-500/40 text-emerald-500"
                      : percentScore >= 60
                        ? "border-indigo-500/40 text-indigo-500"
                        : "border-amber-500/40 text-amber-500"
                }`}>
                  <span className="text-2xl font-extrabold">{correctCount} / {questionsPool.length}</span>
                  <span className="text-[10px] font-bold uppercase opacity-75">Correct</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl max-w-md mx-auto border ${isHighContrast ? "border-white" : "border-slate-100 dark:border-slate-900/60 bg-slate-50/50 dark:bg-slate-900/40"}`}>
                <h4 className={`text-sm font-extrabold ${rating.color}`}>{rating.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{rating.subtitle}</p>
              </div>
            </div>

            {/* Answer Review Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Detailed Review
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {sessionAnswers.map((answer, index) => {
                  const isExpanded = expandedSummaryIdx === index;
                  return (
                    <div 
                      key={index}
                      className={`border rounded-xl overflow-hidden transition-all duration-150 ${
                        isHighContrast
                          ? "border-white"
                          : "border-slate-150 dark:border-slate-900 bg-white dark:bg-[#0c0e17]/40"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedSummaryIdx(isExpanded ? null : index)}
                        className="w-full text-left p-3 flex items-center justify-between text-xs font-semibold gap-3 hover:bg-slate-50 dark:hover:bg-slate-950/20"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {answer.isCorrect ? (
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle size={16} className="text-rose-500 shrink-0" />
                          )}
                          <span className={`font-extrabold shrink-0 px-1.5 py-0.5 rounded text-[9px] ${
                            isHighContrast
                              ? "border border-zinc-700"
                              : answer.question.category === "creational"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400"
                                : answer.question.category === "structural"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          }`}>
                            {answer.question.patternTitle}
                          </span>
                          <p className="truncate text-slate-700 dark:text-slate-300">
                            {answer.question.question.question}
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className={`p-3.5 border-t text-xs space-y-2.5 font-medium leading-relaxed ${
                          isHighContrast
                            ? "border-white text-zinc-300 bg-black"
                            : "border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/10 text-slate-600 dark:text-slate-400"
                        }`}>
                          <div>
                            <p className="font-bold text-slate-550 mb-1">Question:</p>
                            <p className="text-slate-700 dark:text-slate-300">{answer.question.question.question}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <p className="font-bold text-slate-550 mb-1">Your Answer:</p>
                              <p className={`p-1.5 rounded border text-[11px] ${
                                answer.isCorrect
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                              }`}>
                                {answer.question.question.options[answer.selectedIdx]}
                              </p>
                            </div>
                            {!answer.isCorrect && (
                              <div>
                                <p className="font-bold text-slate-550 mb-1">Correct Answer:</p>
                                <p className="p-1.5 rounded border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px]">
                                  {answer.question.question.options[answer.question.question.correctAnswerIndex]}
                                </p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-550 mb-1">Explanation:</p>
                            <p className="text-slate-500 dark:text-slate-400 font-normal italic">
                              {answer.question.question.explanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complete Section Button */}
            <div className="pt-4 border-t border-slate-150 dark:border-slate-900 flex justify-end gap-3">
              <button
                onClick={() => setStep("config")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  isHighContrast
                    ? "bg-black border-white text-white hover:bg-zinc-900"
                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <RotateCcw size={14} />
                <span>Configure New Quiz</span>
              </button>
              <button
                onClick={() => onClose()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isHighContrast
                    ? "bg-white text-black font-extrabold hover:bg-yellow-300"
                    : theme === "dark"
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
