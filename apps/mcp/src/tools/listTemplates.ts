import type { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { TEMPLATES } from "@mrsluffy/generator-core";

/**
 * Handles the list_templates MCP tool invocation.
 *
 * Flow: Import TEMPLATES → map to { id, label, description, highlights, preset } → return array
 */
export async function handleListTemplates(): Promise<CallToolResult> {
  try {
    const mapped = TEMPLATES.map(({ id, label, description, highlights, preset }) => ({
      id,
      label,
      description,
      highlights,
      preset,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(mapped),
        },
      ],
    };
  } catch {
    return {
      content: [
        {
          type: "text",
          text: "Failed to load templates",
        },
      ],
      isError: true,
    };
  }
}
