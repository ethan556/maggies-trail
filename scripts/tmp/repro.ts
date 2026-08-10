import { readFileSync } from "fs";
import { Lesson } from "../../src/lib/schema";
const data = JSON.parse(readFileSync("content/courses/data-distributions/lessons/dd-04-01.json","utf8"));
const p = Lesson.safeParse(data);
if (!p.success) for (const i of p.error.issues) console.log(JSON.stringify({path:i.path.join("."),code:i.code,msg:i.message,received:(i as any).received}));
else console.log("PARSES CLEAN");
