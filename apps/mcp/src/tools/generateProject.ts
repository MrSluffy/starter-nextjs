import type { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { z } from "zod";
import { GeneratorConfigInputSchema, buildZip, recordGeneration } from "@mrsluffy/generator-core";
import type { GeneratorConfig } from "@mrsluffy/generator-core";

/**
 * Handles the generate_project MCP tool invocation.
 *
 * Flow: Validate args → apply defaults → buildZip → recordGeneration → base64 encode → return
 */
export async function handleGenerateProject(args: unknown): Promise<CallToolResult> {
  let config: GeneratorConfig;

  try {
    config = GeneratorConfigInputSchema.parse(args) as GeneratorConfig;
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const messages = err.issues.map((issue) => {
        // Enum validation failures (Zod 4: invalid_value with values array)
        if (
          issue.code === "invalid_value" &&
          "values" in issue &&
          Array.isArray((issue as { values?: unknown }).values)
        ) {
          const field = issue.path.join(".");
          const allowed = (issue as { values: string[] }).values.join(", ");
          return `Invalid value for '${field}'. Allowed values: ${allowed}`;
        }
        // Missing projectName (field absent → invalid_type with received "undefined")
        if (issue.code === "invalid_type" && issue.path.includes("projectName")) {
          return "projectName is required";
        }
        // Empty projectName (min(1) violation)
        if (issue.code === "too_small" && issue.path.includes("projectName")) {
          return "projectName is required";
        }
        // Regex pattern violation (projectName format) — Zod 4 uses "invalid_format"
        if (
          (issue.code === "invalid_format" || issue.code === "invalid_string") &&
          issue.path.includes("projectName")
        ) {
          return "Invalid projectName. Must match ^[a-z0-9-]+$, be 1-128 characters.";
        }
        // projectName too long (max(128) violation)
        if (issue.code === "too_big" && issue.path.includes("projectName")) {
          return "Invalid projectName. Must match ^[a-z0-9-]+$, be 1-128 characters.";
        }
        return issue.message;
      });

      // Deduplicate messages (e.g. regex + too_small can both fire for empty string)
      const uniqueMessages = [...new Set(messages)];
      return {
        content: [{ type: "text", text: uniqueMessages.join(". ") }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: "Failed to generate project" }],
      isError: true,
    };
  }

  try {
    const zipBuffer = await buildZip(config);
    await recordGeneration(config.projectName);

    const contentBase64 = zipBuffer.toString("base64");
    const filename = `${config.projectName}.zip`;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ filename, contentBase64 }),
        },
      ],
    };
  } catch {
    return {
      content: [{ type: "text", text: "Failed to generate project" }],
      isError: true,
    };
  }
}
