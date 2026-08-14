# Avatar Prompt Pack — all 60 concepts, render-ready

Generated from `AVATAR_CONCEPT_LEDGER.md` trait lines + `AVATAR_ART_PRODUCTION_SPEC.md` §1–§4.
Machine-readable twin: `avatar-prompts.json`.

**What this is.** One prompt per manifest id, so whoever renders the library — an image model, 
a Weave workflow, or a commissioned illustrator working from a brief — produces art that passes 
the FABLE-Q contact-sheet gate (spec §6) instead of 60 individually-nice-but-mismatched pictures.

**The one thing that must not be edited per-avatar:** the style block. It is byte-identical in 
all 48 portrait prompts, and separately byte-identical in all 12 symbol prompts. That invariance 
*is* the consistency mechanism. Vary only the trait sentence and the band's age clause.

**One number is provisional.** Spec §1 says the eye line gets locked from the first production 
re-render and FABLE-A owns the final value. This pack carries **57%** as a working figure so the 
prompts are runnable today. Render one anchor first, measure it, and if FABLE-A sets a different 
number, change it in `build_prompt_pack.py`'s `STYLE_PORTRAIT` and regenerate — never by hand in 
60 places.

**Still governed by spec §8.** No file lands at `avatar-<NNN>-<SIZE>.webp` until the art is 
genuinely final, and no manifest entry flips `enabled: true` until both files are on disk — 
`src/lib/avatars.test.ts` enforces the second half of that mechanically.

---

## Locked style block — portraits (48)

```
Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library.
```

## Locked style block — symbols (12)

```
Dimensional stylized illustrated mark with real shading and volume — soft painterly rendering,
subtle form modelling. Not flat vector, not photoreal, not glossy 3D render, not an emoji, not a
line icon. Single subject centred in the frame, occupying roughly 60% of frame height, with
uniform empty margin on all four sides. Background is one single flat warm-ivory tone #F7F3EC —
no gradient, no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even
key light from the front and slightly left. Brand palette: Deep Navy #0D1B2A, Warm Ivory
#F7F3EC, Summit Orange #F08A24 as the rationed accent. Warm but restrained saturation, matched
across the whole library.
```

## Negative prompt — all 60

```
phone frame, device bezel, home button, screen chrome, rounded card, border, frame, mockup, drop
shadow, gradient background, scenery, props, text, letters, numbers, watermark, signature, logo
type, multiple subjects, collage, contact sheet, hands, full body, photorealistic skin, 3D
plastic render, flat vector, harsh rim light, colour cast
```

The first six negatives exist because every one of the 16 board-anchored concepts sits inside 
drawn phone-frame chrome (ledger finding 5). That chrome is the single most likely thing to 
reappear in a render that was shown the boards as a style reference.

## Canvas & export

Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256. Export exactly two WebP files per id — `-256.webp` (picker grid) and `-512.webp` 
(profile). No other sizes or formats ship (spec §4).

---

## Early — K–2, grade ids 0–2, block 001–012

*Age clause (identical across all 12): a young child, roughly 5 to 8 years old. Keep genuinely young-child proportions — rounder face, larger eye-to-face ratio, soft jaw. Do not age up for polish.*

### `avatar-001` — board 2:1 (C05)

**Traits.** Two high puff buns with braided sections and gold bead accents; broad open smile; yellow tee under light-blue denim overalls

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Two high puff buns with braided sections
and gold bead accents; broad open smile; yellow tee under light-blue denim overalls. Keep
genuinely young-child proportions — rounder face, larger eye-to-face ratio, soft jaw. Do not age
up for polish. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-002` — board 2:2 (C06)

**Traits.** Straight black hair with a fringe; round dark-rimmed glasses; royal-blue hoodie

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Straight black hair with a fringe; round
dark-rimmed glasses; royal-blue hoodie. Keep genuinely young-child proportions — rounder face,
larger eye-to-face ratio, soft jaw. Do not age up for polish. Dimensional stylized-illustration
portrait with real shading and volume — soft painterly rendering, visible form modelling on the
face and clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders,
portrait orientation, subject centred and facing the viewer. Eye line at 57% of frame height
measured from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible,
cropped at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform
empty margin on all four sides between the subject's outer silhouette (hair included) and the
canvas edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory
tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied
surface. Soft, even key light from the front and slightly left, gentle falloff, no hard rim
light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-003` — board 2:3 (C07)

**Traits.** Dark wavy high ponytail with a yellow scrunchie; small gold stud earrings; purple tunic-style top with an embroidered placket

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Dark wavy high ponytail with a yellow
scrunchie; small gold stud earrings; purple tunic-style top with an embroidered placket. Keep
genuinely young-child proportions — rounder face, larger eye-to-face ratio, soft jaw. Do not age
up for polish. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-004` — board 2:4 (C08)

**Traits.** Loose curly mid-brown hair; freckles; big smile; green-and-cream raglan tee

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Loose curly mid-brown hair; freckles; big
smile; green-and-cream raglan tee. Keep genuinely young-child proportions — rounder face, larger
eye-to-face ratio, soft jaw. Do not age up for polish. Dimensional stylized-illustration
portrait with real shading and volume — soft painterly rendering, visible form modelling on the
face and clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders,
portrait orientation, subject centred and facing the viewer. Eye line at 57% of frame height
measured from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible,
cropped at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform
empty margin on all four sides between the subject's outer silhouette (hair included) and the
canvas edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory
tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied
surface. Soft, even key light from the front and slightly left, gentle falloff, no hard rim
light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-005` — board 3:1 (C09)

