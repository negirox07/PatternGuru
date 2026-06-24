import { useState, useEffect } from "react";
import { PatternQuiz, QuizQuestion } from "../types";
import { 
  Award, CheckCircle2, XCircle, RotateCcw, 
  HelpCircle, ArrowRight, ThumbsUp, AlertCircle
} from "lucide-react";
import { saveQuizAttempt, getQuizAttempts, QuizAttempt } from "../utils/browserDb";

interface PatternQuizViewProps {
  quiz: PatternQuiz | undefined;
  theme: string;
  patternTitle: string;
}

export default function PatternQuizView({ quiz, theme, patternTitle }: PatternQuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [answersHistory, setAnswersHistory] = useState<Array<{ questionId: string; selectedIndex: number; isCorrect: boolean }>>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (!quiz?.patternId) return;
    getQuizAttempts()
      .then(list => {
        setAttempts(list.filter(a => a.patternId === quiz.patternId));
      })
      .catch(e => console.error("Failed to load quiz attempts:", e));
  }, [quiz?.patternId, quizCompleted]);

  const isHighContrast = theme === "high-contrast";

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className={`p-6 rounded-2xl border text-center ${
        isHighContrast
          ? "bg-black border-2 border-white text-white"
          : theme === "dark"
            ? "bg-slate-900/50 border-slate-800 text-slate-400"
            : "bg-slate-50 border-slate-100 text-slate-500"
      }`}>
        <AlertCircle className="mx-auto mb-2 text-slate-400" size={24} />
        <p className="text-sm font-medium">No quiz questions available for this design pattern yet.</p>
      </div>
    );
  }

  const currentQuestion: QuizQuestion = quiz.questions[currentQuestionIndex];

  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOptionIndex(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || isAnswered) return;

    const isCorrect = selectedOptionIndex === currentQuestion.correctAnswerIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswersHistory(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedIndex: selectedOptionIndex,
        isCorrect
      }
    ]);

    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
      // Save quiz attempt log to IndexedDB
      saveQuizAttempt({
        patternId: quiz.patternId,
        patternTitle,
        score,
        totalQuestions: quiz.questions.length,
        completedAt: Date.now()
      })
      .then(() => {
        // Trigger re-fetch of attempts
        getQuizAttempts()
          .then(list => setAttempts(list.filter(a => a.patternId === quiz.patternId)))
          .catch(e => console.error("Failed to load quiz attempts:", e));
      })
      .catch(e => console.error("Failed to save quiz attempt:", e));
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
    setAnswersHistory([]);
  };

  const getScoreRating = (percent: number) => {
    if (percent === 100) return { title: "Mastermind!", subtitle: "Perfect score! You truly understand this pattern.", color: "text-emerald-500" };
    if (percent >= 60) return { title: "Great Job!", subtitle: "Strong understanding of the fundamentals.", color: "text-indigo-500" };
    return { title: "Keep Practicing!", subtitle: "Review the raw article and try again.", color: "text-amber-500" };
  };

  const completionPercent = Math.round((score / quiz.questions.length) * 100);
  const rating = getScoreRating(completionPercent);

  return (
    <div className="space-y-6">
      {/* Quiz Card */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 ${
        isHighContrast
          ? "bg-black border-2 border-white text-white"
          : theme === "dark"
            ? "bg-[#0c0e17]/60 backdrop-blur-md border-slate-900/80"
            : "bg-white border-slate-100 shadow-sm"
      }`}>
        {!quizCompleted ? (
          <div>
            {/* Header: Progress indicator */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className={isHighContrast ? "text-yellow-300" : "text-indigo-500"} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Concept Check
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full transition-all duration-300 ease-out ${
                  isHighContrast
                    ? "bg-white"
                    : theme === "dark"
                      ? "bg-indigo-500"
                      : "bg-indigo-600"
                }`}
                style={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h3 className={`text-lg font-bold leading-snug mb-6 ${
              isHighContrast
                ? "text-yellow-300"
                : "text-slate-900 dark:text-slate-100"
            }`}>
              {currentQuestion.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                const isCorrect = currentQuestion.correctAnswerIndex === index;
                
                let optionStyle = "";
                if (isHighContrast) {
                  if (isAnswered) {
                    if (isCorrect) optionStyle = "border-2 border-green-400 text-green-400 bg-black";
                    else if (isSelected) optionStyle = "border-2 border-red-400 text-red-400 bg-black";
                    else optionStyle = "border border-white/40 text-white/40 bg-black";
                  } else {
                    optionStyle = isSelected
                      ? "border-2 border-yellow-300 text-yellow-300 bg-black"
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
                        ? "bg-[#090b11] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300"
                        : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-100/60 text-slate-700";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={isAnswered}
                    onClick={() => handleOptionSelect(index)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all duration-150 flex items-start gap-3 ${optionStyle}`}
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

            {/* Answer Explanation & Control */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {!isAnswered ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Select the best answer and click Submit to check your concept understanding.
                  </p>
                ) : (
                  <div className="space-y-1 max-w-lg">
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      selectedOptionIndex === currentQuestion.correctAnswerIndex
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}>
                      {selectedOptionIndex === currentQuestion.correctAnswerIndex ? "Correct Answer!" : "Incorrect Answer"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-3 justify-end">
                {!isAnswered ? (
                  <button
                    disabled={selectedOptionIndex === null}
                    onClick={handleSubmitAnswer}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border ${
                      selectedOptionIndex === null
                        ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-100 dark:bg-slate-900"
                        : isHighContrast
                          ? "bg-yellow-300 border-yellow-300 text-black hover:bg-white hover:border-white"
                          : "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 shadow-md shadow-indigo-600/10"
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border flex items-center gap-1.5 ${
                      isHighContrast
                        ? "bg-white border-white text-black hover:bg-yellow-300 hover:border-yellow-300"
                        : "bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700 shadow-md dark:shadow-indigo-600/10"
                    }`}
                  >
                    <span>
                      {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Complete Quiz"}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Quiz Completion View */
          <div className="text-center py-6">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
              isHighContrast
                ? "border-2 border-white text-yellow-300"
                : completionPercent >= 60
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-slate-500/10 text-slate-500"
            }`}>
              <Award size={32} />
            </div>

            <h3 className={`text-2xl font-bold mb-2 ${
              isHighContrast ? "text-white" : "text-slate-900 dark:text-slate-100"
            }`}>
              Quiz Completed!
            </h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              You've answered all concept questions for the <strong className={isHighContrast ? "text-yellow-300" : "text-indigo-500"}>{patternTitle}</strong> pattern.
            </p>

            <div className="inline-block relative mb-6">
              <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${
                isHighContrast
                  ? "border-white text-yellow-300"
                  : completionPercent === 100
                    ? "border-emerald-500/40 text-emerald-500"
                    : completionPercent >= 60
                      ? "border-indigo-500/40 text-indigo-500"
                      : "border-amber-500/40 text-amber-500"
              }`}>
                <span className="text-3xl font-extrabold">{score} / {quiz.questions.length}</span>
                <span className="text-xs font-semibold opacity-75">Correct</span>
              </div>
            </div>

            <div className="space-y-1 mb-8">
              <h4 className={`text-lg font-bold ${rating.color}`}>{rating.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{rating.subtitle}</p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border flex items-center gap-1.5 ${
                  isHighContrast
                    ? "bg-black border-white text-white hover:bg-yellow-300 hover:text-black"
                    : theme === "dark"
                      ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <RotateCcw size={14} />
                <span>Retake Quiz</span>
              </button>
            </div>

            {/* Attempts History Section */}
            {attempts.length > 0 && (
              <div className="mt-8 border-t border-slate-100 dark:border-slate-850 pt-6 text-left max-w-md mx-auto">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between">
                  <span>Previous Attempts (IndexedDB)</span>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">({attempts.length})</span>
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {attempts.map((attempt, idx) => {
                    const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                    const formattedDate = new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + new Date(attempt.completedAt).toLocaleDateString();
                    return (
                      <div key={idx} className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-medium border ${
                        isHighContrast
                          ? "border-white bg-black text-white"
                          : theme === "dark"
                            ? "bg-slate-900/40 border-slate-800/60 text-slate-300"
                            : "bg-white border-slate-150 text-slate-650 shadow-sm"
                      }`}>
                        <div className="flex flex-col">
                          <span className={isHighContrast ? "text-yellow-300 font-bold" : "text-slate-800 dark:text-slate-200"}>
                            Score: {attempt.score} / {attempt.totalQuestions} ({pct}%)
                          </span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-normal">
                            {formattedDate}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pct === 100
                            ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                            : pct >= 60
                              ? "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20"
                              : "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20"
                        }`}>
                          {pct === 100 ? "Perfect" : pct >= 60 ? "Passed" : "Retake"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
