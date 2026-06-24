import { useId } from "react";
import { ThemeMode } from "../types";

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  theme: ThemeMode;
}

export default function SyntaxHighlighter({ code, language, theme }: SyntaxHighlighterProps) {
  const containerId = useId();

  const highlight = (txt: string, lang: string, currentTheme: ThemeMode) => {
    // Escape HTML to prevent injection and rendering bugs
    let escaped = txt
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Syntax regex tokens mapping
    // Note: order is important! Comments and strings should be matched first to avoid keywords inside them being highlighted.

    const patterns: { class: string; regex: RegExp }[] = [];

    if (currentTheme === "high-contrast") {
      patterns.push(
        // Comments
        {
          regex: /(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g,
          class: "text-zinc-400 italic font-medium"
        },
        // Strings
        {
          regex: /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"|'(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\'])*'|`[\s\S]*?`)/g,
          class: "text-green-300 font-semibold"
        },
        // Numbers & Booleans
        {
          regex: /\b(true|false|True|False|null|None|nullptr|\d+)\b/g,
          class: "text-red-400 font-bold"
        },
        // Keywords
        {
          regex: /\b(const|let|var|class|function|interface|type|private|public|protected|static|readonly|return|new|this|implements|extends|abstract|import|from|def|self|final|volatile|synchronized|struct|void|double|int|float|bool|char|if|else|for|while|try|catch|throw|delete|override|std|vector|unique_ptr|lock_guard|mutex|include|volatile|volatile|synchronized)\b/g,
          class: "text-yellow-300 font-bold underline"
        },
        // Annotations / Decorators
        {
          regex: /(@\w+)/g,
          class: "text-cyan-300 font-bold"
        }
      );
    } else if (currentTheme === "dark") {
      patterns.push(
        // Comments
        {
          regex: /(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g,
          class: "text-emerald-400 italic"
        },
        // Strings
        {
          regex: /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"|'(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\'])*'|`[\s\S]*?`)/g,
          class: "text-amber-200"
        },
        // Numbers & Booleans
        {
          regex: /\b(true|false|True|False|null|None|nullptr|\d+)\b/g,
          class: "text-orange-400 font-medium"
        },
        // Keywords
        {
          regex: /\b(const|let|var|class|function|interface|type|private|public|protected|static|readonly|return|new|this|implements|extends|abstract|import|from|def|self|final|volatile|synchronized|struct|void|double|int|float|bool|char|if|else|for|while|try|catch|throw|delete|override|std|vector|unique_ptr|lock_guard|mutex|include)\b/g,
          class: "text-pink-400 font-semibold"
        },
        // Methods & Classes
        {
          regex: /\b(DatabaseConnection|Transport|Truck|Ship|Logistics|RoadLogistics|SeaLogistics|House|HouseBuilder|JSONAnalyticData|LegacyXmlStockService|StockXmlToJsonAdapter|XmlToJsonAdapter|LegacyXmlService|JsonAnalytics|Notifier|EmailNotifier|NotifierDecorator|SmsDecorator|SlackDecorator|VideoFile|CodecFactory|BitrateReader|VideoConverterFacade|Observer|StockMarketPublisher|MobileAppAlerts|AnalyticsDashboard|RouteStrategy|DrivingStrategy|WalkingStrategy|NavigatorContext|State|ReadyState|PlayingState|PausedState|AudioPlayer)\b/g,
          class: "text-teal-300 font-medium"
        },
        // Function declarations
        {
          regex: /\b(getInstance|query|deliver|planDelivery|createTransport|reset|buildWalls|buildDoors|addPool|addGarden|getResult|describe|fetchJson|getXmlData|send|sendSms|sendSlack|extract|read|convert|convertVideo|subscribe|unsubscribe|setPrice|notifyAll|update|calculateRoute|buildRoute|clickPlay|changeState)\b/g,
          class: "text-blue-300"
        }
      );
    } else {
      // Light Theme
      patterns.push(
        // Comments
        {
          regex: /(\/\/.*|#.*|\/\*[\s\S]*?\*\/)/g,
          class: "text-emerald-700 italic"
        },
        // Strings
        {
          regex: /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"|'(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\'])*'|`[\s\S]*?`)/g,
          class: "text-amber-800"
        },
        // Numbers & Booleans
        {
          regex: /\b(true|false|True|False|null|None|nullptr|\d+)\b/g,
          class: "text-orange-600 font-semibold"
        },
        // Keywords
        {
          regex: /\b(const|let|var|class|function|interface|type|private|public|protected|static|readonly|return|new|this|implements|extends|abstract|import|from|def|self|final|volatile|synchronized|struct|void|double|int|float|bool|char|if|else|for|while|try|catch|throw|delete|override|std|vector|unique_ptr|lock_guard|mutex|include)\b/g,
          class: "text-fuchsia-700 font-semibold"
        },
        // Methods & Classes
        {
          regex: /\b(DatabaseConnection|Transport|Truck|Ship|Logistics|RoadLogistics|SeaLogistics|House|HouseBuilder|JSONAnalyticData|LegacyXmlStockService|StockXmlToJsonAdapter|XmlToJsonAdapter|LegacyXmlService|JsonAnalytics|Notifier|EmailNotifier|NotifierDecorator|SmsDecorator|SlackDecorator|VideoFile|CodecFactory|BitrateReader|VideoConverterFacade|Observer|StockMarketPublisher|MobileAppAlerts|AnalyticsDashboard|RouteStrategy|DrivingStrategy|WalkingStrategy|NavigatorContext|State|ReadyState|PlayingState|PausedState|AudioPlayer)\b/g,
          class: "text-cyan-800 font-medium"
        },
        // Function declarations
        {
          regex: /\b(getInstance|query|deliver|planDelivery|createTransport|reset|buildWalls|buildDoors|addPool|addGarden|getResult|describe|fetchJson|getXmlData|send|sendSms|sendSlack|extract|read|convert|convertVideo|subscribe|unsubscribe|setPrice|notifyAll|update|calculateRoute|buildRoute|clickPlay|changeState)\b/g,
          class: "text-blue-700"
        }
      );
    }

    // Process the code text by wrapping matches inside HTML span elements
    // To do this simply and cleanly, we mask code comments and strings first, and replace keywords.
    // However, since we have a defined, structured set of snippets, a token-based approach or
    // carefully running simple global regex replacements works beautifully. Let's do selective regex
    // tags replacement in a safe sequence.

    let highlighted = escaped;

    // We can use a unique marker to replace segments, so we don't double-highlight keywords inside strings
    const placeholders: { [key: string]: string } = {};
    let placeholderCounter = 0;

    // 1. Mask strings and comments first to preserve them
    const maskPattern = (regex: RegExp, className: string) => {
      highlighted = highlighted.replace(regex, (match) => {
        const id = `___PLACEHOLDER_${placeholderCounter++}___`;
        placeholders[id] = `<span class="${className}">${match}</span>`;
        return id;
      });
    };

    // Mask comments and strings
    maskPattern(patterns[0].regex, patterns[0].class);
    maskPattern(patterns[1].regex, patterns[1].class);

    // 2. Perform highlighting on remaining text
    for (let i = 2; i < patterns.length; i++) {
      const p = patterns[i];
      highlighted = highlighted.replace(p.regex, `<span class="${p.class}">$&</span>`);
    }

    // 3. Restore masked strings and comments
    Object.keys(placeholders).reverse().forEach((id) => {
      highlighted = highlighted.replace(id, placeholders[id]);
    });

    return highlighted;
  };

  const highlightedCode = highlight(code, language, theme);

  return (
    <pre id={containerId} className="overflow-x-auto p-4 md:p-6 font-mono text-xs md:text-sm leading-relaxed whitespace-pre select-text">
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
}
