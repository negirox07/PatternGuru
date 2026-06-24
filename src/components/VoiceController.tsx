import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, HelpCircle, X, ChevronDown, CheckCircle2 } from "lucide-react";
import { ThemeMode } from "../types";

interface VoiceControllerProps {
  onNavigate: (patternId: string) => void;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenHelp: () => void;
  onCloseHelp: () => void;
  theme: ThemeMode;
  availablePatternIds: string[];
}

interface VoiceLog {
  text: string;
  matched: boolean;
  timestamp: string;
}

export default function VoiceController({
  onNavigate,
  onThemeChange,
  onOpenHelp,
  onCloseHelp,
  theme,
  availablePatternIds
}: VoiceControllerProps) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [logs, setLogs] = useState<VoiceLog[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [pulse, setPulse] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for web speech api support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setPulse(true);
        addLog("Voice control activated. Listening for commands...", true);
      };

      recognition.onend = () => {
        setIsListening(false);
        setPulse(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          addLog("Permission to use microphone was denied.", false);
        } else {
          addLog(`Error occurred: ${event.error}`, false);
        }
        setIsListening(false);
        setPulse(false);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = "";
        let interimTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(interimTrans);

        if (finalTrans) {
          const command = finalTrans.trim().toLowerCase();
          setTranscript(command);
          setInterimTranscript("");
          processVoiceCommand(command);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [availablePatternIds]);

  const addLog = (text: string, matched: boolean) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [{ text, matched, timestamp: time }, ...prev.slice(0, 9)]);
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const processVoiceCommand = (rawCommand: string) => {
    const command = rawCommand.trim().toLowerCase();
    let matched = false;

    // Pattern Navigation commands
    for (const patternId of availablePatternIds) {
      // Replace hyphens with spaces for phonetic matching
      const phoneticName = patternId.replace(/-/g, " ");
      const triggerPatterns = [
        `go to ${phoneticName}`,
        `show me ${phoneticName}`,
        `open ${phoneticName}`,
        phoneticName
      ];

      if (triggerPatterns.some(tp => command.includes(tp))) {
        onNavigate(patternId);
        matched = true;
        addLog(`Navigated to: ${patternId.toUpperCase()}`, true);
        showFeedback(`Navigated to ${patternId.replace(/-/g, " ")}`);
        break;
      }
    }

    if (!matched) {
      // Theme switching commands
      if (command.includes("dark mode") || command.includes("go dark") || command.includes("enable dark")) {
        onThemeChange("dark");
        matched = true;
        addLog("Switched to Dark Mode", true);
        showFeedback("Switched to Dark Mode");
      } else if (command.includes("light mode") || command.includes("go light") || command.includes("enable light")) {
        onThemeChange("light");
        matched = true;
        addLog("Switched to Light Mode", true);
        showFeedback("Switched to Light Mode");
      } else if (command.includes("high contrast") || command.includes("contrast mode") || command.includes("accessibility mode")) {
        onThemeChange("high-contrast");
        matched = true;
        addLog("Switched to High Contrast Mode", true);
        showFeedback("Switched to High Contrast Mode");
      } 
      // Modal commands
      else if (command.includes("help") || command.includes("show keyboard") || command.includes("shortcuts")) {
        onOpenHelp();
        matched = true;
        addLog("Opened keyboard shortcuts help", true);
        showFeedback("Opened Keyboard Shortcuts");
      } else if (command.includes("close help") || command.includes("hide help") || command.includes("close")) {
        onCloseHelp();
        matched = true;
        addLog("Closed help modal", true);
        showFeedback("Closed overlay");
      }
    }

    if (!matched) {
      addLog(`Unrecognized voice command: "${rawCommand}"`, false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setPulse(false);
      addLog("Voice control deactivated.", true);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Start failed", err);
      }
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if Web Speech API isn't supported in current browser/iframe context
  }

  const isHighContrast = theme === "high-contrast";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold animate-bounce border ${
            isHighContrast 
              ? "bg-black border-2 border-white text-yellow-300" 
              : "bg-[#090D16] text-white border-slate-900"
          }`}
        >
          <CheckCircle2 size={16} className={isHighContrast ? "text-yellow-300" : "text-emerald-400"} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Voice Controls Drawer */}
      {isPanelOpen && (
        <div 
          className={`w-80 p-4 rounded-xl shadow-2xl border transition-all duration-300 ${
            isHighContrast
              ? "bg-black border-2 border-white text-white"
              : "bg-[#090D16]/95 backdrop-blur-md border-slate-900 text-slate-100"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Volume2 size={18} className="text-indigo-400" />
              <h4 className="font-semibold text-sm">Voice Command Center</h4>
            </div>
            <button 
              onClick={() => setIsPanelOpen(false)}
              className="p-1 rounded-md hover:bg-slate-900 transition-colors"
              aria-label="Close voice controller panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Listening Status & Mic Toggle */}
            <div className="flex items-center justify-between bg-[#06080E] p-3 rounded-lg border border-slate-900/80">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Status</span>
                <span className={`text-sm font-medium ${isListening ? "text-emerald-400" : "text-amber-400"}`}>
                  {isListening ? "Listening actively..." : "Microphone off"}
                </span>
              </div>
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-full transition-all duration-300 relative ${
                  isListening 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "bg-slate-800 hover:bg-slate-750 text-slate-300"
                }`}
                aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
              >
                {isListening ? (
                  <>
                    <Mic size={18} />
                    <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                  </>
                ) : (
                  <MicOff size={18} />
                )}
              </button>
            </div>

            {/* Current Heard Text */}
            <div className="bg-[#06080E] p-3 rounded-lg border border-slate-900/80">
              <span className="text-xs text-slate-400 block mb-1">What you said:</span>
              <p className="text-sm font-medium italic min-h-[1.5rem] text-slate-200">
                {interimTranscript && <span className="text-slate-500">{interimTranscript}</span>}
                {transcript ? `"${transcript}"` : !interimTranscript && "Try saying: 'go to singleton'"}
              </p>
            </div>

            {/* Commands Guide dropdown */}
            <div className="text-xs border border-slate-900/80 bg-[#06080E]/50 p-2.5 rounded-lg">
              <span className="font-semibold text-slate-300 block mb-1">Supported Commands:</span>
              <ul className="grid grid-cols-1 gap-1 text-slate-400">
                <li>• <strong className="text-indigo-400">"singleton"</strong>, <strong className="text-indigo-400">"factory method"</strong>, etc.</li>
                <li>• <strong className="text-indigo-400">"dark mode"</strong>, <strong className="text-indigo-400">"light mode"</strong></li>
                <li>• <strong className="text-indigo-400">"high contrast"</strong></li>
                <li>• <strong className="text-indigo-400">"help"</strong> / <strong className="text-indigo-400">"close"</strong></li>
              </ul>
            </div>

            {/* Command History Logs */}
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-semibold mb-1">Activity Log</span>
              <div className="max-h-24 overflow-y-auto flex flex-col gap-1 bg-[#06080E] p-2 rounded border border-slate-900/80 text-[10px] font-mono">
                {logs.length === 0 ? (
                  <span className="text-slate-600">No recent actions logged.</span>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex justify-between items-start border-b border-slate-950 pb-1">
                      <span className={log.matched ? "text-slate-300" : "text-amber-500"}>
                        {log.text}
                      </span>
                      <span className="text-slate-600 shrink-0 ml-1">{log.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border font-medium text-sm transition-all duration-300 ${
            isHighContrast
              ? "bg-black border-2 border-white text-white hover:bg-zinc-900"
              : "bg-[#0F111A] hover:bg-[#121624] text-slate-100 border-slate-900/80"
          }`}
          aria-label="Toggle voice command panel"
        >
          <Volume2 size={16} className={pulse ? "text-emerald-400 animate-pulse" : "text-indigo-400"} />
          <span>Voice Controls</span>
          <ChevronDown size={14} className={`transform transition-transform ${isPanelOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Quick Mic Toggle if drawer closed */}
        {!isPanelOpen && (
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-full shadow-lg border transition-all duration-300 relative ${
              isListening
                ? "bg-emerald-600 text-white border-emerald-500"
                : isHighContrast
                  ? "bg-black border-2 border-white text-white hover:bg-zinc-900"
                  : "bg-[#0F111A] hover:bg-[#121624] text-slate-300 border-slate-900/80"
            }`}
            aria-label={isListening ? "Stop listening for commands" : "Start listening for commands"}
          >
            {isListening ? (
              <>
                <Mic size={18} />
                <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
              </>
            ) : (
              <MicOff size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
