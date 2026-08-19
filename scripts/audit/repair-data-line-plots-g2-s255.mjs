import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "data-line-plots-g2", "lessons");
const CHECK = process.argv.includes("--check");

const figures = {
  "g2g-01-01": { c1: "ruler-measure", c2: "g2g-shared-unit-compare", remedial: "g2g-shared-unit-compare" },
  "g2g-01-02": { c1: "g2g-record-repeats", c2: "vm-line-plot-read", remedial: "g2g-record-repeats" },
  "g2g-01-03": { c1: "vm-line-plot-read", c2: "vm-line-plot-read", remedial: "vm-line-plot-read" },
  "g2g-01-04": { c1: "vm-line-plot-read", c2: "vm-line-plot-read", remedial: "vm-line-plot-read" },
  "g2g-01-05": { c1: "vm-line-plot-read", c2: "vm-line-plot-read", remedial: "vm-line-plot-read" },
  "g2g-02-01": { c1: "mmt-picture-graph", c2: "mmt-picture-graph", remedial: "mmt-picture-graph" },
  "g2g-02-02": { c1: "mmt-picture-graph", c2: "mmt-picture-graph", remedial: "mmt-picture-graph" },
  "g2g-02-03": { c1: "single-scale-graph", c2: "single-scale-graph", remedial: "single-scale-graph" },
  "g2g-02-04": { c1: "single-scale-graph", c2: "g2g-bar-gap", remedial: "g2g-bar-gap" },
  "g2g-03-01": { c1: "single-scale-graph", c2: "single-scale-graph", remedial: "single-scale-graph" },
  "g2g-03-02": { c1: "g2g-bar-gap", c2: "single-scale-graph", remedial: "g2g-bar-gap" },
  "g2g-03-03": { c1: "vm-line-plot-read", c2: "single-scale-graph", remedial: "g2g-display-choice" },
};

const optionPositions = {
  "g2g-01-01/k1": 1, "g2g-01-01/rem": 2,
  "g2g-01-02/k1": 3, "g2g-01-02/k3": 0, "g2g-01-02/rem": 1,
  "g2g-01-03/k3": 2,
  "g2g-01-05/k1": 3, "g2g-01-05/k3": 0, "g2g-01-05/rem": 1,
  "g2g-02-01/k3": 2,
  "g2g-02-03/k3": 3,
  "g2g-03-03/k1": 0, "g2g-03-03/k2": 1, "g2g-03-03/k3": 2, "g2g-03-03/rem": 3,
};

