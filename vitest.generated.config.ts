import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    pool: "threads",
    include: ["tests/generated-projects.test.ts"],
    exclude: ["e2e/**", ".next/**", "node_modules/**", "src/**"],
    testTimeout: 480000,
    hookTimeout: 120000,
  },
});
