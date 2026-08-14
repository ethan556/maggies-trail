#!/usr/bin/env python3
"""Build the 60-concept avatar prompt pack from AVATAR_CONCEPT_LEDGER.md trait lines
plus AVATAR_ART_PRODUCTION_SPEC.md's framing/lighting/finish rules.

One render-ready prompt per avatar id. The style block is byte-identical across every
portrait prompt — that invariance is what makes the library read as one art team, and it
is what the FABLE-Q contact-sheet gate (spec §6) actually checks.
"""
import json, textwrap

# ---------------------------------------------------------------- locked style blocks

STYLE_PORTRAIT = (
    "Dimensional stylized-illustration portrait with real shading and volume — soft painterly "
    "rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, "
    "not glossy 3D render. "
    "Head-and-shoulders, portrait orientation, subject centred and facing the viewer. "
    "Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50% of "
    "frame height. Both shoulders visible, cropped at a consistent point below the collarbone — "
    "not at the neck, not at the elbows. "
    "Uniform empty margin on all four sides between the subject's outer silhouette (hair included) "
    "and the canvas edge; nothing touches or bleeds past the edge. "
    "Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, "
    "no scenery, no drop shadow, no implied surface. "
    "Soft, even key light from the front and slightly left, gentle falloff, no hard rim light. "
    "Warm but restrained saturation, matched across the whole library."
)

STYLE_SYMBOL = (
    "Dimensional stylized illustrated mark with real shading and volume — soft painterly "
    "rendering, subtle form modelling. Not flat vector, not photoreal, not glossy 3D render, "
    "not an emoji, not a line icon. "
    "Single subject centred in the frame, occupying roughly 60% of frame height, with uniform "
    "empty margin on all four sides. "
    "Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, "
    "no scenery, no drop shadow, no implied surface. "
    "Soft, even key light from the front and slightly left. "
    "Brand palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the rationed "
    "accent. Warm but restrained saturation, matched across the whole library."
)

NEGATIVE = (
    "phone frame, device bezel, home button, screen chrome, rounded card, border, frame, mockup, "
    "drop shadow, gradient background, scenery, props, text, letters, numbers, watermark, "
    "signature, logo type, multiple subjects, collage, contact sheet, hands, full body, "
    "photorealistic skin, 3D plastic render, flat vector, harsh rim light, colour cast"
)

CANVAS = "Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256."

BANDS = {
    "early": dict(
        block="001-012", grades="K-2 (grade ids 0-2)",
        age="a young child, roughly 5 to 8 years old",
        note=("Keep genuinely young-child proportions — rounder face, larger eye-to-face ratio, "
              "soft jaw. Do not age up for polish."),
    ),
    "explorer": dict(
        block="101-112", grades="grades 3-5",
        age="an upper-elementary child, roughly 9 to 11 years old",
        note=("Slightly longer face and narrower proportions than the early band, still clearly "
              "pre-adolescent."),
    ),
    "adventurer": dict(
        block="201-212", grades="grades 6-8",
        age="an early teenager, roughly 12 to 14 years old",
        note="Middle-school proportions — the maturity level of sample board 1.",
    ),
    "summit": dict(
        block="301-312", grades="grades 9-13",
        age="a high-school student, roughly 15 to 18 years old",
        note=("Genuinely older proportions, styling and bearing — board 1's most mature concept is "
              "the FLOOR, not the ceiling. Self-possessed or quiet expression, not beaming. "
              "This is NOT an enlarged elementary character."),
    ),
}

# ---------------------------------------------------------------- concept data (from the ledger)

