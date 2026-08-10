# Session 222 — Wave 02 adversarial QA

**Automated shell decision:** ACCEPT.
**Whole closure decision:** CONDITIONAL — manual hardware/assistive-technology gates and baseline Vitest/security debt remain open.

## Falsification checks

- Re-ran all 90 surfaces after the fixes; no representative-only sampling was substituted.
- Promoted touch sizing from a diagnostic count to a failing 44px gate. The first repaired run still failed 4 captures because Basecamp exposed 22 undersized controls; those were fixed and the entire matrix rerun.
- Verified both light and dark themes at 390×844, 768×1024, and 1440×900.
- Required zero horizontal overflow and visible desktop keyboard focus reachability.
- Kept screenshots in reduced-motion settled state so entry animation opacity could not create false defects.
- Preserved the curriculum freeze: `git diff -- content/courses` is empty.
- Did not relabel the 17 failing Vitest tests, generated-state failure, or Sharp advisory as green.
- Restored generated reports immediately after the stale verifier attempted to rewrite them.

## Residual risk

The public deployment does not publish a Git SHA, so the asset/hash evidence cannot become cryptographic provenance without a future build-info endpoint or Vercel metadata export. Manual screen-reader, real-device, 200% zoom, and normal-motion checks remain outside this automated session.
