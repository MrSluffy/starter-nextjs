import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleGenerateProject } from "../tools/generateProject";

vi.mock("@mrsluffy/generator-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mrsluffy/generator-core")>();
  return {
    ...actual,
    buildZip: vi.fn(),
    recordGeneration: vi.fn(),
  };
});

import { buildZip, recordGeneration } from "@mrsluffy/generator-core";

const mockedBuildZip = vi.mocked(buildZip);
const mockedRecordGeneration = vi.mocked(recordGeneration);

describe("handleGenerateProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("success returns base64 ZIP with filename", async () => {
    const fakeBuffer = Buffer.from("fake-zip-content");
    mockedBuildZip.mockResolvedValue(fakeBuffer);
    mockedRecordGeneration.mockResolvedValue(undefined);

    const result = await handleGenerateProject({ projectName: "my-app" });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse((result.content[0] as { type: "text"; text: string }).text);
    expect(parsed.filename).toBe("my-app.zip");
    expect(parsed.contentBase64).toBe(fakeBuffer.toString("base64"));
    // Verify it's a valid base64 string
    expect(() => Buffer.from(parsed.contentBase64, "base64")).not.toThrow();
  });

  it("calls recordGeneration", async () => {
    const fakeBuffer = Buffer.from("fake-zip-content");
    mockedBuildZip.mockResolvedValue(fakeBuffer);
    mockedRecordGeneration.mockResolvedValue(undefined);

    await handleGenerateProject({ projectName: "my-app" });

    expect(mockedRecordGeneration).toHaveBeenCalledWith("my-app");
  });

  it("invalid name returns error", async () => {
    const result = await handleGenerateProject({ projectName: "INVALID!" });

    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toContain("projectName");
  });

  it("invalid enum returns error", async () => {
    const result = await handleGenerateProject({
      projectName: "test",
      packageManager: "bower",
    });

    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    // Should mention the field or allowed values
    expect(text.toLowerCase()).toMatch(/packagemanager|allowed/i);
  });

  it('buildZip failure returns "Failed to generate project"', async () => {
    mockedBuildZip.mockRejectedValue(new Error("disk full"));
    mockedRecordGeneration.mockResolvedValue(undefined);

    const result = await handleGenerateProject({ projectName: "my-app" });

    expect(result.isError).toBe(true);
    const text = (result.content[0] as { type: "text"; text: string }).text;
    expect(text).toBe("Failed to generate project");
  });
});
