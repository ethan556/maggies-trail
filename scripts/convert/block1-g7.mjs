// Conversion Playbook Block 1 (G7 two-step equations) — the pilot.
// Replaces the widget block of ONE designated step per lesson and adds a predict where the step
// does not already carry one. Prose, ids, order, hints, conceptTags and every other step are
// untouched. Every edit asserts the step it expects to find before anything is written.

import { readFileSync, writeFileSync } from "node:fs";

const DIR = "content/courses/two-step-equations/lessons";
const MINUS = "\u2212";

/** step id -> { expect: old widget type, widget: new spec, predict?: block } */
const PLAN = {
  // ---- (inversePipeline) undo-order is this lesson's whole content -------------------------
  "tse-02-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "To undo x \u2192 \u00d73 \u2192 +4, which move comes FIRST on the way back?",
      options: [
        { id: "sub", label: "Subtract 4 \u2014 undo the last thing that happened" },
        { id: "div", label: "Divide by 3 \u2014 undo the multiplication" },
        { id: "either", label: "Either order gives the same answer" },
      ],
      outcomeId: "sub",
      reveal:
        "Subtract 4 first. Going forward, \u00d73 happened and THEN +4, so coming back you meet +4 first \u2014 the way you take off a coat before the shirt that went on under it. Build the track and watch the order reverse itself.",
    },
    widget: {
      type: "inversePipeline",
      prompt:
        "3x + 4 = 19. The forward chain does \u00d73 then +4. Build the track that undoes it, in the order you would actually walk it back.",
      forward: [
        { id: "f1", op: "mul", n: 3 },
        { id: "f2", op: "add", n: 4 },
      ],
      tray: [
        { id: "s4", op: "sub", n: 4 },
        { id: "d3", op: "div", n: 3 },
        { id: "a4", op: "add", n: 4 },
        { id: "m3", op: "mul", n: 3 },
      ],
      answer: ["s4", "d3"],
      sampleInput: 5,
      successFeedback:
        "x = 5. The track runs \u22124 then \u00f73 \u2014 the forward chain read backwards with every operation turned around. 19 \u2192 15 \u2192 5.",
      forwardOrderFeedback:
        "Right operations, forward order. \u00f73 is sitting first, but \u00d73 was the FIRST thing done to x, so it is the LAST thing to undo. Drag the \u22124 to the front of the track.",
      unflippedFeedback:
        "The order is right, but a card is still doing what the forward chain did. Undoing +4 means \u22124, and undoing \u00d73 means \u00f73 \u2014 every card has to turn around, not just move.",
      missFeedback:
        "The track needs exactly two cards: one to undo the +4 and one to undo the \u00d73. Check the forward chain above and reverse it card by card.",
    },
  },

  // ---- (g) signed tiles --------------------------------------------------------------------
  "tse-02-02": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "On the balance, \u22122x + 5 = \u22127 starts with NEGATIVE tiles on both pans. Can you finish with x alone and positive?",
      options: [
        { id: "flip", label: "Yes \u2014 but something has to turn the signs around" },
        { id: "never", label: "No \u2014 negative tiles can never become positive" },
        { id: "auto", label: "Yes \u2014 the negatives cancel by themselves" },
      ],
      outcomeId: "flip",
      reveal:
        "Something has to turn them around. Clearing units and splitting gets you as far as \u2212x = \u22126 \u2014 true, but not yet an answer. Multiplying BOTH pans by \u22121 is the move that flips every tile at once and leaves x standing positive.",
    },
    widget: {
      type: "solveBalance",
      prompt:
        "Solve \u22122x + 5 = \u22127. Clear the units from both pans, split into equal groups, then turn the signs around.",
      a: -2,
      b: 5,
      c: -7,
      successFeedback:
        "x = 6. Five units left both pans (\u22122x = \u221212), both sides split into 2 groups (\u2212x = \u22126), then \u00d7(\u22121) turned every tile around at once.",
      unbalancedFeedback:
        "The beam tipped \u2014 a tile moved on one pan only. With negatives it is easy to add to one side while meaning to take from the other. Undo, and make every move happen twice: once left, once right.",
      notIsolatedFeedback:
        "Balanced the whole way \u2014 every move was fair. But it is \u2212x on the pan, not x. One more move turns the signs around on both sides at once.",
      missFeedback:
        "Keep the x-tiles \u2014 they are what the question is asking for. Clear the units from both pans, split into equal groups, then flip the signs.",
    },
  },

  // ---- story skin, positive balance --------------------------------------------------------
  "tse-02-03": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt:
        "A cab charges $3 to get in plus $4 a mile, and the fare came to $19. On the balance, which tiles stand for the $3?",
      options: [
        { id: "units", label: "The 3 loose unit tiles \u2014 they are there whatever the distance" },
        { id: "xtiles", label: "The x-tiles \u2014 they hold the money" },
        { id: "right", label: "The right pan \u2014 that is where the total lives" },
      ],
      outcomeId: "units",
      reveal:
        "The 3 loose units. The flat fee does not depend on how far you go, so it sits as plain tiles; the x-tiles carry the per-mile charge and grow with the distance. Clear the flat fee off both pans first and what is left is pure mileage.",
    },
    widget: {
      type: "solveBalance",
      prompt:
        "The fare is 4x + 3 = 19, where x is the miles travelled. Clear the flat fee from both pans, then split into equal groups.",
      a: 4,
      b: 3,
      c: 19,
      successFeedback:
        "x = 4 miles. The $3 flat fee came off both pans (4x = 16), then both sides split into 4 groups \u2014 one mile against $4.",
      unbalancedFeedback:
        "The beam tipped \u2014 the fee came off one pan only. Taking $3 off the cost without taking it off the total describes a different journey. Undo and remove it from both.",
      notIsolatedFeedback:
        "Still level, so every move was fair. But the pan holds 4 miles' worth, not one. Split both sides into 4 equal groups to find the price of a single mile.",
      missFeedback:
        "The x-tiles are the miles you are solving for \u2014 keep them on the pan. Clear the flat fee from both sides, then split.",
    },
  },

  // ---- (f) groups, positive multiplier ------------------------------------------------------
  "tse-03-01": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "3(x + 2) = 18 sits on the pan as three sealed (x + 2) groups. Opening them, where does the \u00d73 land?",
      options: [
        { id: "both", label: "On both parts \u2014 3 x-tiles AND 6 units" },
        { id: "xonly", label: "On the x only \u2014 3 x-tiles and 2 units" },
        { id: "outside", label: "Nowhere \u2014 the 3 stays outside" },
      ],
      outcomeId: "both",
      reveal:
        "On both parts. Three copies of (x + 2) hold three x-tiles and three 2s \u2014 six units. The pan cannot gain or lose weight just because you opened the brackets, and the beam will say so immediately if it does.",
    },
    widget: {
      type: "solveBalance",
      prompt:
        "Solve 3(x + 2) = 18. Take the brackets off \u2014 there are two buttons, and the beam will tell you which one kept the pan honest.",
      a: 3,
      b: 6,
      c: 18,
      groups: { count: 3, x: 1, unit: 2 },
      successFeedback:
        "x = 4. Opening all three groups gave 3x + 6 = 18, six units came off both pans (3x = 12), then both sides split into 3.",
      unbalancedFeedback:
        "The beam tipped \u2014 a tile moved on one side only. Whatever leaves the left pan has to leave the right pan too.",
      notIsolatedFeedback:
        "Balanced, so every move was fair \u2014 but x is not alone yet. Clear the units from both pans, then split into equal groups.",
      missFeedback:
        "Keep the x-tiles \u2014 they are what you are solving for. Clear the unit tiles from both sides, then split both sides into 3 groups.",
      unexpandedFeedback:
        "The brackets are still sealed. Nothing is wrong with the pan \u2014 it balances \u2014 but the tiles inside a group cannot be taken off one at a time. Open the groups first.",
      partialDistributeFeedback:
        "The beam tipped the moment the brackets came off, and no tile has moved since. The \u00d73 reached the x but not the 2, so the pan lost four units it was holding. Undo and give the \u00d73 to both parts.",
    },
  },

  // ---- (f) groups, NEGATIVE multiplier ------------------------------------------------------
  "tse-03-02": {
    step: "i3",
    expect: "numeric",
    predict: {
      prompt: "\u22125(x + 3) = \u221220 \u2014 five copies of \u2212(x + 3). Does the minus reach the 3 as well as the x?",
      options: [
        { id: "both", label: "Yes \u2014 every tile inside turns negative" },
        { id: "xonly", label: "No \u2014 only the x turns negative" },
        { id: "outside", label: "The minus stays outside the brackets" },
      ],
      outcomeId: "both",
      reveal:
        "Every tile inside. A negative multiplier is still a multiplier: it reaches the whole group, so each copy contributes \u2212x AND \u22123. Watch the pan fill with negative tiles when the groups open.",
    },
    widget: {
      type: "solveBalance",
      prompt:
        "Solve \u22125(x + 3) = \u221220. Open the groups, clear the units from both pans, split, then turn the signs around.",
      a: -5,
      b: -15,
      c: -20,
      groups: { count: -5, x: 1, unit: 3 },
      successFeedback:
        "x = 1. Opening the groups gave \u22125x \u2212 15 = \u221220, fifteen negative units came off both pans (\u22125x = \u22125), splitting into 5 left \u2212x = \u22121, and \u00d7(\u22121) turned it the right way up.",
      unbalancedFeedback:
        "The beam tipped \u2014 a tile moved on one pan only. Every removal needs its partner on the other side.",
      notIsolatedFeedback:
        "Balanced, so the moves were fair \u2014 but x is not standing alone and positive yet. Keep clearing from both pans, then split, then flip the signs.",
      missFeedback:
        "Keep the x-tiles \u2014 they are the thing being solved for. Clear the unit tiles from both sides, then split both sides into 5 groups.",
      unexpandedFeedback:
        "The groups are still sealed. The pan balances, but tiles locked inside a group cannot be moved one at a time \u2014 open them first.",
      partialDistributeFeedback:
        "The beam tipped as soon as the brackets came off. The \u22125 reached the x but only one copy of the 3 came out with it \u2014 the other four are missing, and the pan is lighter than the group it replaced.",
    },
  },

  "tse-03-03": {
    step: "i1",
    expect: "numeric",
    predict: {
      prompt: "3(x + 4) = 24. Before opening anything \u2014 how many unit tiles will the left pan hold once the brackets are off?",
      options: [
        { id: "twelve", label: "12 \u2014 three copies of 4" },
        { id: "four", label: "4 \u2014 the 4 inside the brackets" },
        { id: "seven", label: "7 \u2014 3 plus 4" },
      ],
      outcomeId: "twelve",
      reveal:
        "Twelve. Three groups, each carrying a 4, is three 4s. The count is settled before you press anything \u2014 opening the brackets only shows you tiles that were already on the pan.",
    },
    widget: {
      type: "solveBalance",
      prompt:
        "Solve 3(x + 4) = 24. Open the groups, then clear and split until one x-tile stands alone.",
      a: 3,
      b: 12,
      c: 24,
      groups: { count: 3, x: 1, unit: 4 },
      successFeedback:
        "x = 4. Three groups opened to 3x + 12 = 24, twelve units came off both pans (3x = 12), then both sides split into 3.",
      unbalancedFeedback:
        "The beam tipped \u2014 tiles left one pan without leaving the other. Undo back to level and remove in pairs.",
      notIsolatedFeedback:
        "Level the whole way, so every move was fair. x is not alone yet \u2014 finish clearing the units from both pans, then split.",
      missFeedback:
        "The x-tiles stay \u2014 they are what the question wants. Clear units from both sides, then split both sides into 3 groups.",
      unexpandedFeedback:
        "The brackets are still closed. The pan is balanced, but a sealed group moves as one piece \u2014 open the groups before clearing tiles.",
      partialDistributeFeedback:
        "The beam tipped the instant the brackets opened. The \u00d73 went to the x and left the 4 behind, so eight units vanished from a pan that was balanced a moment ago.",
    },
  },

  // ---- (h) inequalities ---------------------------------------------------------------------
  "tse-04-01": {
    step: "i1",
    expect: "mcq",
    widget: {
      type: "solveBalance",
      prompt:
        "Solve 3x + 2 > 14. The beam is tilted because the sentence is TRUE \u2014 keep it that way while you clear and split.",
      a: 3,
      b: 2,
      c: 14,
      relation: "gt",
      successFeedback:
        "x > 4. Two units came off both pans, then both sides split into 3 \u2014 and the beam never changed which way it leaned, so the > never had to move.",
      unbalancedFeedback:
        "The tilt reversed, which means the sentence stopped being true. Something happened to one pan only. Undo and pair every move.",
      notIsolatedFeedback:
        "The sentence is still true \u2014 every move so far was legal. But x is not alone yet: clear the units from both pans, then split into equal groups.",
      missFeedback:
        "Keep the x-tiles on the pan \u2014 they are what you are solving for. Clear the units from both sides, then split.",
      notFlippedFeedback:
        "The comparator and the beam are pointing opposite ways. Nothing here needed a flip \u2014 adding, subtracting and splitting into groups all leave the tilt alone.",
    },
  },

  "tse-04-02": {
    step: "i1",
    expect: "mcq",
    widget: {
      type: "solveBalance",
      prompt:
        "Solve \u22122x + 5 > \u22123. Clear, split, then multiply both sides by \u22121 \u2014 and watch what the beam does to your comparator.",
      a: -2,
      b: 5,
      c: -3,
      relation: "gt",
      successFeedback:
        "x < 4. Multiplying both pans by \u22121 physically swapped which side was heavier, so the > had to become < to keep describing the beam. The flip is not a rule to remember \u2014 it is what you just watched happen.",
      unbalancedFeedback:
        "The sentence stopped being true, and not because of a sign flip \u2014 a tile moved on one pan only. Undo and make every move happen on both sides.",
      notIsolatedFeedback:
        "The sentence still tells the truth \u2014 the moves were legal. But x is not standing alone and positive yet. Keep going: clear, split, then turn the signs around.",
      missFeedback:
        "Keep the x-tiles \u2014 they are the thing being solved for. Clear the units from both pans, then split both sides into 2 groups.",
      notFlippedFeedback:
        "Look at the beam and then at the symbol: they disagree. Multiplying both pans by \u22121 made the heavier side the lighter one, so the sentence you are holding now says the opposite of what the balance shows. Flip the comparator and they agree again.",
    },
  },

  "tse-04-03": {
    step: "i1",
    expect: "mcq",
    widget: {
      type: "solveBalance",
      prompt:
        "You have $20 saved and add $5 a week, aiming for at least $50: 5x + 20 \u2265 50. Clear and split without breaking the sentence.",
      a: 5,
      b: 20,
      c: 50,
      relation: "ge",
      successFeedback:
        "x \u2265 6. Six weeks or more. The $20 came off both pans and both sides split into 5 \u2014 the beam leaned the same way throughout, so \u2265 never needed touching.",
      unbalancedFeedback:
        "The tilt reversed \u2014 the sentence is no longer true. The starting $20 came off one pan only, which describes a different savings plan. Undo and take it off both.",
      notIsolatedFeedback:
        "Still true \u2014 every move was legal. But the pan holds five weeks' saving, not one. Split both sides into 5 equal groups.",
      missFeedback:
        "The x-tiles are the weeks you are solving for \u2014 keep them. Clear the $20 from both pans, then split.",
      notFlippedFeedback:
        "The comparator no longer matches the beam. Nothing in this problem multiplies by a negative, so \u2265 should have stayed exactly as it was.",
    },
  },

  // ---- expression lessons: algebraTiles, not the balance (see CONVERSION_LOG) ----------------
  "tse-01-01": {
    step: "i1",
    expect: "mcq",
    widget: {
      type: "algebraTiles",
      prompt:
        "Build \u22123(x + 2) with tiles: three copies of the group (x + 2), every tile turned negative. Set the x-count and the constant to what you end up holding.",
      targetX: -3,
      targetConst: -6,
      maxTiles: 8,
      xStart: 0,
      constStart: 0,
      successFeedback:
        "\u22123x \u2212 6. Three copies of \u2212(x + 2): three negative x-tiles and three negative 2s. The \u22123 reached every tile inside the brackets, sign and all.",
      xFeedback:
        "Check the x-tiles. Three copies of the group means three x-tiles, and the \u22123 makes every one of them negative.",
      constFeedback:
        "Check the units. Each of the three copies carries a 2, and the minus reaches those as well \u2014 so it is \u22126, not \u22122 and not +6.",
    },
  },

  "tse-01-03": {
    step: "i1",
    expect: "mcq",
    widget: {
      type: "algebraTiles",
      prompt:
        "Build 3(x + 2) + 4x with tiles \u2014 open the group first, then bring in the 4x. Set the x-count and the constant to what you are holding.",
      targetX: 7,
      targetConst: 6,
      maxTiles: 8,
      xStart: 0,
      constStart: 0,
      successFeedback:
        "7x + 6. Opening 3(x + 2) put 3 x-tiles and 6 units on the table; the 4x joined the x-tiles and nothing joined the units.",
      xFeedback:
        "Check the x-tiles. Three come out of the brackets and four arrive from the 4x \u2014 they are the same kind of tile, so they stack together.",
      constFeedback:
        "Check the units. Three copies of 2 make 6, and the 4x has no units to contribute \u2014 an x-tile and a unit tile are different objects and never combine.",
    },
  },
};

