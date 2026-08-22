# S250 aggressive coarse-locator authority wave

## Outcome

- Authoritative pending workload: **13,057 → 10,236** (**−2,821 rows**).
- Standards decisions: **749 → 3,561**, all canonical and valid.
- Rejected coarse locators: **747 → 3,559**.
- Partial standards decisions retained: **2**.
- Invalid, unbound, or inconsistent standards decisions: **0**.
- Open standards rows: **5,374 → 2,562** (**−2,812**).
- Optimized plan: **10,236 rows → 362 primary portfolios** (**28.28× compression**).

## Authority packets closed

| Authority boundary | Rows | Bounded packets | Exact descendants changed |
|---|---:|---:|---:|
| New York high-school conceptual-category locators | 604 | 17 | 0 |
| Texas high-school course-section locators | 604 | 18 | 0 |
| Remaining Common Core high-school category locators | 355 | 10 | 0 |
| Remaining California high-school category locators | 355 | 10 | 0 |
| Remaining Florida high-school portfolio locators | 355 | 10 | 0 |
| Texas Grades 1–8 grade-section locators | 539 | 16 | 0 |
| **Total** | **2,812** | **81** | **0** |

Every packet was capped at 40 edges, signed against the current dossier and lesson-source hashes, checked for overlap, and applied atomically. Challenge/transfer metadata was not used to infer transfer or mastery. Every exact descendant standard or benchmark remains open for a separate full-intent review.

## Official boundaries

- New York: the official P–12 mathematics publication organizes high-school content under conceptual categories and narrower standards.
- Texas: Chapter 111 sections identify grades or courses; assessable student expectations occur in nested subsection/item identifiers.
- Common Core: high-school category prefixes require narrower domain, cluster, and standard identifiers.
- California: higher-mathematics conceptual categories contain narrower standards and California additions.
- Florida: exact benchmarks use the subject, grade band, strand, standard, and benchmark coding scheme.

## Evidence state

- Queue: `SOURCE_SEAL_MATCH`, 10,236 rows.
- Standards: 6,121 dossiers; 3,561 valid decisions; 3,559 rejected; 2 partial; 2,560 candidate.
- Lesson cards: 1,701 source-sealed cards; 170 current decisions; 57 unrelated stale historical decisions; 1,531 pending.
- Cache: tracked and local current; seal `ec71e276620b9db039a1d9014f1e3e2b606533f9ea0c9777c7905d7e3eb4acae`.
- Portfolio plan: 362 scopes; 153 standards parent families; 168 exact-code contracts remain explicit.

The K–8 standards update initially reopened 53 additional lesson decisions. Exact reconstruction proved that those 53 bases differed only in the newly rejected Texas grade-locator edge state; focused course/evaluator/figure regressions passed, and explicit superseding records restored them. The remaining 57 stale decisions have unrelated source changes and remain open.
