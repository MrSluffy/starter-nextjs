import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import * as semver from "semver";

const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf-8"));

describe("Package Manifest", () => {
  it("should have correct scoped name", () => {
    expect(packageJson.name).toBe("@mrsluffy/starter-nextjs-mcp");
  });

  it("should have bin pointing to dist/server.js", () => {
    expect(packageJson.bin["starter-nextjs-mcp"]).toBe("dist/server.js");
  });

  it("should not be private", () => {
    expect(packageJson.private).toBe(false);
  });

  it("should include only dist/, README.md, LICENSE in files", () => {
    expect(packageJson.files).toEqual(["dist/", "README.md", "LICENSE"]);
  });

  it("should define a valid Node.js engine range with a modern baseline", () => {
    expect(packageJson.engines.node).toBeDefined();
    expect(semver.validRange(packageJson.engines.node)).toBeTruthy();

    const minimumVersion = semver.minVersion(packageJson.engines.node);
    expect(minimumVersion).not.toBeNull();
    expect(minimumVersion!.major).toBeGreaterThanOrEqual(18);
  });

  it("should have all required keywords", () => {
    const required = ["mcp", "mcp-server", "nextjs", "starter", "generator", "scaffold"];
    for (const keyword of required) {
      expect(packageJson.keywords).toContain(keyword);
    }
  });

  it("should have version in semver format", () => {
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("should have runtime dependencies in dependencies", () => {
    expect(packageJson.dependencies["@modelcontextprotocol/sdk"]).toBeDefined();
    expect(packageJson.dependencies["zod"]).toBeDefined();
    expect(packageJson.dependencies["zod-to-json-schema"]).toBeDefined();
  });

  it("should have public npm publishConfig", () => {
    expect(packageJson.publishConfig).toEqual({
      access: "public",
      registry: "https://registry.npmjs.org/",
    });
  });

  it("should ship README.md and LICENSE next to the package", () => {
    expect(existsSync(resolve(process.cwd(), "README.md"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "LICENSE"))).toBe(true);
  });
});
