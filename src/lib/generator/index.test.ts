import { describe, expect, it, vi } from "vitest";
import { createConfig, representativeConfigs } from "../../../tests/helpers/configs";
import { unzipTextEntries } from "../../../tests/helpers/zip";
import { buildZip, collectFiles } from "./index";

// Avoid live npm registry calls in unit tests
vi.mock("./packageJson", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./packageJson")>();
  return {
    ...actual,
    resolveDependencyVersions: vi.fn().mockResolvedValue({}),
  };
});

describe("generator index", () => {
  it("collects core files and optional integrations for a rich config", () => {
    const files = collectFiles(representativeConfigs.javascript);
    const fileMap = new Map(files.map((file) => [file.path, file.content]));

    expect(fileMap.get("package.json")).toBeTruthy();
    expect(fileMap.get("Dockerfile")).toContain("COPY package.json package-lock.json ./");
    expect(fileMap.get("docker-compose.yml")).toContain("mongodb:");
    expect(fileMap.get(".github/workflows/ci.yml")).toContain("name: CI");
    expect(fileMap.get("src/app/api/health/route.js")).toContain('status: "ok"');
    expect(fileMap.get("src/components/atoms/Button.jsx")).toContain("btn--");
    expect(fileMap.get("src/lib/prisma.js")).toBeUndefined();
    expect(fileMap.get("vitest.config.js")).toContain("defineConfig");
  });

  it("collects test-specific files for each supported testing option", () => {
    expect(
      collectFiles(createConfig({ testing: "jest" })).some(
        (file) => file.path === "jest.config.ts",
      ),
    ).toBe(true);
    expect(
      collectFiles(createConfig({ testing: "vitest" })).some(
        (file) => file.path === "vitest.config.ts",
      ),
    ).toBe(true);
    expect(
      collectFiles(createConfig({ testing: "playwright" })).some(
        (file) => file.path === "playwright.config.ts",
      ),
    ).toBe(true);
    expect(
      collectFiles(createConfig({ testing: "cypress" })).some(
        (file) => file.path === "cypress.config.ts",
      ),
    ).toBe(true);
  });

  it("builds a zip rooted at the project name", async () => {
    const cfg = createConfig({
      projectName: "zip-check",
      testing: "none",
    });

    const zipBuffer = await buildZip(cfg);
    const zipEntries = unzipTextEntries(zipBuffer);

    expect(Object.keys(zipEntries)).toContain("zip-check/package.json");
    expect(zipEntries["zip-check/README.md"]).toContain("# zip-check");
    expect(zipEntries["zip-check/src/app/page.tsx"]).toContain("Welcome to your new Next.js app.");
  });
});
