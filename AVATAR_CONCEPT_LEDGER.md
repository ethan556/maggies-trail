# Avatar Concept Ledger

**Scope.** This is a catalog of every concept behind the 60-entry `AVATARS` manifest in
`src/lib/avatars.ts`: the original 16 board-anchored candidates supplied for WS-J
(`design-reference/ws-j-avatar-board-1.png` … `-4.png`), catalogued in the "Concept table" below,
plus 44 net-new expansion concepts (no board source) catalogued in "Expansion concept tables"
further down — added in the same pass that brought `early`/`explorer`/`adventurer` to ~12 each and
stood up the `summit` and `symbol` collections from zero. It exists so a future commissioning
session — human or agent — can produce real production portraits without re-deriving this reading
from the boards, or without re-deriving the expansion concepts' trait reasoning. **Concepts here
are commissioning references only. No board crop is production art or a user-selectable
composite, per `OPTIMIZATION_PLAN_V3.md:141`** ("A student never selects a quadrant of a board, and
no board crop is ever claimed as final art"). The four PNGs stay in `design-reference/` untouched
and are never imported by `src/` or copied into `public/`. The 44 expansion concepts have no board
source at all — nothing to crop even in principle — but the same non-negotiable applied to them
identically: concept-only prose here, zero pixels, `enabled: false`, until FABLE-Q-gated production
art existed.

**PRODUCTION STATUS — S244 complete-library release.** S243's four pre-canary renders were rejected
for inconsistent framing and an incomplete learner choice. S244 produced all 60 independent
masters, normalized the four 15-item cohorts, and passed an independent whole-library review at
512, 256 and true 48 px. The exact approved 120 WebP exports are enabled atomically in
`public/avatars`; sources, revisions, contact sheets and hashes remain under
`reports/avatar-candidates/`. No board crop ships.

A code-authored set was rendered, exported, enabled and then WITHDRAWN on 2026-08-14 after review
against the four WS-J concept boards. It was internally consistent — uniform eye line, head scale,
shoulder crop, margin and background across all 60, the mechanical half of `AVATAR_ART_PRODUCTION_SPEC.md`
§6 — but it failed the half that decides: all four bands read at the same apparent age (§3 unmet,
`summit` indistinguishable from `early`), facial geometry and expression were constant across the 48
so the grid read as one figure with swapped hair and garment layers, and the finish was
gradient-shaded vector rather than the boards' painterly dimensional language (§2).

`avatars.test.ts` passed throughout. §6 says outright that test "cannot verify quality (that is
FABLE-Q's job, from pixels)" — this episode is the standing proof of it.

Matching the boards needs a real image-generation model. `AVATAR_PROMPT_PACK.md` in this directory
carries the 60 render-ready prompts, style-locked to those boards, for whichever renderer is used.
Not one pixel ever came from a board: the four `design-reference/` PNGs remain untouched, uncropped
and unimported.

The concept traits describe **hairstyle, accessories, clothing and expression**. The V4 production
pack separately assigns four broad painterly skin-tone directions in equal 3/3/3/3 balance inside
each age band. Those directions prevent image-model default bias; they are art-production fields,
not identity labels, and never enter the runtime manifest, learner profile, analytics or accessible
name. Race, ethnicity, nationality and gender are never inferred. A head covering is a garment and
nothing more. No avatar has a name.

Every row in the "Concept table" below was produced by directly viewing all four boards in this
session (not inferred from filenames or prior notes). Concept IDs are assigned `C01`–`C16` = board
number × position, left to right, top row only (each board is a single row of four phone-frame
mockups). The 44 rows in "Expansion concept tables" further down have no board to view — they are
net-new designs written directly to the same trait vocabulary, so they carry no `C##` id (a `C##`
would misleadingly imply a board origin that doesn't exist); each is referenced by its assigned
avatar id alone.

**No race or ethnicity is assigned to any concept. No character is given an invented name — these
are candidate *selectable identities* for a real student, not NPCs with backstories.** Traits
below are limited to observable, non-sensitive visual elements (hairstyle, accessories, clothing,
expression) — the same category of descriptor the picker's accessibility labels will eventually
use (`OPTIMIZATION_PLAN_V3.md:150`: "Avatar with braids and green top," never inferred identity).

## Shared art language (all four boards)

- Dimensional stylized-illustration portraits — not flat vector, not photoreal. Head-and-shoulders,
  portrait orientation, warm off-white background inside each frame.
- **Every portrait sits inside drawn phone-frame chrome** (rounded device bezel + a circular
  home-button glyph below the image). This is the direct evidence for why no crop can ship as-is:
  the chrome would ride along with any crop, and the exact crop/margin/scale is inconsistent
  cell-to-cell — none of the four boards frames its four portraits identically. Production art
  must be re-rendered clean, per `AVATAR_ART_PRODUCTION_SPEC.md`, not extracted from these files.
- 4 concepts per board, boards read left → right as position 1–4.

## Concept table

| Concept ID | Source board:position | Assigned avatar id | Apparent maturity (as drawn) | Provisional band (FABLE-A to confirm) | Distinctive non-sensitive traits | Production status | Regeneration priority |
|---|---|---|---|---|---|---|---|
| C01 | 1:1 | avatar-201 | Early teen (~12–14) | adventurer | Long thin box braids past the shoulders; small gold hoop earrings + a fine pendant necklace; dark-green ribbed top | concept-only | P1 |
| C02 | 1:2 | avatar-202 | Early teen (~12–14) | adventurer | Tousled wavy golden-brown hair; freckles; cream drawstring hoodie under a blue denim jacket | concept-only | P1 |
| C03 | 1:3 | avatar-203 | Early teen (~12–14) | adventurer | Short tousled black hair with a fringe; dark navy zip jacket over a black hoodie, light tee beneath | concept-only | P1 |
| C04 | 1:4 | avatar-204 | Early teen (~12–14) | adventurer | Very long wavy dark hair; teardrop turquoise earrings + a small pendant necklace; patterned rust-red top | concept-only | P1 |
| C05 | 2:1 | avatar-001 | Young child (~5–7) | early | Two high puff buns with braided sections and gold bead accents; broad open smile; yellow tee under light-blue denim overalls | concept-only | P1 |
| C06 | 2:2 | avatar-002 | Young child (~5–7) | early | Straight black hair with a fringe; round dark-rimmed glasses; royal-blue hoodie | concept-only | P1 |
| C07 | 2:3 | avatar-003 | Young child (~5–7) | early | Dark wavy high ponytail with a yellow scrunchie; small gold stud earrings; purple tunic-style top with an embroidered placket | concept-only | P1 |
| C08 | 2:4 | avatar-004 | Young child (~5–7) | early | Loose curly mid-brown hair; freckles; big smile; green-and-cream raglan tee | concept-only | P1 |
| C09 | 3:1 | avatar-005 | Young child (~6–8) | early | Teal/sea-green head covering (hijab-style, drapes over the shoulders); cream top with delicate floral embroidery; gentle smile | concept-only | P1 |
| C10 | 3:2 | avatar-006 | Young child (~6–8) | early | Short tightly-coiled dark hair; wide grin; golden-yellow drawstring hoodie | concept-only | P1 |
| C11 | 3:3 | avatar-007 | Young child (~6–8) | early | Shoulder-length coppery-red hair; freckles across the nose and cheeks; sage-green tee under blue denim overalls | concept-only | P1 |
| C12 | 3:4 | avatar-008 | Young child (~6–8) | early | Short straight black hair, side-swept fringe; royal-blue zip jacket over a striped tee | concept-only | P1 |
| C13 | 4:1 | avatar-101 | Upper elementary (~9–11) | explorer | Short twists/coils on top with faded sides; bright smile; royal-blue track jacket with double white shoulder stripes and a white zip | concept-only | P1 |
| C14 | 4:2 | avatar-102 | Upper elementary (~9–11) | explorer | Straight black chin-length bob, center part; small stud earrings; lilac cardigan over a cream collared shirt | concept-only | P1 |
| C15 | 4:3 | avatar-103 | Upper elementary (~9–11) | explorer | Short wavy black hair; soft smile; forest-green crewneck over a cream tee | concept-only | P1 |
| C16 | 4:4 | avatar-104 | Preteen (~10–12) | explorer | Long wavy brown hair; small gold hoop earrings; blue denim jacket over a cream top | concept-only | P1 |

`Assigned avatar id` is the deterministic filename id this concept will anchor once re-rendered
(see `AVATAR_ART_PRODUCTION_SPEC.md` §File-naming convention). `Production status` is
`concept-only` for all 16. Four S243 pre-canary renders exist outside `public/`, but all failed the
coherent-campaign gate and remain disabled. `Regeneration priority` records the P0/P1/P2 production
order (P1 means "anchored concept, needs an independent re-render").

## Findings for FABLE-A and future commissioning sessions

*(Findings 1–4 below record the state at 16 concepts. The 44 net-new rows close those gaps at the
concept level only. Production art remains pending under `AVATAR_V4_PRODUCTION_RUNBOOK.md`; no band
is approved or enabled.)*

1. **The `summit` band (grades 9–13 / roughly ages 14–18) has zero anchors.** No board reads
   high-school age; board 1 — the most mature of the four — reads middle-school (~12–14). All
   ~12 `summit` portraits are net-new commissions with no board reference at all. This is the
   single highest-priority gap: **regeneration priority P0**, higher than the 16 anchor
   re-renders themselves, because P0 has no starting material whatsoever. Board 1's four concepts
   *could* be aged up as a starting point for summit commissions, but as drawn they read as, and
   are provisionally assigned to, `adventurer`.
   *Status: closed at the concept level — see "Summit expansion (avatar-301–312, all net-new,
   P0)" below. Still zero production art; P0 for the art commission itself is unchanged.*
2. **Band imbalance among the 16 anchors:** `early` has 8 (C05–C12), `explorer` has 4 (C13–C16),
   `adventurer` has 4 (C01–C04), `summit` has 0. The plan's target is ~12 per band
   (`OPTIMIZATION_PLAN_V3.md:142`), so every band needs expansion beyond its anchors — `early`
   needs 4 more, `explorer` and `adventurer` need 8 more each, `summit` needs all 12. FABLE-A may
   also choose to re-triage the board-3/board-4 boundary (some of board 3's older-reading
   concepts, e.g. C11/C12, sit close to board 4's youngest); the per-concept maturity read above
   is the evidence for that call either way.
   *Status: closed at the concept level — `early`/`explorer`/`adventurer` each now have exactly
   12 concepts (8+4, 4+8, 4+8). The board-3/board-4 re-triage option was left untaken: C11/C12
   stay `early` as originally read, since re-triaging them is a judgment call this pass had no new
   evidence to resolve one way or the other, and leaving an open option open is safer than
   deciding it by default.*
3. **Trait coverage already present across the 16:** box braids (C01), twists/coils with faded
   sides (C13), tightly-coiled hair (C10), puff buns with braided sections (C05), wavy hair
   (C02, C04, C11, C16), straight hair (C03, C06, C09, C12, C14), a bob (C14), a ponytail (C07);
   glasses (C06 only — thin coverage, worth adding more of in expansion); one head covering (C09);
   freckles (C02, C08, C11). No locs are present among the 16. Expansion to ~12/band should
   broaden hair texture, glasses, and head-covering coverage *naturally* per band — never
   "one representative per trait," which is the tokenism the plan explicitly rules out
   (`OPTIMIZATION_PLAN_V3.md:142`).
   *Status: addressed — glasses go from 1 to 7 across the 60 (early ×2, explorer ×2, adventurer
   ×0 by design, summit ×3 — see the expansion tables' introduction for why one band stays at
   zero), head coverings from 1 to 3 (one more in `explorer`, one more in `summit`), freckles from
   3 to 7, and locs — entirely absent from the 16 — appear three times, all in `summit` (see
   finding-1's status note), enough to read as a real recurring style rather than a single
   token instance.*
4. **Zero symbolic/neutral concepts exist in any of the four boards.** All 8–12 planned
   neutral/symbolic options (Maggie mark, compass, summit star, owl, fox, constellation,
   topographic badge, …) are net-new designs, to be produced in the brand's illustration language
   once WS-A's tokens are stable — there is nothing to anchor them to in this concept pool.
   *Status: closed at the concept level — see "Symbol expansion (avatar-401–412, all net-new,
   P2)" below, 12 concepts covering every mark this finding named plus five trail-coherent
   additions. WS-A's brand tokens (Deep Navy `#0D1B2A`, Warm Ivory `#F7F3EC`, Summit Orange
   `#F08A24` — `src/components/brand.tsx`) are in fact stable now, so these concepts are written
   directly against them rather than waiting further.*
5. **Chrome contamination is universal, not occasional.** All 16 concepts sit inside phone-frame
   mockup chrome (see "Shared art language" above). There is no concept among the 16 that could be
   cropped cleanly even as a stopgap — production re-rendering is required for every single one,
   not just a subset.
   *Status: unaffected by this pass. The 44 expansion concepts have no board and thus no chrome to
   begin with, but that changes nothing about the 16 — this finding stands exactly as written.*

## Expansion concept tables (net-new — no board source)

44 concepts, none anchored to any board, written directly to the trait vocabulary established by
the 16 above. Every one is `concept-only` / `enabled: false` in `src/lib/avatars.ts`. This section
closes the concept inventory; it does not claim that reviewed art exists.

**Method.** Two lanes, split by category ownership so neither has to harmonize against the other's
work or risks colliding on an id:
- *Band-expansion lane* (`early` +4, `explorer` +8, `adventurer` +8 — 20 concepts): read the 16
  anchors first and wrote continuations of those exact bands — same age register, same clothing
  maturity, same hue families (royal blue, golden yellow, sage/forest, lilac, rust, teal, cream,
  denim; **zero new hues introduced** in this lane, deliberately, so nothing in `early`–`adventurer`
  reads as a palette departure from the anchors).
- *No-anchor lane* (`summit` all 12 + `symbol` all 12 — 24 concepts): both categories start from
  nothing, so this lane owns the traits the 16 anchors never used at all — locs, side-shaves/short
  crops, longer single/twin braid forms (`summit` only) — plus the entire symbol collection. This
  lane introduces three new hue families (charcoal/graphite, navy, olive) to support `summit`'s
  genuinely-older read (`AVATAR_ART_PRODUCTION_SPEC.md` §3), reused several times each rather than
  once, and grounds the 12 symbols in WS-A's actual brand hexes (Deep Navy `#0D1B2A`, Warm Ivory
  `#F7F3EC`, Summit Orange `#F08A24` — `src/components/brand.tsx`) instead of inventing new ones.

