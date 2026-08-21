# S329 Closure Investigation — Lane A, Packet CL4

Scope: `CL-P1-033` only ("Current full Vitest" — Windows current branch is not green: 15
failures / 12,813 tests across 6 files). Read-only against `CLOSURE_LEDGER.md` itself — this
session did **not** edit the ledger (a separate integration step applies status edits after
reading this report). Working tree: branch `codex/v4-s244-authored-visual-wave`, HEAD
`7d8e4f40ec296ef41a471a6c60bf4a8c170e4f79`. This sandbox is Linux (Node v22.22.2), so the
recorded Windows failures cannot be reproduced directly — the assignment was to audit the test
suite's own source for the specific portability bug classes the ledger row names, fix what's
concretely wrong, and be honest about what can and cannot be verified from here.

The tree had a large number of *other* files already modified by concurrent work when this
session started (hundreds of `content/courses/*.json` lesson files, `reports/`, other
`src/lib`/`src/components` files, a stray `src/components/__tmp_render_probe.test.tsx` that
appeared and then vanished mid-session) — none of that is this session's work and none of it was
touched here. Two of those concurrent edits produced test failures that are **not** part of this
row and are called out explicitly in §4 so they aren't mistaken for something this session broke.
This session's entire footprint is six files, all under `src/`, listed in full in §5.

No lesson content was read, interpreted, or edited for this row — every fix is to test-harness
source (path/temp-file handling), never to an assertion's mathematical or pedagogical meaning.

---

## 1. Method

`vitest.config.ts`'s `include` is `["src/**/*.test.{ts,tsx}"]` — that is the exact and only
definition of "full Vitest" here (`npm test` → `vitest run`, no other glob). 725 files match.
`scripts/` contains no `*.test.ts`/`*.test.tsx` files at all, so that half of the requested search
scope is empty by inspection (`find scripts -name '*.test.ts' -o -name '*.test.tsx'` → nothing).
One `scripts/audit/flagship-representation.test.mjs` exists but uses `node:test`, not Vitest, is
not in `vitest.config.ts`'s include glob, and is not wired into any `package.json` script — it is
outside "full Vitest" and was left alone.

For each of the ledger's three named defect classes, I ran systematic greps and small Node
scripts across the full 725-file set (not just a sample), then read every candidate file in full
before deciding whether it was a real hazard. Key techniques used to separate real bugs from
false alarms, all reproducible on this Linux box:

- A live Vitest probe (`expect(new Set(...)).toEqual(new Set(...))` with shuffled member order)
  confirmed this codebase's Vitest 4.1.10 treats `Set`/`Map` equality in `toEqual` as
  order-independent — so any test comparing two `Set`s built from directory-scan output is safe
  regardless of scan order, on any OS.
- A live Node probe confirmed `fs.mkdirSync(path, {recursive:true})` throws `ENOTDIR` when a path
  segment already exists as a plain file — the property the fix in §2.3 depends on.
- `path.basename(file, ".json")` was checked against the pre-fix `.split("/").pop()...` output on
  every currently-matched file and produces byte-identical results on this platform (see §2.1),
  so the fix is a no-op here and only changes behavior on the platform where the bug exists.

## 2. Bug class 1 — path-separator bugs

### 2.1 `globSync()` results treated as forward-slash strings (2 files, both fixed)

`node:fs`'s built-in `globSync`/`glob` (added Node 20+, used here — this repo has no third-party
`glob` package dependency; confirmed via `package.json`) walks the filesystem and joins matched
path segments with the **platform's native separator**, unlike the popular userland `glob`
package, which normalizes to `/` on every OS. Verified locally: `globSync("content/courses/*/
lessons/*.json")` returns forward-slash paths *on this Linux box* — consistent with the current
green Linux CI — but on Windows the same call is documented to return backslash-joined paths.
Two files depended on the Linux-only shape:

- **`src/lib/content.authoredKeys.s242.test.ts:48`** (pre-fix)
  ```ts
  const lessons = globSync("content/courses/*/lessons/*.json").map((file) => ({
    id: file.split("/").pop()!.replace(".json", ""),
    ...
  ```
  On Windows, `file` would be e.g. `content\courses\word-problems-g3\lessons\g3w-01-03.json`.
  `.split("/")` finds no `/` at all, so `.pop()` returns the **entire path string**, and `id`
  becomes `content\courses\word-problems-g3\lessons\g3w-01-03` instead of `g3w-01-03`.

