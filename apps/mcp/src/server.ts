// Node.js version check
const [major] = process.versions.node.split(".").map(Number);
if (major < 18) {
  process.stderr.write(
    `Error: starter-nextjs-mcp requires Node.js >= 18.0.0 (current: ${process.version})\n`,
  );
  process.exit(1);
}

// Health check mode for test:dist script
if (process.argv.includes("--health-check")) {
  process.stdout.write("OK\n");
  process.exit(0);
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GeneratorConfigInputSchema } from "@mrsluffy/generator-core";
import { handleGenerateProject } from "./tools/generateProject";
import { handleGetGenerationCount } from "./tools/getGenerationCount";
import { handleListTemplates } from "./tools/listTemplates";
import { handleGetConfigSchema } from "./tools/getConfigSchema";

const server = new McpServer({ name: "starter-nextjs-mcp", version: "1.0.0" });

// Register generate_project tool with Zod input schema for validation
server.registerTool(
  "generate_project",
  {
    description:
      "Generate a Next.js starter project as a ZIP archive. Accepts configuration for package manager, language, Next.js version, router, styling, state management, API layer, auth, database, ORM, testing, and extras. Returns the base64-encoded ZIP with filename.",
    inputSchema: GeneratorConfigInputSchema,
  },
  async (args) => {
    return handleGenerateProject(args);
  },
);

// Register get_generation_count tool (no parameters)
server.registerTool(
  "get_generation_count",
  {
    description: "Retrieve the total number of projects generated so far.",
  },
  async () => {
    return handleGetGenerationCount();
  },
);

// Register list_templates tool (no parameters)
server.registerTool(
  "list_templates",
  {
    description:
      "List all available project templates with their IDs, labels, descriptions, highlights, and preset configurations.",
  },
  async () => {
    return handleListTemplates();
  },
);

// Register get_config_schema tool (no parameters)
server.registerTool(
  "get_config_schema",
  {
    description:
      "Retrieve the full configuration schema describing all available fields, their types, allowed values, and constraints.",
  },
  async () => {
    return handleGetConfigSchema();
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  if (error?.code === "MODULE_NOT_FOUND" || error?.code === "ERR_MODULE_NOT_FOUND") {
    const match = error.message?.match(/Cannot find (?:module|package) '([^']+)'/);
    const pkg = match?.[1] ?? "unknown";
    process.stderr.write(
      `Error: Missing required dependency "${pkg}". Run "npm install" to install all dependencies.\n`,
    );
  } else {
    process.stderr.write(`MCP server failed to start: ${error?.message ?? error}\n`);
  }
  process.exit(1);
});