**Traits.** Teal/sea-green head covering that drapes over the shoulders; cream top with delicate floral embroidery; gentle smile

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Teal/sea-green head covering that drapes
over the shoulders; cream top with delicate floral embroidery; gentle smile. Keep genuinely
young-child proportions — rounder face, larger eye-to-face ratio, soft jaw. Do not age up for
polish. Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to
512 and 256.
```

### `avatar-006` — board 3:2 (C10)

**Traits.** Short tightly-coiled dark hair; wide grin; golden-yellow drawstring hoodie

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Short tightly-coiled dark hair; wide grin;
golden-yellow drawstring hoodie. Keep genuinely young-child proportions — rounder face, larger
eye-to-face ratio, soft jaw. Do not age up for polish. Dimensional stylized-illustration
portrait with real shading and volume — soft painterly rendering, visible form modelling on the
face and clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders,
portrait orientation, subject centred and facing the viewer. Eye line at 57% of frame height
measured from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible,
cropped at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform
empty margin on all four sides between the subject's outer silhouette (hair included) and the
canvas edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory
tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied
surface. Soft, even key light from the front and slightly left, gentle falloff, no hard rim
light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-007` — board 3:3 (C11)

**Traits.** Shoulder-length coppery-red hair; freckles across the nose and cheeks; sage-green tee under blue denim overalls

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Shoulder-length coppery-red hair; freckles
across the nose and cheeks; sage-green tee under blue denim overalls. Keep genuinely young-child
proportions — rounder face, larger eye-to-face ratio, soft jaw. Do not age up for polish.
Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to
512 and 256.
```

### `avatar-008` — board 3:4 (C12)

**Traits.** Short straight black hair with a side-swept fringe; royal-blue zip jacket over a striped tee

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Short straight black hair with a side-swept
fringe; royal-blue zip jacket over a striped tee. Keep genuinely young-child proportions —
rounder face, larger eye-to-face ratio, soft jaw. Do not age up for polish. Dimensional
stylized-illustration portrait with real shading and volume — soft painterly rendering, visible
form modelling on the face and clothing. Not flat vector, not photoreal, not glossy 3D render.
Head-and-shoulders, portrait orientation, subject centred and facing the viewer. Eye line at 57%
of frame height measured from the top. Head height (crown to chin) 50% of frame height. Both
shoulders visible, cropped at a consistent point below the collarbone — not at the neck, not at
the elbows. Uniform empty margin on all four sides between the subject's outer silhouette (hair
included) and the canvas edge; nothing touches or bleeds past the edge. Background is one single
flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow,
no implied surface. Soft, even key light from the front and slightly left, gentle falloff, no
hard rim light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-009` — net-new

**Traits.** Curly afro-textured hair shaped into a rounded puff with a thin striped headband; wide gap-toothed grin; teal-and-cream colour-blocked tee

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Curly afro-textured hair shaped into a
rounded puff with a thin striped headband; wide gap-toothed grin; teal-and-cream colour-blocked
tee. Keep genuinely young-child proportions — rounder face, larger eye-to-face ratio, soft jaw.
Do not age up for polish. Dimensional stylized-illustration portrait with real shading and
volume — soft painterly rendering, visible form modelling on the face and clothing. Not flat
vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject
centred and facing the viewer. Eye line at 57% of frame height measured from the top. Head
height (crown to chin) 50% of frame height. Both shoulders visible, cropped at a consistent
point below the collarbone — not at the neck, not at the elbows. Uniform empty margin on all
four sides between the subject's outer silhouette (hair included) and the canvas edge; nothing
touches or bleeds past the edge. Background is one single flat warm-ivory tone #F7F3EC — no
gradient, no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key
light from the front and slightly left, gentle falloff, no hard rim light. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-010` — net-new

**Traits.** Two short braided pigtails finished with small colourful beads; easy smile; rust-red overalls over a cream long-sleeve top

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Two short braided pigtails finished with
small colourful beads; easy smile; rust-red overalls over a cream long-sleeve top. Keep
genuinely young-child proportions — rounder face, larger eye-to-face ratio, soft jaw. Do not age
up for polish. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-011` — net-new

**Traits.** Chin-length straight hair held back with a wide fabric headband; round dark-rimmed glasses; golden-yellow cardigan over a cream tee

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Chin-length straight hair held back with a
wide fabric headband; round dark-rimmed glasses; golden-yellow cardigan over a cream tee. Keep
genuinely young-child proportions — rounder face, larger eye-to-face ratio, soft jaw. Do not age
up for polish. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-012` — net-new

**Traits.** Short loose curls with a single flower hair clip; freckles across the cheeks; sage-green tunic top with rust trim

**Prompt.**

```
Portrait of a young child, roughly 5 to 8 years old. Short loose curls with a single flower hair
clip; freckles across the cheeks; sage-green tunic top with rust trim. Keep genuinely young-
child proportions — rounder face, larger eye-to-face ratio, soft jaw. Do not age up for polish.
Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to
512 and 256.
```

## Explorer — grades 3–5, block 101–112

*Age clause (identical across all 12): an upper-elementary child, roughly 9 to 11 years old. Slightly longer face and narrower proportions than the early band, still clearly pre-adolescent.*

### `avatar-101` — board 4:1 (C13)

**Traits.** Short twists/coils on top with faded sides; bright smile; royal-blue track jacket with double white shoulder stripes and a white zip

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Short twists/coils on top with
faded sides; bright smile; royal-blue track jacket with double white shoulder stripes and a
white zip. Slightly longer face and narrower proportions than the early band, still clearly pre-
adolescent. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-102` — board 4:2 (C14)

**Traits.** Straight black chin-length bob with a centre part; small stud earrings; lilac cardigan over a cream collared shirt

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Straight black chin-length bob
with a centre part; small stud earrings; lilac cardigan over a cream collared shirt. Slightly
longer face and narrower proportions than the early band, still clearly pre-adolescent.
Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to
512 and 256.
```

### `avatar-103` — board 4:3 (C15)

**Traits.** Short wavy black hair; soft smile; forest-green crewneck over a cream tee

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Short wavy black hair; soft
smile; forest-green crewneck over a cream tee. Slightly longer face and narrower proportions
than the early band, still clearly pre-adolescent. Dimensional stylized-illustration portrait
with real shading and volume — soft painterly rendering, visible form modelling on the face and
clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait
orientation, subject centred and facing the viewer. Eye line at 57% of frame height measured
from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped
at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform empty
margin on all four sides between the subject's outer silhouette (hair included) and the canvas
edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory tone
#F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied surface.
Soft, even key light from the front and slightly left, gentle falloff, no hard rim light. Warm
but restrained saturation, matched across the whole library. Square canvas, 1024x1024 minimum,
high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-104` — board 4:4 (C16)