let touched = 0;
for (const [lesson, plan] of Object.entries(PLAN)) {
  const path = `${DIR}/${lesson}.json`;
  const raw = readFileSync(path, "utf8");
  const doc = JSON.parse(raw);
  const step = doc.steps.find((s) => s.id === plan.step);
  if (!step) throw new Error(`${lesson}: step ${plan.step} not found`);
  if (step.widget?.type !== plan.expect)
    throw new Error(`${lesson}/${plan.step}: expected widget ${plan.expect}, found ${step.widget?.type}`);
  if (plan.predict && step.predict)
    throw new Error(`${lesson}/${plan.step}: already has a predict — refusing to overwrite authored content`);

  const bodyBefore = step.body;
  step.widget = plan.widget;
  if (plan.predict) {
    // Keep key order stable: predict sits before widget, as it does in every authored step.
    const rebuilt = {};
    for (const k of Object.keys(step)) {
      if (k === "widget") rebuilt.predict = plan.predict;
      rebuilt[k] = step[k];
    }
    if (!("predict" in rebuilt)) rebuilt.predict = plan.predict;
    for (const k of Object.keys(step)) delete step[k];
    Object.assign(step, rebuilt);
  }
  if (step.body !== bodyBefore) throw new Error(`${lesson}: body changed — aborting`);

  writeFileSync(path, JSON.stringify(doc, null, 2), "utf8");
  touched += 1;
  console.log(`${lesson}/${plan.step}: ${plan.expect} -> ${plan.widget.type}${plan.predict ? " (+predict)" : ""}`);
}
console.log(`\n${touched} lessons converted (expected 11)`);
if (touched !== 11) throw new Error("unexpected conversion count");
