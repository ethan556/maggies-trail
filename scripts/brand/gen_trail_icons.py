#!/usr/bin/env python3
"""Trail icon set v2 — duotone + rationed accent.

DESIGN SYSTEM
  Grid            24x24, live area 2-22 (2px optical margin)
  Three tones     fg      currentColor            — the subject, solid mass
                  tint    currentColor @ 0.22     — the second plane / supporting mass
                  accent  Summit Orange #F08A24   — used at most ONCE per icon
  Depth           exactly two planes, never three. Tint sits behind fg.
  Mass over line  solid fills carry the form; strokes only for genuinely linear
                  things (a trail, a horizon, a cable, a handle)
  Stroke          2.0 optical, round caps and joins
  Accent rule     the accent marks the icon's POINT — the star on the summit, the
                  flame in the lantern, the north half of the needle, the lit door
                  of the tent. Pure-environment icons (pine, bridge) stay two-tone
                  on purpose; a forced accent everywhere is what makes a set read
                  as decorated rather than designed.
"""

F, T, A = "fg", "tint", "accent"


def p(d, tone=F, w=None, rule=None):
    return {"d": d, "tone": tone, "w": w, "rule": rule}


ICONS = {
    # ---------------------------------------------------------- navigation --
    "compassRose": [
        p("M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 0 0 0-19.2z", T),
        p("M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 0 0 0-19.2z", F, w=1.7),
        p("M12 20.4 9.3 12h5.4z", F),
        p("M12 3.6 14.7 12H9.3z", A),
    ],
    "signpost": [
        p("M12 22.4c3.4 0 6.2-.4 6.2-1s-2.8-1-6.2-1-6.2.4-6.2 1 2.8 1 6.2 1z", T),
        p("M10.8 2.8h2.4v18.3a1.2 1.2 0 0 1-2.4 0z", F),
        p("M13.2 12.7h6.4l2.4 2.8-2.4 2.8h-6.4z", F),
        p("M10.8 5.5H4.4L2 8.3l2.4 2.8h6.4z", A),
    ],
    "waypoint": [
        p("M12 22c2.6 0 4.7-.7 4.7-1.6S14.6 18.8 12 18.8s-4.7.7-4.7 1.6S9.4 22 12 22z", T),
        p("M12 1.7a7 7 0 0 0-7 7c0 4.8 7 11.1 7 11.1s7-6.3 7-11.1a7 7 0 0 0-7-7z", F),
        p("M12 6.2a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z", A),
    ],
    "map": [
        p("M2.3 6.5 8.7 4.2v13.3L2.3 19.8zM15.3 6.5 21.7 4.2v13.3l-6.4 2.3zM8.7 4.2 15.3 6.5v13.3L8.7 17.5z", T),
        p("M2.3 6.5 8.7 4.2 15.3 6.5 21.7 4.2v13.3l-6.4 2.3-6.6-2.3-6.4 2.3z", F, w=1.7),
        p("M8.7 4.2v13.3M15.3 6.5v13.3", F, w=1.5),
        p("M5.2 15.4c2.4-1.2 1.6-3.6 3.6-4.6s3.6.4 5-1.8", A, w=1.9),
    ],

    # ------------------------------------------------------------ the path --
    "ascent": [
        p("M1.8 20.8 12.6 5.2 22.2 20.8z", T),
        p("M6.6 20.8c2.8-1.6 2.2-4.2 4.4-5.8s2.8-3.6 2.2-5.6", F, w=2.1),
        p("M12.6 1.6l.95 2.6 2.6.95-2.6.95-.95 2.6-.95-2.6-2.6-.95 2.6-.95z", A),
    ],
    "bridge": [
        p("M1.8 19.6h20.4v2.2H1.8z", T),
        p("M5.6 4.2h2.6v11.2H5.6zM15.8 4.2h2.6v11.2h-2.6z", F),
        p("M6.9 5c2.6 5.6 7.6 5.6 10.2 0", F, w=1.7),
        p("M9.6 15.4v-3.4M12 15.4v-4.4M14.4 15.4v-3.4", F, w=1.5),
        p("M1.8 15.4h20.4v2.6H1.8z", A),
    ],
    "trailBadge": [
        p("M12 1.6 20.7 4.9v7.1c0 5.1-4 8-8.7 9.6-4.7-1.6-8.7-4.5-8.7-9.6V4.9z", F),
        p("M12 4.1v17.5c-4.7-1.6-8.7-4.5-8.7-9.6V4.9z", T),
        p("M8 14.9 12 8.7l4 6.2z", A),
    ],

    # ----------------------------------------------------------- landmarks --
    "summit": [
        p("M15.6 6.8 22.2 20.6H9z", T),
        p("M8.5 9.6 15.2 20.6H1.8z", F),
        p("M18.4 1.4l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z", A),
    ],
    "cairn": [
        p("M12 22.2c4.5 0 8.1-.5 8.1-1.2s-3.6-1.2-8.1-1.2-8.1.5-8.1 1.2 3.6 1.2 8.1 1.2z", T),
        p("M12 15.2c-3.6 0-6.5 1.2-6.5 2.7s2.9 2.7 6.5 2.7 6.5-1.2 6.5-2.7-2.9-2.7-6.5-2.7z", F),
        p("M12 9.9c-2.7 0-4.9 1-4.9 2.3s2.2 2.3 4.9 2.3 4.9-1 4.9-2.3-2.2-2.3-4.9-2.3z", F),
        p("M12 5.2c-1.8 0-3.3.8-3.3 1.9s1.5 1.9 3.3 1.9 3.3-.8 3.3-1.9-1.5-1.9-3.3-1.9z", A),
    ],
    "pine": [
        p("M17.6 5.4 22.4 13h-3l3.2 5.6h-9.2L17.2 13h-2.6z", T),
        p("M9 2.2 13.8 9.8h-2.7l3.5 6.1h-2.9l3.6 5.5H2.7l3.6-5.5H4.4l3.5-6.1H5.2z", F),
        p("M7.9 21.4h2.2v1.2H7.9z", T),
    ],
    "basecamp": [
        p("M12 3.2 22.2 20.8H12z", T),
        p("M12 3.2 1.8 20.8H12z", F),
        p("M12 11.8 15.6 20.8H8.4z", A),
    ],
    "summitFlag": [
        p("M12 22.2c4 0 7.2-.5 7.2-1.1s-3.2-1.1-7.2-1.1-7.2.5-7.2 1.1 3.2 1.1 7.2 1.1z", T),
        p("M5.4 2.4h2.2v18.4a1.1 1.1 0 0 1-2.2 0z", F),
        p("M7.6 3.8h12l-2.9 4 2.9 4h-12z", A),
    ],

    # ------------------------------------------------------------- terrain --
    "elevation": [
        p("M2.2 20.4V15l4.6-5.9 3.2 3.5L14.8 4l3.5 6.1 3.5-3.6v13.9z", T),
        p("M2.2 20.4h19.6", F, w=2.1),
        p("M2.2 16.4 6.8 10.6l3.2 3.5L14.8 5.6l3.5 6.1 3.5-3.6", F, w=2.1),
        p("M14.8 5.6a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8z", A),
    ],

    # ----------------------------------------------------------------- kit --
    "backpack": [
        p("M7 7.6h10a3.6 3.6 0 0 1 3.6 3.6v7.4A2.8 2.8 0 0 1 17.8 21.4H6.2a2.8 2.8 0 0 1-2.8-2.8v-7.4A3.6 3.6 0 0 1 7 7.6z", F),
        p("M8.4 21.4v-4.9a3.6 3.6 0 0 1 7.2 0v4.9z", T),
        p("M8.8 7.6V5.9a3.2 3.2 0 0 1 6.4 0v1.7", F, w=2.1),
        p("M10.3 17.6h3.4", A, w=2.2),
    ],
    "lantern": [
        p("M8.4 8h7.2l.8 10.4H7.6z", T),
        p("M9.2 5.2a2.8 2.8 0 0 1 5.6 0", F, w=2.1),
        p("M7.4 5.4h9.2l-1.1 2.6H8.5z", F),
        p("M6.8 18.4h10.4v2.8H6.8z", F),
        p("M12 10.4c1.85 1.7 1.85 4.2 0 5.8-1.85-1.6-1.85-4.1 0-5.8z", A),
    ],
    "binoculars": [
        p("M10.6 10.2h2.8v3.4h-2.8z", T),
        p("M6.9 5a4.1 4.1 0 0 1 4.1 4.1v7.1a4.1 4.1 0 0 1-8.2 0V9.1A4.1 4.1 0 0 1 6.9 5zM17.1 5a4.1 4.1 0 0 1 4.1 4.1v7.1a4.1 4.1 0 0 1-8.2 0V9.1A4.1 4.1 0 0 1 17.1 5z", F),
        p("M6.9 13.9a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zM17.1 13.9a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z", A),
    ],

    # ------------------------------------------------------------- moments --
    "sunrise": [
        p("M12 3.4v2.8M4.6 6.5l2 2M19.4 6.5l-2 2M1.6 15.4h2.6M19.8 15.4h2.6", T, w=2.1),
        p("M12 9.4a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z", A),
        p("M2.2 18.2h19.6M6.6 21.4h10.8", F, w=2.2),
    ],
    "northStar": [
        p("M12 1.4 14.8 9.2 22.6 12 14.8 14.8 12 22.6 9.2 14.8 1.4 12 9.2 9.2z", T),
        p("M12 4.6 13.9 10.1 19.4 12 13.9 13.9 12 19.4 10.1 13.9 4.6 12 10.1 10.1z", A),
    ],
}

