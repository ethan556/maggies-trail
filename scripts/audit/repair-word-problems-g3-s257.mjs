import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CHECK = process.argv.includes("--check");
const COURSE = path.join(process.cwd(), "content", "courses", "word-problems-g3", "lessons");

const figures = {
  "g3w-01-01": ["mb-multistep", "two-step-bar"],
  "g3w-01-02": ["dop-grouping", "mult3-equal-groups"],
  "g3w-01-03": ["mb-multistep", "mult3-equal-groups"],
  "g3w-01-04": ["mult3-fair-shares", "bar-join"],
  "g3w-02-01": ["ee-variable", "mult3-missing-factor"],
  "g3w-02-02": ["dop-order-matters", "dop-word-expr"],
  "g3w-02-03": ["two-step-bar", "mb-multistep"],
  "g3w-02-04": ["mmt-estimate", "mmt-estimate-catch"],
  "g3w-03-01": ["pv3-round-ten", "mult3-estimate"],
  "g3w-03-02": ["mmt-estimate-catch", "mb-multistep"],
  "g3w-03-03": ["as100-keyword-trap", "mult3-equal-groups"],
  "g3w-03-04": ["dop-word-expr", "dop-grouping"],
};

const cmlPlans = {
  "g3w-01-01": ["Name the unstated middle quantity that the final question depends on, then solve in order.", "The hidden quantity must be found before it can be used in the final operation.", "Trying to answer the final question directly from the numbers that are stated."],
  "g3w-01-02": ["Increase the number of equal groups first, then multiply by the size of each group.", "A new full group changes the group count, so the addition belongs before multiplication.", "Adding one object after multiplying instead of adding one whole group."],
  "g3w-01-03": ["Build the equal-group total, then subtract one loss from the whole.", "A loss stated once is removed once from the completed total, not from every group.", "Subtracting the single loss inside each equal group."],
  "g3w-01-04": ["Divide to find one equal share, then add the amount that joins each share.", "When the same amount joins every share, it is added to the size of one share after division.", "Adding to the total before sharing, even though the story adds to each group afterward."],
  "g3w-02-01": ["Use a letter as a placeholder and find its value from the equal-group relationship.", "The letter represents one unknown quantity consistently throughout the equation.", "Treating the letter as a label instead of the number that makes the equation true."],
  "g3w-02-02": ["Translate the story into an equation whose grouping records which step happens first.", "Parentheses preserve the story's order and can change which quantity is adjusted.", "Using the right numbers and operations in an order that tells a different story."],
  "g3w-02-03": ["Build equal bar parts for the groups and place a one-time adjustment at the end of the whole.", "A mark at the end changes the completed total once; a mark inside every part changes every group.", "Drawing a one-time loss inside each equal part."],
  "g3w-02-04": ["Round to friendly numbers, keep both operations, and calculate a useful estimate.", "A useful estimate preserves the operation order while replacing values with nearby friendly numbers.", "Estimating only the first step or changing multiplication into addition."],
  "g3w-03-01": ["Compare an exact answer with a rounded estimate to decide whether it is plausible.", "An exact answer can differ from its estimate and still be reasonable when the difference is small.", "Rejecting a correct exact answer because it does not equal the rounded estimate."],
  "g3w-03-02": ["Use the story's maximum or direction of change to reject an impossible answer.", "Subtracting from a built total cannot produce a result larger than that total.", "Checking only digit patterns instead of the quantities the story allows."],
  "g3w-03-03": ["Read the question first and select only the quantities needed to answer it.", "A number can be true in the story yet irrelevant to the relationship the question asks about.", "Using every number merely because it appears in the story."],
  "g3w-03-04": ["Create or select a story whose sequence of actions matches a given two-step expression.", "The location of an adjustment—once on the total or inside every group—determines the grouping.", "Writing a story with the right numbers but operations or grouping that tell a different sequence."],
};

const i1Plans = {
  "g3w-01-01": { type: "estimateSlider", prompt: "Four boxes hold 6 pencils each before 5 are given away. Select the hidden box total needed first.", min: 12, max: 36, start: 19, target: 24, acceptFactor: 1.1, unitLabel: "pencils", ticks: [12, 24, 36], choices: [
    { value: 19, label: "19 pencils", correct: false, feedback: "That is the final amount after giving away 5, not the hidden total needed first." },
    { value: 24, label: "24 pencils", correct: true, feedback: "Correct — four groups of six make the hidden total 24 before anything is given away." },
    { value: 29, label: "29 pencils", correct: false, feedback: "That adds the 5 even though the story gives pencils away after the total is built." },
  ], lowFeedback: "The hidden total must include all four groups of six.", highFeedback: "Four groups of six cannot make more than 24 pencils.", successFeedback: "24 pencils — the unstated total required before subtracting 5." },
  "g3w-02-04": { type: "estimateSlider", prompt: "Estimate 7 × 48 − 96 by using 50 and 100. Select the rounded result.", min: 150, max: 350, start: 150, target: 250, acceptFactor: 1.1, unitLabel: "apples", ticks: [150, 250, 350], choices: [
    { value: 150, label: "About 150 apples", correct: false, feedback: "That removes too much: seven groups of about 50 make 350 before about 100 are removed." },
    { value: 250, label: "About 250 apples", correct: true, feedback: "Correct — 7 × 50 − 100 = 250." },
    { value: 350, label: "About 350 apples", correct: false, feedback: "That stops after the product and omits the subtraction of about 100." },
  ], lowFeedback: "Keep both steps: first build about 350, then remove about 100.", highFeedback: "The estimate must be below the starting product of about 350.", successFeedback: "About 250 apples — the useful rounded estimate, distinct from the exact answer 240." },
  "g3w-03-01": { type: "estimateSlider", prompt: "Check 6 × 39 + 21 = 255. Select the estimate from 6 × 40 + 20.", min: 220, max: 300, start: 220, target: 260, acceptFactor: 1.1, unitLabel: "items", ticks: [220, 260, 300], choices: [
    { value: 220, label: "About 220", correct: false, feedback: "Six groups of about 40 already make about 240 before 20 is added." },
    { value: 260, label: "About 260", correct: true, feedback: "Correct — 6 × 40 + 20 = 260, close to the exact answer 255." },
    { value: 300, label: "About 300", correct: false, feedback: "That is too high for 240 plus about 20." },
  ], lowFeedback: "Use the complete rounded chain: 6 × 40 + 20.", highFeedback: "The rounded product is 240 and only about 20 more is added.", successFeedback: "About 260 — close enough to 255 to support its reasonableness." },
  "g3w-03-03": { type: "tapDiagram", prompt: "Sam has 3 red bags and 4 blue bags. Each blue bag holds 6 marbles. Tap only the numbers needed to find the blue marbles.", mode: "selectAll", canvas: { w: 3, h: 1 }, hotspots: [
    { id: "n3", x: 17, y: 50, label: "3 red bags", icon: "3️⃣", count: 1, feedback: "The question asks only about blue bags, so the red-bag count is extra information." },
    { id: "n4", x: 50, y: 50, label: "4 blue bags", icon: "4️⃣", count: 1, correct: true },
    { id: "n6", x: 83, y: 50, label: "6 marbles per blue bag", icon: "6️⃣", count: 1, correct: true },
  ], missFeedback: "Choose the number of blue bags and the marbles in each blue bag; leave out the red-bag count.", successFeedback: "Correct — 4 and 6 answer the blue-marble question; 3 is true but irrelevant." },
};