PORTRAITS = [
    # (id, band, source, traits)
    ("avatar-001", "early", "board 2:1 (C05)", "Two high puff buns with braided sections and gold bead accents; broad open smile; yellow tee under light-blue denim overalls"),
    ("avatar-002", "early", "board 2:2 (C06)", "Straight black hair with a fringe; round dark-rimmed glasses; royal-blue hoodie"),
    ("avatar-003", "early", "board 2:3 (C07)", "Dark wavy high ponytail with a yellow scrunchie; small gold stud earrings; purple tunic-style top with an embroidered placket"),
    ("avatar-004", "early", "board 2:4 (C08)", "Loose curly mid-brown hair; freckles; big smile; green-and-cream raglan tee"),
    ("avatar-005", "early", "board 3:1 (C09)", "Teal/sea-green head covering that drapes over the shoulders; cream top with delicate floral embroidery; gentle smile"),
    ("avatar-006", "early", "board 3:2 (C10)", "Short tightly-coiled dark hair; wide grin; golden-yellow drawstring hoodie"),
    ("avatar-007", "early", "board 3:3 (C11)", "Shoulder-length coppery-red hair; freckles across the nose and cheeks; sage-green tee under blue denim overalls"),
    ("avatar-008", "early", "board 3:4 (C12)", "Short straight black hair with a side-swept fringe; royal-blue zip jacket over a striped tee"),
    ("avatar-009", "early", "net-new", "Curly afro-textured hair shaped into a rounded puff with a thin striped headband; wide gap-toothed grin; teal-and-cream colour-blocked tee"),
    ("avatar-010", "early", "net-new", "Two short braided pigtails finished with small colourful beads; easy smile; rust-red overalls over a cream long-sleeve top"),
    ("avatar-011", "early", "net-new", "Chin-length straight hair held back with a wide fabric headband; round dark-rimmed glasses; golden-yellow cardigan over a cream tee"),
    ("avatar-012", "early", "net-new", "Short loose curls with a single flower hair clip; freckles across the cheeks; sage-green tunic top with rust trim"),

    ("avatar-101", "explorer", "board 4:1 (C13)", "Short twists/coils on top with faded sides; bright smile; royal-blue track jacket with double white shoulder stripes and a white zip"),
    ("avatar-102", "explorer", "board 4:2 (C14)", "Straight black chin-length bob with a centre part; small stud earrings; lilac cardigan over a cream collared shirt"),
    ("avatar-103", "explorer", "board 4:3 (C15)", "Short wavy black hair; soft smile; forest-green crewneck over a cream tee"),
    ("avatar-104", "explorer", "board 4:4 (C16)", "Long wavy brown hair; small gold hoop earrings; blue denim jacket over a cream top"),
    ("avatar-105", "explorer", "net-new", "Curly afro-textured hair in a rounded high puff with a thin patterned headband; easy grin; royal-blue zip-up hoodie over a cream striped tee"),
    ("avatar-106", "explorer", "net-new", "Two neat box braids gathered into low pigtails; round wire-rimmed glasses; golden-yellow raglan tee under an open chambray shirt"),
    ("avatar-107", "explorer", "net-new", "Patterned teal-and-cream head wrap framing the face with loose strands at the temples; small gold stud earrings; sage-green quarter-zip pullover over a cream tee"),
    ("avatar-108", "explorer", "net-new", "Short tightly-coiled hair cut close with a sharp side part; confident grin; teal track jacket with cream trim over a cream tee"),
    ("avatar-109", "explorer", "net-new", "Straight waist-length hair in a high ponytail wrapped with a bright scrunchie; freckles; lilac zip hoodie over a cream tee"),
    ("avatar-110", "explorer", "net-new", "Short wavy hair with a deep side part; thin round glasses; rust bomber-style jacket over a cream tee"),
    ("avatar-111", "explorer", "net-new", "Chin-length curly bob; small silver hoop earrings; forest-green cardigan over a cream striped tee"),
    ("avatar-112", "explorer", "net-new", "Short natural coils with a faded side part and a single thin braid accent; warm smile; denim jacket over a golden-yellow tee"),

    ("avatar-201", "adventurer", "board 1:1 (C01)", "Long thin box braids past the shoulders; small gold hoop earrings and a fine pendant necklace; dark-green ribbed top"),
    ("avatar-202", "adventurer", "board 1:2 (C02)", "Tousled wavy golden-brown hair; freckles; cream drawstring hoodie under a blue denim jacket"),
    ("avatar-203", "adventurer", "board 1:3 (C03)", "Short tousled black hair with a fringe; dark navy zip jacket over a black hoodie with a light tee beneath"),
    ("avatar-204", "adventurer", "board 1:4 (C04)", "Very long wavy dark hair; teardrop turquoise earrings and a small pendant necklace; patterned rust-red top"),
    ("avatar-205", "adventurer", "net-new", "Short natural coils cut close with a defined part; confident grin; teal zip-up jacket over a cream tee"),
    ("avatar-206", "adventurer", "net-new", "Two thin braided pigtails past the shoulders with small gold cuffs at the ends; sage-green hoodie under a denim jacket"),
    ("avatar-207", "adventurer", "net-new", "Loose corkscrew curls pulled half-up with a small clip; freckles; rust hoodie over a cream long-sleeve top"),
    ("avatar-208", "adventurer", "net-new", "Chin-length straight bob with blunt bangs; small silver stud earrings; golden-yellow crewneck over a cream tee"),
    ("avatar-209", "adventurer", "net-new", "Long single braid resting over one shoulder; wide open smile; royal-blue track jacket over a cream striped tee"),
    ("avatar-210", "adventurer", "net-new", "Short wavy hair with a tousled side part; relaxed half-smile; forest-green hoodie under a light denim jacket"),
    ("avatar-211", "adventurer", "net-new", "Shoulder-length twists with a faded undercut at the sides; small hoop earrings; denim zip jacket over a teal tee"),
    ("avatar-212", "adventurer", "net-new", "Long wavy hair swept into a high half-up twist; turquoise stud earrings; lilac hoodie over a cream tee"),

    ("avatar-301", "summit", "net-new (P0)", "Short tapered coils with a subtle side part; quiet half-smile; charcoal quarter-zip pullover over a light-grey tee"),
    ("avatar-302", "summit", "net-new (P0)", "Shoulder-length locs tied back in a low ponytail; small silver stud earrings; olive canvas jacket over a plain cream tee"),
    ("avatar-303", "summit", "net-new (P0)", "Straight dark hair in a low bun with loose face-framing strands; thin wire-rimmed glasses; navy button-up shirt with the sleeves rolled"),
    ("avatar-304", "summit", "net-new (P0)", "Short undercut with longer curls left on top; confident closed-mouth smile; rust bomber jacket over a charcoal tee"),
    ("avatar-305", "summit", "net-new (P0)", "Long single braid over one shoulder with a few loose flyaway strands; freckles; forest-green flannel shirt over a cream tee"),
    ("avatar-306", "summit", "net-new (P0)", "Loose shoulder-length wavy hair with a centre part; small hoop earrings; cream cardigan over a rust top"),
    ("avatar-307", "summit", "net-new (P0)", "Short locs cropped close to the head; faint, self-possessed smile; denim trucker jacket over a cream tee"),
    ("avatar-308", "summit", "net-new (P0)", "Long straight hair with a deep side part; round tortoiseshell-style glasses; sage-green cardigan over a cream turtleneck"),
    ("avatar-309", "summit", "net-new (P0)", "Twin long braids past the chest tied off with simple dark cord; steady, self-possessed expression; teal flannel shirt with the sleeves rolled, over a cream tee"),
    ("avatar-310", "summit", "net-new (P0)", "Short cropped locs with a faded undercut; relaxed half-smile; golden-yellow crewneck sweater over a collared cream shirt"),
    ("avatar-311", "summit", "net-new (P0)", "Loose waves pulled into a low ponytail beneath a teal-patterned head wrap; calm, warm expression; cream button-up shirt under a rust cardigan"),
    ("avatar-312", "summit", "net-new (P0)", "Short tousled wavy hair; thin rectangular glasses; charcoal bomber jacket over an olive tee"),
]