**Anti-tokenism discipline applied to all 44:** vocabulary stays hairstyle/accessories/clothing/
expression only, never skin tone, ethnicity, or inferred identity (same rule as the 16, restated at
the bottom of this file). Traits recur across multiple concepts in different combinations rather
than appearing exactly once (freckles: 7 of 48 human concepts now, not 1; head coverings: 3 bands,
not 1; locs: 3 concepts, not 1) — repetition of a single trait is what makes a set read like real
people rather than a checklist; what's avoided is *stacking* several rare traits on one concept
(no concept combines, say, a new head covering with new glasses) and *exact-combination* duplication
(no two concepts share hairstyle + clothing category + palette all three at once — individual
traits repeating across different combinations is expected and fine). Glasses land at 7 of 48 (early
×2 including the 1 anchor, explorer ×2, adventurer ×0, summit ×3) — a real range, not a quota, with
`adventurer` the band that happens to land at zero rather than every band getting a forced instance.

### Early expansion (avatar-009–012, 4 net-new, `early`, P2)

| Assigned avatar id | Distinctive non-sensitive traits | Production status | Regeneration priority |
|---|---|---|---|
| avatar-009 | Curly afro-textured hair shaped into a rounded puff with a thin striped headband; wide gap-toothed grin; teal-and-cream color-blocked tee | concept-only | P2 |
| avatar-010 | Two short braided pigtails finished with small colorful beads; easy smile; rust-red overalls over a cream long-sleeve top | concept-only | P2 |
| avatar-011 | Chin-length straight hair held back with a wide fabric headband; round dark-rimmed glasses; golden-yellow cardigan over a cream tee | concept-only | P2 |
| avatar-012 | Short loose curls with a single flower hair clip; freckles across the cheeks; sage-green tunic top with rust trim | concept-only | P2 |

