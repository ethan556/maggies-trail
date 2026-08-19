import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "content", "courses", "compose-shapes-g1", "lessons");
const CHECK = process.argv.includes("--check");

const bindings = {
  "g1s-01-01": { c1: "shape-attributes", c2: "shape-attributes" },
  "g1s-01-02": { c1: "ks-any-way-up", c2: "ks-size-same" },
  "g1s-01-03": { c1: "geo3-sort-yesno", c2: "ks-sort-count" },
  "g1s-02-01": { c1: "ks-build-shapes", c2: "ks-build-shapes" },
  "g1s-03-01": { c1: "flat-vs-solid", c2: "solid-shapes" },
  "g1s-03-02": { c1: "ks-build-shapes", c2: "ks-build-shapes" },
  "g1s-03-03": { c1: "ks-build-shapes", c2: "shape-attributes" },
};

const residuals = new Set([
  "g1s-02-02/c1", "g1s-02-02/c2",
  "g1s-02-03/c1", "g1s-02-03/c2",
  "g1s-02-04/c1", "g1s-02-04/c2",
]);

const bodies = {
  "g1s-01-01/c1": "A triangle has 3 straight sides and 3 corners. A hexagon has 6 straight sides and 6 corners. Those counts help name each shape.",
  "g1s-01-01/c2": "Count the straight sides and corners of the pictured triangle and hexagon. Changing colour or size would not change those counts.",
  "g1s-01-02/c1": "A square stays a square when it is turned. The picture shows the same four equal sides and four square corners in both positions.",
  "g1s-01-02/c2": "A tiny triangle and a giant triangle are both triangles. Size does not change their 3 straight sides and 3 corners.",
  "g1s-01-03/c1": "A sorting rule asks a yes-or-no question. The picture asks whether a shape has 4 sides, then sends it to YES or NO.",
  "g1s-01-03/c2": "Objects can also be sorted by colour. The picture groups red buttons and blue buttons, but colour does not decide the name of a shape.",
  "g1s-02-01/c1": "Two matching triangle halves fit together to make a square. Trace the finished outside edge to name the new shape.",
  "g1s-02-01/c2": "The picture shows the two triangle pieces and the square they make. Their shared edge becomes an inside seam, not part of the square's outside edge.",
  "g1s-03-01/c1": "Flat shapes lie on paper. Solid shapes such as a ball, box, or cone take up space and can be held.",
  "g1s-03-01/c2": "Solids can have flat faces, curved surfaces, or both. The picture compares a cube, cone, and cylinder.",
  "g1s-03-02/c1": "Read the picture backward: a square made from two matching triangle halves can be separated along its diagonal seam into those two triangles.",
  "g1s-03-02/c2": "Read the picture forward again: the same two triangle pieces rejoin to rebuild the square. Composing and taking apart undo each other here.",
  "g1s-03-03/c1": "Start with one exact building step: two matching triangle halves make a square. Repeating known building steps can make larger shapes.",
  "g1s-03-03/c2": "Name a finished outline by its own sides and corners. The picture marks all 3 on a triangle and all 6 on a hexagon.",
};

const commonReplacements = [
  ["Two triangles are joined along their long edges", "Two matching triangle halves of a square are joined along their long edges"],
  ["Two triangles are joined along their long edges to make a square", "Two matching triangle halves are joined along their long edges to make a square"],
  ["What new shape do two triangles make when joined?", "What new shape do two matching triangle halves make when joined?"],
  ["joining two triangles makes a square", "joining two matching triangle halves makes a square"],
  ["Joining two triangles makes something larger", "Joining two matching triangle halves makes something larger"],
  ["two triangles joined on their long edges make a square", "two matching triangle halves joined on their long edges make a square"],
  ["Picture the two long edges pressed together", "Picture the matching long edges pressed together"],
  ["What new shape do two squares make when joined?", "What new shape do two equal squares make when joined side by side?"],
  ["joining two squares makes a rectangle", "joining two equal squares side by side makes a rectangle"],
  ["Two squares are pushed together side by side", "Two equal squares are pushed together side by side"],
  ["Two squares pushed together side by side", "Two equal squares pushed together side by side"],
  ["Two squares join into a rectangle", "Two equal squares join side by side into a rectangle"],
  ["two squares side by side make a rectangle", "two equal squares side by side make a rectangle"],
  ["The two squares still exist inside the rectangle — composing does not destroy the pieces, it only hides the edge between them.", "The two equal squares are still visible as parts of the rectangle. Their shared side is an inside seam, not part of the finished outline."],
  ["Six triangles meeting at a single centre point make a hexagon", "Six matching triangle pieces arranged evenly around one centre make a hexagon"],
  ["Six triangles meeting at one point close into a six-sided hexagon.", "Six matching triangle pieces arranged evenly around one point close into a six-sided hexagon."],
  ["Six triangles meet at one centre point.", "Six matching triangle pieces fit evenly around one centre point."],
  ["Six triangles meet at a centre point.", "Six matching triangle pieces fit evenly around a centre point."],
  ["What new shape do six triangles make when joined?", "What new shape do six matching triangle pieces make when arranged around one centre?"],
  ["joining six triangles makes a hexagon", "arranging six matching triangle pieces around one centre makes a hexagon"],
  ["Six triangles make a hexagon.", "Six matching triangle pieces can be arranged around one centre to make a hexagon."],
];

