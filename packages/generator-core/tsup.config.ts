import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node18",
  platform: "node",
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