function step(lesson, id) {
  const found = lesson.steps.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing ${lesson.id}/${id}`);
  return found;
}
function route(lesson) {
  if (lesson.remedials?.length !== 1) throw new Error(`${lesson.id}: expected one remedial route`);
  return lesson.remedials[0];
}
function setConcept(target, figure, body) {
  target.figure = figure;
  target.body = body;
  target.narration = body;
}
function setNumeric(widget, prompt, answer, commonErrors, fallbackFeedback, successFeedback) {
  Object.assign(widget, { type: "numeric", prompt, answer, tolerance: 0, unit: "", commonErrors, fallbackFeedback, successFeedback });
}
function setMcq(widget, prompt, labels, feedback) {
  if (widget.type !== "mcq" || widget.options.length !== 4) throw new Error(`Expected four-option MCQ: ${prompt}`);
  const options = [...widget.options].sort((a, b) => a.id.localeCompare(b.id));
  if (options.map((option) => option.id).join(",") !== "o0,o1,o2,o3") throw new Error(`Unstable MCQ option IDs: ${prompt}`);
  widget.prompt = prompt;
  widget.options = options.map((option, index) => ({ ...option, label: labels[index], correct: index === 0, feedback: feedback[index] }));
}
function positionMcq(widget, desired) {
  const stable = [...widget.options].sort((a, b) => a.id.localeCompare(b.id));
  const correct = stable.find((option) => option.correct);
  const wrong = stable.filter((option) => !option.correct);
  widget.options = [...wrong.slice(0, desired), correct, ...wrong.slice(desired)];
}

function repairLesson(lesson) {
  const plan = figures[lesson.id];
  if (!plan) throw new Error(`No S255 plan for ${lesson.id}`);
  const remedial = route(lesson);
  step(lesson, "c1").figure = plan.c1;
  step(lesson, "c2").figure = plan.c2;
  remedial.concept.figure = plan.remedial;

  switch (lesson.id) {
    case "g2g-01-01": {
      setConcept(step(lesson, "c1"), plan.c1, "Use the same-size unit for every object. Line up the start, cover the whole length, and count the units.");
      setConcept(step(lesson, "c2"), plan.c2, "Using centimeters for both ribbons makes the comparison fair: the ribbon that covers more centimeters is longer.");
      setConcept(remedial.concept, plan.remedial, "Line up both ribbons at zero and use the same centimeter spaces. Then their lengths can be compared fairly.");
      setMcq(step(lesson, "k1").widget, "What should stay the same when you measure every ribbon?", ["The size of the unit", "The ribbon's color", "The starting number", "The person's name"], ["Correct — the same-size unit makes every length comparable.", "Color does not change length; use the same-size measuring unit.", "A ribbon may start at another mark if you measure the gap correctly.", "The measurer's name does not affect the ribbon's length."]);
      setMcq(remedial.check.widget, "Which plan makes a fair comparison of two ribbons?", ["Use centimeters for both", "Use inches for one only", "Count marks for one only", "Skip the shorter ribbon"], ["Correct — both ribbons use the same unit.", "Different units cannot be compared until they are converted.", "Measure the spaces for both ribbons, not marks for only one.", "Both ribbons must be measured before they can be compared."]);
      for (const id of ["k2", "k3", "ch1"]) step(lesson, id).widget.fallbackFeedback = "Subtract the start mark from the end mark. The spaces between them give the ribbon's length.";
      break;
    }
    case "g2g-01-02": {
      setConcept(step(lesson, "c1"), plan.c1, "A record keeps every measurement, including repeats. Each measured ribbon needs one entry.");
      setConcept(step(lesson, "c2"), plan.c2, "Three ribbons that measure 6 cm need three entries. A later line plot will show three Xs above 6.");
      setConcept(remedial.concept, plan.remedial, "Do not erase a repeated measurement. Two ribbons that both measure 4 cm still need two separate entries.");
      setMcq(step(lesson, "k1").widget, "Five ribbons measure 6, 8, 6, 7, and 6 cm. Which record keeps the same five results?", ["6, 8, 6, 7, 6 cm", "6, 8, 6, 7, 8 cm", "6, 8, 7, 7, 6 cm", "6, 6, 6, 7, 7 cm"], ["Correct — all five results, including all three 6s, are present.", "The last 6 was changed to 8, so this is different data.", "One 6 was changed to 7, so this is different data.", "The 8 was changed to 7, so this is different data."]);
      setMcq(step(lesson, "k3").widget, "A record changes 5, 7, 5, 6 cm to 5, 6, 7 cm. What was lost?", ["The second 5 cm result", "The only 7 cm result", "The only 6 cm result", "No result was lost"], ["Correct — one of the two separate 5 cm results disappeared.", "The 7 cm result is still in the shorter list.", "The 6 cm result is still in the shorter list.", "A repeated 5 cm result was removed, so information was lost."]);
      setMcq(remedial.check.widget, "Four ribbons measure 4, 4, 6, and 7 cm. Which record keeps every result?", ["4, 4, 6, 7 cm", "4, 6, 7, 8 cm", "4, 4, 6, 8 cm", "4, 6, 6, 7 cm"], ["Correct — both 4s and the 6 and 7 are recorded.", "One 4 is missing and an 8 was added.", "The 7 was changed to an 8.", "One 4 was changed to a 6."]);
      break;
    }
    case "g2g-01-03": {
      setConcept(step(lesson, "c1"), plan.c1, "A line plot puts the measurements on a number line. Draw one X for each result, so repeated results make a stack.");
      setConcept(step(lesson, "c2"), plan.c2, "Copy the record carefully: one result becomes one X above that value. The stack heights show how often each value occurs.");
      setConcept(remedial.concept, plan.remedial, "Match each record entry to one X. If 5 appears twice in the record, the line plot needs two Xs above 5.");
      setNumeric(remedial.check.widget, "A line plot has 4 Xs above 9. How many measurements equal 9?", 4, [{ value: 9, feedback: "Nine is the value below the stack; count the four Xs above it." }, { value: 13, feedback: "Do not add the value and the stack; count only the four Xs." }], "Count the Xs above 9. Each X stands for one measurement.", "Correct — four Xs mean four measurements equal 9.");
      setMcq(step(lesson, "k3").widget, "The record is 4, 4, 5. Which line-plot stacks match it?", ["Two Xs at 4; one at 5", "One X at 4; two at 5", "Three Xs at 4; none at 5", "One X at 4; one at 5"], ["Correct — each of the two 4s gets an X, and the 5 gets one X.", "That swaps the frequencies of 4 and 5.", "The record contains a 5, so one X must stand above 5.", "That drops the second recorded 4." ]);
      step(lesson, "k3").widget.plotData = { values: [4, 5], counts: [2, 1] };
      for (const id of ["k1", "k2", "ch1"]) step(lesson, id).widget.prompt = step(lesson, id).widget.prompt.replace(/data points?/gi, "measurements").replace(/frequency/gi, "count");
      break;
    }
    case "g2g-01-04": {
      setConcept(step(lesson, "c1"), plan.c1, "To answer 'how many?', choose the value below the stack and count the Xs above it.");
      setConcept(step(lesson, "c2"), plan.c2, "The number below a stack names the measurement. The Xs above it tell how many times that measurement appears.");
      setConcept(remedial.concept, plan.remedial, "First point to the requested value. Then count only the Xs in the stack directly above it.");
      setNumeric(remedial.check.widget, "Five Xs stand above 6 on a line plot. How many measurements equal 6?", 5, [{ value: 6, feedback: "Six labels the measurement; the five Xs tell how many measurements." }, { value: 11, feedback: "Do not add the label and the stack count; count only the Xs." }], "Find 6 below the plot, then count the five Xs above it.", "Correct — five measurements equal 6.");
      for (const id of ["k1", "k2", "k3", "ch1"]) step(lesson, id).widget.prompt = step(lesson, id).widget.prompt.replace(/data points?/gi, "measurements").replace(/frequency/gi, "count");
      break;
    }
    case "g2g-01-05": {
      setConcept(step(lesson, "c1"), plan.c1, "The most common measurement has the tallest stack. Find that stack, then read the measurement below it.");
      setConcept(step(lesson, "c2"), plan.c2, "Stack height tells how many results there are. The value below the tallest stack is the most common measurement.");
      setConcept(remedial.concept, plan.remedial, "Do not answer with the number of Xs. Find the tallest stack, then answer with the measurement written below it.");
      Object.assign(step(lesson, "i1").widget, { prompt: "Find the tallest stack. Tap every X in that stack, then check the measurement written below it.", successFeedback: "The 6-inch measurement is most common; its stack has five Xs." });
      Object.assign(step(lesson, "i2").widget, { prompt: "On the new plot, tap every X in the tallest stack. Then check the measurement below it.", target: [4, 2, 5, 3], given: [4, 2, 5, 3], maxPerValue: 6, successFeedback: "The 6-inch measurement is most common; its stack has five Xs." });
      setMcq(step(lesson, "k1").widget, "Use the first plot: above 5, 6, 7, and 8 inches are 2, 5, 3, and 1 Xs. Which measurement is most common?", ["6 inches", "5 inches", "7 inches", "8 inches"], ["Correct — the tallest stack, with five Xs, stands above 6 inches.", "Five is the number of Xs in the tallest stack, not its measurement.", "The stack above 7 inches has only three Xs.", "The stack above 8 inches has only one X."]);
      step(lesson, "k1").widget.plotData = { values: [5, 6, 7, 8], counts: [2, 5, 3, 1] };
      setMcq(step(lesson, "k3").widget, "A later plot has 6, 2, 3, and 1 Xs above 5, 6, 7, and 8 inches. Which measurement is most common?", ["5 inches", "6 inches", "7 inches", "8 inches"], ["Correct — the tallest stack, with six Xs, stands above 5 inches.", "Six is the height of the tallest stack, not the value below it.", "The stack above 7 inches has only three Xs.", "The stack above 8 inches has only one X."]);
      step(lesson, "k3").widget.plotData = { values: [5, 6, 7, 8], counts: [6, 2, 3, 1] };
      setMcq(remedial.check.widget, "Which measurement is under the tallest stack? The counts above 2, 3, 4, and 5 inches are 1, 4, 2, and 3.", ["3 inches", "2 inches", "4 inches", "5 inches"], ["Correct — the tallest stack, with four Xs, stands above 3 inches.", "The stack above 2 inches has only one X.", "Four is the stack height, not the measurement below it.", "The stack above 5 inches has three Xs, not four."]);
      remedial.check.widget.plotData = { values: [2, 3, 4, 5], counts: [1, 4, 2, 3] };
      step(lesson, "k1").explanationVariants = ["Find the tallest stack.", "Read the measurement below it."];
      step(lesson, "c2").body = step(lesson, "c2").narration = "Stack height and the value below it have different jobs. The value under the tallest stack is the most common measurement.";
      step(lesson, "r1").takeaways = ["Find the tallest stack.", "Read the value below it.", "Stack height and measurement have different jobs."];
      remedial.check.explanationVariants = ["Find the tallest stack.", "Read its measurement below."];
      break;
    }
    case "g2g-02-01": {
      setConcept(step(lesson, "c1"), plan.c1, "A picture graph has one row for each category. In these graphs, the key says each picture counts as 1.");
      setConcept(step(lesson, "c2"), plan.c2, "With a key of 1, four finds on Monday need four pictures in Monday's row.");
      setConcept(remedial.concept, plan.remedial, "Read the key first. When one picture means 1 find, draw one picture for each find in that row.");
      setNumeric(remedial.check.widget, "A key-of-1 picture graph has 6 shell pictures in Sunday's row. How many shells were found Sunday?", 6, [{ value: 5, feedback: "One shell picture was missed; all six count because the key is 1." }, { value: 7, feedback: "One extra shell was counted; only six pictures are shown." }], "The key says each picture counts as 1, so count all six pictures.", "Correct — six pictures with a key of 1 mean six shells.");
      setMcq(step(lesson, "k3").widget, "The class votes for one of four trip choices. Which display fits the category counts?", ["A bar graph of votes", "A line plot of lengths", "A ruler showing inches", "A clock showing minutes"], ["Correct — separate bars compare the counts for the four choices.", "A line plot is for number measurements, not named trip choices.", "A ruler measures length; it does not compare vote categories.", "A clock shows time; it does not compare vote categories."]);
      break;
    }
    case "g2g-02-02": {
      setConcept(step(lesson, "c1"), plan.c1, "Use the key, then count the pictures in the named row. With a key of 1, each picture adds one to the total.");
      setConcept(step(lesson, "c2"), plan.c2, "A longer row has more pictures. With the same key, that row represents a larger count.");
      setConcept(remedial.concept, plan.remedial, "Stay in the named row and count each picture once. Then use the key to name the total.");
      setNumeric(remedial.check.widget, "Friday's row has 7 sticker pictures and the key is 1. How many stickers does the row show?", 7, [{ value: 6, feedback: "One sticker picture was missed; count all seven pictures." }, { value: 8, feedback: "One picture was counted twice; only seven are shown." }], "Count the seven pictures in Friday's row. The key says each one counts as 1.", "Correct — seven pictures with a key of 1 show seven stickers.");
      break;
    }
    case "g2g-02-03": {
      setConcept(step(lesson, "c1"), plan.c1, "A bar graph has one bar for each category. The top of each bar reaches that category's count.");
      setConcept(step(lesson, "c2"), plan.c2, "Use the numbered grid like a ruler. Raise each bar until its top meets the correct count.");
      setConcept(remedial.concept, plan.remedial, "Start every bar at zero. Follow the gridlines upward and stop the bar at its category's count.");
      setNumeric(remedial.check.widget, "A bar starts at zero and reaches 6 on a scale where each gridline counts as 1. What count does it show?", 6, [{ value: 5, feedback: "That stops one gridline below the top of the bar." }, { value: 7, feedback: "That goes one gridline above the top of the bar." }], "Follow the bar's top to the numbered scale. It reaches 6.", "Correct — the bar reaches 6.");
      setMcq(step(lesson, "k3").widget, "You measure ribbon lengths and want to see which lengths repeat. Which display fits?", ["A line plot of lengths", "A bar graph of colors", "A clock showing times", "A ruler for one ribbon"], ["Correct — a line plot stacks repeated measurements above number values.", "Color categories do not show which measured lengths repeat.", "A clock displays time, not repeated ribbon lengths.", "One ruler measurement does not display the whole data set."]);
      for (const id of ["i2", "k2", "ch1"]) step(lesson, id).widget.prompt = step(lesson, id).widget.prompt.replace(/y-axis label/gi, "number on the scale").replace(/unit-scale/gi, "one-unit");
      break;
    }
    case "g2g-02-04": {
      setConcept(step(lesson, "c1"), plan.c1, "To read a bar, follow its top across to the numbered scale. The number it reaches is the count.");
      setConcept(step(lesson, "c2"), plan.c2, "The dogs bar reaches 6 and the cats bar reaches 3. The taller bar has 3 more votes because 6 minus 3 equals 3.");
      setConcept(remedial.concept, plan.remedial, "Read both bar heights, then subtract the smaller count from the larger count to find how many more.");
      setNumeric(remedial.check.widget, "A bar starts at zero and reaches 4 on a scale where each gridline counts as 1. What count does it show?", 4, [{ value: 3, feedback: "That stops one gridline below the top of the bar." }, { value: 5, feedback: "That goes one gridline above the top of the bar." }], "Follow the top of the bar to the numbered scale. It reaches 4.", "Correct — the bar shows 4.");
      for (const id of ["i2", "k1", "k3"]) step(lesson, id).widget.prompt = step(lesson, id).widget.prompt.replace(/unit-scale/gi, "one-unit");
      break;
    }
    case "g2g-03-01": {
      setConcept(step(lesson, "c1"), plan.c1, "To find how many two categories have together, read both bar heights and add the two counts.");
      setConcept(step(lesson, "c2"), plan.c2, "Cats have 3 votes and birds have 4 votes. Together they have 3 plus 4, or 7 votes.");
      setConcept(remedial.concept, plan.remedial, "Read one bar, read the other bar, and add. Keep the two category counts separate until you add them.");
      step(lesson, "i1").widget.prompt = "Read Monday's bar. Move the marker to the number of votes it shows.";
      step(lesson, "i2").widget.prompt = "Read Tuesday's bar. Move the marker to the number of votes it shows.";
      step(lesson, "ch1").widget.prompt = "29 + 33 = ? These are Thursday's and Friday's bar counts together.";
      setNumeric(remedial.check.widget, "One bar shows 15 votes and another shows 27. How many votes do they show together?", 42, [{ value: 32, feedback: "The ones were not combined correctly; 5 plus 7 makes 12." }, { value: 12, feedback: "That adds only the ones digits and leaves out the tens." }], "Add both bar counts: 15 plus 27.", "Correct — 15 plus 27 equals 42 votes.");
      break;
    }
    case "g2g-03-02": {
      setConcept(step(lesson, "c1"), plan.c1, "The dogs bar reaches 6 and the cats bar reaches 3. Subtract 3 from 6 to find the visible gap of 3 votes.");
      setConcept(step(lesson, "c2"), plan.c2, "To find how many more, read both bars and subtract the smaller count from the larger count.");
      setConcept(remedial.concept, plan.remedial, "Match the shorter bar to the start of the taller bar. The uncovered part is the gap, so subtract smaller from larger.");
      step(lesson, "i1").widget.prompt = "Read Thursday's bar. Move the marker to the number of votes it shows.";
      step(lesson, "i2").widget.prompt = "Read Wednesday's shorter bar. Move the marker to its count before comparing it with Thursday's 9.";
      step(lesson, "ch1").widget.prompt = "Wednesday's bar shows 6 votes and Thursday's shows 8. What is the gap between their heights?";
      setNumeric(remedial.check.widget, "One bar shows 5 votes and another shows 12. How many more votes does the taller bar show?", 7, [{ value: 17, feedback: "That adds the two counts; 'how many more' asks for their difference." }, { value: 6, feedback: "That is one short; count the gap from 5 up to 12." }], "Subtract the smaller bar count from the larger: 12 minus 5.", "Correct — the taller bar shows 7 more votes.");
      break;
    }
    case "g2g-03-03": {
      setConcept(step(lesson, "c1"), plan.c1, "Use a line plot for number measurements. Put one X above the value of each measurement.");
      setConcept(step(lesson, "c2"), plan.c2, "Use separate bars or picture rows for named categories so their counts can be compared.");
      setConcept(remedial.concept, plan.remedial, "Ask what the data names: number measurements use a line plot; named choices use bars or picture rows.");
      setMcq(step(lesson, "k1").widget, "You measure ribbon lengths and want to see which lengths repeat. Which display fits?", ["A line plot of lengths", "A bar graph of colors", "A clock showing times", "A ruler for one ribbon"], ["Correct — a line plot stacks repeated measurements above number values.", "Color categories do not show which measured lengths repeat.", "A clock displays time, not repeated ribbon lengths.", "One ruler measurement does not display the whole data set."]);
      setMcq(step(lesson, "k2").widget, "The class votes for one of four trip choices. Which display fits the category counts?", ["A bar graph of votes", "A line plot of lengths", "A ruler showing inches", "A clock showing minutes"], ["Correct — separate bars compare the counts for the four choices.", "A line plot is for number measurements, not named trip choices.", "A ruler measures length; it does not compare vote categories.", "A clock shows time; it does not compare vote categories."]);
      setMcq(step(lesson, "k3").widget, "Stacks above 5, 6, 7, and 8 inches have 2, 4, 3, and 1 Xs. Which measurement is most common?", ["6 inches", "5 inches", "7 inches", "8 inches"], ["Correct — the tallest stack, with four Xs, stands above 6 inches.", "The stack above 5 inches has only two Xs.", "The stack above 7 inches has only three Xs.", "The stack above 8 inches has only one X."]);
      step(lesson, "k3").widget.plotData = { values: [5, 6, 7, 8], counts: [2, 4, 3, 1] };
      setMcq(remedial.check.widget, "A survey records each student's favorite pet. Which display fits these named choices?", ["A bar graph of pets", "A line plot of lengths", "A ruler showing inches", "A clock showing minutes"], ["Correct — separate bars compare the counts for pet categories.", "A line plot is for number measurements, not pet names.", "A ruler measures length; it does not compare pet choices.", "A clock shows time; it does not compare pet choices."]);
      break;
    }
    default:
      throw new Error(`No S255 lesson repair for ${lesson.id}`);
  }

  for (const entry of [...lesson.steps, ...lesson.remedials.flatMap((item) => [item.concept, item.check])]) {
    const widget = entry.widget;
    if (!widget) continue;
    if (Array.isArray(widget.commonErrors)) for (const error of widget.commonErrors) {
      if (error.feedback === "Adding the marks measures nothing; the span between them is the length.") {
        error.feedback = "Adding the two mark numbers does not give the length; subtract the start from the end.";
      }
    }
  }
  for (const [surface, desired] of Object.entries(optionPositions)) {
    const [lessonId, stepId] = surface.split("/");
    if (lessonId !== lesson.id) continue;
    const widget = stepId === "rem" ? remedial.check.widget : step(lesson, stepId).widget;
    positionMcq(widget, desired);
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
  repairLesson(lesson);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}
if (CHECK && changed) throw new Error(`${changed} data-line-plots-g2 lessons are not S255-normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED",
  lessons: files.length,
  changed,
  sourceClosures: { textOnlyRemedials: 12, copiedConcepts: 7, repeatedChecks: 10, fixedFirstMcqs: 15, weakFigures: 5, modalAction: 1, total: 50 },
  seal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