function step(lesson, id) {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`${lesson.id}: missing ${id}`);
  return found;
}

function replaceStrings(value) {
  if (typeof value === "string") {
    let next = value;
    for (const [from, to] of commonReplacements) next = next.replaceAll(from, to);
    return next;
  }
  if (Array.isArray(value)) return value.map(replaceStrings);
  if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) value[key] = replaceStrings(child);
  return value;
}

function setHotspot(widget, id, values) {
  const hotspot = widget.hotspots.find((candidate) => candidate.id === id);
  if (!hotspot) throw new Error(`missing hotspot ${id}`);
  Object.assign(hotspot, values);
}

function repairDefinitions(lesson) {
  const surfaces = [
    ...lesson.steps.filter((candidate) => candidate.widget).map((candidate) => candidate.widget),
    ...(lesson.remedials ?? []).map((route) => route.check?.widget).filter(Boolean),
  ];
  for (const widget of surfaces) {
    if (widget.type !== "mcq") continue;
    const key = widget.options.find((option) => option.correct);
    if (!key) throw new Error(`${lesson.id}: mcq lacks correct option`);
    if (/What makes a shape a square\?/i.test(widget.prompt)) {
      key.label = "4 equal straight sides and 4 square corners";
      key.feedback = "Correct — a square has 4 equal straight sides and 4 square corners; colour, size, and direction can change.";
    }
    if (/What makes a shape a rectangle\?/i.test(widget.prompt)) {
      key.label = "4 straight sides and 4 square corners";
      key.feedback = "Correct — a rectangle has 4 straight sides and 4 square corners; colour, size, and direction can change.";
    }
  }
}