const i2Plans = {
  "g3w-01-01": { type: "estimateSlider", prompt: "Three bags hold 7 counters each before 4 are removed. Select the different hidden total needed first.", min: 10, max: 32, start: 17, target: 21, acceptFactor: 1.1, unitLabel: "counters", ticks: [10, 21, 32], choices: [
    { value: 17, label: "17 counters", correct: false, feedback: "That is the amount left after removal, not the hidden total needed first." },
    { value: 21, label: "21 counters", correct: true, feedback: "Correct — three groups of seven make the hidden total 21." },
    { value: 25, label: "25 counters", correct: false, feedback: "That adds the four counters instead of removing them later." },
  ], lowFeedback: "Build all three groups of seven before the removal.", highFeedback: "Three groups of seven make exactly 21.", successFeedback: "21 counters — now the later subtraction can use the hidden total." },
  "g3w-01-02": { type: "numberLineHop", prompt: "Three carts are joined by two more carts. Each cart carries 6 boxes. Hop the five equal groups.", min: 0, max: 42, start: 0, hop: 6, hops: 5, direction: "forward", commonLandings: [
    { value: 18, feedback: "That counts only the original three carts; include the two carts that joined." },
    { value: 20, feedback: "That multiplies the original cart count by the combined count instead of using six boxes per cart." },
  ], missFeedback: "The cart count changes first: 3 + 2 = 5, then five hops of 6 reach 30.", successFeedback: "30 boxes — five complete groups of six." },
  "g3w-01-03": { type: "barBuilder", prompt: "Build a new starting total: 6 shelves with 5 books on each shelf, before 8 books are removed.", categories: ["Shelf 1", "Shelf 2", "Shelf 3", "Shelf 4", "Shelf 5", "Shelf 6"], target: [5, 5, 5, 5, 5, 5], maxVal: 7, step: 1, successFeedback: "30 books — the equal-group total before one loss of 8.", partialFeedback: "Make all six shelf bars equal to 5 before removing anything.", display: "bar", histogram: false },
  "g3w-01-04": { type: "barBuilder", prompt: "Share 24 counters into 4 teams, then add 1 counter to each team. Build the final teams.", categories: ["Team 1", "Team 2", "Team 3", "Team 4"], target: [7, 7, 7, 7], maxVal: 9, step: 1, successFeedback: "7 per team — six from the fair share, then one added to each team.", partialFeedback: "First share 24 into four groups of six, then add one to every group.", display: "bar", histogram: false },
  "g3w-02-01": { type: "numberLineHop", prompt: "Six bags hold n counters each and 48 in total. Hop six equal groups to reveal n.", min: 0, max: 56, start: 0, hop: 8, hops: 6, direction: "forward", commonLandings: [
    { value: 42, feedback: "Six hops of 7 reach only 42, so n must be larger." },
    { value: 54, feedback: "Six hops of 9 overshoot 48, so n must be smaller." },
  ], missFeedback: "Six equal hops of 8 land on 48, so n equals 8.", successFeedback: "48 — six groups of 8, so the placeholder n is 8." },
  "g3w-02-02": { type: "numberLinePlace", prompt: "Place where (4 × 6) + 5 lands; the added five joins the whole once.", min: 0, max: 48, step: 1, tickStep: 6, target: 29, start: 0, commonPlacements: [
    { value: 24, feedback: "That is the product before the five join the whole." },
    { value: 44, feedback: "That is 4 × (6 + 5), which adds five inside every group." },
    { value: 15, feedback: "That adds the three written numbers without building equal groups." },
  ], successFeedback: "29 — four groups of six make 24, then five join once.", lowFeedback: "Build 24 first and then add five once.", highFeedback: "Do not add five inside each of the four groups." },
  "g3w-02-03": { type: "barBuilder", prompt: "Build a second model: 5 equal parts of 6, before 9 are crossed off the end.", categories: ["Part 1", "Part 2", "Part 3", "Part 4", "Part 5"], target: [6, 6, 6, 6, 6], maxVal: 8, step: 1, successFeedback: "30 in five equal parts — now one end adjustment of 9 can be removed.", partialFeedback: "Every part has the same size; build each bar to 6.", display: "bar", histogram: false },
  "g3w-02-04": { type: "estimateSlider", prompt: "Try a second rounded chain: use 40 and 40 for 6 × 39 − 42. Choose its estimate.", min: 120, max: 280, start: 160, target: 200, acceptFactor: 1.1, unitLabel: "items", ticks: [120, 200, 280], choices: [
    { value: 160, label: "About 160", correct: false, feedback: "That removes two groups of forty; the story removes only one 40 after building 240." },
    { value: 200, label: "About 200", correct: true, feedback: "Correct — 6 × 40 − 40 = 200." },
    { value: 240, label: "About 240", correct: false, feedback: "That stops after multiplication and omits the subtraction." },
  ], lowFeedback: "Build about 240, then remove about 40.", highFeedback: "The subtraction must make the result less than about 240.", successFeedback: "About 200 — the rounded two-step estimate." },
  "g3w-03-01": { type: "estimateSlider", prompt: "A student gets 311 for 5 × 58 + 21. Select the check from 5 × 60 + 20.", min: 260, max: 360, start: 280, target: 320, acceptFactor: 1.1, unitLabel: "items", ticks: [260, 320, 360], choices: [
    { value: 280, label: "About 280", correct: false, feedback: "That is too low: five groups of about 60 already make about 300." },
    { value: 320, label: "About 320", correct: true, feedback: "Correct — 5 × 60 + 20 = 320, close to 311." },
    { value: 360, label: "About 360", correct: false, feedback: "Only about 20 joins the rounded product of 300." },
  ], lowFeedback: "Use all of 5 × 60 before adding about 20.", highFeedback: "The rounded chain totals about 320, not 360.", successFeedback: "About 320 — close enough to 311 to support its reasonableness." },
  "g3w-03-02": { type: "numberLinePlace", prompt: "Six shelves hold 8 books each and 7 are borrowed. Place the reasonable result.", min: 0, max: 60, step: 1, tickStep: 6, target: 41, start: 0, commonPlacements: [
    { value: 48, feedback: "That is the starting total before seven books are borrowed." },
    { value: 55, feedback: "Borrowing cannot increase the starting total of 48." },
    { value: 7, feedback: "That is the number borrowed, not the number remaining." },
  ], successFeedback: "41 — the result is below the starting total of 48, as the story requires.", lowFeedback: "Only seven are removed from 48, so the result should remain near 48.", highFeedback: "Borrowing books must leave fewer than the starting total of 48." },
  "g3w-03-03": { type: "tapDiagram", prompt: "A coach has 5 soccer balls and 3 bins with 8 cones in each bin. Tap only the numbers needed to find the cones.", mode: "selectAll", canvas: { w: 3, h: 1 }, hotspots: [
    { id: "n5", x: 17, y: 50, label: "5 soccer balls", icon: "5️⃣", count: 1, feedback: "The question asks for cones, so the soccer-ball count is extra information." },
    { id: "n3", x: 50, y: 50, label: "3 cone bins", icon: "3️⃣", count: 1, correct: true },
    { id: "n8", x: 83, y: 50, label: "8 cones per bin", icon: "8️⃣", count: 1, correct: true },
  ], missFeedback: "Choose the number of cone bins and cones per bin; leave out the soccer balls.", successFeedback: "Correct — 3 and 8 determine the cone total; 5 is extra information." },
  "g3w-03-04": { type: "numberLinePlace", prompt: "Place where (4 × 7) − 5 lands; use this equation to imagine a matching story.", min: 0, max: 36, step: 1, tickStep: 4, target: 23, start: 0, commonPlacements: [
    { value: 28, feedback: "That is the four equal groups before five are removed." },
    { value: 8, feedback: "That is 4 × (7 − 5), which removes five from every group." },
    { value: 33, feedback: "That adds five even though the expression subtracts it." },
  ], successFeedback: "23 — four groups of seven make 28, then five are removed once.", lowFeedback: "The one-time loss comes from the product 28, not from every group.", highFeedback: "The final operation removes five, so the result must be below 28." },
};

