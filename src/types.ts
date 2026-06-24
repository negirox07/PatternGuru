export interface CodeSnippet {
  language: string;
  code: string;
}

export interface DesignPattern {
  id: string; // e.g. "singleton"
  title: string;
  category: "creational" | "structural" | "behavioral";
  tagline: string;
  intent: string;
  problem: string;
  solution: string;
  analogy: string;
  diagram: string; // ASCII UML diagram representation
  pros: string[];
  cons: string[];
  snippets: CodeSnippet[];
  relatedPatterns: string[]; // ids of related patterns
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags?: string[];
}

export interface KeyboardShortcut {
  keys: string[];
  description: string;
  action: string;
}

export type ThemeMode = "light" | "dark" | "high-contrast";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface PatternQuiz {
  patternId: string;
  questions: QuizQuestion[];
}

