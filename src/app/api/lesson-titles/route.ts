import { NextResponse } from "next/server";
import { readJson } from "@/server/http";
import { getCatalog } from "@/lib/content.server";

/** POST { ids: string[] } → { titles: Record<lessonId, title> }. Serves the
 * missed-predictions card, which lives client-side with the profile but needs
 * server-side lesson titles. Unknown ids are simply omitted. */
export async function POST(req: Request) {
  const body = await readJson<{ ids?: unknown }>(req);
  if (!body) return NextResponse.json({ titles: {} }, { status: 400 });
  let ids = Array.isArray(body.ids)
    ? body.ids.filter((x): x is string => typeof x === "string" && x.length <= 300)
    : [];
  ids = ids.slice(0, 50);
  const cat = await getCatalog();
  const titles: Record<string, string> = {};
  for (const id of ids) {
    const s = cat.lessonIndex[id];
    if (s) titles[id] = s.title;
  }
  return NextResponse.json({ titles });
}
