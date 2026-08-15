// Imported from "vitest/config" (not "vite") so the `test` block is typed.
import { defineConfig } from "vitest/config";

// `dist` is what wrangler.jsonc serves as the static-asset bundle.
export default defineConfig({
  build: { outDir: "dist", emptyOutDir: true },
  test: { environment: "jsdom" },
});
