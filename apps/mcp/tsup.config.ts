import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node18",
  platform: "node",
  bundle: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  shims: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
  noExternal: ["@mrsluffy/generator-core"],
  external: ["@modelcontextprotocol/sdk", "zod", "zod-to-json-schema", "archiver", "semver", "ejs"],
});