**Traits.** Long wavy brown hair; small gold hoop earrings; blue denim jacket over a cream top

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Long wavy brown hair; small
gold hoop earrings; blue denim jacket over a cream top. Slightly longer face and narrower
proportions than the early band, still clearly pre-adolescent. Dimensional stylized-illustration
portrait with real shading and volume — soft painterly rendering, visible form modelling on the
face and clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders,
portrait orientation, subject centred and facing the viewer. Eye line at 57% of frame height
measured from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible,
cropped at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform
empty margin on all four sides between the subject's outer silhouette (hair included) and the
canvas edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory
tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied
surface. Soft, even key light from the front and slightly left, gentle falloff, no hard rim
light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-105` — net-new

**Traits.** Curly afro-textured hair in a rounded high puff with a thin patterned headband; easy grin; royal-blue zip-up hoodie over a cream striped tee

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Curly afro-textured hair in a
rounded high puff with a thin patterned headband; easy grin; royal-blue zip-up hoodie over a
cream striped tee. Slightly longer face and narrower proportions than the early band, still
clearly pre-adolescent. Dimensional stylized-illustration portrait with real shading and volume
— soft painterly rendering, visible form modelling on the face and clothing. Not flat vector,
not photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred
and facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown
to chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-106` — net-new

**Traits.** Two neat box braids gathered into low pigtails; round wire-rimmed glasses; golden-yellow raglan tee under an open chambray shirt

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Two neat box braids gathered
into low pigtails; round wire-rimmed glasses; golden-yellow raglan tee under an open chambray
shirt. Slightly longer face and narrower proportions than the early band, still clearly pre-
adolescent. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-107` — net-new

**Traits.** Patterned teal-and-cream head wrap framing the face with loose strands at the temples; small gold stud earrings; sage-green quarter-zip pullover over a cream tee

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Patterned teal-and-cream head
wrap framing the face with loose strands at the temples; small gold stud earrings; sage-green
quarter-zip pullover over a cream tee. Slightly longer face and narrower proportions than the
early band, still clearly pre-adolescent. Dimensional stylized-illustration portrait with real
shading and volume — soft painterly rendering, visible form modelling on the face and clothing.
Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation,
subject centred and facing the viewer. Eye line at 57% of frame height measured from the top.
Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped at a consistent
point below the collarbone — not at the neck, not at the elbows. Uniform empty margin on all
four sides between the subject's outer silhouette (hair included) and the canvas edge; nothing
touches or bleeds past the edge. Background is one single flat warm-ivory tone #F7F3EC — no
gradient, no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key
light from the front and slightly left, gentle falloff, no hard rim light. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-108` — net-new

**Traits.** Short tightly-coiled hair cut close with a sharp side part; confident grin; teal track jacket with cream trim over a cream tee

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Short tightly-coiled hair cut
close with a sharp side part; confident grin; teal track jacket with cream trim over a cream
tee. Slightly longer face and narrower proportions than the early band, still clearly pre-
adolescent. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-109` — net-new

**Traits.** Straight waist-length hair in a high ponytail wrapped with a bright scrunchie; freckles; lilac zip hoodie over a cream tee

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Straight waist-length hair in
a high ponytail wrapped with a bright scrunchie; freckles; lilac zip hoodie over a cream tee.
Slightly longer face and narrower proportions than the early band, still clearly pre-adolescent.
Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to
512 and 256.
```

### `avatar-110` — net-new

**Traits.** Short wavy hair with a deep side part; thin round glasses; rust bomber-style jacket over a cream tee

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Short wavy hair with a deep
side part; thin round glasses; rust bomber-style jacket over a cream tee. Slightly longer face
and narrower proportions than the early band, still clearly pre-adolescent. Dimensional
stylized-illustration portrait with real shading and volume — soft painterly rendering, visible
form modelling on the face and clothing. Not flat vector, not photoreal, not glossy 3D render.
Head-and-shoulders, portrait orientation, subject centred and facing the viewer. Eye line at 57%
of frame height measured from the top. Head height (crown to chin) 50% of frame height. Both
shoulders visible, cropped at a consistent point below the collarbone — not at the neck, not at
the elbows. Uniform empty margin on all four sides between the subject's outer silhouette (hair
included) and the canvas edge; nothing touches or bleeds past the edge. Background is one single
flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow,
no implied surface. Soft, even key light from the front and slightly left, gentle falloff, no
hard rim light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-111` — net-new

**Traits.** Chin-length curly bob; small silver hoop earrings; forest-green cardigan over a cream striped tee

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Chin-length curly bob; small
silver hoop earrings; forest-green cardigan over a cream striped tee. Slightly longer face and
narrower proportions than the early band, still clearly pre-adolescent. Dimensional stylized-
illustration portrait with real shading and volume — soft painterly rendering, visible form
modelling on the face and clothing. Not flat vector, not photoreal, not glossy 3D render. Head-
and-shoulders, portrait orientation, subject centred and facing the viewer. Eye line at 57% of
frame height measured from the top. Head height (crown to chin) 50% of frame height. Both
shoulders visible, cropped at a consistent point below the collarbone — not at the neck, not at
the elbows. Uniform empty margin on all four sides between the subject's outer silhouette (hair
included) and the canvas edge; nothing touches or bleeds past the edge. Background is one single
flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow,
no implied surface. Soft, even key light from the front and slightly left, gentle falloff, no
hard rim light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-112` — net-new

**Traits.** Short natural coils with a faded side part and a single thin braid accent; warm smile; denim jacket over a golden-yellow tee

**Prompt.**

