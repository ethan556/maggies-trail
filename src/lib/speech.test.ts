// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi } from "vitest";
import { canSpeak, narrationEnabled, setNarrationEnabled, speak, cancelSpeech, narrationFor, speakableMath } from "./speech";

/** A minimal speechSynthesis stand-in — jsdom ships none. */
function installSpeech() {
  const spoken: string[] = [];
  let cancelled = 0;
  class U {
    text: string;
    rate = 1;
    pitch = 1;
    lang = "";
    onend: (() => void) | null = null;
    constructor(t: string) {
      this.text = t;
    }
  }
  (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance = U;
  (window as unknown as Record<string, unknown>).speechSynthesis = {
    speak: (u: U) => spoken.push(u.text),
    cancel: () => {
      cancelled++;
    },
  };
  return { spoken, cancelled: () => cancelled };
}

function removeSpeech() {
  delete (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
  delete (window as unknown as Record<string, unknown>).speechSynthesis;
}

describe("speech — narration for the early band", () => {
  beforeEach(() => {
    window.localStorage.clear();
    removeSpeech();
  });

  it("is a silent no-op when the browser has no speech support", () => {
    // The whole point: an unsupported browser must degrade to the pre-existing text player rather
    // than throwing inside a render.
    expect(canSpeak()).toBe(false);
    expect(speak("two plus two")).toBe(false);
    expect(() => cancelSpeech()).not.toThrow();
  });

  it("speaks only when support exists, and cancels anything in flight first", () => {
    const h = installSpeech();
    expect(canSpeak()).toBe(true);
    expect(speak("count the apples")).toBe(true);
    expect(h.spoken).toEqual(["count the apples"]);
    // A second utterance must replace, not queue behind, the first.
    speak("now count the pears");
    expect(h.cancelled()).toBe(2);
    expect(h.spoken).toEqual(["count the apples", "now count the pears"]);
  });

  it("refuses empty or whitespace-only text", () => {
    installSpeech();
    expect(speak("   ")).toBe(false);
    expect(speak("")).toBe(false);
  });

  it("defaults to OFF — narration is opt-in, never a surprise", () => {
    expect(narrationEnabled()).toBe(false);
    setNarrationEnabled(true);
    expect(narrationEnabled()).toBe(true);
    setNarrationEnabled(false);
    expect(narrationEnabled()).toBe(false);
  });

  it("cancels in-flight speech when narration is switched off", () => {
    const h = installSpeech();
    setNarrationEnabled(true);
    speak("a long sentence");
    const before = h.cancelled();
    setNarrationEnabled(false);
    expect(h.cancelled()).toBeGreaterThan(before);
  });

  it("survives localStorage throwing (private-mode Safari)", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => narrationEnabled()).not.toThrow();
    expect(narrationEnabled()).toBe(false);
    spy.mockRestore();
  });

  it("prefers authored narration over the body, which may read badly aloud", () => {
    expect(narrationFor({ narration: "Count the red apples.", body: "Something else." })).toBe("Count the red apples.");
    expect(narrationFor({ body: "Count on from four." })).toBe("Count on from four.");
    expect(narrationFor({})).toBe(null);
    expect(narrationFor({ narration: "   ", body: "fallback" })).toBe("fallback");
  });

  it("speaks the QUESTION, not just the framing around it", () => {
    // The real gap this closes: an early step says "Say the double." in the body while the
    // problem itself lives only in the widget prompt. A pre-reader would hear the instruction and
    // never learn which double to say.
    const spoken = narrationFor({ body: "Say the double.", widget: { prompt: "8 + 8 = ?" } });
    expect(spoken).toContain("Say the double");
    expect(spoken).toContain("8 plus 8");
  });

  it("does not repeat the prompt when the framing already contains it", () => {
    const spoken = narrationFor({ body: "How many apples?", widget: { prompt: "How many apples?" } });
    expect(spoken).toBe("How many apples?");
  });

  it("renders notation as words a voice can actually say", () => {
    expect(speakableMath("8 + 8 = ?")).toBe("8 plus 8 equals");
    expect(speakableMath("9 - 4")).toBe("9 minus 4");
    expect(speakableMath("3 × 5")).toBe("3 times 5");
    expect(speakableMath("12 ÷ 4")).toBe("12 divided by 4");
    expect(speakableMath("2 < 7")).toBe("2 is less than 7");
    expect(speakableMath("3/4")).toBe("3 over 4"); // a fraction, not a division
    // A trailing blank marker is silence, not an audible "question mark".
    expect(speakableMath("5 + 1 = ?")).not.toContain("?");
  });

  it("leaves ordinary prose untouched", () => {
    expect(speakableMath("Count the red apples in the basket.")).toBe("Count the red apples in the basket.");
  });

  it("slows the default rate — the browser default is brisk for a six-year-old", () => {
    let captured: { rate?: number } = {};
    installSpeech();
    (window as unknown as Record<string, unknown>).speechSynthesis = {
      speak: (u: { rate: number }) => {
        captured = u;
      },
      cancel: () => {},
    };
    speak("ten frame");
    expect(captured.rate).toBeLessThan(1);
  });
});
