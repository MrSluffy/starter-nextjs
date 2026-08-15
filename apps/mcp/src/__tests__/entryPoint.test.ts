import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { resolve } from "path";
import { readFileSync } from "fs";

const mcpRoot = resolve(__dirname, "../..");
const serverPath = resolve(mcpRoot, "src/server.ts");

describe("Entry Point Robustness", () => {
  it("should exit 0 with 'OK' on --health-check", () => {
    const result = spawnSync("npx", ["tsx", serverPath, "--health-check"], {
      cwd: mcpRoot,
      encoding: "utf-8",
      shell: true,
      timeout: 30000,
    });
    expect(result.stdout.trim()).toBe("OK");
    expect(result.status).toBe(0);
  }, 30000);

  it("should contain Node.js version check for < 18", () => {
    const source = readFileSync(serverPath, "utf-8");
    expect(source).toContain("process.versions.node");
    expect(source).toContain("major < 18");
    expect(source).toContain("requires Node.js >= 18.0.0");
  });

  it("should handle missing dependency with human-readable error", () => {
    const source = readFileSync(serverPath, "utf-8");
    expect(source).toContain("MODULE_NOT_FOUND");
    expect(source).toContain("Missing required dependency");
    expect(source).toContain("npm install");
  });
});
