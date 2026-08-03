import { describe, it, expect } from "vitest";
import { handleListTemplates } from "../tools/listTemplates";
import { TEMPLATES } from "@mrsluffy/generator-core";

describe("handleListTemplates", () => {
  it("returns all templates with correct shape", async () => {
    const result = await handleListTemplates();

    // No error
    expect(result.isError).toBeUndefined();

    // content[0].text is valid JSON
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");

    const text = (result.content[0] as { type: "text"; text: string }).text;
    const parsed = JSON.parse(text);

    // Parsed result is an array
    expect(Array.isArray(parsed)).toBe(true);

    // Array is not empty and matches TEMPLATES length
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed).toHaveLength(TEMPLATES.length);

    // Each item has the correct shape
    for (const item of parsed) {
      expect(typeof item.id).toBe("string");
      expect(typeof item.label).toBe("string");
      expect(typeof item.description).toBe("string");
      expect(Array.isArray(item.highlights)).toBe(true);
      expect(typeof item.preset).toBe("object");
      expect(item.preset).not.toBeNull();
    }

    // Known template IDs are present
    const ids = parsed.map((t: { id: string }) => t.id);
    expect(ids).toContain("saas");
    expect(ids).toContain("dashboard");
    expect(ids).toContain("content");
    expect(ids).toContain("custom");
  });
});