const specialSteps = {
  "g3w-01-01": {
    k3: { type: "mcq", prompt: "In a new story, 5 packs hold 8 cards each and 6 cards are used. Which hidden question must be answered first?", options: [
      { id: "o0", label: "How many cards are in the 5 packs?", correct: true, feedback: "Correct — the total in the packs must be known before six can be removed." },
      { id: "o1", label: "How many cards are used?", correct: false, feedback: "The story already gives that amount as six." },
      { id: "o2", label: "How many packs are there?", correct: false, feedback: "The story already gives five packs." },
      { id: "o3", label: "How many cards remain?", correct: false, feedback: "That is the final question, which depends on the hidden pack total." },
    ] },
    ch1: { type: "numeric", prompt: "Six trays hold 7 muffins each, then 9 muffins are sold. How many remain?", answer: 33, tolerance: 0, unit: "muffins", commonErrors: [{ value: 42, feedback: "That is the hidden tray total before the nine sold muffins are removed." }, { value: 51, feedback: "Selling muffins subtracts nine; it does not add nine." }], fallbackFeedback: "First find the unstated tray total, then subtract the amount sold.", successFeedback: "Correct — 33 muffins remain." },
  },
  "g3w-01-02": {
    k2: { type: "mcq", prompt: "Two buses wait, then 3 more arrive. Each bus carries 6 students. Which expression matches?", options: [
      { id: "o0", label: "(2 + 3) × 6", correct: true, feedback: "Correct — the bus count changes first, then every bus carries six." },
      { id: "o1", label: "2 + (3 × 6)", correct: false, feedback: "That treats the original two buses as two students rather than full groups." },
      { id: "o2", label: "2 × 6 + 3", correct: false, feedback: "The three arrivals are buses, so each arrival brings a full group of six." },
      { id: "o3", label: "(2 + 3) + 6", correct: false, feedback: "Five equal groups of six require multiplication." },
    ] },
    k3: { type: "numeric", prompt: "Two vans wait and 3 more arrive. Each van carries 6 hikers. How many hikers are there?", answer: 30, tolerance: 0, unit: "hikers", commonErrors: [{ value: 15, feedback: "That adds five and six instead of multiplying five equal groups." }, { value: 12, feedback: "That counts only the original two vans." }], fallbackFeedback: "Combine the van counts first, then multiply by six hikers per van.", successFeedback: "Correct — 30 hikers." },
    ch1: { type: "numeric", prompt: "Six teams enter and 2 more join. Each team has 4 players. How many players compete?", answer: 32, tolerance: 0, unit: "players", commonErrors: [{ value: 14, feedback: "That adds the combined team count to the group size." }, { value: 24, feedback: "That omits the two teams that joined." }], fallbackFeedback: "Find the new team count, then multiply by four players per team.", successFeedback: "Correct — 32 players." },
  },
  "g3w-01-03": {
    k3: { type: "numeric", prompt: "Use multiply, then subtract in this compact case: 6 shelves hold 4 markers each and students take 21. How many remain?", answer: 3, tolerance: 0, unit: "markers", commonErrors: [{ value: 45, feedback: "That adds the loss instead of subtracting it from the shelf total." }, { value: 24, feedback: "That stops at the shelf total before the students take 21." }], fallbackFeedback: "Build six groups of four, then subtract the one loss of 21.", successFeedback: "Correct — 3 markers remain." },
    k2: { type: "mcq", prompt: "Seven baskets hold 5 oranges each and 9 oranges are used. Which equation gives what remains?", options: [
      { id: "o0", label: "(7 × 5) − 9", correct: true, feedback: "Correct — build 35, then remove the one loss of nine." },
      { id: "o1", label: "7 × (5 − 9)", correct: false, feedback: "That removes nine from every basket and also creates a negative group size." },
      { id: "o2", label: "7 + 5 − 9", correct: false, feedback: "Seven equal groups of five combine by multiplication." },
      { id: "o3", label: "(7 × 5) + 9", correct: false, feedback: "Used oranges leave the total, so the final operation is subtraction." },
    ] },
    ch1: { type: "numeric", prompt: "Eight racks hold 5 helmets each. Thirteen helmets are borrowed. How many remain?", answer: 27, tolerance: 0, unit: "helmets", commonErrors: [{ value: 40, feedback: "That is the rack total before the borrowed helmets leave." }, { value: 53, feedback: "Borrowing decreases the total; it does not add thirteen." }], fallbackFeedback: "Multiply to build the rack total, then subtract the one borrowed amount.", successFeedback: "Correct — 27 helmets remain." },
  },
  "g3w-01-04": {
    k1: { type: "numeric", prompt: "Twenty-four counters are shared among 6 teams, then each team gets 3 more. How many counters does each team have?", answer: 7, tolerance: 0, unit: "counters", commonErrors: [{ value: 27, feedback: "That adds three to the total before sharing instead of to each team afterward." }, { value: 4, feedback: "That stops after the fair share and omits the three added to each team." }], fallbackFeedback: "Divide to find one team's share, then add three to that share.", successFeedback: "Correct — 7 counters per team." },
    k3: { type: "numeric", prompt: "Thirty-five stickers are shared among 5 students, then each student gets 2 more. How many does each student have?", answer: 9, tolerance: 0, unit: "stickers", commonErrors: [{ value: 7, feedback: "That stops after sharing and omits the two added to each student." }, { value: 37, feedback: "That adds to the whole instead of finding one student's final share." }], fallbackFeedback: "Share first, then add two to one student's share.", successFeedback: "Correct — 9 stickers each." },
    ch1: { type: "numeric", prompt: "Thirty-two markers are shared among 4 tables, then each table receives 1 more. How many markers per table?", answer: 9, tolerance: 0, unit: "markers", commonErrors: [{ value: 8, feedback: "That stops after dividing and omits the extra marker per table." }, { value: 33, feedback: "The question asks for one table's share, not the new whole." }], fallbackFeedback: "Divide 32 by four, then add one to the share.", successFeedback: "Correct — 9 markers per table." },
  },
  "g3w-02-01": {
    k2: { type: "numeric", prompt: "Four equal groups contain 28 counters. What value does n have in 4 × n = 28?", answer: 7, tolerance: 0, unit: "counters", commonErrors: [{ value: 24, feedback: "Subtracting four does not undo four equal groups; divide 28 by four." }, { value: 28, feedback: "Twenty-eight is the whole, while n is one group size." }], fallbackFeedback: "Find the factor that pairs with four to make 28.", successFeedback: "Correct — n = 7." },
    ch1: { type: "numeric", prompt: "A fact family says 7 × n = 42. Use division to find n.", answer: 6, tolerance: 0, unit: "", commonErrors: [{ value: 35, feedback: "Subtraction does not undo multiplication here; use 42 ÷ 7." }, { value: 42, feedback: "That is the product, not the missing factor." }], fallbackFeedback: "Divide the product by the known factor.", successFeedback: "Correct — n = 6." },
  },
  "g3w-02-02": {
    k3: { type: "mcq", prompt: "Which story matches 6 × (5 − 2), rather than (6 × 5) − 2?", options: [
      { id: "o0", label: "Six boxes each lose 2 from their 5 pencils", correct: true, feedback: "Correct — the loss happens inside every one of the six equal groups." },
      { id: "o1", label: "Six boxes hold 5 pencils each, then 2 pencils are lost in all", correct: false, feedback: "That is (6 × 5) − 2 because the loss happens once to the total." },
      { id: "o2", label: "Six pencils join 5 pencils, then 2 are lost", correct: false, feedback: "That story starts with addition, not six equal groups." },
      { id: "o3", label: "Thirty pencils are shared among 2 boxes", correct: false, feedback: "That story uses division and does not match the expression." },
    ] },
    ch1: { type: "numeric", prompt: "Evaluate (3 + 2) × 8 for a story where two groups join three groups before filling them.", answer: 40, tolerance: 0, unit: "items", commonErrors: [{ value: 19, feedback: "That multiplies only two by eight; the group counts must combine first." }, { value: 13, feedback: "Five equal groups of eight require multiplication, not addition." }], fallbackFeedback: "Evaluate inside the parentheses first, then multiply.", successFeedback: "Correct — 40 items." },
  },
  "g3w-02-03": {
    k3: { type: "mcq", prompt: "A bar has 4 equal parts of 7, and 2 is crossed off inside every part. Which expression matches?", options: [
      { id: "o0", label: "4 × (7 − 2)", correct: true, feedback: "Correct — the crossing occurs inside each part, so each group changes before multiplication." },
      { id: "o1", label: "(4 × 7) − 2", correct: false, feedback: "That removes two only once from the end of the whole bar." },
      { id: "o2", label: "4 + 7 − 2", correct: false, feedback: "Four equal parts of seven combine by multiplication." },
      { id: "o3", label: "4 × (7 + 2)", correct: false, feedback: "Crossed-off pieces are removed, not added." },
    ] },
    ch1: { type: "numeric", prompt: "Six equal bars hold 8 tiles each, with 17 crossed off the end of the whole. How many tiles remain?", answer: 31, tolerance: 0, unit: "tiles", commonErrors: [{ value: 48, feedback: "That is the complete bar before the end adjustment." }, { value: 102, feedback: "That applies seventeen to every part instead of once to the whole." }], fallbackFeedback: "Build six equal parts, then subtract the end adjustment once.", successFeedback: "Correct — 31 tiles remain." },
  },
  "g3w-02-04": {
    k2: { type: "numeric", prompt: "Use 5 × 60 − 100 to estimate 5 × 58 − 97. What is the estimate?", answer: 200, tolerance: 0, unit: "", commonErrors: [{ value: 300, feedback: "That stops after the rounded product and omits the subtraction." }, { value: 400, feedback: "That adds the rounded adjustment instead of subtracting it." }], fallbackFeedback: "Keep both operations in the rounded chain.", successFeedback: "Correct — the estimate is 200." },
    k3: { type: "mcq", prompt: "Which is the most useful estimate for 8 × 31 + 19?", options: [
      { id: "o0", label: "8 × 30 + 20 = 260", correct: true, feedback: "Correct — friendly nearby numbers preserve both operations." },
      { id: "o1", label: "8 × 30 = 240", correct: false, feedback: "That estimates only the product and drops the addition." },
      { id: "o2", label: "8 + 30 + 20 = 58", correct: false, feedback: "The equal groups still require multiplication." },
      { id: "o3", label: "8 × 40 + 20 = 340", correct: false, feedback: "Forty is not the nearest friendly ten to 31; it makes an unnecessarily loose estimate." },
    ] },
    ch1: { type: "numeric", prompt: "Now compute the exact value of 7 × 48 − 96 and compare it with the estimate 250.", answer: 240, tolerance: 0, unit: "", commonErrors: [{ value: 250, feedback: "That is the estimate, not the exact value requested." }, { value: 336, feedback: "That stops after multiplication and omits subtracting 96." }], fallbackFeedback: "Calculate the product exactly, then subtract 96.", successFeedback: "Correct — 240 is close to the estimate 250." },
  },
  "g3w-03-01": {
    k2: { type: "numeric", prompt: "Round 8 × 49 − 18 to 8 × 50 − 20. What checking estimate do you get?", answer: 380, tolerance: 0, unit: "", commonErrors: [{ value: 400, feedback: "That stops after the rounded product and omits the subtraction." }, { value: 420, feedback: "The rounded adjustment is subtracted, not added." }], fallbackFeedback: "Keep the subtraction after calculating the rounded product.", successFeedback: "Correct — the checking estimate is 380." },
    k3: { type: "mcq", prompt: "The exact value of 8 × 49 − 10 is 382, and a nearby estimate is 8 × 50 − 20 = 380. What follows?", options: [
      { id: "o0", label: "382 is reasonable because it is close to 380", correct: true, feedback: "Correct — the exact result lies in the estimate's neighborhood." },
      { id: "o1", label: "382 is wrong because it is not exactly 380", correct: false, feedback: "An estimate is a check, not an exact target." },
      { id: "o2", label: "380 must be the exact answer", correct: false, feedback: "The rounded numbers create an estimate, not the original expression's exact value." },
      { id: "o3", label: "No comparison is possible", correct: false, feedback: "Their closeness is useful evidence that the exact answer is plausible." },
    ] },
    ch1: { type: "numeric", prompt: "Compute the exact result used in the opening check: 6 × 39 + 21.", answer: 255, tolerance: 0, unit: "", commonErrors: [{ value: 260, feedback: "That is the rounded estimate, not the exact calculation." }, { value: 234, feedback: "That stops after the product and omits adding 21." }], fallbackFeedback: "Multiply exactly first, then add 21.", successFeedback: "Correct — 255 is close to the estimate 260." },
  },
  "g3w-03-02": {
    k3: { type: "mcq", prompt: "Five boxes hold 7 pencils each and 6 pencils are given away. Why is an answer of 80 impossible?", options: [
      { id: "o0", label: "The boxes begin with only 35 pencils, and giving away lowers that total", correct: true, feedback: "Correct — the result must be below the maximum of 35." },
      { id: "o1", label: "Eighty is even", correct: false, feedback: "Parity does not decide reasonableness in this story." },
      { id: "o2", label: "Eighty is not a multiple of 7", correct: false, feedback: "After subtraction, the result need not stay a multiple of seven." },
      { id: "o3", label: "Eighty is possible", correct: false, feedback: "The story never has more than 35 pencils." },
    ] },
    ch1: { type: "mcq", prompt: "Four trays hold 8 muffins each and 5 are sold. Which proposed answer can be rejected without exact arithmetic?", options: [
      { id: "o0", label: "60 muffins", correct: true, feedback: "Correct — the trays hold only 32 before any are sold." },
      { id: "o1", label: "27 muffins", correct: false, feedback: "That is exactly plausible: 32 minus 5." },
      { id: "o2", label: "A number below 32", correct: false, feedback: "Selling muffins should leave a number below the starting total." },
      { id: "o3", label: "About 30 muffins", correct: false, feedback: "That is a reasonable rough description of the result." },
    ] },
  },
  "g3w-03-03": {
    k2: { type: "numeric", prompt: "Sam has 3 red bags and 4 blue bags with 6 marbles in each blue bag. How many blue marbles are there?", answer: 24, tolerance: 0, unit: "marbles", commonErrors: [{ value: 42, feedback: "That uses the extra red-bag count as though all seven bags were blue." }, { value: 13, feedback: "The needed blue-bag quantities form four equal groups of six." }], fallbackFeedback: "Ignore the red-bag count and multiply four blue bags by six marbles each.", successFeedback: "Correct — 24 blue marbles." },
    k3: { type: "mcq", prompt: "A shelf has 2 red bins and 5 green bins with 7 blocks in each green bin. Which number is extra when finding green blocks?", options: [
      { id: "o0", label: "The 2 red bins", correct: true, feedback: "Correct — the question concerns only the green bins." },
      { id: "o1", label: "The 5 green bins", correct: false, feedback: "That quantity is one of the two factors needed for the product." },
      { id: "o2", label: "The 7 blocks per green bin", correct: false, feedback: "That is the needed group size." },
      { id: "o3", label: "No number is extra", correct: false, feedback: "The red-bin count is true but irrelevant to the green-block total." },
    ] },
    ch1: { type: "numeric", prompt: "A library has 9 shelves and 6 display stands. Each shelf holds 8 books. How many books are on the shelves?", answer: 72, tolerance: 0, unit: "books", commonErrors: [{ value: 120, feedback: "That treats the six display stands as six more shelves." }, { value: 23, feedback: "Nine shelves of eight require multiplication; the stand count is extra." }], fallbackFeedback: "Use only the number of shelves and books per shelf.", successFeedback: "Correct — 72 shelf books." },
  },
  "g3w-03-04": {
    k3: { type: "mcq", prompt: "Which story is answered by 3 × (8 + 2)?", options: [
      { id: "o0", label: "Three baskets hold 8 apples each, then 2 apples are added to every basket", correct: true, feedback: "Correct — each group changes before the three groups are combined." },
      { id: "o1", label: "Three baskets hold 8 apples each, then 2 apples join the whole", correct: false, feedback: "That is (3 × 8) + 2 because two join only once." },
      { id: "o2", label: "Three apples, eight apples, and two apples are combined", correct: false, feedback: "That is simple addition with no equal groups." },
      { id: "o3", label: "Eight apples are shared among 2 baskets after 3 are eaten", correct: false, feedback: "That story uses subtraction and division." },
    ] },
    ch1: { type: "numeric", prompt: "Write the matching calculation for 7 boxes of 5 markers, then 6 markers added once. How many markers?", answer: 41, tolerance: 0, unit: "markers", commonErrors: [{ value: 77, feedback: "That adds six inside every box: 7 × (5 + 6)." }, { value: 18, feedback: "That adds the three numbers without forming equal groups." }], fallbackFeedback: "Multiply the equal groups first, then add six once.", successFeedback: "Correct — 41 markers." },
  },
};

