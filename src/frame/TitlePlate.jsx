import { useEffect } from "react";

// DESIGN §2 (verbatim copy), §1.3 (type scale), §5.1 ⓐⓑⓒⓓ (layout). The
// title plate is the site frame's signature piece — it is what makes this a
// website and not a bare canvas (ANALYSIS §5, the shape risk T-12 answers).
//
// The kumkum rule under the title is also the load progress bar (§5.1 ⓑ):
// it grows toward the title's width while `ready` is false, then contracts
// to 44px once the scene reports its first WebGL frame.

const TITLE = "Threshold";
const TAMIL_LINE = "கோலம் · a doorstep drawing";
const CONCEPT_LINE =
  "One stroke falls as eight. Rice powder on wet stone — a kolam, the way it is drawn on the doorstep at dawn.";
// The bare Tamil word, isolated, for the tofu-detection probe below.
const TOFU_PROBE = "கோலம்";
// A private-use-area string of the same code-unit length as the probe: if
// the browser renders both strings at the same measured width, neither
// actually resolved to real glyphs — both fell back to the fallback tofu
// glyph, and the Tamil line should be hidden rather than shown as garbage
// (DESIGN §1.4's "8 lines" guard).
const TOFU_CONTROL = "";

function runTamilTofuGuard() {
  if (typeof document === "undefined") return;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const tamilStack =
      getComputedStyle(document.documentElement).getPropertyValue("--font-tamil") ||
      "sans-serif";
    ctx.font = `16px ${tamilStack}`;
    const probeWidth = ctx.measureText(TOFU_PROBE).width;
    const controlWidth = ctx.measureText(TOFU_CONTROL).width;
    if (Math.abs(probeWidth - controlWidth) < 0.5) {
      document.documentElement.classList.add("no-tamil");
    }
  } catch {
    // Measurement failing is not fatal — worst case the Tamil line renders
    // as tofu on a browser this guard couldn't probe, which is still no
    // worse than not having the guard at all.
  }
}

/**
 * @param {{ ready: boolean, concept: 'wide' | 'narrow' }} props
 *   `ready` — has the scene produced its first WebGL frame yet (drives the
 *   rule's grow→contract animation, DESIGN §8 row 1 "Boot").
 *   `concept` — DESIGN §5.1 ⓓ's delegated check: 'narrow' drops the concept
 *   line to 26ch if it touches the kolam's outer ring at desktop width.
 */
export function TitlePlate({ ready, concept = "wide" }) {
  useEffect(() => {
    runTamilTofuGuard();
  }, []);

  return (
    <div className="title-plate">
      <h1 className="title-plate__title">{TITLE}</h1>
      <div className={`title-plate__rule${ready ? "" : " title-plate__rule--loading"}`} />
      <p className="title-plate__tamil">{TAMIL_LINE}</p>
      <p
        className={`title-plate__concept${
          concept === "narrow" ? " title-plate__concept--narrow" : ""
        }`}
      >
        {CONCEPT_LINE}
      </p>
    </div>
  );
}
