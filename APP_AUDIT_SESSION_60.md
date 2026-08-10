# Application hardening audit — Session 60

## Result

The review covered the application shell, persistence, account and token flows, sync semantics, SQLite migrations, API boundaries, deterministic catalog loading, async error states, navigation, release tooling, and generated product records.

This pass fixes root causes rather than suppressing symptoms. Grade/variant coverage is unchanged; one authored feedback sentence was corrected because it contained a false mathematical equality.

## High-severity repairs

- Magic-link and email-verification tokens are no longer consumed by GET requests, so inbox security scanners cannot use single-use tokens before the learner or parent acts. Links now land on explicit confirmation pages; the API consumes tokens only on PUT.
- Password reset now has a complete `/reset` page and usable email destination.
- A valid HttpOnly session now restores the display mirror on every shell page, not only `/account`; Teach, Premium, syllabus entitlement, and auto-sync react to session changes.
- Offline logout now leaves a local tombstone and retries server revocation before allowing the session mirror to return. It no longer destroys the only browser copy of the token before the durable session row can be revoked.
- Token consumption is atomic under concurrent requests.
- Sync idempotency is scoped by account and learner, rechecked under an immediate write reservation, and rejects corrupt cached responses instead of crashing or leaking another scope's response.
- Stored sync profiles are runtime-validated and bounded before merge or persistence; malformed durable rows surface as recoverable conflicts/corruption rather than being overwritten.
- Sync transport throws can no longer leave a tab permanently locked as “in flight.”

## Data-integrity and offline repairs

- Browser persistence now has a tab-memory fallback for blocked/quota-limited storage across roster, progress, resume state, teacher data, narration, entitlement, device id, auth display mirror, and sync metadata.
- The memory mirror no longer resurrects a key removed by another tab or browser settings.
- Persisted profiles and rosters are runtime-validated; malformed structures fall back safely. Profiles written before `correctStreak` existed receive a narrow compatibility repair.
- Learner-data export preserves corrupt profile bytes for recovery instead of throwing during `JSON.parse`.
- Daily-date validation rejects impossible calendar dates.
- Catalog ordering now follows the generated curriculum manifest rather than filesystem enumeration, making recommendations and shared-skill routing deterministic.

## API and security-boundary repairs

- Every JSON API uses a shared bounded parser; oversized UTF-8 bodies and malformed JSON cannot become unbounded allocations or 500 responses.
- Email, token, password, learner, class, code, date, grade, and profile inputs are normalized and bounded before database work.
- Learner PIN throttling includes a learner-specific durable bucket, so spoofing an IP header cannot remove the brute-force ceiling.
- Production password/PIN hashing fails closed when `AUTH_PEPPER` is absent.
- Database-unavailable states are explicit 503 responses and retry after a short cache window rather than disabling account features for the process lifetime.
- SQLite migration 003 scopes idempotency keys and preserves old rows in an unreachable legacy scope until retention purges them.

## User-interface repairs

- Removed duplicate Teach entries from navigation.
- Daily, Review, and Notebook now distinguish load failure from empty content and expose a retry path.
- Daily and Review abort stale requests so a slower previous response cannot overwrite a newer grade/view.
- Added route-level error recovery and a useful 404 page.
- Native buttons have explicit button types; the shared Button defaults to `type="button"` unless a caller requests submit.
- Reduced-motion bootstrap follows the active roster profile and clears stale state.
- The visible server classroom code now resolves in the local join flow; class names and assignment due dates are bounded/validated.
- The one known authored hyperbola feedback error now diagnoses subtracting side lengths instead of claiming `1 = √(16 − 9)`.

## Tooling and release-truth repairs

- Removed author-machine absolute paths from two verification scripts.
- Added `npm run validate:native`, a dependency-free integrity gate covering JSON, imports, routes, assets, bounded API parsing, button semantics, registration, and path portability.
- Product-state generation no longer calls an unavailable `npx`, no longer silently labels every archive `no-git` because of a missing import, and reports accessibility/deployment status from evidence rather than hardcoded claims.
- Added a minimal Playwright smoke configuration and tests, generated tier/MCQ/product-state reports, current PWA wording, honest README, script map, and explicit known-limitations document.

## Verification completed in this checkout

- Native integrity: 1,231 JSON files, 546 source files, 678 local imports, 38 internal links, 1 literal asset, 133 native buttons, and 15 API routes.
- Content JSON: 1,225 files parsed.
- TypeScript syntax transpile: 264 files.
- SQLite: clean application of migrations 001–003 and successful 002→003 upgrade preserving the legacy retry row.
- Runtime smoke: strict dates, sync profile boundary, legacy profile repair, malformed profile rejection, cross-tab removal behavior, and blocked-storage fallback.
- Curriculum generators: 84 courses, 1,129 lessons, 10,487 steps, 1,165 skills with an acyclic prerequisite graph; registration, flagship tiers, scaffold audit, inventory, MCQ inventory, and product-state generation completed.

## Gates not executed

The archive did not include `node_modules`, and `npm ci` failed with repeated HTTP 503 responses from the internal package registry. Therefore the package-backed TypeScript semantic typecheck, Vitest suite, Zod schema/pedagogy runs, Next lint/build, Playwright execution, and `npm audit` are not recorded as passing. The repository is packaged without partial dependency or build artifacts.
