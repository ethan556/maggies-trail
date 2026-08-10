import { readFileSync, writeFileSync } from "node:fs";
const { WidgetSpec, widgetIntegrityErrors, shapePartCount } = await import("../../src/lib/schema.ts");

const w = (o) => ({ type: "shapeParts", ...o });
const P = [
  { path: "content/courses/shapes-measure-g1/lessons/smg1-01-01.json", lesson: "smg1-01-01", steps: {
    i1: { predict: {
      prompt: "You will touch each side of the triangle once. How many touches will that take?",
      options: [{ id: "three", label: "3" }, { id: "two", label: "2" }, { id: "four", label: "4" }],
      outcomeId: "three",
      reveal: "A triangle has three straight sides. Touch each one and count as you go \u2014 that is what \u201chow many sides\u201d means." },
      widget: w({ prompt: "Touch each side of the triangle to count it.", shape: "polygon", sides: 3, part: "sides",
        successFeedback: "3 sides! You touched every side once. That is what makes it a triangle \u2014 \u201ctri\u201d means three.",
        missedFeedback: "There is still a side you have not touched. Go round the shape and get them all.",
        doubleCountFeedback: "You touched one side twice. Tap it again to let it go, then go round in order." }) },
    i2: { widget: w({ prompt: "Touch each side of the hexagon to count it.", shape: "polygon", sides: 6, part: "sides",
        successFeedback: "6 sides! A hexagon has six. Going round in order helps you not lose your place.",
        missedFeedback: "Some sides are still waiting. Keep going round the shape.",
        doubleCountFeedback: "That side is already counted. Tap it again to let it go." }) },
    i3: { widget: w({ prompt: "Touch each corner of the pentagon to count it.", shape: "polygon", sides: 5, part: "corners",
        successFeedback: "5 corners! A pentagon has five corners and five sides \u2014 they always match.",
        missedFeedback: "There is still a corner left. Look where two sides meet.",
        doubleCountFeedback: "That corner is already counted. Tap it again to let it go." }) } } },
  { path: "content/courses/shapes-measure-g1/lessons/smg1-01-02.json", lesson: "smg1-01-02", steps: {
    i2: { widget: w({ prompt: "Touch each flat face of the cube to count it. The dashed lines show the faces round the back.",
        shape: "cube", part: "faces",
        successFeedback: "6 faces! A cube has six flat square faces \u2014 top, bottom, front, back, and two sides.",
        missedFeedback: "Some faces are still uncounted. The dashed lines lead to the ones at the back.",
        doubleCountFeedback: "That face is already counted. Tap it again to let it go." }) },
    i3: { widget: w({ prompt: "Touch each FLAT face of the cylinder. The curved part that wraps around is not flat.",
        shape: "cylinder", part: "faces",
        successFeedback: "2 flat faces \u2014 the circle on top and the circle on the bottom. The part that wraps around is curved, not flat.",
        missedFeedback: "There is one more flat face. Look at the other end.",
        doubleCountFeedback: "That face is already counted. Tap it again to let it go." }) } } },
  { path: "content/courses/shapes-measure-g1/lessons/smg1-01-03.json", lesson: "smg1-01-03", steps: {
    i1: { predict: {
      prompt: "A cube's corners are called vertices. Some are at the front and some are hidden at the back. How many in all?",
      options: [{ id: "eight", label: "8" }, { id: "four", label: "4" }, { id: "six", label: "6" }],
      outcomeId: "eight",
      reveal: "Four corners sit at the front and four more sit behind them \u2014 eight in all. The dashed lines will help you find the ones at the back." },
      widget: w({ prompt: "Touch each vertex of the cube. The dashed lines lead to the ones at the back.",
        shape: "cube", part: "vertices",
        successFeedback: "8 vertices! Four at the front and four behind. The hidden ones still count, even though you cannot see straight through to them.",
        missedFeedback: "Some corners are still uncounted \u2014 follow the dashed lines to the back ones.",
        doubleCountFeedback: "That corner is already counted. Tap it again to let it go." }) },
    i2: { widget: w({ prompt: "Touch each face of the rectangular prism to count it.", shape: "rectangularPrism", part: "faces",
        successFeedback: "6 faces \u2014 the same as a cube. A prism is stretched, but stretching does not add or remove faces.",
        missedFeedback: "Some faces are still uncounted. The dashed lines lead to the back ones.",
        doubleCountFeedback: "That face is already counted. Tap it again to let it go." }) },
    i3: { widget: w({ prompt: "Touch each vertex of the rectangular prism to count it.", shape: "rectangularPrism", part: "vertices",
        successFeedback: "8 vertices \u2014 the same as a cube again. Stretching a solid moves its corners but never changes how many there are.",
        missedFeedback: "Some corners are still uncounted \u2014 follow the dashed lines.",
        doubleCountFeedback: "That corner is already counted. Tap it again to let it go." }) } } },
  { path: "content/courses/shapes-shares-g2/lessons/ssg2-01-01.json", lesson: "ssg2-01-01", steps: {
    i1: { predict: {
      prompt: "\u201cHepta\u201d means seven. Before counting \u2014 how many sides will the heptagon have?",
      options: [{ id: "seven", label: "7" }, { id: "six", label: "6" }, { id: "eight", label: "8" }],
      outcomeId: "seven",
      reveal: "Shape names carry their number: hexa is 6, hepta is 7, octa is 8. Counting the sides confirms the name is not arbitrary." },
      widget: w({ prompt: "Touch each side of the heptagon to count it.", shape: "polygon", sides: 7, part: "sides",
        successFeedback: "7 sides. \u201cHepta\u201d means seven \u2014 the name tells you the count before you start, and counting proves it.",
        missedFeedback: "Some sides are still uncounted. Go round the shape in order so none gets skipped.",
        doubleCountFeedback: "That side is already counted. Tap it again to release it." }) } } },
  { path: "content/courses/shapes-shares-g2/lessons/ssg2-01-02.json", lesson: "ssg2-01-02", steps: {
    i1: { predict: {
      prompt: "A square pyramid sits on a square base with triangles rising to a point. How many faces in total?",
      options: [{ id: "five", label: "5 \u2014 four triangles and the base" }, { id: "four", label: "4 \u2014 just the triangles" }, { id: "six", label: "6" }],
      outcomeId: "five",
      reveal: "The base is a face too \u2014 it is flat and it closes the solid. Four triangles plus one square base makes five." },
      widget: w({ prompt: "Touch each face of the square pyramid. Do not forget the base it stands on.",
        shape: "squarePyramid", part: "faces",
        successFeedback: "5 faces \u2014 four triangles rising to the point, plus the square base. The base is easy to forget because the pyramid sits on it.",
        missedFeedback: "One face is still uncounted. Is it the base underneath?",
        doubleCountFeedback: "That face is already counted. Tap it again to release it." }) },
    i2: { widget: w({ prompt: "Touch each vertex of the square pyramid to count it.", shape: "squarePyramid", part: "vertices",
        successFeedback: "5 vertices \u2014 the four base corners plus the point on top. A square pyramid has the same number of faces as vertices, which is unusual.",
        missedFeedback: "One corner is still uncounted \u2014 check the point at the top.",
        doubleCountFeedback: "That corner is already counted. Tap it again to release it." }) } } }
];