const remedialWidgets = {
  "g3w-01-01": { type: "mcq", prompt: "Four cartons hold 5 bottles each and 3 bottles spill. Which hidden quantity comes first?", options: [{ id: "o0", label: "The 20 bottles in all four cartons", correct: true, feedback: "Correct — the carton total is needed before subtracting the spill." }, { id: "o1", label: "The 3 spilled bottles", correct: false, feedback: "The story already states the spilled amount; it is not hidden." }, { id: "o2", label: "The 4 cartons", correct: false, feedback: "The story already states the carton count; it is not hidden." }, { id: "o3", label: "The bottles left", correct: false, feedback: "That is the final result, not the hidden middle quantity." }] },
  "g3w-01-02": { type: "numeric", prompt: "Three carts wait and 1 more joins. Each cart holds 6 bins. How many bins?", answer: 24, tolerance: 0, unit: "bins", commonErrors: [{ value: 10, feedback: "Four equal groups of six require multiplication." }, { value: 18, feedback: "That omits the cart that joined." }], fallbackFeedback: "Combine the cart counts before multiplying.", successFeedback: "Correct — 24 bins." },
  "g3w-01-03": { type: "numeric", prompt: "Five racks hold 8 balls each and 9 are taken. How many remain?", answer: 31, tolerance: 0, unit: "balls", commonErrors: [{ value: 40, feedback: "That omits the one loss of nine." }, { value: 49, feedback: "Taking balls subtracts nine." }], fallbackFeedback: "Build the total, then subtract once.", successFeedback: "Correct — 31 balls." },
  "g3w-01-04": { type: "numeric", prompt: "Twenty-seven cards are shared among 3 players, then each gets 2 more. How many each?", answer: 11, tolerance: 0, unit: "cards", commonErrors: [{ value: 9, feedback: "That stops after sharing." }, { value: 29, feedback: "The question asks for one player's share." }], fallbackFeedback: "Divide first, then add to each share.", successFeedback: "Correct — 11 cards each." },
  "g3w-02-01": { type: "numeric", prompt: "In 7 × n = 42, what number does n represent?", answer: 6, tolerance: 0, unit: "", commonErrors: [{ value: 35, feedback: "Use division to undo multiplication." }, { value: 42, feedback: "That is the whole, not one group." }], fallbackFeedback: "Compute 42 divided by seven.", successFeedback: "Correct — n = 6." },
  "g3w-02-02": { type: "mcq", prompt: "Four boxes hold 6 pencils each, then 5 pencils are donated. Which equation matches?", options: [{ id: "o0", label: "(4 × 6) − 5", correct: true, feedback: "Correct — build the total, then subtract once." }, { id: "o1", label: "4 × (6 − 5)", correct: false, feedback: "That removes five from every box." }, { id: "o2", label: "4 + 6 − 5", correct: false, feedback: "Equal groups require multiplication." }, { id: "o3", label: "(4 × 6) + 5", correct: false, feedback: "Donated pencils leave the total." }] },
  "g3w-02-03": { type: "mcq", prompt: "A model has 3 equal bars of 8 and 5 crossed off the end. What remains?", options: [{ id: "o0", label: "(3 × 8) − 5 = 19", correct: true, feedback: "Correct — the end adjustment happens once." }, { id: "o1", label: "3 × (8 − 5) = 9", correct: false, feedback: "That crosses five off every bar." }, { id: "o2", label: "3 + 8 − 5 = 6", correct: false, feedback: "Equal bars combine by multiplication." }, { id: "o3", label: "(3 × 8) + 5 = 29", correct: false, feedback: "Crossed off means subtract." }] },
  "g3w-02-04": { type: "mcq", prompt: "Which is a useful estimate for 4 × 62 + 18?", options: [{ id: "o0", label: "4 × 60 + 20 = 260", correct: true, feedback: "Correct — nearby friendly values preserve both steps." }, { id: "o1", label: "4 × 60 = 240", correct: false, feedback: "That stops after the product and omits the final addition." }, { id: "o2", label: "4 + 60 + 20 = 84", correct: false, feedback: "The equal groups still multiply." }, { id: "o3", label: "4 × 70 + 20 = 300", correct: false, feedback: "Seventy is not the nearest ten to 62." }] },
  "g3w-03-01": { type: "mcq", prompt: "A result is 197 and its rounded estimate is 190. What does the check show?", options: [{ id: "o0", label: "197 is reasonable because it is close to 190", correct: true, feedback: "Correct — estimates check neighborhoods, not exact equality." }, { id: "o1", label: "197 must be wrong", correct: false, feedback: "Exact results normally differ slightly from estimates." }, { id: "o2", label: "190 is the exact result", correct: false, feedback: "The rounded calculation is only an estimate." }, { id: "o3", label: "The numbers cannot be compared", correct: false, feedback: "Their closeness is the evidence used by the check." }] },
  "g3w-03-02": { type: "mcq", prompt: "Seven bags hold 6 beads each and 4 are used. Why is 70 beads left impossible?", options: [{ id: "o0", label: "The bags begin with only 42 beads", correct: true, feedback: "Correct — using beads can only lower 42." }, { id: "o1", label: "Seventy is even", correct: false, feedback: "Evenness does not test whether the answer fits this story." }, { id: "o2", label: "Seventy ends in zero", correct: false, feedback: "The last digit does not test this story's maximum." }, { id: "o3", label: "Seventy is possible", correct: false, feedback: "It exceeds every bead the story starts with." }] },
  "g3w-03-03": { type: "mcq", prompt: "Two red trays and 6 blue trays hold 4 cups per blue tray. Which number is extra for blue cups?", options: [{ id: "o0", label: "The 2 red trays", correct: true, feedback: "Correct — only the blue trays answer the question." }, { id: "o1", label: "The 6 blue trays", correct: false, feedback: "That quantity is one of the two factors needed for the product." }, { id: "o2", label: "The 4 cups per blue tray", correct: false, feedback: "That is the needed group size." }, { id: "o3", label: "No number", correct: false, feedback: "The red-tray count is extra." }] },
  "g3w-03-04": { type: "mcq", prompt: "Which story matches (4 × 6) − 5?", options: [{ id: "o0", label: "Four bags hold 6 tokens each, then 5 tokens are removed", correct: true, feedback: "Correct — equal groups first, one removal second." }, { id: "o1", label: "Four bags each lose 5 of their 6 tokens", correct: false, feedback: "That removes five inside every group, which is 4 × (6 − 5)." }, { id: "o2", label: "Four, six, and five tokens join", correct: false, feedback: "That story uses only addition and never forms four equal groups." }, { id: "o3", label: "Twenty-four tokens gain 5 more", correct: false, feedback: "That adds rather than subtracts." }] },
};