SYMBOLS = [
    ("avatar-401", "adventurer", "Maggie mark medallion — the twin-peaks-and-trail brand icon rendered as a dimensional badge, deep navy on warm ivory, a single summit-orange four-point star above the peaks"),
    ("avatar-402", "summit", "Function summit — a smooth rising curve cresting into a peak and easing over, deep navy, with a single summit-orange point marking the crest"),
    ("avatar-403", "early", "First step — one deep-navy boot print pressed into a warm trail, a short dotted path continuing ahead in summit orange"),
    ("avatar-404", "early", "Counting cairn — three balanced trail stones in warm stone tones, the topmost summit orange, quietly reading as one, two, three without any numeral"),
    ("avatar-405", "early", "Shape sprout — a young seedling whose two leaves are a clean triangle and a clean circle, forest green with a summit-orange stem"),
    ("avatar-406", "summit", "Proof lantern — a trail lantern casting a widening cone of warm light downward, deep-navy body, summit-orange flame and light"),
    ("avatar-407", "summit", "Infinity trail — a single winding path that loops back through itself into a continuous figure-eight, deep navy with a summit-orange lead segment"),
    ("avatar-408", "explorer", "Fraction bridge — a rope-and-plank trail bridge whose evenly spaced planks read as equal parts of one span, warm timber over deep-navy cables"),
    ("avatar-409", "explorer", "Pattern peak — a ridgeline of repeating peaks stepping up in a steady rhythm, deep navy, the tallest tipped summit orange"),
    ("avatar-410", "adventurer", "Data ridge — a mountain ridge whose profile is also a rising bar sequence, deep navy, the tallest bar summit orange"),
    ("avatar-411", "explorer", "Coordinate compass — a trail compass whose face is a pair of crossed axes rather than a rose, deep-navy needle pointing into the upper-right quadrant, summit-orange origin point"),
    ("avatar-412", "adventurer", "Algebra knot — two trail ropes crossing and tucking through each other in a clean symmetric knot, deep navy and summit orange, one continuous loop"),
]

