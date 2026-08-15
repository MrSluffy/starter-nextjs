import type { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { readStore } from "@mrsluffy/generator-core";

/**
 * Handles the get_generation_count MCP tool invocation.
 *
 * Flow: readStore() → return { count }
 */
export async function handleGetGenerationCount(): Promise<CallToolResult> {
  const store = await readStore();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ count: store.count }),
      },
    ],
  };
}
