/**
 * TELEMETRY PROVIDER (s331, CL-P0-020 prep) — the interface contract and the
 * default provider, proven:
 *  · ConsoleTelemetryProvider.captureError prints EXACTLY what the route
 *    error boundary printed before the seam existed — console.error(label,
 *    error) — so the refactor changed no observable behavior;
 *  · a missing label falls back to a sensible default;
 *  · captureEvent goes to console.debug (never adds noise to error logs);
 *  · selection defaults to the console provider;
 *  · the sentry branch fails LOUDLY, naming every env var it requires;
 *  · an unknown provider name is refused with the valid values.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConsoleTelemetryProvider, createTelemetryProvider, telemetry } from "./telemetry";

afterEach(() => vi.restoreAllMocks());

describe("ConsoleTelemetryProvider (the default = the current behavior)", () => {
  it("captureError prints console.error(label, error) — byte-identical to the pre-seam boundary", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("boom");
    new ConsoleTelemetryProvider().captureError(err, { label: "Maggie's Trail route error", digest: "d1" });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("Maggie's Trail route error", err);
  });

  it("captureError without a label uses the default label", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("boom");
    new ConsoleTelemetryProvider().captureError(err);
    expect(spy).toHaveBeenCalledWith("Maggie's Trail error", err);
  });

  it("captureEvent goes to console.debug, never console.error", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    new ConsoleTelemetryProvider().captureEvent("release-marker", { version: "v4" });
    expect(debug).toHaveBeenCalledWith("Maggie's Trail event: release-marker", { version: "v4" });
    expect(error).not.toHaveBeenCalled();
  });
});

describe("provider selection (NEXT_PUBLIC_TELEMETRY_PROVIDER)", () => {
  it("defaults to the console provider, and the module-level instance IS that default", () => {
    expect(createTelemetryProvider().name).toBe("console");
    expect(createTelemetryProvider("console")).toBeInstanceOf(ConsoleTelemetryProvider);
    expect(telemetry.name).toBe("console");
  });

  it("sentry is a documented stub: throws naming every required env var", () => {
    expect(() => createTelemetryProvider("sentry")).toThrowError(
      /NEXT_PUBLIC_SENTRY_DSN.*SENTRY_ENVIRONMENT.*SENTRY_RELEASE/s
    );
    expect(() => createTelemetryProvider("sentry")).toThrowError(/not configured/);
  });

  it("refuses an unknown provider name, listing the valid values", () => {
    expect(() => createTelemetryProvider("datadog")).toThrowError(/console.*sentry/s);
  });
});