### Explorer expansion (avatar-105–112, 8 net-new, `explorer`, P2)

| Assigned avatar id | Distinctive non-sensitive traits | Production status | Regeneration priority |
|---|---|---|---|
| avatar-105 | Curly afro-textured hair in a rounded high puff with a thin patterned headband; easy grin; royal-blue zip-up hoodie over a cream striped tee | concept-only | P2 |
| avatar-106 | Two neat box braids gathered into low pigtails; round wire-rimmed glasses; golden-yellow raglan tee under an open chambray shirt | concept-only | P2 |
| avatar-107 | Patterned teal-and-cream head wrap framing the face, loose strands at the temples; small gold stud earrings; sage-green quarter-zip pullover over a cream tee | concept-only | P2 |
| avatar-108 | Short tightly-coiled hair cut close with a sharp side part; confident grin; teal track jacket with cream trim over a cream tee | concept-only | P2 |
| avatar-109 | Straight waist-length hair in a high ponytail wrapped with a bright scrunchie; freckles; lilac zip hoodie over a cream tee | concept-only | P2 |
| avatar-110 | Short wavy hair with a deep side part; thin round glasses; rust bomber-style jacket over a cream tee | concept-only | P2 |
| avatar-111 | Chin-length curly bob; small silver hoop earrings; forest-green cardigan over a cream striped tee | concept-only | P2 |
| avatar-112 | Short natural coils with a faded side part and a single thin braid accent; warm smile; denim jacket over a golden-yellow tee | concept-only | P2 |

