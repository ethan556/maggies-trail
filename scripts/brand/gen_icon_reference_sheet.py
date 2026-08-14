#!/usr/bin/env python3
"""Self-contained HTML reference sheet for the whole AppIcon set."""
import re, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from gen_trail_icons import ICONS as TRAIL, ORDER as TRAIL_ORDER, body as trail_body

# Alphanumeric ids are canonical, per the naming ruling: an icon carries no name, only an
# identifier. Blocks mirror the avatar spec so a later addition never renumbers an earlier
# one. The concept word below is documentation for a human reading this sheet — it is not
# an alias, is not accepted by AppIcon, and appears nowhere in the app.
IDS = {
    "compassRose": "icon-001", "signpost": "icon-002", "waypoint": "icon-003", "map": "icon-004",
    "ascent": "icon-101", "bridge": "icon-102", "trailBadge": "icon-103",
    "summit": "icon-201", "cairn": "icon-202", "pine": "icon-203", "basecamp": "icon-204",
    "summitFlag": "icon-205", "elevation": "icon-301",
    "backpack": "icon-401", "lantern": "icon-402", "binoculars": "icon-403",
    "sunrise": "icon-501", "northStar": "icon-502",
}

LINE_IDS = {
 "icon-601":"home","icon-602":"courses","icon-603":"review","icon-604":"daily","icon-605":"family",
 "icon-606":"profile","icon-607":"account","icon-608":"premium","icon-609":"more",
 "icon-701":"chevronRight","icon-702":"chevronDown","icon-703":"arrowLeft","icon-704":"check",
 "icon-705":"lock","icon-706":"sun","icon-707":"moon",
 "icon-801":"spark","icon-802":"flame","icon-803":"target","icon-804":"trophy","icon-805":"chart",
 "icon-806":"repeat","icon-807":"route","icon-808":"compass",
 "icon-901":"notebook","icon-902":"tally","icon-903":"operations","icon-904":"fraction",
 "icon-905":"ruler","icon-906":"clock","icon-907":"shapes","icon-908":"angle","icon-909":"scale",
 "icon-910":"functionCurve","icon-911":"calculus","icon-912":"dice",
}

src = open(pathlib.Path(__file__).resolve().parents[2] / "src/components/ui.tsx").read()
block = src.split("const PATHS: Record<LineIconName, React.ReactNode> = {", 1)[1]
block = block.split("\n};", 1)[0]

line_icons, line_order = {}, []
for m in re.finditer(r'^  "(icon-[0-9]+)":\s*(.*?)(?=^  "icon-|\Z)', block, re.S | re.M):
    name, b = m.group(1), m.group(2)
    prims = re.findall(r"<(path|circle|rect|ellipse|line|polyline)\b([^/>]*)/?>", b)
    if prims:
        line_icons[name] = "".join(f"<{t}{a.rstrip()} />" for t, a in prims)
        line_order.append(name)


def svg(name, size):
    if name in TRAIL:
        inner = trail_body(name, fg="currentColor", accent="var(--accent)")
        head = ""
    else:
        inner = line_icons[name]
        head = (' stroke="currentColor" stroke-width="2" stroke-linecap="round"'
                ' stroke-linejoin="round"')
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none"'
            f'{head} aria-hidden="true">{inner}</svg>')


def cell(name):
    sizes = "".join(f'<span class="s">{svg(name, s)}</span>' for s in (16, 20, 24, 32, 56))
    if name in IDS:
        cap = f'<b>{IDS[name]}</b><span class="concept">{name}</span>'
    elif name in LINE_IDS:
        cap = f'<b>{name}</b><span class="concept">{LINE_IDS[name]}</span>'
    else:
        cap = name
    return (f'<figure class="cell"><div class="row">{sizes}</div>'
            f'<figcaption>{cap}</figcaption></figure>')


sec = []
sec.append('<h2>Trail set <span class="count">18 · duotone</span></h2>')
sec.append('<p class="lede">Three tones: <b>fg</b> is <code>currentColor</code> as solid mass, '
           '<b>tint</b> is the same colour at 26% — the plane behind it, which is why no dark-mode '
           'variant is needed — and <b>accent</b> is Summit Orange, used <i>at most once per icon</i>, '
           'on the element that IS the icon\'s point: the star on the summit, the flame in the '
           'lantern, the north half of the needle, the lit door of the tent, the deck you cross. '
           'Depth is exactly two planes, never three.</p>')
sec.append('<p class="lede"><b>The id is the name.</b> Per the naming ruling these carry alphanumeric '
           'identifiers only \u2014 <code>&lt;AppIcon name="icon-201" /&gt;</code>, file <code>public/icons/set/icon-201.svg</code>. '
           'Blocks follow the avatar spec so a later addition never renumbers an earlier one: '
           '<b>0xx</b> navigation, <b>1xx</b> the path, <b>2xx</b> landmarks, <b>3xx</b> terrain, '
           '<b>4xx</b> kit, <b>5xx</b> moments. The grey word under each id is documentation for '
           'this sheet only \u2014 it is not an alias, <code>AppIcon</code> does not accept it, and it '
           'appears nowhere in the app.</p>')