function diversify(lesson) {
  if (lesson.id === "g1s-01-01") {
    const host = step(lesson, "i2");
    host.body = "Use equal sides too.";
    host.widget.prompt = "Tap the shape with 4 equal straight sides and 4 square corners.";
    setHotspot(host.widget, "h1", { label: "square", icon: "🟦", correct: true });
    setHotspot(host.widget, "h2", { label: "triangle", icon: "🔺", correct: false, feedback: "A triangle has only 3 straight sides. Look for 4 equal sides and 4 square corners." });
    setHotspot(host.widget, "h3", { label: "circle", icon: "⚪", correct: false, feedback: "A circle has a curved edge, not 4 equal straight sides and 4 square corners." });
    setHotspot(host.widget, "h4", { label: "rectangle", icon: "▬", correct: false, feedback: "This rectangle has 4 square corners, but its 4 sides are not all equal. Tap the square." });
    host.widget.missFeedback = "Check both rules: 4 equal straight sides and 4 square corners.";
    host.widget.successFeedback = "Yes — all 4 sides are equal and all 4 corners are square.";
  }
  if (lesson.id === "g1s-01-02") {
    const host = step(lesson, "i2");
    host.body = "Change the size.";
    host.widget.prompt = "Tap the tiny shape that is still a triangle.";
    setHotspot(host.widget, "h1", { label: "tiny triangle", icon: "🔺", correct: true });
    host.widget.missFeedback = "Size can change. Find the tiny shape that still has 3 straight sides and 3 corners.";
    host.widget.successFeedback = "Yes — even when it is tiny, 3 straight sides and 3 corners keep it a triangle.";
  }
  if (lesson.id === "g1s-02-01") {
    const host = step(lesson, "i2");
    host.body = "Reverse the build.";
    host.widget.prompt = "A square made from two matching triangle halves is opened along its diagonal seam. Tap one piece.";
    setHotspot(host.widget, "h1", { label: "triangle", icon: "🔺", correct: true });
    setHotspot(host.widget, "h2", { label: "square", icon: "🟦", correct: false, feedback: "The square is the whole. Opening its diagonal seam reveals two triangle pieces." });
    setHotspot(host.widget, "h3", { label: "circle", icon: "⚪", correct: false, feedback: "The straight diagonal seam cannot make a round piece. Each piece is a triangle." });
    setHotspot(host.widget, "h4", { label: "rectangle", icon: "▬", correct: false, feedback: "Each half has 3 sides after the diagonal seam opens, so each piece is a triangle." });
    host.widget.missFeedback = "Follow the diagonal seam and count the 3 sides of one piece.";
    host.widget.successFeedback = "Yes — opening the diagonal seam reveals two matching triangles.";
  }
  if (lesson.id === "g1s-02-02") {
    const host = step(lesson, "i2");
    host.body = "Find the inside seam.";
    host.widget.prompt = "Two equal squares share one full side. Tap the part that becomes an inside seam of the rectangle.";
    setHotspot(host.widget, "h1", { label: "shared side", icon: "│", correct: true });
    setHotspot(host.widget, "h2", { label: "outside side", icon: "▬", correct: false, feedback: "An outside side stays on the rectangle's outline. The side the squares share becomes the inside seam." });
    setHotspot(host.widget, "h3", { label: "corner", icon: "•", correct: false, feedback: "A corner is a point, not the full side where the two equal squares touch." });
    setHotspot(host.widget, "h4", { label: "gap", icon: "□", correct: false, feedback: "The equal squares touch with no gap. Their shared full side becomes the inside seam." });
    host.widget.missFeedback = "Look for the full side touched by both equal squares.";
    host.widget.successFeedback = "Yes — the shared side becomes an inside seam, so it is not part of the outside outline.";
  }
  if (lesson.id === "g1s-03-01") {
    const k3 = step(lesson, "k3");
    k3.body = "Match a solid to an object.";
    k3.widget.prompt = "Which object is shaped like a sphere?";
    const values = {
      o0: ["A ball", "Correct — a ball is shaped like a sphere and can roll in every direction."],
      o1: ["A sheet of paper", "A sheet is flat, while a sphere is a solid that takes up space."],
      o2: ["A box", "A box is shaped like a cube or rectangular prism, not a sphere."],
      o3: ["An ice-cream cone", "An ice-cream cone is cone-shaped, with a point and one flat circular face."],
    };
    for (const option of k3.widget.options) [option.label, option.feedback] = values[option.id];
    k3.explanationVariants = ["A ball is a familiar sphere-shaped solid.", "A sphere is round in every direction, like a ball."];
    k3.hints = ["A sphere is round all over.", "Think of an object that rolls in every direction.", "A ball."];

    const ch1 = step(lesson, "ch1");
    ch1.body = "Count a different solid part.";
    ch1.widget.prompt = "How many flat faces does a cone have?";
    ch1.widget.commonErrors = [
      { value: 2, feedback: "That counts the curved surface too. A cone has 1 flat circular face." },
      { value: 0, feedback: "Look at the circular base: it is the cone's 1 flat face." },
    ];
    ch1.widget.fallbackFeedback = "Find the flat circular base. The curved surface is not a flat face.";
    ch1.widget.successFeedback = "Correct — a cone has 1 flat circular face.";
    ch1.explanationVariants = ["A cone has 1 flat circular face at its base.", "Its other surface is curved, so only the base counts as flat."];
    ch1.hints = ["Look at the cone's base.", "Count only flat faces, not curved surfaces.", "1 flat face."];
  }
  if (lesson.id === "g1s-03-02") {
    const i2 = step(lesson, "i2");
    i2.body = "Put the pieces back.";
    i2.widget.prompt = "Two matching triangle halves are pushed back together along their long edges. Tap the shape that returns.";
    setHotspot(i2.widget, "h1", { label: "square", icon: "🟦", correct: true });
    setHotspot(i2.widget, "h2", { label: "triangle", icon: "🔺", correct: false, feedback: "One piece is a triangle, but both matching halves together rebuild the square." });
    setHotspot(i2.widget, "h3", { label: "rectangle", icon: "▬", correct: false, feedback: "These are the two matching halves cut from a square, so rejoining them returns that square." });
    setHotspot(i2.widget, "h4", { label: "circle", icon: "⚪", correct: false, feedback: "Straight triangle edges cannot make a curved circle. They rebuild the square." });
    i2.widget.missFeedback = "The pieces came from a square. Rejoin the matching long edges to rebuild it.";
    i2.widget.successFeedback = "Yes — rejoining the matching triangle halves rebuilds the square.";

    const k1 = step(lesson, "k1");
    k1.widget.prompt = "A rectangle was built from two equal squares side by side. Which pieces can you recover by opening the middle seam?";
    k1.widget.options[0].feedback = "Correct — opening the middle seam recovers the two equal squares used to build the rectangle.";
    const remedial = lesson.remedials[0].check;
    remedial.widget.prompt = "A rectangle was built from two equal squares side by side. Which pieces can you recover by opening the middle seam?";
    remedial.widget.options[0].feedback = "Correct — opening the middle seam recovers the two equal squares used to build the rectangle.";

    const k3 = step(lesson, "k3");
    k3.body = "Recover known pieces.";
    k3.widget.prompt = "Which action reverses joining two equal squares along a middle seam?";
    const options = {
      o0: ["Open the middle seam", "Correct — opening the seam reverses the join and recovers the two equal squares."],
      o1: ["Erase the whole shape", "Erasing does not take the built shape apart into its original pieces. Open the seam instead."],
      o2: ["Round every outside edge", "Changing the outside edges does not reverse the join. Open the middle seam to recover the squares."],
      o3: ["Fold it into a cube", "Folding changes a flat shape into a solid; it does not recover the two flat square pieces."],
    };
    for (const option of k3.widget.options) [option.label, option.feedback] = options[option.id];
    k3.explanationVariants = ["The middle seam separates the built rectangle into the two equal squares used to make it.", "Taking apart reverses the original build."];
  }
  if (lesson.id === "g1s-03-03") {
    const host = step(lesson, "i2");
    host.body = "Reverse the last join.";
    host.widget.prompt = "A rectangle made from two equal squares opens at its middle seam. Tap one recovered piece.";
    setHotspot(host.widget, "h1", { label: "square", icon: "🟦", correct: true });
    setHotspot(host.widget, "h2", { label: "triangle", icon: "🔺", correct: false, feedback: "The middle seam separates the rectangle into its two square sections, not into single triangle halves." });
    setHotspot(host.widget, "h3", { label: "circle", icon: "⚪", correct: false, feedback: "Opening a straight seam cannot create a curved circle. Each recovered piece is a square." });
    setHotspot(host.widget, "h4", { label: "cube", icon: "🧊", correct: false, feedback: "The rectangle is flat, so opening its seam leaves flat square pieces, not a solid cube." });
    host.widget.missFeedback = "Look at the two equal sections on either side of the middle seam.";
    host.widget.successFeedback = "Yes — the middle seam opens to recover the two equal squares.";
  }
}

