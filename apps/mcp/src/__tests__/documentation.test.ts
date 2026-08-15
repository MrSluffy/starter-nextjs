import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const projectRoot = resolve(__dirname, "../../../..");
const mcpReadme = readFileSync(resolve(__dirname, "../../README.md"), "utf-8");
const registryReadme = readFileSync(
  resolve(projectRoot, "registry-submission/servers/starter-nextjs/README.md"),
  "utf-8",
);

describe("apps/mcp/README.md", () => {
  it("should contain title and transport badge", () => {
    expect(mcpReadme).toContain("starter-nextjs-mcp");
    expect(mcpReadme).toContain("stdio");
  });

  it("should contain Tools section", () => {
    expect(mcpReadme).toContain("## Tools");
  });

  it("should contain Installation section", () => {
    expect(mcpReadme).toContain("## Installation");
    expect(mcpReadme).toContain("npx @mrsluffy/starter-nextjs-mcp");
  });

  it("should contain Configuration section", () => {
    expect(mcpReadme).toContain("## Configuration");
  });

  it("should contain Requirements section", () => {
    expect(mcpReadme).toContain("## Requirements");
    expect(mcpReadme).toContain("GITHUB_GIST_TOKEN");
    expect(mcpReadme).toContain("GITHUB_GIST_ID");
  });

  it("should contain Development section", () => {
    expect(mcpReadme).toContain("## Development");
  });

  it("should list all 4 tools", () => {
    expect(mcpReadme).toContain("generate_project");
    expect(mcpReadme).toContain("get_generation_count");
    expect(mcpReadme).toContain("list_templates");
    expect(mcpReadme).toContain("get_config_schema");
  });

  it("should have valid JSON in configuration examples", () => {
    const jsonBlocks = mcpReadme.match(/```json\r?\n([\s\S]*?)```/g) || [];
    expect(jsonBlocks.length).toBeGreaterThan(0);
    for (const block of jsonBlocks) {
      const json = block.replace(/```json\r?\n/, "").replace(/\r?\n?```$/, "");
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });
});

describe("Registry Submission README", () => {
  it("should contain title matching server name", () => {
    expect(registryReadme).toContain("# starter-nextjs");
  });

  it("should contain features list with at least 3 items", () => {
    expect(registryReadme).toContain("## Features");
    const featuresSection = registryReadme.split("## Features")[1]?.split("##")[0] || "";
    const listItems = featuresSection.match(/^- /gm) || [];
    expect(listItems.length).toBeGreaterThanOrEqual(3);
  });

  it("should contain tools table with all 4 tools", () => {
    expect(registryReadme).toContain("## Tools");
    expect(registryReadme).toContain("generate_project");
    expect(registryReadme).toContain("get_generation_count");
    expect(registryReadme).toContain("list_templates");
    expect(registryReadme).toContain("get_config_schema");
  });

  it("should contain installation instructions", () => {
    expect(registryReadme).toContain("## Installation");
    expect(registryReadme).toContain("@mrsluffy/starter-nextjs-mcp");
  });

  it("should contain configuration example with valid JSON", () => {
    expect(registryReadme).toContain("## Configuration");
    const jsonBlocks = registryReadme.match(/```json\r?\n([\s\S]*?)```/g) || [];
    expect(jsonBlocks.length).toBeGreaterThan(0);
    for (const block of jsonBlocks) {
      const json = block.replace(/```json\r?\n/, "").replace(/\r?\n?```$/, "");
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });
});