for grp, names in TRAIL_ORDER:
    sec.append(f'<h3>{grp}</h3><div class="grid">' + "".join(cell(n) for n in names) + "</div>")

sec.append(f'<h2>Line set <span class="count">{len(line_order)} · single-weight</span></h2>')
sec.append('<p class="lede">The existing vocabulary, untouched. Shown so the halves can be judged '
           'as one family. Now alphanumeric too, on the same block discipline: <b>6xx</b> shell, '
           '<b>7xx</b> chrome, <b>8xx</b> status and reward, <b>9xx</b> mathematics. The deliberate '
           'near-pairs stay checkable side by side \u2014 <code>icon-001</code> is a rose where '
           '<code>icon-808</code> is a needle; <code>icon-101</code> is a rising path where '
           '<code>icon-807</code> is a wired one; <code>icon-501</code> sits on a horizon where '
           '<code>icon-706</code> is overhead.</p>')
sec.append('<div class="grid">' + "".join(cell(n) for n in line_order) + "</div>")

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Maggie's Trail — icon reference</title>
<style>
  :root {{ --navy:#0D1B2A; --ivory:#F7F3EC; --accent:#F08A24;
    --bg:var(--ivory); --fg:var(--navy); --muted:#0D1B2A99; --line:#0D1B2A1f; --card:#ffffff8c; }}
  body.dark {{ --bg:#0D1B2A; --fg:#F7F3EC; --muted:#F7F3EC99; --line:#F7F3EC24; --card:#F7F3EC0d; }}
  * {{ box-sizing:border-box }}
  body {{ margin:0; padding:40px 32px 72px; background:var(--bg); color:var(--fg);
    font:15px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    transition:background .2s,color .2s }}
  .wrap {{ max-width:1120px; margin:0 auto }}
  header {{ display:flex; align-items:baseline; gap:16px; flex-wrap:wrap;
    border-bottom:1px solid var(--line); padding-bottom:18px; margin-bottom:26px }}
  h1 {{ font-size:22px; margin:0; letter-spacing:-.01em }}
  h1 b {{ color:var(--accent) }}
  h2 {{ font-size:17px; margin:46px 0 6px; display:flex; align-items:center; gap:10px }}
  h3 {{ font-size:12px; text-transform:uppercase; letter-spacing:.09em; color:var(--muted);
    margin:26px 0 10px; font-weight:600 }}
  .count {{ font-size:11px; font-weight:600; color:var(--accent);
    border:1px solid var(--accent); border-radius:999px; padding:2px 9px }}
  .lede {{ margin:0 0 8px; color:var(--muted); max-width:74ch; font-size:13.5px }}
  code {{ font:12.5px ui-monospace,SFMono-Regular,Menlo,monospace;
    background:var(--line); padding:1px 5px; border-radius:5px }}
  .grid {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:10px }}
  .cell {{ margin:0; padding:15px 13px 12px; border:1px solid var(--line); border-radius:14px;
    background:var(--card) }}
  .row {{ display:flex; align-items:flex-end; gap:11px; height:58px }}
  .s {{ display:inline-flex; align-items:flex-end }}
  figcaption {{ margin-top:12px; font:12px ui-monospace,SFMono-Regular,Menlo,monospace;
    color:var(--muted); overflow-wrap:anywhere }}
  figcaption b {{ color:var(--fg); font-weight:600 }}
  .concept {{ display:block; margin-top:3px; font-size:11px; opacity:.62 }}
  button {{ font:inherit; font-size:13px; cursor:pointer; border:1px solid var(--line);
    background:transparent; color:var(--fg); border-radius:999px; padding:6px 15px }}
  button:hover {{ border-color:var(--accent); color:var(--accent) }}
  .note {{ margin-top:52px; padding-top:20px; border-top:1px solid var(--line);
    color:var(--muted); font-size:13px; max-width:78ch }}
</style></head>
<body><div class="wrap">
<header><h1>Maggie's Trail <b>·</b> icon reference</h1><button id="t">Toggle dark</button></header>
{''.join(sec)}
<p class="note">Every icon is shown at <b>16 · 20 · 24 · 32 · 56&nbsp;px</b> — the sizes it renders
at in the app. Anything that stopped reading at 16 was redrawn or cut rather than shipped: a
<code>contour</code> icon (nested topographic rings) was designed three times and dropped, because
nested closed curves collapse into a bullseye at this scale and <code>elevation</code> already
carries that meaning.</p>
</div>
<script>
  var b=document.body,t=document.getElementById('t');
  t.addEventListener('click',function(){{ b.classList.toggle('dark');
    t.textContent=b.classList.contains('dark')?'Toggle light':'Toggle dark'; }});
</script></body></html>"""

open(pathlib.Path(__file__).resolve().parents[2] / "maggies-trail-icons.html", "w").write(html)
print(f"{len(TRAIL)} trail + {len(line_order)} line = {len(TRAIL) + len(line_order)} icons")
