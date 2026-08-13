# Avatar Concept Ledger

**Scope.** This is a catalog of the 16 approved concept-board candidates supplied for WS-J
(`design-reference/ws-j-avatar-board-1.png` … `-4.png`). It exists so a future commissioning
session — human or agent — can produce real production portraits without re-deriving this reading
from the boards. **Concepts here are commissioning references only. No board crop is production
art or a user-selectable composite, per `OPTIMIZATION_PLAN_V3.md:141`** ("A student never selects
a quadrant of a board, and no board crop is ever claimed as final art"). The four PNGs stay in
`design-reference/` untouched and are never imported by `src/` or copied into `public/`.

Every row below was produced by directly viewing all four boards in this session (not inferred
from filenames or prior notes). Concept IDs are assigned `C01`–`C16` = board number × position,
left to right, top row only (each board is a single row of four phone-frame mockups).

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
`concept-only` for all 16 — none has been individually re-rendered to the production spec, so none
is `enabled: true` in `src/lib/avatars.ts`. `Regeneration priority` follows the P0/P1/P2 scale
defined in the production spec; P1 here means "anchored concept, needs an individual re-render,"
not "already usable."

## Findings for FABLE-A and future commissioning sessions

1. **The `summit` band (grades 9–13 / roughly ages 14–18) has zero anchors.** No board reads
   high-school age; board 1 — the most mature of the four — reads middle-school (~12–14). All
   ~12 `summit` portraits are net-new commissions with no board reference at all. This is the
   single highest-priority gap: **regeneration priority P0**, higher than the 16 anchor
   re-renders themselves, because P0 has no starting material whatsoever. Board 1's four concepts
   *could* be aged up as a starting point for summit commissions, but as drawn they read as, and
   are provisionally assigned to, `adventurer`.
2. **Band imbalance among the 16 anchors:** `early` has 8 (C05–C12), `explorer` has 4 (C13–C16),
   `adventurer` has 4 (C01–C04), `summit` has 0. The plan's target is ~12 per band
   (`OPTIMIZATION_PLAN_V3.md:142`), so every band needs expansion beyond its anchors — `early`
   needs 4 more, `explorer` and `adventurer` need 8 more each, `summit` needs all 12. FABLE-A may
   also choose to re-triage the board-3/board-4 boundary (some of board 3's older-reading
   concepts, e.g. C11/C12, sit close to board 4's youngest); the per-concept maturity read above
   is the evidence for that call either way.
3. **Trait coverage already present across the 16:** box braids (C01), twists/coils with faded
   sides (C13), tightly-coiled hair (C10), puff buns with braided sections (C05), wavy hair
   (C02, C04, C11, C16), straight hair (C03, C06, C09, C12, C14), a bob (C14), a ponytail (C07);
   glasses (C06 only — thin coverage, worth adding more of in expansion); one head covering (C09);
   freckles (C02, C08, C11). No locs are present among the 16. Expansion to ~12/band should
   broaden hair texture, glasses, and head-covering coverage *naturally* per band — never
   "one representative per trait," which is the tokenism the plan explicitly rules out
   (`OPTIMIZATION_PLAN_V3.md:142`).
4. **Zero symbolic/neutral concepts exist in any of the four boards.** All 8–12 planned
   neutral/symbolic options (Maggie mark, compass, summit star, owl, fox, constellation,
   topographic badge, …) are net-new designs, to be produced in the brand's illustration language
   once WS-A's tokens are stable — there is nothing to anchor them to in this concept pool.
5. **Chrome contamination is universal, not occasional.** All 16 concepts sit inside phone-frame
   mockup chrome (see "Shared art language" above). There is no concept among the 16 that could be
   cropped cleanly even as a stopgap — production re-rendering is required for every single one,
   not just a subset.

## Non-negotiable reminders for whoever picks this up next

- No board crop — full portrait, quadrant, or otherwise — ever ships as a selectable avatar or
  becomes a file under `/public/avatars/`.
- No concept in this ledger gets a name. Names are not part of the avatar data model
  (`AvatarDefinition` has no name field — see `src/lib/avatars.ts`).
- No trait description in this document, or in any future expansion of it, should characterize
  race or ethnicity. Hairstyle, accessories, clothing, and expression are the vocabulary; skin
  tone and ethnic categorization are not, per `OPTIMIZATION_PLAN_V3.md:140,146,150`.
