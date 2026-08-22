import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // `server-only` guards are Next.js-specific; tests run in a Node
      // environment where the guard's client/server distinction doesn't apply.
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
    },
  },
});
