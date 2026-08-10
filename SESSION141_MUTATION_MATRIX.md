# Session 141 adversarial mutation matrix

| mutation | required detector |
|---|---|
| Equal coefficients and unequal constants grade as one solution | schema/evaluator test + 3,456-case sweep |
| Equal coefficients and equal constants grade as no solution | truth derivation test + sweep |
| Different coefficients grade as infinitely many | truth unit test |
| Two choices encode the derived outcome | integrity gate |
| Duplicate IDs or labels | integrity gate |
| Variant falls back to MCQ | executable sweep |
| Variant answer ID disagrees with derived outcome | executable sweep + variant gate branch |
| Distribution constant is not multiplied | independent normalized-coefficient check |
| Wrong-path feedback disappears | content proof + audit |
| Remedial check returns to MCQ | equation-outcome audit |
| Choose-an-equation task is force-converted | audit preserves retained MCQ surfaces |
| Set-valued blank challenge is force-converted | audit preserves retained MCQ surfaces |
| Reveal replaces learner claim | renderer test (`eol-ghost`) |
| Adapt=3 without toward/away events | renderer marker + capability audit |
| Meaning relies on color alone | dashed residue, text label, operator and SR narration checks |
| Claim control drops below 44px | DOM test (`min-h-14`) |
| Registration surface missing | 116/116 engine-registration contract |
| Non-target lesson changes | 1,129-file content proof |
| Historical audit freezes whole shared source file | generated historical non-regression chain |
| Package root/session identity drifts | package identity + re-extraction gate |