```
Portrait of an upper-elementary child, roughly 9 to 11 years old. Short natural coils with a
faded side part and a single thin braid accent; warm smile; denim jacket over a golden-yellow
tee. Slightly longer face and narrower proportions than the early band, still clearly pre-
adolescent. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

## Adventurer — grades 6–8, block 201–212

*Age clause (identical across all 12): an early teenager, roughly 12 to 14 years old. Middle-school proportions — the maturity level of sample board 1.*

### `avatar-201` — board 1:1 (C01)

**Traits.** Long thin box braids past the shoulders; small gold hoop earrings and a fine pendant necklace; dark-green ribbed top

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Long thin box braids past the
shoulders; small gold hoop earrings and a fine pendant necklace; dark-green ribbed top. Middle-
school proportions — the maturity level of sample board 1. Dimensional stylized-illustration
portrait with real shading and volume — soft painterly rendering, visible form modelling on the
face and clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders,
portrait orientation, subject centred and facing the viewer. Eye line at 57% of frame height
measured from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible,
cropped at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform
empty margin on all four sides between the subject's outer silhouette (hair included) and the
canvas edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory
tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied
surface. Soft, even key light from the front and slightly left, gentle falloff, no hard rim
light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-202` — board 1:2 (C02)

**Traits.** Tousled wavy golden-brown hair; freckles; cream drawstring hoodie under a blue denim jacket

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Tousled wavy golden-brown hair;
freckles; cream drawstring hoodie under a blue denim jacket. Middle-school proportions — the
maturity level of sample board 1. Dimensional stylized-illustration portrait with real shading
and volume — soft painterly rendering, visible form modelling on the face and clothing. Not flat
vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject
centred and facing the viewer. Eye line at 57% of frame height measured from the top. Head
height (crown to chin) 50% of frame height. Both shoulders visible, cropped at a consistent
point below the collarbone — not at the neck, not at the elbows. Uniform empty margin on all
four sides between the subject's outer silhouette (hair included) and the canvas edge; nothing
touches or bleeds past the edge. Background is one single flat warm-ivory tone #F7F3EC — no
gradient, no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key
light from the front and slightly left, gentle falloff, no hard rim light. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-203` — board 1:3 (C03)

**Traits.** Short tousled black hair with a fringe; dark navy zip jacket over a black hoodie with a light tee beneath

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Short tousled black hair with a
fringe; dark navy zip jacket over a black hoodie with a light tee beneath. Middle-school
proportions — the maturity level of sample board 1. Dimensional stylized-illustration portrait
with real shading and volume — soft painterly rendering, visible form modelling on the face and
clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait
orientation, subject centred and facing the viewer. Eye line at 57% of frame height measured
from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped
at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform empty
margin on all four sides between the subject's outer silhouette (hair included) and the canvas
edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory tone
#F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied surface.
Soft, even key light from the front and slightly left, gentle falloff, no hard rim light. Warm
but restrained saturation, matched across the whole library. Square canvas, 1024x1024 minimum,
high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-204` — board 1:4 (C04)

**Traits.** Very long wavy dark hair; teardrop turquoise earrings and a small pendant necklace; patterned rust-red top

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Very long wavy dark hair; teardrop
turquoise earrings and a small pendant necklace; patterned rust-red top. Middle-school
proportions — the maturity level of sample board 1. Dimensional stylized-illustration portrait
with real shading and volume — soft painterly rendering, visible form modelling on the face and
clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait
orientation, subject centred and facing the viewer. Eye line at 57% of frame height measured
from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped
at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform empty
margin on all four sides between the subject's outer silhouette (hair included) and the canvas
edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory tone
#F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied surface.
Soft, even key light from the front and slightly left, gentle falloff, no hard rim light. Warm
but restrained saturation, matched across the whole library. Square canvas, 1024x1024 minimum,
high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-205` — net-new

**Traits.** Short natural coils cut close with a defined part; confident grin; teal zip-up jacket over a cream tee

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Short natural coils cut close with a
defined part; confident grin; teal zip-up jacket over a cream tee. Middle-school proportions —
the maturity level of sample board 1. Dimensional stylized-illustration portrait with real
shading and volume — soft painterly rendering, visible form modelling on the face and clothing.
Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation,
subject centred and facing the viewer. Eye line at 57% of frame height measured from the top.
Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped at a consistent
point below the collarbone — not at the neck, not at the elbows. Uniform empty margin on all
four sides between the subject's outer silhouette (hair included) and the canvas edge; nothing
touches or bleeds past the edge. Background is one single flat warm-ivory tone #F7F3EC — no
gradient, no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key
light from the front and slightly left, gentle falloff, no hard rim light. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-206` — net-new

**Traits.** Two thin braided pigtails past the shoulders with small gold cuffs at the ends; sage-green hoodie under a denim jacket

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Two thin braided pigtails past the
shoulders with small gold cuffs at the ends; sage-green hoodie under a denim jacket. Middle-
school proportions — the maturity level of sample board 1. Dimensional stylized-illustration
portrait with real shading and volume — soft painterly rendering, visible form modelling on the
face and clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders,
portrait orientation, subject centred and facing the viewer. Eye line at 57% of frame height
measured from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible,
cropped at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform
empty margin on all four sides between the subject's outer silhouette (hair included) and the
canvas edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory
tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied
surface. Soft, even key light from the front and slightly left, gentle falloff, no hard rim
light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-207` — net-new

**Traits.** Loose corkscrew curls pulled half-up with a small clip; freckles; rust hoodie over a cream long-sleeve top

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Loose corkscrew curls pulled half-up
with a small clip; freckles; rust hoodie over a cream long-sleeve top. Middle-school proportions
— the maturity level of sample board 1. Dimensional stylized-illustration portrait with real
shading and volume — soft painterly rendering, visible form modelling on the face and clothing.
Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation,
subject centred and facing the viewer. Eye line at 57% of frame height measured from the top.
Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped at a consistent
point below the collarbone — not at the neck, not at the elbows. Uniform empty margin on all
four sides between the subject's outer silhouette (hair included) and the canvas edge; nothing
touches or bleeds past the edge. Background is one single flat warm-ivory tone #F7F3EC — no
gradient, no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key
light from the front and slightly left, gentle falloff, no hard rim light. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-208` — net-new