# ---------------------------------------------------------------- build

records = []

for aid, band, source, traits in PORTRAITS:
    b = BANDS[band]
    prompt = (
        f"Portrait of {b['age']}. {traits}. "
        f"{b['note']} "
        f"{STYLE_PORTRAIT} {CANVAS}"
    )
    records.append(dict(
        id=aid, kind="human", band=band, block=b["block"], grades=b["grades"],
        concept_source=source, traits=traits,
        prompt=" ".join(prompt.split()),
        negative_prompt=NEGATIVE,
        files=[f"/public/avatars/{aid}-256.webp", f"/public/avatars/{aid}-512.webp"],
        a11y_label=None,
    ))

for aid, band, traits in SYMBOLS:
    prompt = f"{traits}. {STYLE_SYMBOL} {CANVAS}"
    records.append(dict(
        id=aid, kind="symbol", band=band, block="401-412",
        grades=BANDS[band]["grades"], concept_source="net-new",
        traits=traits,
        prompt=" ".join(prompt.split()),
        negative_prompt=NEGATIVE,
        files=[f"/public/avatars/{aid}-256.webp", f"/public/avatars/{aid}-512.webp"],
        a11y_label=None,
    ))

assert len(records) == 60, len(records)
assert sum(1 for r in records if r["kind"] == "human") == 48
assert sum(1 for r in records if r["kind"] == "symbol") == 12
for band in ("early", "explorer", "adventurer", "summit"):
    n = sum(1 for r in records if r["kind"] == "human" and r["band"] == band)
    assert n == 12, (band, n)

with open("/home/claude/avatar-prompts.json", "w") as f:
    json.dump(dict(
        version="1.2",
        generated_for="Maggie's Trail WS-J avatar library",
        spec="AVATAR_ART_PRODUCTION_SPEC.md",
        ledger="AVATAR_CONCEPT_LEDGER.md",
        style_block_portrait=STYLE_PORTRAIT,
        style_block_symbol=STYLE_SYMBOL,
        negative_prompt=NEGATIVE,
        canvas=CANVAS,
        count=len(records),
        avatars=records,
    ), f, indent=2, ensure_ascii=False)

# ------------------------------------------------------------------ markdown