### Adventurer expansion (avatar-205–212, 8 net-new, `adventurer`, P2)

| Assigned avatar id | Distinctive non-sensitive traits | Production status | Regeneration priority |
|---|---|---|---|
| avatar-205 | Short natural coils with a subtle side part; quiet closed-mouth half-smile; teal zip-up jacket over a cream tee | reviewed revision; quarantined | P2 |
| avatar-206 | Two thin braided pigtails past the shoulders with small gold cuffs at the ends; sage-green hoodie under a denim jacket | concept-only | P2 |
| avatar-207 | Loose corkscrew curls pulled half-up with a small clip; freckles; rust hoodie over a cream long-sleeve top | concept-only | P2 |
| avatar-208 | Chin-length straight bob with blunt bangs; small silver stud earrings; golden-yellow crewneck over a cream tee | concept-only | P2 |
| avatar-209 | Long single braid resting over one shoulder; wide open smile; royal-blue track jacket over a cream striped tee | concept-only | P2 |
| avatar-210 | Short wavy hair with a tousled side part; relaxed half-smile; forest-green hoodie under a light denim jacket | concept-only | P2 |
| avatar-211 | Shoulder-length twists with a faded undercut at the sides; small hoop earrings; denim zip jacket over a teal tee | concept-only | P2 |
| avatar-212 | Long wavy hair swept into a high half-up twist; turquoise stud earrings; lilac hoodie over a cream tee | concept-only | P2 |