**Traits.** Chin-length straight bob with blunt bangs; small silver stud earrings; golden-yellow crewneck over a cream tee

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Chin-length straight bob with blunt
bangs; small silver stud earrings; golden-yellow crewneck over a cream tee. Middle-school
proportions — the maturity level of sample board 1. Dimensional stylized-illustration portrait
with real shading and volume — soft painterly rendering, visible form modelling on the face and
clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait
orientation, subject centred and facing the viewer. Eye line at 57% of frame height measured
from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped
at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform empty
margin on all four sides between the subject's outer silhouette (hair included) and the canvas
edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory tone
#F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied surface.
Soft, even key light from the front and slightly left, gentle falloff, no hard rim light. Warm
but restrained saturation, matched across the whole library. Square canvas, 1024x1024 minimum,
high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-209` — net-new

**Traits.** Long single braid resting over one shoulder; wide open smile; royal-blue track jacket over a cream striped tee

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Long single braid resting over one
shoulder; wide open smile; royal-blue track jacket over a cream striped tee. Middle-school
proportions — the maturity level of sample board 1. Dimensional stylized-illustration portrait
with real shading and volume — soft painterly rendering, visible form modelling on the face and
clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait
orientation, subject centred and facing the viewer. Eye line at 57% of frame height measured
from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped
at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform empty
margin on all four sides between the subject's outer silhouette (hair included) and the canvas
edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory tone
#F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied surface.
Soft, even key light from the front and slightly left, gentle falloff, no hard rim light. Warm
but restrained saturation, matched across the whole library. Square canvas, 1024x1024 minimum,
high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-210` — net-new

**Traits.** Short wavy hair with a tousled side part; relaxed half-smile; forest-green hoodie under a light denim jacket

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Short wavy hair with a tousled side
part; relaxed half-smile; forest-green hoodie under a light denim jacket. Middle-school
proportions — the maturity level of sample board 1. Dimensional stylized-illustration portrait
with real shading and volume — soft painterly rendering, visible form modelling on the face and
clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait
orientation, subject centred and facing the viewer. Eye line at 57% of frame height measured
from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped
at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform empty
margin on all four sides between the subject's outer silhouette (hair included) and the canvas
edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory tone
#F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied surface.
Soft, even key light from the front and slightly left, gentle falloff, no hard rim light. Warm
but restrained saturation, matched across the whole library. Square canvas, 1024x1024 minimum,
high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-211` — net-new

**Traits.** Shoulder-length twists with a faded undercut at the sides; small hoop earrings; denim zip jacket over a teal tee

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Shoulder-length twists with a faded
undercut at the sides; small hoop earrings; denim zip jacket over a teal tee. Middle-school
proportions — the maturity level of sample board 1. Dimensional stylized-illustration portrait
with real shading and volume — soft painterly rendering, visible form modelling on the face and
clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait
orientation, subject centred and facing the viewer. Eye line at 57% of frame height measured
from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped
at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform empty
margin on all four sides between the subject's outer silhouette (hair included) and the canvas
edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory tone
#F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied surface.
Soft, even key light from the front and slightly left, gentle falloff, no hard rim light. Warm
but restrained saturation, matched across the whole library. Square canvas, 1024x1024 minimum,
high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-212` — net-new

**Traits.** Long wavy hair swept into a high half-up twist; turquoise stud earrings; lilac hoodie over a cream tee

**Prompt.**

```
Portrait of an early teenager, roughly 12 to 14 years old. Long wavy hair swept into a high
half-up twist; turquoise stud earrings; lilac hoodie over a cream tee. Middle-school proportions
— the maturity level of sample board 1. Dimensional stylized-illustration portrait with real
shading and volume — soft painterly rendering, visible form modelling on the face and clothing.
Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation,
subject centred and facing the viewer. Eye line at 57% of frame height measured from the top.
Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped at a consistent
point below the collarbone — not at the neck, not at the elbows. Uniform empty margin on all
four sides between the subject's outer silhouette (hair included) and the canvas edge; nothing
touches or bleeds past the edge. Background is one single flat warm-ivory tone #F7F3EC — no
gradient, no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key
light from the front and slightly left, gentle falloff, no hard rim light. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

## Summit — grades 9–13, block 301–312

**P0 — highest priority in the library: zero board anchors.**

*Age clause (identical across all 12): a high-school student, roughly 15 to 18 years old. Genuinely older proportions, styling and bearing — board 1's most mature concept is the FLOOR, not the ceiling. Self-possessed or quiet expression, not beaming. This is NOT an enlarged elementary character.*

### `avatar-301` — net-new (P0)

**Traits.** Short tapered coils with a subtle side part; quiet half-smile; charcoal quarter-zip pullover over a light-grey tee

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Short tapered coils with a subtle
side part; quiet half-smile; charcoal quarter-zip pullover over a light-grey tee. Genuinely
older proportions, styling and bearing — board 1's most mature concept is the FLOOR, not the
ceiling. Self-possessed or quiet expression, not beaming. This is NOT an enlarged elementary
character. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-302` — net-new (P0)

**Traits.** Shoulder-length locs tied back in a low ponytail; small silver stud earrings; olive canvas jacket over a plain cream tee

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Shoulder-length locs tied back in
a low ponytail; small silver stud earrings; olive canvas jacket over a plain cream tee.
Genuinely older proportions, styling and bearing — board 1's most mature concept is the FLOOR,
not the ceiling. Self-possessed or quiet expression, not beaming. This is NOT an enlarged
elementary character. Dimensional stylized-illustration portrait with real shading and volume —
soft painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-303` — net-new (P0)

**Traits.** Straight dark hair in a low bun with loose face-framing strands; thin wire-rimmed glasses; navy button-up shirt with the sleeves rolled

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Straight dark hair in a low bun
with loose face-framing strands; thin wire-rimmed glasses; navy button-up shirt with the sleeves
rolled. Genuinely older proportions, styling and bearing — board 1's most mature concept is the
FLOOR, not the ceiling. Self-possessed or quiet expression, not beaming. This is NOT an enlarged
elementary character. Dimensional stylized-illustration portrait with real shading and volume —
soft painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-304` — net-new (P0)

