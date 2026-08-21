/**
 * Single source of truth for Google AdSense identifiers.
 *
 * The publisher ID must match three things or no ads will ever serve:
 *   1. the `client=` query param on the adsbygoogle.js tag in index.html
 *   2. the `google-adsense-account` meta tag in index.html
 *   3. the pub- line in public/ads.txt
 *
 * These are real ad units created in AdSense under Ads > By ad unit (account-wide —
 * `sidebar` and `multiplex` are shared with atmosphere-iq.vercel.app, which is fine,
 * the same unit can legitimately serve on more than one site you own).
 */

export const ADSENSE_CLIENT = "ca-pub-9187440931404634";

/**
 * Flip back to true only if a slot below reverts to a placeholder. While true, ad
 * containers render nothing at all — better than shipping empty "Advertisement"
 * boxes, which look broken and read as a policy problem.
 */
export const ADSENSE_SLOTS_ARE_PLACEHOLDERS: boolean = false;

export const AD_SLOTS = {
  /** "Article ads" unit — in-article format (data-ad-layout="in-article"), dropped
   *  inline in the reading column below the quiz on a pattern page. */
  patternBanner: "7694311040",
  /** "All ads" unit — general responsive display, used in the fixed-width sidebar. */
  sidebar: "5342210952",
  /** "Multiplex ads" unit — native content-recommendation grid (autorelaxed format).
   *  Not placed on any page yet; a natural fit would be beside/below the "Related
   *  Patterns" grid at the end of a pattern page. */
  multiplex: "9089081944",
  /** "Image ads" unit — image-only display creative. Not placed on any page yet. */
  imageAd: "3078648308",
} as const;
