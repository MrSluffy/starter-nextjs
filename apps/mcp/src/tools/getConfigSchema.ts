import type { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { CONFIG_SCHEMA } from "@mrsluffy/generator-core";

/**
 * Handles the get_config_schema tool call.
 * Returns the static CONFIG_SCHEMA descriptor so MCP clients can
 * inspect available configuration fields without parsing Zod schemas.
 */
export async function handleGetConfigSchema(): Promise<CallToolResult> {
  return {
    content: [{ type: "text", text: JSON.stringify(CONFIG_SCHEMA) }],
  };
}
