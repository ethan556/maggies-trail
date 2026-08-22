/**
 * TELEMETRY PROVIDER — the observability seam behind the route error
 * boundary, lifted into an explicit, env-selected interface (S331,
 * CL-P0-020 prep).
 *
 * What the product needs from telemetry today is exactly two calls:
 *   captureError(error, context) — an unexpected failure happened; make it
 *     visible somewhere an operator can act on it.
 *   captureEvent(name, props)    — a noteworthy non-error signal (release
 *     markers, health beacons). Nothing calls this yet; it exists so the
 *     interface does not need to change when something does.
 *
 * The DEFAULT provider is the current behavior, unchanged: the console.
 * `captureError` prints exactly what src/app/error.tsx printed before this
 * seam existed — console.error(label, error) — visible in development and in
 * hosted platform logs, invisible to any alerting system. That gap is the
 * open ledger row; this file is where it closes.
 *
 * Selection is by env var (used from client components, so NEXT_PUBLIC_ —
 * Next.js inlines it at build time):
 *   NEXT_PUBLIC_TELEMETRY_PROVIDER=console  (default) — ConsoleTelemetryProvider.
 *   NEXT_PUBLIC_TELEMETRY_PROVIDER=sentry  — documented stub: throws at
 *     selection time with the env vars a real Sentry (or equivalent)
 *     integration needs. Implementing it means an SDK-backed provider that
 *     forwards both calls with release/environment tags and keeps the console
 *     line in development. See docs/PROVIDERS.md (CL-P0-020).
 */

export interface TelemetryContext extends Record<string, unknown> {
  /** Console log label; the console provider prints this before the error. */
  label?: string;
}

export interface TelemetryProvider {
  readonly name: string;
  captureError(error: unknown, context?: TelemetryContext): void;
  captureEvent(name: string, props?: Record<string, unknown>): void;
}

/**
 * The current (and default) behavior, unchanged: errors to console.error with
 * the caller's label (byte-identical to the pre-seam error boundary output),
 * events to console.debug so they never add noise to hosted error logs.
 */
export class ConsoleTelemetryProvider implements TelemetryProvider {
  readonly name = "console";

  captureError(error: unknown, context?: TelemetryContext): void {
    console.error(context?.label ?? "Maggie's Trail error", error);
  }

  captureEvent(name: string, props?: Record<string, unknown>): void {
    console.debug(`Maggie's Trail event: ${name}`, props ?? {});
  }
}

const SENTRY_ENV_VARS = "NEXT_PUBLIC_SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_RELEASE";

/**
 * Select a telemetry provider by name (defaults to NEXT_PUBLIC_TELEMETRY_PROVIDER,
 * then "console"). The sentry branch is a documented stub that fails loudly rather
 * than silently dropping production errors.
 */
export function createTelemetryProvider(
  name: string = process.env.NEXT_PUBLIC_TELEMETRY_PROVIDER ?? "console"
): TelemetryProvider {
  switch (name) {
    case "console":
      return new ConsoleTelemetryProvider();
    case "sentry":
      throw new Error(
        `NEXT_PUBLIC_TELEMETRY_PROVIDER=sentry is not configured in this build. A real error-telemetry ` +
          `integration requires ${SENTRY_ENV_VARS} and a SentryTelemetryProvider implementation in ` +
          `src/lib/telemetry.ts forwarding captureError/captureEvent with release correlation. ` +
          `See docs/PROVIDERS.md (CL-P0-020).`
      );
    default:
      throw new Error(`Unknown NEXT_PUBLIC_TELEMETRY_PROVIDER "${name}" — valid values: console (default), sentry.`);
  }
}

export const telemetry: TelemetryProvider = createTelemetryProvider();