const numericContracts = {
  "g3w-01-01/k2": ["The hidden total is 7 vans with 4 hikers in each van. How many hikers is that?", 28, "hikers"],
  "g3w-01-01/ch1": ["A stand has 42 muffins, sells 12, then bakes 3 more. How many muffins are there now?", 33, "muffins"],
  "g3w-01-02/k1": ["After the new crate arrives, there are 5 crates with 5 apples each. How many apples?", 25, "apples"],
  "g3w-01-02/k3": ["After all arrivals, there are 5 vans with 6 hikers each. How many hikers?", 30, "hikers"],
  "g3w-01-02/ch1": ["The group count is now 8 and every team has 4 players. To finish, what is 8 × 4?", 32, "players"],
  "g3w-01-03/k1": ["The hidden shelf total is 54 markers. Students take 11 and return 0. How many remain?", 43, "markers"],
  "g3w-01-03/k3": ["In a compact retrieval case, the hidden total is 24 markers. Students take 21 and return 0. How many remain?", 3, "markers"],
  "g3w-01-03/ch1": ["Before any helmets are borrowed, 8 racks hold 5 helmets each. What is the hidden total?", 40, "helmets"],
  "g3w-01-04/k1": ["Before any extras are added, what is 24 ÷ 6 counters per team?", 4, "counters"],
  "g3w-01-04/k3": ["Find the fair share first: 35 ÷ 5 = ? Think: 5 × ? = 35.", 7, "stickers"],
  "g3w-01-04/ch1": ["Find the share before one more is added: 32 ÷ 4 = ?", 8, "markers"],
  "g3w-02-01/k2": ["Solve 4 × n = 28. What number does n represent?", 7, "counters"],
  "g3w-02-01/ch1": ["Use the multiplication family: what is 42 ÷ 7?", 6, ""],
  "g3w-02-02/k2": ["The equation first makes 36 markers, then 4 are taken and 0 returned. How many remain?", 32, "markers"],
  "g3w-02-02/ch1": ["After combining the group counts, the equation has 5 groups of 8. What is the value?", 40, "items"],
  "g3w-02-03/k2": ["The bar first totals 63 markers. Then 19 are crossed off and 0 returned. How many remain?", 44, "markers"],
  "g3w-02-03/ch1": ["A bar totals 48 tiles. Then 17 are crossed off and 0 added back. How many remain?", 31, "tiles"],
  "g3w-02-04/k2": ["For the rounded chain, calculate the first step: 5 × 60 = ?", 300, ""],
  "g3w-02-04/ch1": ["The exact product is 336. Subtract 96 and add 0. What exact result do you get?", 240, ""],
  "g3w-03-01/k2": ["The rounded product is 400. Subtract 20 and add 0. What checking estimate results?", 380, ""],
  "g3w-03-01/ch1": ["The exact product is 234. Subtract 0, then add 21. What is the exact result?", 255, ""],
  "g3w-03-02/k2": ["The shelves begin with 54 markers. Students take 13 and return 0. How many remain?", 41, "markers"],
  "g3w-03-03/k2": ["For the blue-bag question, use 4 blue bags with 6 marbles each. How many blue marbles?", 24, "marbles"],
  "g3w-03-03/ch1": ["Use 9 shelves with 8 books each to answer the shelf question; the story also mentions 6 display stands. How many shelf books?", 72, "books"],
  "g3w-03-04/ch1": ["The equal groups make 35 markers. Remove 0, then add 6 once. How many markers?", 41, "markers"],
};