**Traits.** Short undercut with longer curls left on top; confident closed-mouth smile; rust bomber jacket over a charcoal tee

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Short undercut with longer curls
left on top; confident closed-mouth smile; rust bomber jacket over a charcoal tee. Genuinely
older proportions, styling and bearing — board 1's most mature concept is the FLOOR, not the
ceiling. Self-possessed or quiet expression, not beaming. This is NOT an enlarged elementary
character. Dimensional stylized-illustration portrait with real shading and volume — soft
painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-305` — net-new (P0)

**Traits.** Long single braid over one shoulder with a few loose flyaway strands; freckles; forest-green flannel shirt over a cream tee

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Long single braid over one
shoulder with a few loose flyaway strands; freckles; forest-green flannel shirt over a cream
tee. Genuinely older proportions, styling and bearing — board 1's most mature concept is the
FLOOR, not the ceiling. Self-possessed or quiet expression, not beaming. This is NOT an enlarged
elementary character. Dimensional stylized-illustration portrait with real shading and volume —
soft painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-306` — net-new (P0)

**Traits.** Loose shoulder-length wavy hair with a centre part; small hoop earrings; cream cardigan over a rust top

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Loose shoulder-length wavy hair
with a centre part; small hoop earrings; cream cardigan over a rust top. Genuinely older
proportions, styling and bearing — board 1's most mature concept is the FLOOR, not the ceiling.
Self-possessed or quiet expression, not beaming. This is NOT an enlarged elementary character.
Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to
512 and 256.
```

### `avatar-307` — net-new (P0)

**Traits.** Short locs cropped close to the head; faint, self-possessed smile; denim trucker jacket over a cream tee

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Short locs cropped close to the
head; faint, self-possessed smile; denim trucker jacket over a cream tee. Genuinely older
proportions, styling and bearing — board 1's most mature concept is the FLOOR, not the ceiling.
Self-possessed or quiet expression, not beaming. This is NOT an enlarged elementary character.
Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to
512 and 256.
```

### `avatar-308` — net-new (P0)

**Traits.** Long straight hair with a deep side part; round tortoiseshell-style glasses; sage-green cardigan over a cream turtleneck

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Long straight hair with a deep
side part; round tortoiseshell-style glasses; sage-green cardigan over a cream turtleneck.
Genuinely older proportions, styling and bearing — board 1's most mature concept is the FLOOR,
not the ceiling. Self-possessed or quiet expression, not beaming. This is NOT an enlarged
elementary character. Dimensional stylized-illustration portrait with real shading and volume —
soft painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-309` — net-new (P0)

**Traits.** Twin long braids past the chest tied off with simple dark cord; steady, self-possessed expression; teal flannel shirt with the sleeves rolled, over a cream tee

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Twin long braids past the chest
tied off with simple dark cord; steady, self-possessed expression; teal flannel shirt with the
sleeves rolled, over a cream tee. Genuinely older proportions, styling and bearing — board 1's
most mature concept is the FLOOR, not the ceiling. Self-possessed or quiet expression, not
beaming. This is NOT an enlarged elementary character. Dimensional stylized-illustration
portrait with real shading and volume — soft painterly rendering, visible form modelling on the
face and clothing. Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders,
portrait orientation, subject centred and facing the viewer. Eye line at 57% of frame height
measured from the top. Head height (crown to chin) 50% of frame height. Both shoulders visible,
cropped at a consistent point below the collarbone — not at the neck, not at the elbows. Uniform
empty margin on all four sides between the subject's outer silhouette (hair included) and the
canvas edge; nothing touches or bleeds past the edge. Background is one single flat warm-ivory
tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no implied
surface. Soft, even key light from the front and slightly left, gentle falloff, no hard rim
light. Warm but restrained saturation, matched across the whole library. Square canvas,
1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-310` — net-new (P0)

**Traits.** Short cropped locs with a faded undercut; relaxed half-smile; golden-yellow crewneck sweater over a collared cream shirt

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Short cropped locs with a faded
undercut; relaxed half-smile; golden-yellow crewneck sweater over a collared cream shirt.
Genuinely older proportions, styling and bearing — board 1's most mature concept is the FLOOR,
not the ceiling. Self-possessed or quiet expression, not beaming. This is NOT an enlarged
elementary character. Dimensional stylized-illustration portrait with real shading and volume —
soft painterly rendering, visible form modelling on the face and clothing. Not flat vector, not
photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and
facing the viewer. Eye line at 57% of frame height measured from the top. Head height (crown to
chin) 50% of frame height. Both shoulders visible, cropped at a consistent point below the
collarbone — not at the neck, not at the elbows. Uniform empty margin on all four sides between
the subject's outer silhouette (hair included) and the canvas edge; nothing touches or bleeds
past the edge. Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette,
no props, no scenery, no drop shadow, no implied surface. Soft, even key light from the front
and slightly left, gentle falloff, no hard rim light. Warm but restrained saturation, matched
across the whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample
cleanly to 512 and 256.
```

### `avatar-311` — net-new (P0)

**Traits.** Loose waves pulled into a low ponytail beneath a teal-patterned head wrap; calm, warm expression; cream button-up shirt under a rust cardigan

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Loose waves pulled into a low
ponytail beneath a teal-patterned head wrap; calm, warm expression; cream button-up shirt under
a rust cardigan. Genuinely older proportions, styling and bearing — board 1's most mature
concept is the FLOOR, not the ceiling. Self-possessed or quiet expression, not beaming. This is
NOT an enlarged elementary character. Dimensional stylized-illustration portrait with real
shading and volume — soft painterly rendering, visible form modelling on the face and clothing.
Not flat vector, not photoreal, not glossy 3D render. Head-and-shoulders, portrait orientation,
subject centred and facing the viewer. Eye line at 57% of frame height measured from the top.
Head height (crown to chin) 50% of frame height. Both shoulders visible, cropped at a consistent
point below the collarbone — not at the neck, not at the elbows. Uniform empty margin on all
four sides between the subject's outer silhouette (hair included) and the canvas edge; nothing
touches or bleeds past the edge. Background is one single flat warm-ivory tone #F7F3EC — no
gradient, no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key
light from the front and slightly left, gentle falloff, no hard rim light. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-312` — net-new (P0)