- **`src/components/widgets.buildReadout.s242.test.tsx:47`** (pre-fix) — identical pattern,
  identical corruption.

  **Why this is a genuine hazard, not hypothetical:** this is exactly the documented behavior
  difference between Node's built-in glob and the third-party `glob` package (native-separator
  output on Windows vs. forced POSIX output), and the code explicitly assumed the latter. In
  *both* files today the corrupted `id`/`lesson` field only feeds diagnostic strings (`${lesson}#
  ${step}`) rather than the pass/fail condition itself, so on the current corpus this bug would
  not by itself flip a green assertion to red — but it does mean every failure message these two
  suites produce on Windows would be unreadable (a lesson id replaced by a multi-directory path),
  which is a real defect in a test suite's job of localizing failures, and it is squarely the bug
  class the ledger names. Both are fixed with `path.basename(file, ".json")`, which reads both
  separators correctly on every OS. Verified byte-identical to the old code's output on this
  Linux tree via a direct probe (`oldWay === newWay` for a live corpus path).

  **Fix (both files):** added `import { basename } from "node:path";` and replaced
  `file.split("/").pop()!.replace(".json", "")` with `basename(file, ".json")`.

### 2.2 Dormant separator-assumption inconsistent with the file's own established idiom (1 file, fixed)

- **`src/components/AvatarDisplay.fence.test.tsx:39`** (pre-fix)
  ```ts
  function isReasoningSurface(path: string): boolean {
    const name = path.split(/[\\/]/).pop() ?? "";       // <- correctly handles both separators
    return (
      /^LessonPlayer/.test(name) || ... ||
      path.includes("/manipulative")                     // <- does not
    );
  }
  ```
  `path` here is built by this same file's own `sourceFiles()` walker via `join(dir, e)` (line
  21), which is native-separator on Windows. Three lines above, the file's own author already
  handles this correctly (`path.split(/[\\/]/)`), and the same-purpose `rel()` helper defined
  later in the file does too — this one clause reverted to a bare `"/"` check.

  **Why this is a genuine hazard, and why I'm calling it dormant rather than active:** on Windows
  this clause would never match a real `manipulative*` source file, exactly mirroring the
  documented TOOL-01 defect this codebase already fixed once in `scripts/native-integrity.mjs`
  (`ROUTE_FILTER` against `join()`-built paths — see `src/lib/toolPortability.s242.test.ts`, which
  pins that exact regression). I confirmed via `find src -iname '*manipulative*'` that no
  directory or non-test file currently matches this clause, on Linux or (by the same path-content
  argument) on Windows — so today it is inert on both platforms and is **not** one of the 15
  recorded failures. It is a genuine, latent portability defect that would silently stop working
  the moment a `manipulative*` source file or directory is added, in a file whose entire job is
  guarding an architectural invariant — exactly the kind of trap that should be closed while
  touching this bug class rather than left for a future session to rediscover.

  **Fix:** `path.includes("/manipulative")` → `/[\\/]manipulative/.test(path)`, matching the
  file's own established `split(/[\\/]/)` idiom.

### 2.3 Hardcoded POSIX-only special file used to simulate an unwritable path (1 file, fixed)