L = []
A = L.append
A("# Avatar Prompt Pack — all 60 concepts, render-ready\n")
A("Generated from `AVATAR_CONCEPT_LEDGER.md` trait lines + `AVATAR_ART_PRODUCTION_SPEC.md` §1–§4.")
A("Machine-readable twin: `avatar-prompts.json`.\n")
A("**What this is.** One prompt per manifest id, so whoever renders the library — an image model, ")
A("a Weave workflow, or a commissioned illustrator working from a brief — produces art that passes ")
A("the FABLE-Q contact-sheet gate (spec §6) instead of 60 individually-nice-but-mismatched pictures.\n")
A("**The one thing that must not be edited per-avatar:** the style block. It is byte-identical in ")
A("all 48 portrait prompts, and separately byte-identical in all 12 symbol prompts. That invariance ")
A("*is* the consistency mechanism. Vary only the trait sentence and the band's age clause.\n")
A("**One number is provisional.** Spec §1 says the eye line gets locked from the first production ")
A("re-render and FABLE-A owns the final value. This pack carries **57%** as a working figure so the ")
A("prompts are runnable today. Render one anchor first, measure it, and if FABLE-A sets a different ")
A("number, change it in `build_prompt_pack.py`'s `STYLE_PORTRAIT` and regenerate — never by hand in ")
A("60 places.\n")
A("**Still governed by spec §8.** No file lands at `avatar-<NNN>-<SIZE>.webp` until the art is ")
A("genuinely final, and no manifest entry flips `enabled: true` until both files are on disk — ")
A("`src/lib/avatars.test.ts` enforces the second half of that mechanically.\n")
A("---\n")
A("## Locked style block — portraits (48)\n")
A("```")
A(textwrap.fill(STYLE_PORTRAIT, 96))
A("```\n")
A("## Locked style block — symbols (12)\n")
A("```")
A(textwrap.fill(STYLE_SYMBOL, 96))
A("```\n")
A("## Negative prompt — all 60\n")
A("```")
A(textwrap.fill(NEGATIVE, 96))
A("```\n")
A("The first six negatives exist because every one of the 16 board-anchored concepts sits inside ")
A("drawn phone-frame chrome (ledger finding 5). That chrome is the single most likely thing to ")
A("reappear in a render that was shown the boards as a style reference.\n")
A("## Canvas & export\n")
A(f"{CANVAS} Export exactly two WebP files per id — `-256.webp` (picker grid) and `-512.webp` ")
A("(profile). No other sizes or formats ship (spec §4).\n")
A("---\n")

for band, title in (("early", "Early — K–2, grade ids 0–2, block 001–012"),
                    ("explorer", "Explorer — grades 3–5, block 101–112"),
                    ("adventurer", "Adventurer — grades 6–8, block 201–212"),
                    ("summit", "Summit — grades 9–13, block 301–312")):
    rows = [r for r in records if r["kind"] == "human" and r["band"] == band]
    prio = "**P0 — highest priority in the library: zero board anchors.**" if band == "summit" else ""
    A(f"## {title}\n")
    if prio:
        A(prio + "\n")
    A(f"*Age clause (identical across all 12): {BANDS[band]['age']}. {BANDS[band]['note']}*\n")
    for r in rows:
        A(f"### `{r['id']}` — {r['concept_source']}\n")
        A(f"**Traits.** {r['traits']}\n")
        A("**Prompt.**\n")
        A("```")
        A(textwrap.fill(r["prompt"], 96))
        A("```\n")

A("## Symbols — block 401–412, band assigned by tonal fit\n")
A("*Not portraits. `ageBand` here governs which collection surfaces the symbol by default, never ")
A("who may pick it — the plan's \"See all avatars\" reach makes every symbol selectable at any grade.*\n")
for r in [r for r in records if r["kind"] == "symbol"]:
    A(f"### `{r['id']}` — band `{r['band']}`\n")
    A(f"**Concept.** {r['traits']}\n")
    A("**Prompt.**\n")
    A("```")
    A(textwrap.fill(r["prompt"], 96))
    A("```\n")

A("---\n")
A("## Accessibility labels\n")
A("Spec §7: the UI never names ethnicity, and never makes an inferred identity claim. Each label is ")
A("either `Avatar N` / `Avatar N selected`, or a concise non-sensitive descriptor in the same ")
A("register as the trait column — \"Avatar with braids and a green top\". The `a11y_label` field in ")
A("`avatar-prompts.json` is deliberately `null`: labels get written once the art exists and can be ")
A("described from the actual pixels, not predicted from the prompt.\n")
A("## Checklist before any `enabled: true`\n")
A("1. Both `-256.webp` and `-512.webp` exist at the spec §5 path.\n")
A("2. Contact-sheet review against the whole enabled library — head scale, eye line, lighting, ")
A("background, saturation, sharpness, age appearance (spec §6).\n")
A("3. The test: *would a user assume one professional character-design team drew everything?*\n")
A("4. `npx vitest run src/lib/avatars.test.ts` green.\n")

with open("/home/claude/AVATAR_PROMPT_PACK.md", "w") as f:
    f.write("\n".join(L))

print(f"{len(records)} prompts")
print("portraits:", sum(1 for r in records if r["kind"] == "human"))
print("symbols:  ", sum(1 for r in records if r["kind"] == "symbol"))
for b in ("early", "explorer", "adventurer", "summit"):
    print(f"  {b:11s}", sum(1 for r in records if r['kind']=='human' and r['band']==b))
