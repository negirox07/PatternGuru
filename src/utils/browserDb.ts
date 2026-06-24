export interface UserNote {
  patternId: string;
  note: string;
  updatedAt: number;
}

export interface QuizAttempt {
  id?: number;
  patternId: string;
  patternTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: number;
}

const DB_NAME = "DesignPatternsBrowserDB";
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", { keyPath: "patternId" });
      }
      if (!db.objectStoreNames.contains("quizAttempts")) {
        db.createObjectStore("quizAttempts", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveNote(patternId: string, note: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readwrite");
    const store = tx.objectStore("notes");
    const request = store.put({
      patternId,
      note,
      updatedAt: Date.now(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getNote(patternId: string): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readonly");
    const store = tx.objectStore("notes");
    const request = store.get(patternId);

    request.onsuccess = () => {
      const result = request.result as UserNote | undefined;
      resolve(result ? result.note : "");
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveQuizAttempt(attempt: Omit<QuizAttempt, "id">): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("quizAttempts", "readwrite");
    const store = tx.objectStore("quizAttempts");
    const request = store.add(attempt);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getQuizAttempts(): Promise<QuizAttempt[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("quizAttempts", "readonly");
    const store = tx.objectStore("quizAttempts");
    const request = store.getAll();

    request.onsuccess = () => {
      const result = request.result as QuizAttempt[];
      // Sort attempts by date descending
      result.sort((a, b) => b.completedAt - a.completedAt);
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearQuizAttempts(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("quizAttempts", "readwrite");
    const store = tx.objectStore("quizAttempts");
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
