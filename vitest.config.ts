import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // vitest 4 (rolldown) honors tsconfig jsx:"preserve" (required by Next), so
  // the react plugin owns the JSX transform — tsconfig-independent.
  plugins: [react()],
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    alias: {
      // jsdom can't resolve next/dynamic chunks, so specs see the widget
      // catalogue through a static shim; production keeps the lazy boundary
      // (exercised for real by the browser Playwright suite).
      "@/components/WidgetView": new URL("./src/components/WidgetView.testshim.tsx", import.meta.url).pathname,
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
