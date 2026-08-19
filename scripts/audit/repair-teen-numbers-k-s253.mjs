import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const COURSE = path.join(ROOT, "content", "courses", "teen-numbers-k", "lessons");
const CHECK = process.argv.includes("--check");

const concepts = {
  "knb-01-01": ["teen-ten-and-more", "nwk-teen-count-on"],
  "knb-01-02": ["nwk-teen-ten-four", "teen-ten-and-more"],
  "knb-01-03": ["kc-teen-14", "nwk-teen-ten-four"],
  "knb-01-04": ["c120-teen-13", "nwk-teens-pattern"],
  "knb-02-01": ["kc-teen-14", "nwk-teens-pattern"],
  "knb-02-02": ["kc-to-20", "nwk-teens-pattern"],
  "knb-02-03": ["nwk-teen-ten-four", "tno-ten-is-ten"],
  "knb-02-04": ["nwk-teen-ten-four", "teen-ten-and-more"],
  "knb-03-01": ["nwk-teen-ten-four", "kc-teen-14"],
  "knb-03-02": ["kc-to-20", "nwk-teen-count-on"],
  "knb-03-03": ["nwk-teen-ten-four", "kc-teen-14"],
  "knb-03-04": ["teen-ten-and-more", "nwk-teens-pattern"],
};

const tenFrameRepairs = {
  "knb-01-01": { target: 3, prompt: "A learner says 13 has three tens. Build only the three extra ones beside the finished ten to repair the model." },
  "knb-01-02": { target: 4, prompt: "Build the four loose ones that join one finished ten to make 14." },
  "knb-01-03": { target: 8, prompt: "A learner reads 18 as eight tens and one one. Build the eight loose ones beside one full ten to repair the model." },
  "knb-01-04": { target: 2, prompt: "Start with one complete ten and build the two loose ones that make 12." },
  "knb-02-01": { target: 4, prompt: "A card says 14 = 10 + 4. Build only the four loose ones that verify the split." },
  "knb-02-02": { target: 7, prompt: "Build the seven loose ones in 17, leaving one complete ten as the anchor." },
  "knb-02-03": { target: 7, prompt: "Reverse the build: show the seven leftover ones after a group of 17 fills one ten-frame." },
  "knb-02-04": { target: 5, prompt: "Use the equation 15 = 10 + 5. Build the five represented by the second addend." },
  "knb-03-01": { target: 8, prompt: "A pile of 18 fills one ten. Build the eight dots that must remain outside." },
  "knb-03-03": { target: 9, prompt: "A picture has one full ten and nine loose dots. Build the loose part, then name the teen." },
  "knb-03-04": { target: 2, prompt: "An egg tray holds ten and two eggs sit beside it. Build only the two extras." },
};

const promptRepairs = {
  "knb-01-03": {
    k1: "A teen has one full ten and six loose dots. Build only the loose part.",
    ch1: "A carton holds ten eggs and three sit beside it. Build the three extras.",
  },
  "knb-01-04": { ch1: "A learner already has one full ten. Build eight loose ones to complete 18." },
  "knb-02-01": { k1: "A model shows one full ten and six loose dots. Build the loose part of 16." },
  "knb-02-02": { k1: "A model shows one full ten and five loose dots. Build the loose part of 15." },
  "knb-02-03": { ch1: "Which proposed ten-and-ones decomposition fails to make 15?" },
  "knb-03-02": { k1: "Use four one-steps from ten to reach the point that names 14.", i2: "Measure the distance from 10 to 16 with six equal one-steps, then tap 16." },
  "knb-03-03": { ch1: "One full ten is ready. Build four loose dots to complete the model of 14." },
};

function setTenFrame(widget, repair) {
  widget.prompt = repair.prompt;
  widget.target = repair.target;
  widget.preFilled = 0;
  widget.commonCounts = [
    { count: Math.max(0, repair.target - 1), feedback: `That shows one too few loose ones. The target needs ${repair.target}.` },
    { count: Math.min(10, repair.target + 1), feedback: `That shows one too many loose ones. Stop at ${repair.target}.` },
  ];
  widget.missFeedback = `Keep the full ten fixed and build exactly ${repair.target} loose ones.`;
  widget.successFeedback = `${10 + repair.target} is one complete ten and ${repair.target} more.`;
}

function replaceChoice(step) {
  step.widget.prompt = "Why build the full ten before the extra ones?";
  const labels = [
    "It anchors the teen as ten and some more",
    "It makes every teen have two full tens",
    "It changes the value of each loose one",
    "It lets us skip counting the extra ones",
  ];
  const feedback = [
    "Correct — the full ten is a known group, so only the loose ones need to be counted.",
    "A teen has one full ten, not two; two tens would make twenty.",
    "Each loose dot is still one, whether or not the ten is built first.",
    "The extra ones still matter; the ten only gives a reliable starting point.",
  ];
  step.widget.options.forEach((option, index) => {
    option.label = labels[index];
    option.feedback = feedback[index];
  });
}

const files = (await readdir(COURSE)).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 12) throw new Error(`Expected 12 lessons, found ${files.length}`);
let changed = 0;
const hashes = [];
for (const file of files) {
  const full = path.join(COURSE, file);
  const before = await readFile(full, "utf8");
  const lesson = JSON.parse(before);

  for (const [index, stepId] of ["c1", "c2"].entries()) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step) throw new Error(`Missing ${lesson.id}/${stepId}`);
    step.figure = concepts[lesson.id][index];
    step.narration = step.body;
  }

  const i2 = lesson.steps.find((entry) => entry.id === "i2");
  if (!i2?.widget) throw new Error(`Missing ${lesson.id}/i2`);
  i2.body = "Use a different teen-number job.";
  if (tenFrameRepairs[lesson.id]) setTenFrame(i2.widget, tenFrameRepairs[lesson.id]);

  for (const [stepId, prompt] of Object.entries(promptRepairs[lesson.id] ?? {})) {
    const step = lesson.steps.find((entry) => entry.id === stepId);
    if (!step?.widget) throw new Error(`Missing ${lesson.id}/${stepId}`);
    step.widget.prompt = prompt;
  }

  if (lesson.id === "knb-01-02") replaceChoice(lesson.steps.find((entry) => entry.id === "k2"));

  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) await writeFile(full, after, "utf8");
  }
  hashes.push(createHash("sha256").update(after).digest("hex"));
}

if (CHECK && changed) throw new Error(`${changed} teen-numbers-k lessons are not normalized`);
console.log(JSON.stringify({
  status: CHECK ? "CURRENT" : "UPDATED",
  lessons: files.length,
  changed,
  illustrationSourceClosures: 24,
  progressionSourceClosures: 12,
  choiceSourceClosures: 1,
  courseSeal: createHash("sha256").update(hashes.join("\n")).digest("hex"),
}, null, 2));