- **`src/server/deployability.test.ts:41,45`** (pre-fix)
  ```ts
  // A path under a file (not a directory) cannot be created — the closest portable stand-in for
  // a read-only serverless filesystem.
  process.env.MAGGIE_DB_PATH = join("/proc/version", "nested", "app.db");
  ...
  expect(() => openDb(join("/proc/version", "nested", "app.db"))).toThrow();
  ```
  `openDb()` (`src/server/db.ts:32`) calls `mkdirSync(dirname(path), {recursive:true})` before
  opening the database. The test's premise is that `/proc/version` is guaranteed to exist as a
  regular **file** (not a directory), so creating a subdirectory under it is impossible and
  `mkdirSync` throws — which is true, but only because Linux's procfs happens to expose a file at
  that exact path. `/proc` does not exist at all on Windows (or macOS). On Windows, `join("/proc/
  version", "nested", "app.db")` resolves to an ordinary, currently-nonexistent path rooted at the
  current drive; `mkdirSync(..., {recursive:true})` would very plausibly **succeed** in creating
  it rather than throw, silently invalidating this test's entire premise — this is not a
  hypothetical translation issue, it is the test asserting a fact about a Linux-specific pseudo
  filesystem and calling it "the closest portable stand-in."

  **Fix:** replaced the procfs dependency with a self-manufactured blocker inside the test's own
  `mkdtempSync`-based scratch directory (registered with the file's existing `created` cleanup
  array): write a plain empty file, then point `MAGGIE_DB_PATH` at a path *underneath* that file.
  "A directory cannot be created where a file already exists" is a basic filesystem invariant
  enforced identically by POSIX `mkdir()` and Win32 `CreateDirectory()` — it needs no
  platform-specific file to exist. Verified on this box that the replacement throws `ENOTDIR`
  exactly as the original did (see §1's Node probe).

## 3. Bug class 2 — temp cleanup portability bugs

This is the strongest, least speculative finding in this report.

### 3.1 Missing `db.close()` before `rmSync()` (2 files, both fixed)

Every one of the 18 test files in this suite that opens a real `better-sqlite3` handle
(`openDb`/`new Database`) inside a `mkdtempSync`-based scratch directory and later removes that
directory follows one of two safe patterns: either it holds `db` in an outer-scope variable and
calls `db.close()` directly in `afterEach`, or (in the two files that hand the connection to the
module singleton via `_setDbForTests`) it calls `getDb().close()` before nulling the singleton —
**except two**:

- **`src/app/api/authz.s46.test.ts`** (pre-fix `afterEach`, was lines 49–52)
  ```ts
  afterEach(() => {
    _setDbForTests(null);
    rmSync(dir, { recursive: true, force: true });
  });
  ```
- **`src/app/api/badJson.s46.test.ts`** (pre-fix, was lines 35–47) — same defect, and worse: the
  handle was a `const db = openDb(...)` scoped *inside* `beforeEach`, not even reachable from
  `afterEach` to close.

  In both, `_setDbForTests` (`src/server/db.ts:91`) only reassigns a module-level reference
  (`handle = db;`) — it does not call `.close()` on the previous handle. The open SQLite file
  descriptor is simply abandoned while `rmSync` immediately tries to delete the directory holding
  that still-open file.

  **Why this is a genuine hazard, not hypothetical — this is the textbook case:** POSIX allows
  unlinking a file that a process still has open (the directory entry is removed immediately; the
  underlying inode is freed once the last handle closes) — which is exactly why this passes
  silently on Linux and hides the bug. Windows' NTFS/Win32 model does not permit this by default:
  deleting or renaming a file (or a directory containing one) with an open handle raises
  `EBUSY`/`EPERM` ("the process cannot access the file because it is being used by another
  process") unless the handle was opened with `FILE_SHARE_DELETE`, which `better-sqlite3`'s
  default open on Windows does not request. This is precisely "Windows fails cleanup when a
  handle is still open when cleanup runs," the exact wording of the ledger's own hypothesis, in
  the exact place it would occur (a real DB handle + `rmSync` on its containing directory), and it
  is a clean deviation from a pattern this codebase otherwise gets right in 16 other files.

  **Fix (both files):** added `db.close();` in `afterEach`, immediately before `rmSync`, matching
  the established pattern in this same directory's other two DB-opening tests
  (`src/app/api/lti.s113.test.ts`, `src/app/api/institution.s113.test.ts`) and every
  `src/server/*.test.ts` DB test. For `badJson.s46.test.ts` this additionally required promoting
  `db` from a `beforeEach`-local `const` to a module-scope `let db: DB;` (importing `type DB` from
  `@/server/db`) so `afterEach` can reach it — again matching every sibling file's existing shape.

### 3.2 Everything else in this category: audited, not found

Every `mkdtempSync`/`rmSync` pair in the suite (21 `rmSync(` call sites across ~20 files, found by
exhaustive grep, cross-checked against every `openDb`/`new Database` call site by a small script)
already passes `{ recursive: true, force: true }` — there is no missing-options instance anywhere.
The two files with more complex handle lifecycles (`src/server/db.s43.test.ts`'s
backup/wipe/restore test, and `src/lib/syncClient.test.ts` / `src/lib/sync.route.test.ts`'s
`getDb()`-mediated "simulate a process restart" tests) were read in full and correctly re-register
a live handle before the shared `afterEach` runs. A final full-suite re-scan after the §3.1 fixes
(script listed in §6) confirms all 18 DB-opening-and-cleaning-up files now contain at least one
`.close()` call, with no remaining gap.

## 4. Bug class 3 — authored-set / evaluation order-dependent expectations

Searched exhaustively and found **no live instance** of this class. What was checked, each via a
dedicated script or targeted grep across all 725 files (not sampled):

- All 503 `readdirSync(` call sites across 210 files. Every place a `readdirSync` result is
  compared against a hardcoded/derived array via `toEqual`/`toStrictEqual` (21 sites) already
  calls `.sort()` first. Every place two sides are compared as unordered collections wraps both in
  `new Set(...)` (confirmed order-independent for `toEqual` in this Vitest version, §1). Every
  other `toHaveLength`/`.length` check is inherently order-independent. Recursive directory
  "walker" helpers used only to iterate-and-check-each-file independently of order (the large
  majority of hits) do not have this hazard at all — order only matters when the *set itself*, or
  a value derived from iteration order, is what gets compared.
- The one production helper this session found whose *own* sort key is not separator-normalized
  before comparison (`mathPresentationInputFingerprint` in `scripts/audit/math-presentation-
  source-seal.ts:60`, `.sort((a,b) => relative(root,a).localeCompare(relative(root,b)))`) is a
  non-test production script, not a `*.test.ts`/`*.test.tsx` file, so it is outside this task's
  edit scope; it is also unlikely to manifest given this repo's exclusively lowercase-kebab-case
  content naming (a divergence needs a directory name that is a case-sensitive prefix of a sibling
  entry continuing with an uppercase letter). Flagging it here for awareness only, in the same
  spirit as the ledger's own CL-P1-040 "OPEN — TOOLING ONLY" rows — not fixed, not claimed fixed.
- 6 `Object.keys(...)` sites feeding `toEqual` from directory-scan-populated objects: all 6
  already `.sort()` first.
- `.split("/")` sites that looked path-like at first grep (`[lessonId, stepId] = placement.split
  ("/")` etc., ~20 occurrences) are, on inspection, splitting a synthetic `"lessonId/stepId"`
  composite key string the test authors invented themselves (never touching a real filesystem
  path) — the task's own stated exception for pure data, confirmed by reading each definition site
  (e.g. `withheld = ["mb-01-01/c2", ...]` in `session265.multiplyBiggerSourceRepair.test.ts:15`).

I take the ledger's "authored-set/evaluation expectation failures" wording as most literally
matching the §2/§3 findings above (a corrupted authored-lesson-id `Set`-like grouping key from
§2.1, and handle-open state left over from one test's setup leaking into another's evaluation via
a failed cleanup in §3.1) rather than a distinct, still-undiscovered bug class — I looked hard for
a separate literal Set/array-ordering defect and did not find one.

## 5. Files touched this session

Exactly six, all `*.test.ts`/`*.test.tsx` under `src/`, all portability-only — no assertion
threshold, lesson content, or test *intent* was changed, only how paths/handles/temp files are
built and released:

1. `src/lib/content.authoredKeys.s242.test.ts`
2. `src/components/widgets.buildReadout.s242.test.tsx`
3. `src/components/AvatarDisplay.fence.test.tsx`
4. `src/server/deployability.test.ts`
5. `src/app/api/authz.s46.test.ts`
6. `src/app/api/badJson.s46.test.ts`

`git diff --stat` on these six files: 6 files changed, 34 insertions(+), 10 deletions(-) (comments
included). No other file was written by this session. `reports/closure/cowork-staging/` was not
touched — no lesson content was edited, so no disposition record applies.

## 6. Targeted gates run (Linux, this session)

Per the task's constraint, no full `vitest run`, `tsc --noEmit`, or `npm run build` was run — only
targeted single/multi-file `npx vitest run <files>`, plus small `npx tsx`/`node -e` probes.

```
$ npx vitest run src/server/deployability.test.ts src/components/widgets.buildReadout.s242.test.tsx \
    src/components/AvatarDisplay.fence.test.tsx src/app/api/authz.s46.test.ts src/app/api/badJson.s46.test.ts
 Test Files  5 passed (5)
      Tests  17 passed (17)

$ npx vitest run src/lib/content.authoredKeys.s242.test.ts
 Test Files  1 failed (1)
      Tests  1 failed | 3 passed (4)
      # the 1 failure is pre-existing and unrelated — see below
```

All **6** fixed files together: **20/21 tests pass.**

**The one remaining failure is proven pre-existing and unrelated to this row.**
`content.authoredKeys.s242.test.ts`'s `DROPPED_KEY_BASELINE = 148` no longer matches the live
corpus count (currently 140) — a content-authoring metric ("widgets carrying authored keys the
schema silently strips") that has drifted because concurrent work in this shared sandbox is
actively editing lesson JSON (confirmed: `git diff` shows ~250 modified `content/courses/*.json`
files from a session other than this one). I verified this conclusively with an A/B test: `git
stash` on just this file (reverting to the pre-fix `.split("/").pop()` code) reproduces the
identical `140 vs 148` failure, so it is not caused by the `basename()` fix. This is a
content-freshness/authoring concern (ENG-01), not a path-separator, temp-cleanup, or
order-dependence defect, and editing `DROPPED_KEY_BASELINE` or lesson content is both outside this
row's scope and outside this task's explicit instructions ("do not edit any lesson content
files"). Left untouched; noted here only so it isn't mistaken for something this fix broke.

A second, similarly-caused false lead was ruled out the same way during the broader audit (not a
file this session edited): `src/lib/session245.mathPresentationSourceSeal.test.ts`'s "matches the
current regenerated index" test also fails on this tree, for the same reason — a checked-in seal
in `reports/math-presentation/MATH_SYMBOLIC_DISPLAY_INDEX.csv` no longer matches a live-computed
hash over `content/courses` because that content is being concurrently edited. Confirmed
unconnected to this session: the fingerprinting function explicitly excludes `*.test.*` files from
its hashed input set (`math-presentation-source-seal.ts:59`), so none of this session's edits
could affect that hash even in principle, and this session never touched `content/` or that
script.

Supporting spot-checks (already-correct files, run to confirm nothing was disturbed and to
validate the "no bug found" conclusions in §3.2/§4): `src/server/authService.s43.test.ts`,
`src/server/db.s43.test.ts`, `src/lib/syncClient.test.ts`, `src/lib/toolPortability.s242.test.ts`,
`src/lib/semanticRepresentationInventory.test.ts` — all green (32/33; the one red test in that
batch is the seal-freshness false lead just described).

## 7. What this does not do

No Windows execution happened or could happen from this sandbox — every claim about Windows
behavior above is either a documented Node.js/Win32 filesystem semantic (native-separator
`globSync` output, `FILE_SHARE_DELETE` requirements for delete-while-open, procfs not existing) or
a directly-reproduced-on-Linux mechanism (`ENOTDIR` from `mkdirSync` under a file), not a live
Windows run. This closes the **source-level** portability defects this audit could find and
justify; it does not and cannot certify that the recorded 15 Windows failures are now fully
resolved, since 4 of the recorded 6 failing files were not identified by name in the ledger row
and this session had no way to map its fixes one-to-one against them. A Windows (or Windows CI)
re-run of the full suite remains the only way to confirm the count.

## 8. Recommended ledger update

```
| CL-P1-033 | P1 | Current full Vitest | Windows current branch is not green: 15 failures / 12,813 tests across 6 files; 321 files and 12,798 tests pass. | **OPEN — SOURCE FIXES APPLIED, WINDOWS RE-RUN STILL NEEDED** | S329 source audit of all 725 `src/**/*.test.{ts,tsx}` files fixed 3 concrete path-separator defects and 2 concrete temp-cleanup defects, matching the row's own named bug classes: (1) `content.authoredKeys.s242.test.ts` and `widgets.buildReadout.s242.test.tsx` derived lesson ids via `.split("/").pop()` on `node:fs` `globSync()` output, which is native-separator (backslash) on Windows unlike the third-party `glob` package — fixed with `path.basename(file, ".json")`; (2) `AvatarDisplay.fence.test.tsx`'s `isReasoningSurface` had one bare `path.includes("/manipulative")` inconsistent with the same file's own `split(/[\\/]/)` idiom used two lines above — fixed, though currently dormant (no source file matches it today on either platform); (3) `deployability.test.ts` relied on Linux's `/proc/version` (absent on Windows) to force a `mkdirSync` failure — replaced with a self-manufactured blocking file, a filesystem invariant portable to every OS, verified to throw `ENOTDIR` identically. Temp-cleanup: `authz.s46.test.ts` and `badJson.s46.test.ts` called `rmSync()` on a temp dir holding an open `better-sqlite3` handle without ever calling `.close()` first (only `_setDbForTests(null)`, which does not close the handle) — POSIX permits deleting open files (why this stayed green on Linux/CI) but Windows does not by default; fixed by adding `db.close()` before `rmSync()`, matching the pattern already correct in the other 16 DB-temp-dir test files. Audited and found NO instance of the third named class (order-dependent Set/array expectations from directory-scan output) — every `readdirSync`/`globSync` result compared via `toEqual` already sorts or wraps in `Set` (confirmed order-independent via a live Vitest probe). All 6 fixed files run targeted (`npx vitest run`): 20/21 tests pass; the 1 remaining failure (`content.authoredKeys.s242.test.ts`'s `DROPPED_KEY_BASELINE`) is proven pre-existing and unrelated via `git stash` A/B test — it is content-corpus drift from concurrent unrelated work in this sandbox, not a portability defect. Full evidence, before/after diffs, and reasoning: `reports/closure/S329_CLOSURE_CL4.md`. This session could not run on Windows and did not map its fixes against the 6 originally-named failing files one-to-one, so the row stays OPEN pending an actual Windows (or Windows CI) re-run of the full suite; close only on that evidence. |
```

Reopen condition (unchanged from the row's own standing text): rerun full suite on Linux CI and
Windows; the S236 focused learner-flow set remains green throughout.