### Summit expansion (avatar-301–312, 12 net-new, `summit`, P0)

Zero board anchors (finding 1); the highest-priority gap in the whole library. Styled to read
genuinely older per `AVATAR_ART_PRODUCTION_SPEC.md` §3 — board 1's most-mature concepts as a floor,
not a ceiling: layered/older clothing (flannel, bomber, quarter-zip, button-up, trucker jacket,
turtleneck, cardigan) in place of the younger bands' hoodies/raglans/overalls, and self-possessed
or quiet expressions rather than beaming ones. First appearance of locs in the library (three
concepts — 302, 307, 310 — a recurring style, not a token), short crops/undercuts (304, 310), and
longer single/twin-braid forms (305, 309) distinct from the younger bands' box braids and puff-bun
braids.

| Assigned avatar id | Distinctive non-sensitive traits | Production status | Regeneration priority |
|---|---|---|---|
| avatar-301 | Short tapered coils with a subtle side part; quiet half-smile; charcoal quarter-zip pullover over a light-gray tee | concept-only | P0 |
| avatar-302 | Shoulder-length locs tied back in a low ponytail; small silver stud earrings; olive canvas jacket over a plain cream tee | concept-only | P0 |
| avatar-303 | Straight dark hair in a low bun with loose face-framing strands; thin wire-rimmed glasses; navy button-up shirt, sleeves rolled | concept-only | P0 |
| avatar-304 | Short undercut with longer curls left on top; confident closed-mouth smile; rust bomber jacket over a charcoal tee | concept-only | P0 |
| avatar-305 | Long single braid over one shoulder with a few loose flyaway strands; freckles; forest-green flannel shirt over a cream tee | concept-only | P0 |
| avatar-306 | Loose shoulder-length wavy hair with a center part; small hoop earrings; cream cardigan over a rust top | concept-only | P0 |
| avatar-307 | Short locs cropped close to the head; faint, self-possessed smile; denim trucker jacket over a cream tee | concept-only | P0 |
| avatar-308 | Long straight hair with a deep side part; round tortoiseshell-style glasses; sage-green cardigan over a cream turtleneck | concept-only | P0 |
| avatar-309 | Twin long braids past the chest tied off with simple dark cord; steady, self-possessed expression; teal flannel shirt, sleeves rolled, over a cream tee | concept-only | P0 |
| avatar-310 | Short cropped locs with a faded undercut; relaxed half-smile; golden-yellow crewneck sweater over a collared cream shirt | concept-only | P0 |
| avatar-311 | Loose waves pulled into a low ponytail beneath a teal-patterned head wrap; calm, warm expression; cream button-up shirt under a rust cardigan | concept-only | P0 |
| avatar-312 | Short tousled wavy hair; thin rectangular glasses; charcoal bomber jacket over an olive tee | concept-only | P0 |

