import { useEffect, useRef, useState, CSSProperties } from "react";

interface AdSenseUnitProps {
  client?: string;
  slot: string;
  format?: string;
  responsive?: string;
  style?: CSSProperties;
  className?: string;
}

export default function AdSenseUnit({
  client = "ca-pub-9187440931404634",
  slot,
  format = "auto",
  responsive = "true",
  style = { display: "block" },
  className = "",
}: AdSenseUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
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
    if (shouldRender && !initialized.current) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        
        // Wait a tick for DOM to completely settle and layout to fully render
        const timer = setTimeout(() => {
          const container = containerRef.current;
          if (!container) return;

          // Double check the ins element exists and has no status attribute yet
          const insElement = container.querySelector(".adsbygoogle");
          if (insElement && !insElement.hasAttribute("data-adsbygoogle-status")) {
            try {
              adsbygoogle.push({});
              initialized.current = true;
            } catch (pushErr) {
              console.warn("adsbygoogle.push warning:", pushErr);
            }
          }
        }, 120);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("AdSense Push Error:", err);
      }
    }
  }, [shouldRender]);

  return (
    <div ref={containerRef} className={`my-8 select-none relative ${className}`}>
      <span className="block text-[10px] uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-1.5 font-bold text-center">
        Sponsored Advertisement
      </span>
      <div className="overflow-hidden min-h-[100px] flex items-center justify-center bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl p-3">
        {shouldRender ? (
          /* Ad Instance */
          <ins
            className="adsbygoogle"
            style={style}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
          />
        ) : (
          /* Placeholder while waiting for layout visibility or minimum width */
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono text-center py-4">
            <span>[Ad Pending Visibility]</span>
          </div>
        )}
        
        {/* Subtle Visual Identifier in development environment */}
        {process.env.NODE_ENV !== "production" && shouldRender && (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex flex-col items-center gap-1 py-4 text-center absolute pointer-events-none">
            <span>[AdSense Active Unit]</span>
            <span className="text-[9px] opacity-75">Slot: {slot} | Client: {client}</span>
          </div>
        )}
      </div>
    </div>
  );
}