let n = 0; const staged = [];
for (const plan of P) {
  const doc = JSON.parse(readFileSync(plan.path, "utf8"));
  let touched = false;
  for (const [sid, ch] of Object.entries(plan.steps)) {
    const st = doc.steps.find((s) => s.id === sid);
    if (!st) throw new Error(`${plan.lesson}: ${sid} missing`);
    if (st.widget?.type === "shapeParts") continue;
    if (st.widget?.type !== "numeric") throw new Error(`${plan.lesson}/${sid}: expected numeric, found ${st.widget?.type}`);
    if (st.variant) throw new Error(`${plan.lesson}/${sid}: has a variant tag`);
    const authored = st.widget.answer;
    const errs = widgetIntegrityErrors(WidgetSpec.parse(ch.widget));
    if (errs.length) throw new Error(`${plan.lesson}/${sid}: ${errs.join("; ")}`);
    const derived = shapePartCount(ch.widget.shape, ch.widget.sides, ch.widget.part);
    if (derived !== authored) throw new Error(`${plan.lesson}/${sid}: derived ${derived} != authored answer ${authored}`);
    console.log(`  ${plan.lesson}/${sid}: ${ch.widget.shape} ${ch.widget.part} = ${derived} (matches authored ${authored})`);
    const bodyBefore = st.body;
    const rebuilt = {};
    for (const k of Object.keys(st)) {
      if (k === "widget") { if (ch.predict) rebuilt.predict = ch.predict; rebuilt.widget = ch.widget; continue; }
      rebuilt[k] = st[k];
    }
    if (rebuilt.body !== bodyBefore) throw new Error(`${plan.lesson}/${sid}: body changed`);
    doc.steps[doc.steps.findIndex((s) => s.id === sid)] = rebuilt;
    touched = true; n++;
  }
  if (touched) staged.push([plan.path, doc, plan.lesson]);
}
for (const [path, doc, lesson] of staged) { writeFileSync(path, JSON.stringify(doc, null, 2), "utf8"); console.log(`${lesson}: written`); }
console.log(`${n} steps converted across ${staged.length} lessons`);