### Symbol expansion (avatar-401–412, 12 net-new, P2)

Zero board anchors (finding 4) — the entire kind is net-new. All 12 are dimensional, stylized marks
in the boards' own illustration language (see "Shared art language" above: dimensional, not flat
vector, not photoreal), explicitly not emoji, with no letters or text rendered in any of them, and
each nameable in one or two words. Grounded in WS-A's actual brand hexes (Deep Navy `#0D1B2A`, Warm
Ivory `#F7F3EC`, Summit Orange `#F08A24`) and the brand mark's twin-peaks-and-trail motif. The final
set is deliberately maths-forward: early visual counting/shape/steps; Explorer fraction, pattern
and coordinate marks; Adventurer algebra/data/brand marks; Summit function/proof/infinity marks.

Each symbol's `ageBand` (required by `AvatarDefinition`'s shape even for a bandless-feeling kind —
see the `AvatarKind` doc comment in `src/lib/avatars.ts`) is assigned individually by
thematic/tonal fit rather than dumped into one band: three symbols per band, increasing in
mathematical abstraction while retaining one premium illustration language. This mirrors how the
human portraits scale in maturity by band, without
restricting *who* may pick a given symbol — the plan's "See all avatars" reach
(`OPTIMIZATION_PLAN_V3.md:148`) makes every symbol selectable by any learner regardless of grade;
`ageBand` here only governs which collection surfaces it by default.

| Assigned avatar id | Band | Distinctive non-sensitive traits | Production status | Regeneration priority |
|---|---|---|---|---|
| avatar-401 | adventurer | Maggie mark medallion — the twin-peaks-and-trail icon rendered as a dimensional badge, deep navy on warm ivory with a summit-orange star accent | concept-only | P2 |
| avatar-402 | summit | Function summit — a smooth rising curve cresting into a peak, with one orange point at the crest | concept-only | P2 |
| avatar-403 | early | First step — one navy boot print with a short dotted orange path continuing ahead | concept-only | P2 |
| avatar-404 | early | Counting cairn — three balanced trail stones, the top stone orange | concept-only | P2 |
| avatar-405 | early | Shape sprout — a seedling whose two leaves are a triangle and a circle | concept-only | P2 |
| avatar-406 | summit | Proof lantern — a navy trail lantern casting a widening cone of orange light | concept-only | P2 |
| avatar-407 | summit | Infinity trail — one winding path looping into a continuous figure eight | concept-only | P2 |
| avatar-408 | explorer | Fraction bridge — evenly spaced planks read as equal parts of one span | concept-only | P2 |
| avatar-409 | explorer | Pattern peak — repeating ridgeline peaks step upward in a steady rhythm | concept-only | P2 |
| avatar-410 | adventurer | Data ridge — a mountain profile doubles as a rising bar sequence | concept-only | P2 |
| avatar-411 | explorer | Coordinate compass — crossed axes, an upper-right needle and an orange origin | concept-only | P2 |
| avatar-412 | adventurer | Algebra knot — two trail ropes form one clean symmetric continuous loop | concept-only | P2 |

## Non-negotiable reminders for whoever picks this up next

- No board crop — full portrait, quadrant, or otherwise — ever ships as a selectable avatar or
  becomes a file under `/public/avatars/`.
- No concept in this ledger gets a name. Names are not part of the avatar data model
  (`AvatarDefinition` has no name field — see `src/lib/avatars.ts`).
- No runtime or accessibility field characterizes race, ethnicity, nationality or gender. Broad
  skin-tone directions may exist in production-only art briefs to prevent model-default bias;
  they never become learner identity labels or stereotypes.
- A 61st avatar joins the same way these 60 did: concept row here → art authored to
  `AVATAR_ART_PRODUCTION_SPEC.md` → 1024x1024 master into `art/avatar-masters/` →
  `npm run build:avatars -- --confirm-reviewed avatar-NNN` → full-library review and atomic release.
  One avatar never enables by itself: its whole 15-option learner-facing band must pass and land
  atomically. `scripts/brand/validate-avatar-assets.ts` fails partial releases.