function repairLesson(lesson) {
  replaceStrings(lesson);
  for (const id of ["c1", "c2"]) {
    const concept = step(lesson, id);
    const key = `${lesson.id}/${id}`;
    const figure = bindings[lesson.id]?.[id];
    if (figure) concept.figure = figure;
    else if (residuals.has(key)) delete concept.figure;
    if (bodies[key]) {
      concept.body = bodies[key];
      concept.narration = bodies[key];
    }
  }
  const remedial = lesson.remedials?.[0]?.concept;
  if (remedial) {
    const c2 = step(lesson, "c2");
    remedial.body = c2.body;
    remedial.narration = c2.narration;
    const figure = bindings[lesson.id]?.c2;
    if (figure) remedial.figure = figure;
    else delete remedial.figure;
  }
  repairDefinitions(lesson);
  diversify(lesson);
}

const files = fs.readdirSync(DIR).filter((name) => name.endsWith(".json")).sort();
if (files.length !== 10) throw new Error(`expected 10 lessons, found ${files.length}`);
let changed = 0;
for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, "utf8");
  const lesson = JSON.parse(before);
  const ids = JSON.stringify(lesson.steps.map((candidate) => candidate.id));
  repairLesson(lesson);
  if (JSON.stringify(lesson.steps.map((candidate) => candidate.id)) !== ids) throw new Error(`${lesson.id}: stable step IDs changed`);
  const after = `${JSON.stringify(lesson, null, 2)}\n`;
  if (after !== before) {
    changed += 1;
    if (!CHECK) fs.writeFileSync(full, after);
  }
}
if (CHECK && changed) throw new Error(`${changed} lesson files need repair`);
console.log(`${CHECK ? "CHECK" : "REPAIR"} compose-shapes-g1: ${changed ? `${changed} lesson files need repair` : "CURRENT"}; 14 truthful figure bindings; 6 fail-closed visuals; 7 progression causes repaired`);
