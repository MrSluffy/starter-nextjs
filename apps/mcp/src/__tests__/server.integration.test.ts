import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

describe("MCP Server Integration", () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    const mcpRoot = path.resolve(__dirname, "../..");

    transport = new StdioClientTransport({
      command: "npx",
      args: ["tsx", "src/server.ts"],
      cwd: mcpRoot,
      stderr: "pipe",
    });

    client = new Client(
      { name: "integration-test-client", version: "1.0.0" },
      { capabilities: {} },
    );

    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    await transport.close();
  });

  it("initialize handshake returns server name, semver version, and tools capability", () => {
    const serverVersion = client.getServerVersion();
    expect(serverVersion).toBeDefined();
    expect(serverVersion!.name).toBe("starter-nextjs-mcp");
    expect(serverVersion!.version).toMatch(/^\d+\.\d+\.\d+/);

    const capabilities = client.getServerCapabilities();
    expect(capabilities).toBeDefined();
    expect(capabilities!.tools).toBeDefined();
  });

  it("tools/list returns all 4 tools with descriptions", async () => {
    const result = await client.listTools();

    expect(result.tools).toBeDefined();
    expect(result.tools.length).toBe(4);

    const toolNames = result.tools.map((t) => t.name);
    expect(toolNames).toContain("generate_project");
    expect(toolNames).toContain("get_generation_count");
    expect(toolNames).toContain("list_templates");
    expect(toolNames).toContain("get_config_schema");

    for (const tool of result.tools) {
      expect(tool.description).toBeDefined();
      expect(tool.description!.length).toBeGreaterThan(0);
    }
  });

  it("tools/call for get_generation_count returns count as non-negative integer", async () => {
    const result = await client.callTool({ name: "get_generation_count" });

    expect(result).toBeDefined();
    expect("content" in result).toBe(true);

    const content = (result as { content: Array<{ type: string; text: string }> }).content;
    expect(content.length).toBeGreaterThan(0);
    expect(content[0].type).toBe("text");

    const parsed = JSON.parse(content[0].text);
    expect(typeof parsed.count).toBe("number");
    expect(parsed.count).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(parsed.count)).toBe(true);
  });

  it("tools/call for list_templates returns array with expected template structure", async () => {
    const result = await client.callTool({ name: "list_templates" });

    expect(result).toBeDefined();
    expect("content" in result).toBe(true);

    const content = (result as { content: Array<{ type: string; text: string }> }).content;
    expect(content.length).toBeGreaterThan(0);
    expect(content[0].type).toBe("text");

    const templates = JSON.parse(content[0].text);
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);

    for (const template of templates) {
      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("label");
      expect(template).toHaveProperty("description");
      expect(template).toHaveProperty("highlights");
      expect(template).toHaveProperty("preset");
    }
  });
});
