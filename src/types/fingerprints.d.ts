/** Types for the plain-.mjs fingerprint helpers.
 *
 * These modules are .mjs because the seal scripts run them under bare node with no build step, but
 * they are imported by TypeScript tests too. Without a declaration each importer needs a
 * `@ts-expect-error`, which does not merely silence the error — it lets an implicit `any` through,
 * so a signature change (a renamed field, a different return shape) would typecheck clean at every
 * call site and only surface as a runtime failure inside a seal. Declaring the shape once here
 * keeps the no-`any` rule intact and makes such a change a compile error where it belongs.
 *
 * Keep in sync with the implementations by hand; if the shape drifts, the fingerprint tests fail
 * on the field they read, which is the intended tripwire.
 */
declare module "*/source-fingerprint.mjs" {
  /** One sha256 over everything that can change test BEHAVIOUR except content/. */
  export function sourceFingerprint(root: string): { sha256: string; files: number };
}

declare module "*/corpus-fingerprint.mjs" {
  /** One sha256 over the authored lesson corpus. */
  export function corpusFingerprint(root: string): { sha256: string; files?: number; lessons?: number };
}