const variantContracts = {
  "g3w-02-03/ch1": { gen: "g2-add-subtract-100", form: "TwoStepTradeNumeric", seed: "g3w-02-03|ch1|s257" },
  "g3w-02-04/ch1": { gen: "g2-add-subtract-100", form: "TwoStepTradeNumeric", seed: "g3w-02-04|ch1|s257" },
  "g3w-03-03/ch1": { gen: "g3-mult-fluency", form: "MultMixedSmallNumeric", seed: "g3w-03-03|ch1|s257" },
};

function normalizeNumericContracts(lesson) {
  for (const entry of lesson.steps) {
    const plan = numericContracts[`${lesson.id}/${entry.id}`];
    if (!plan) continue;
    const [prompt, answer, unit] = plan;
    entry.widget = {
      type: "numeric", prompt, answer, tolerance: 0, unit,
      commonErrors: [
        { value: answer - 1, feedback: "That is one below the required result; check the stated operation and quantities." },
        { value: answer + 1, feedback: "That is one above the required result; recompute the declared step carefully." },
      ],
      fallbackFeedback: "Use the quantities in the order stated and complete only the operation this check asks for.",
      successFeedback: `Correct — ${answer}${unit ? ` ${unit}` : ""}.`,
    };
    if (variantContracts[`${lesson.id}/${entry.id}`]) entry.variant = variantContracts[`${lesson.id}/${entry.id}`];
  }
}
function findStep(lesson, id) {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
}