**Traits.** Short tousled wavy hair; thin rectangular glasses; charcoal bomber jacket over an olive tee

**Prompt.**

```
Portrait of a high-school student, roughly 15 to 18 years old. Short tousled wavy hair; thin
rectangular glasses; charcoal bomber jacket over an olive tee. Genuinely older proportions,
styling and bearing — board 1's most mature concept is the FLOOR, not the ceiling. Self-
possessed or quiet expression, not beaming. This is NOT an enlarged elementary character.
Dimensional stylized-illustration portrait with real shading and volume — soft painterly
rendering, visible form modelling on the face and clothing. Not flat vector, not photoreal, not
glossy 3D render. Head-and-shoulders, portrait orientation, subject centred and facing the
viewer. Eye line at 57% of frame height measured from the top. Head height (crown to chin) 50%
of frame height. Both shoulders visible, cropped at a consistent point below the collarbone —
not at the neck, not at the elbows. Uniform empty margin on all four sides between the subject's
outer silhouette (hair included) and the canvas edge; nothing touches or bleeds past the edge.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left, gentle falloff, no hard rim light. Warm but restrained saturation, matched across the
whole library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to
512 and 256.
```

## Symbols — block 401–412, band assigned by tonal fit

*Not portraits. `ageBand` here governs which collection surfaces the symbol by default, never 
who may pick it — the plan's "See all avatars" reach makes every symbol selectable at any grade.*

### `avatar-401` — band `adventurer`

**Concept.** Maggie mark medallion — the twin-peaks-and-trail brand icon rendered as a dimensional badge, deep navy on warm ivory, a single summit-orange four-point star above the peaks

**Prompt.**

```
Maggie mark medallion — the twin-peaks-and-trail brand icon rendered as a dimensional badge,
deep navy on warm ivory, a single summit-orange four-point star above the peaks. Dimensional
stylized illustrated mark with real shading and volume — soft painterly rendering, subtle form
modelling. Not flat vector, not photoreal, not glossy 3D render, not an emoji, not a line icon.
Single subject centred in the frame, occupying roughly 60% of frame height, with uniform empty
margin on all four sides. Background is one single flat warm-ivory tone #F7F3EC — no gradient,
no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key light from
the front and slightly left. Brand palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange
#F08A24 as the rationed accent. Warm but restrained saturation, matched across the whole
library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and
256.
```

### `avatar-402` — band `summit`

**Concept.** Function summit — a smooth rising curve cresting into a peak and easing over, deep navy, with a single summit-orange point marking the crest

**Prompt.**

```
Function summit — a smooth rising curve cresting into a peak and easing over, deep navy, with a
single summit-orange point marking the crest. Dimensional stylized illustrated mark with real
shading and volume — soft painterly rendering, subtle form modelling. Not flat vector, not
photoreal, not glossy 3D render, not an emoji, not a line icon. Single subject centred in the
frame, occupying roughly 60% of frame height, with uniform empty margin on all four sides.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left. Brand palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the
rationed accent. Warm but restrained saturation, matched across the whole library. Square
canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-403` — band `early`

**Concept.** First step — one deep-navy boot print pressed into a warm trail, a short dotted path continuing ahead in summit orange

**Prompt.**

```
First step — one deep-navy boot print pressed into a warm trail, a short dotted path continuing
ahead in summit orange. Dimensional stylized illustrated mark with real shading and volume —
soft painterly rendering, subtle form modelling. Not flat vector, not photoreal, not glossy 3D
render, not an emoji, not a line icon. Single subject centred in the frame, occupying roughly
60% of frame height, with uniform empty margin on all four sides. Background is one single flat
warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no
implied surface. Soft, even key light from the front and slightly left. Brand palette: Deep Navy
#0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the rationed accent. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-404` — band `early`

**Concept.** Counting cairn — three balanced trail stones in warm stone tones, the topmost summit orange, quietly reading as one, two, three without any numeral

**Prompt.**

```
Counting cairn — three balanced trail stones in warm stone tones, the topmost summit orange,
quietly reading as one, two, three without any numeral. Dimensional stylized illustrated mark
with real shading and volume — soft painterly rendering, subtle form modelling. Not flat vector,
not photoreal, not glossy 3D render, not an emoji, not a line icon. Single subject centred in
the frame, occupying roughly 60% of frame height, with uniform empty margin on all four sides.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left. Brand palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the
rationed accent. Warm but restrained saturation, matched across the whole library. Square
canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-405` — band `early`

**Concept.** Shape sprout — a young seedling whose two leaves are a clean triangle and a clean circle, forest green with a summit-orange stem

**Prompt.**

```
Shape sprout — a young seedling whose two leaves are a clean triangle and a clean circle, forest
green with a summit-orange stem. Dimensional stylized illustrated mark with real shading and
volume — soft painterly rendering, subtle form modelling. Not flat vector, not photoreal, not
glossy 3D render, not an emoji, not a line icon. Single subject centred in the frame, occupying
roughly 60% of frame height, with uniform empty margin on all four sides. Background is one
single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop
shadow, no implied surface. Soft, even key light from the front and slightly left. Brand
palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the rationed accent.
Warm but restrained saturation, matched across the whole library. Square canvas, 1024x1024
minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-406` — band `summit`

**Concept.** Proof lantern — a trail lantern casting a widening cone of warm light downward, deep-navy body, summit-orange flame and light

**Prompt.**

```
Proof lantern — a trail lantern casting a widening cone of warm light downward, deep-navy body,
summit-orange flame and light. Dimensional stylized illustrated mark with real shading and
volume — soft painterly rendering, subtle form modelling. Not flat vector, not photoreal, not
glossy 3D render, not an emoji, not a line icon. Single subject centred in the frame, occupying
roughly 60% of frame height, with uniform empty margin on all four sides. Background is one
single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop
shadow, no implied surface. Soft, even key light from the front and slightly left. Brand
palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the rationed accent.
Warm but restrained saturation, matched across the whole library. Square canvas, 1024x1024
minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-407` — band `summit`