ORDER = [
    ("Navigation", ["compassRose", "signpost", "waypoint", "map"]),
    ("The path", ["ascent", "bridge", "trailBadge"]),
    ("Landmarks", ["summit", "cairn", "pine", "basecamp", "summitFlag"]),
    ("Terrain", ["elevation"]),
    ("Kit", ["backpack", "lantern", "binoculars"]),
    ("Moments", ["sunrise", "northStar"]),
]

ACCENT = "#F08A24"


def body(name, fg="#0D1B2A", accent=ACCENT, tint_op=0.26):
    out = []
    for s in ICONS[name]:
        col = {"fg": fg, "accent": accent, "tint": fg}[s["tone"]]
        op = f' opacity="{tint_op}"' if s["tone"] == "tint" else ""
        rule = f' fill-rule="{s["rule"]}"' if s["rule"] else ""
        if s["w"]:
            out.append(f'<path d="{s["d"]}" fill="none" stroke="{col}" '
                       f'stroke-width="{s["w"]}" stroke-linecap="round" '
                       f'stroke-linejoin="round"{op}/>')
        else:
            out.append(f'<path d="{s["d"]}" fill="{col}"{rule}{op}/>')
    return "".join(out)


if __name__ == "__main__":
    import cairosvg

    names = [n for _, g in ORDER for n in g]
    assert len(names) == len(ICONS) == len(set(names))

    SIZES = [16, 20, 24, 32, 64]
    CELL, PAD, GAP = 230, 22, 14
    cols = 4
    rows = (len(names) + cols - 1) // cols
    W = cols * CELL + PAD * 2
    H = rows * (CELL) + PAD * 2

    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}">'
             f'<rect width="{W}" height="{H}" fill="#F7F3EC"/>']
    for i, n in enumerate(names):
        cx = PAD + (i % cols) * CELL
        cy = PAD + (i // cols) * CELL
        x, base = cx + 10, cy + 84
        for s in SIZES:
            parts.append(f'<g transform="translate({x},{base - s}) scale({s / 24})">'
                         + body(n) + "</g>")
            x += s + GAP
        parts.append(f'<text x="{cx + 10}" y="{cy + 112}" font-family="monospace" '
                     f'font-size="13" fill="#0D1B2A">{n}</text>')
    parts.append("</svg>")
    svg = "".join(parts)
    cairosvg.svg2png(bytestring=svg.encode(), write_to="/tmp/v2_sheet.png", scale=1.6)
    print(f"{len(names)} icons -> /tmp/v2_sheet.png")
