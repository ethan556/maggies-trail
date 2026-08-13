# Session 138 — Percent-change price laboratory

The given percent is not an adjustable target. The engine keeps the base price, exact change amount, add/subtract direction, and selected final-price claim visible together. This is why a percentBar slider was rejected as a false fit.

| step | direction | base | percent | derived change | derived final price | wrong paths |
|---|---|---:|---:|---:|---:|---:|
| i1 | markup | 10 | 25% | 2.5 | 12.5 | 2 |
| k1 | markup | 50 | 20% | 10 | 60 | 2 |
| i2 | markdown | 80 | 5% | 4 | 76 | 2 |
| i3 | markdown | 200 | 15% | 30 | 170 | 2 |
| k2 | markdown | 50 | 10% | 5 | 45 | 2 |
| k3 | markup | 20 | 50% | 10 | 30 | 2 |
| ch1 | markdown | 200 | 8% | 16 | 184 | 2 |

- Exact-fit experiences: **7/7**
- Live reviewed K–8 queue: **0**
- Tier counts: **A 1190 · B 458 · C 53 · D 0**
