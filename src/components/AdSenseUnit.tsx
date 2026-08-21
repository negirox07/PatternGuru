import { useEffect, useRef, useState, CSSProperties } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOTS_ARE_PLACEHOLDERS } from "../adsConfig";

interface AdSenseUnitProps {
  client?: string;
  slot: string;
  format?: string;
  /** In-article units: pass layout="in-article" together with format="fluid".
   *  Google's spec omits data-full-width-responsive on these, so it's dropped
   *  automatically whenever layout is set. */
  layout?: string;
  /** Required by some fluid in-feed units; ignored for in-article (uses `layout` instead). */
  layoutKey?: string;
  responsive?: string;
  style?: CSSProperties;
  className?: string;
}

/** AdSense stamps data-ad-status="filled" | "unfilled" on the <ins> once it responds. */
type FillState = "pending" | "filled" | "unfilled";

export default function AdSenseUnit({
  client = ADSENSE_CLIENT,
  slot,
  format = "auto",
  layout,
  layoutKey,
  responsive = "true",
  style = { display: "block" },
  className = "",
}: AdSenseUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [fillState, setFillState] = useState<FillState>("pending");
  const initialized = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check visibility and dimensions
    const checkVisibility = () => {
      if (initialized.current) return;

      const rect = el.getBoundingClientRect();
      const isVisible = el.offsetParent !== null && rect.width > 0 && rect.height > 0;

      // If the ad format is "fluid", AdSense requires at least 250px available width.
      // Otherwise, we just need the element to have a positive visible width.
      const minRequiredWidth = format === "fluid" ? 250 : 100;

      if (isVisible && rect.width >= minRequiredWidth) {
        setShouldRender(true);
      } else {
        setShouldRender(false);
      }
    };

    // Use IntersectionObserver as it detects display transitions (e.g. from display: none to block)
    let io: IntersectionObserver | null = null;
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            checkVisibility();
          }
        });
      }, { threshold: 0 });
      io.observe(el);
    }

    // Fallback: Check visibility on resize
    window.addEventListener("resize", checkVisibility);
    checkVisibility();

    return () => {
      if (io) io.disconnect();
      window.removeEventListener("resize", checkVisibility);
    };
  }, [format, slot]);

  // Run the adsbygoogle push AFTER React has committed the ins element to the DOM
  useEffect(() => {
    if (!shouldRender || initialized.current) return;

    // Wait a tick for DOM to completely settle and layout to fully render
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      // Double check the ins element exists and has no status attribute yet
      const insElement = container.querySelector(".adsbygoogle");
      if (!insElement || insElement.hasAttribute("data-adsbygoogle-status")) return;

      try {
        // The queue MUST be written back onto window. Reading it into a local
        // variable and pushing there loses the request whenever adsbygoogle.js
        // has not finished loading yet, because the real library replaces
        // window.adsbygoogle with its own object and only drains what it finds
        // there. That silent drop is why no ad ever appeared.
        const w = window as unknown as { adsbygoogle?: unknown[] };
        (w.adsbygoogle = w.adsbygoogle || []).push({});
        initialized.current = true;
      } catch (pushErr) {
        console.warn("adsbygoogle.push warning:", pushErr);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [shouldRender]);

  // Watch for AdSense's fill verdict so an unfilled unit can collapse instead of
  // leaving an empty labelled box on the page.
  useEffect(() => {
    if (!shouldRender) return;
    const container = containerRef.current;
    if (!container) return;

    const ins = container.querySelector(".adsbygoogle");
    if (!ins) return;

    const readStatus = () => {
      const status = ins.getAttribute("data-ad-status");
      if (status === "filled") setFillState("filled");
      else if (status === "unfilled") setFillState("unfilled");
    };

    readStatus();
    const mo = new MutationObserver(readStatus);
    mo.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
    return () => mo.disconnect();
  }, [shouldRender]);

  // Nothing to serve until real ad units exist in the AdSense dashboard.
  // Rendering a labelled placeholder box instead would be worse than rendering
  // nothing: it takes up layout, and Google treats empty ad frames as a defect.
  if (ADSENSE_SLOTS_ARE_PLACEHOLDERS) {
    if (import.meta.env.DEV) {
      return (
        <div className={`my-8 select-none ${className}`}>
          <div className="text-[11px] text-amber-600 dark:text-amber-500 font-mono text-center border border-dashed border-amber-300 dark:border-amber-900/60 rounded-xl py-3 px-2">
            Ad slot “{slot}” is a placeholder. Create the unit in AdSense, paste the
            real ID into src/adsConfig.ts, then set
            ADSENSE_SLOTS_ARE_PLACEHOLDERS to false.
          </div>
        </div>
      );
    }
    return null;
  }

  if (fillState === "unfilled") return null;

  return (
    <div ref={containerRef} className={`my-8 select-none relative ${className}`}>
      {/* Policy-compliant label. Google permits "Advertisement" or "Sponsored Links"
          only, and it must not appear unless an ad is actually there. */}
      {fillState === "filled" && (
        <span className="block text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5 font-bold text-center">
          Advertisement
        </span>
      )}
      {shouldRender && (
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-ad-layout={layout}
          data-ad-layout-key={format === "fluid" && !layout ? layoutKey : undefined}
          data-full-width-responsive={layout ? undefined : responsive}
        />
      )}
    </div>
  );
}