**Concept.** Infinity trail — a single winding path that loops back through itself into a continuous figure-eight, deep navy with a summit-orange lead segment

**Prompt.**

```
Infinity trail — a single winding path that loops back through itself into a continuous figure-
eight, deep navy with a summit-orange lead segment. Dimensional stylized illustrated mark with
real shading and volume — soft painterly rendering, subtle form modelling. Not flat vector, not
photoreal, not glossy 3D render, not an emoji, not a line icon. Single subject centred in the
frame, occupying roughly 60% of frame height, with uniform empty margin on all four sides.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left. Brand palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the
rationed accent. Warm but restrained saturation, matched across the whole library. Square
canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-408` — band `explorer`

**Concept.** Fraction bridge — a rope-and-plank trail bridge whose evenly spaced planks read as equal parts of one span, warm timber over deep-navy cables

**Prompt.**

```
Fraction bridge — a rope-and-plank trail bridge whose evenly spaced planks read as equal parts
of one span, warm timber over deep-navy cables. Dimensional stylized illustrated mark with real
shading and volume — soft painterly rendering, subtle form modelling. Not flat vector, not
photoreal, not glossy 3D render, not an emoji, not a line icon. Single subject centred in the
frame, occupying roughly 60% of frame height, with uniform empty margin on all four sides.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left. Brand palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the
rationed accent. Warm but restrained saturation, matched across the whole library. Square
canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

### `avatar-409` — band `explorer`

**Concept.** Pattern peak — a ridgeline of repeating peaks stepping up in a steady rhythm, deep navy, the tallest tipped summit orange

**Prompt.**

```
Pattern peak — a ridgeline of repeating peaks stepping up in a steady rhythm, deep navy, the
tallest tipped summit orange. Dimensional stylized illustrated mark with real shading and volume
— soft painterly rendering, subtle form modelling. Not flat vector, not photoreal, not glossy 3D
render, not an emoji, not a line icon. Single subject centred in the frame, occupying roughly
60% of frame height, with uniform empty margin on all four sides. Background is one single flat
warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no
implied surface. Soft, even key light from the front and slightly left. Brand palette: Deep Navy
#0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the rationed accent. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-410` — band `adventurer`

**Concept.** Data ridge — a mountain ridge whose profile is also a rising bar sequence, deep navy, the tallest bar summit orange

**Prompt.**

```
Data ridge — a mountain ridge whose profile is also a rising bar sequence, deep navy, the
tallest bar summit orange. Dimensional stylized illustrated mark with real shading and volume —
soft painterly rendering, subtle form modelling. Not flat vector, not photoreal, not glossy 3D
render, not an emoji, not a line icon. Single subject centred in the frame, occupying roughly
60% of frame height, with uniform empty margin on all four sides. Background is one single flat
warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no scenery, no drop shadow, no
implied surface. Soft, even key light from the front and slightly left. Brand palette: Deep Navy
#0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the rationed accent. Warm but restrained
saturation, matched across the whole library. Square canvas, 1024x1024 minimum, high enough
fidelity to downsample cleanly to 512 and 256.
```

### `avatar-411` — band `explorer`

**Concept.** Coordinate compass — a trail compass whose face is a pair of crossed axes rather than a rose, deep-navy needle pointing into the upper-right quadrant, summit-orange origin point

**Prompt.**

```
Coordinate compass — a trail compass whose face is a pair of crossed axes rather than a rose,
deep-navy needle pointing into the upper-right quadrant, summit-orange origin point. Dimensional
stylized illustrated mark with real shading and volume — soft painterly rendering, subtle form
modelling. Not flat vector, not photoreal, not glossy 3D render, not an emoji, not a line icon.
Single subject centred in the frame, occupying roughly 60% of frame height, with uniform empty
margin on all four sides. Background is one single flat warm-ivory tone #F7F3EC — no gradient,
no vignette, no props, no scenery, no drop shadow, no implied surface. Soft, even key light from
the front and slightly left. Brand palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange
#F08A24 as the rationed accent. Warm but restrained saturation, matched across the whole
library. Square canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and
256.
```

### `avatar-412` — band `adventurer`

**Concept.** Algebra knot — two trail ropes crossing and tucking through each other in a clean symmetric knot, deep navy and summit orange, one continuous loop

**Prompt.**

```
Algebra knot — two trail ropes crossing and tucking through each other in a clean symmetric
knot, deep navy and summit orange, one continuous loop. Dimensional stylized illustrated mark
with real shading and volume — soft painterly rendering, subtle form modelling. Not flat vector,
not photoreal, not glossy 3D render, not an emoji, not a line icon. Single subject centred in
the frame, occupying roughly 60% of frame height, with uniform empty margin on all four sides.
Background is one single flat warm-ivory tone #F7F3EC — no gradient, no vignette, no props, no
scenery, no drop shadow, no implied surface. Soft, even key light from the front and slightly
left. Brand palette: Deep Navy #0D1B2A, Warm Ivory #F7F3EC, Summit Orange #F08A24 as the
rationed accent. Warm but restrained saturation, matched across the whole library. Square
canvas, 1024x1024 minimum, high enough fidelity to downsample cleanly to 512 and 256.
```

---

## Accessibility labels

Spec §7: the UI never names ethnicity, and never makes an inferred identity claim. Each label is 
either `Avatar N` / `Avatar N selected`, or a concise non-sensitive descriptor in the same 
register as the trait column — "Avatar with braids and a green top". The `a11y_label` field in 
`avatar-prompts.json` is deliberately `null`: labels get written once the art exists and can be 
described from the actual pixels, not predicted from the prompt.

## Checklist before any `enabled: true`

1. Both `-256.webp` and `-512.webp` exist at the spec §5 path.

2. Contact-sheet review against the whole enabled library — head scale, eye line, lighting, 
background, saturation, sharpness, age appearance (spec §6).

3. The test: *would a user assume one professional character-design team drew everything?*

4. `npx vitest run src/lib/avatars.test.ts` green.
