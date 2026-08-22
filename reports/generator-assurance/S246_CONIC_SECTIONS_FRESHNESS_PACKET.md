# S246 conic-sections generator assurance

Date: 2026-08-17  
Generator: `g12-conic-sections`  
Verdict: **PASS for the two stale numeric forms; the global resolver now stops in a separate Grade 10 constructions family.**

## Parabola definition

The form `conic-sections__co-parabola-def__numeric` now generates eight exact parabolas spanning
vertical and horizontal axes. Each state changes the focus, directrix, on-curve point, orientation
and perpendicular distance. The coordinates were chosen from the focus/directrix definition, and
the independent route recomputes the distance directly from the printed point and directrix.

## Hyperbola eccentricity

The form `conic-sections__co-hyp-ecc__numeric` now uses eight exact Pythagorean `(a,b,c)` states,
with horizontal and vertical standard forms. The answer is `c/a`, rounded only because the prompt
explicitly requires two decimal places. Independent assurance parses `a` and `c` from the printed
question and recomputes the ratio.

Both forms retain misconception-specific traps, reject trap/answer collisions, remain deterministic
for the same seed, and vary across all three bands.

## Gates

- Focused conic and conditional suites: **PASS**.
- Real resolver: both conic failures cleared; next failure is `cp-02-01/k2` under
  `g10-constructions-proof`.
- Full generator regression plus S246 properties: **4,004/4,004 PASS**.
- TypeScript: **PASS**.

No lesson declaration or authored lesson prose changed in this packet.