function setWidget(lesson, id, widget) {
  findStep(lesson, id).widget = widget;
}

function repairProgression(lesson) {
  if (i1Plans[lesson.id]) setWidget(lesson, "i1", i1Plans[lesson.id]);
  setWidget(lesson, "i2", i2Plans[lesson.id]);
  for (const [id, widget] of Object.entries(specialSteps[lesson.id] ?? {})) setWidget(lesson, id, widget);
  const remedial = lesson.remedials?.[0]?.check;
  if (!remedial) throw new Error(`Missing ${lesson.id} remedial check`);
  remedial.widget = remedialWidgets[lesson.id];
  normalizeNumericContracts(lesson);
}

function repairContracts(value, lessonId) {
  if (!value || typeof value !== "object") return;
  for (const [key, current] of Object.entries(value)) {
    if (key === "cml" && current && typeof current === "object") {
      const [actionGoal, invariant, misconception] = cmlPlans[lessonId];
      current.actionGoal = actionGoal;
      current.invariants = [invariant];
      current.misconceptions = [misconception];
    }
    if (current && typeof current === "object") repairContracts(current, lessonId);
    if (typeof current !== "string") continue;
    if (current === "Name the hidden question first, answer it, and only then take the second step.") {
      value[key] = "Identify what the question needs, represent the two actions in order, and check each quantity's role.";
    } else if (current.includes("63's neighbors are 60 and 70")) {
      value[key] = "Use the story's operations and starting total to decide whether the placement is too low or too high.";
    } else if (current.includes("arriving shelve")) {
      value[key] = current.replace("arriving shelve", "arriving shelf");
    } else if (current.includes("arriving boxe")) {
      value[key] = current.replace("arriving boxe", "arriving box");
    } else if (/Fourths needs|Bars A and D pass/i.test(current)) {
      throw new Error(`Unrepaired copied fraction feedback remains in ${lessonId}`);
    }
  }
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);
  for (const [index, id] of ["c1", "c2"].entries()) {
    const concept = findStep(lesson, id);
    concept.figure = figures[lesson.id][index];
    concept.narration = concept.body;
  }
  repairProgression(lesson);
  repairContracts(lesson, lesson.id);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} word-problems-g3 lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED", lessons: files.length, changed,
  illustrationSourceClosures: 24, progressionSourceClosures: 12,
  sourceResidual: 0, assessorResidual: 36,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
