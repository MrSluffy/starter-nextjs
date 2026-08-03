import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleGetGenerationCount } from "../tools/getGenerationCount";

vi.mock("@mrsluffy/generator-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mrsluffy/generator-core")>();
  return {
    ...actual,
    readStore: vi.fn(),
  };
});

import { readStore } from "@mrsluffy/generator-core";

const mockedReadStore = vi.mocked(readStore);

describe("handleGetGenerationCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns count from readStore", async () => {
    mockedReadStore.mockResolvedValue({ count: 42, generations: [] });

    const result = await handleGetGenerationCount();

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse((result.content[0] as { type: "text"; text: string }).text);
    expect(parsed).toEqual({ count: 42 });
  });

  it("returns 0 when store unreachable", async () => {
    mockedReadStore.mockResolvedValue({ count: 0, generations: [] });

    const result = await handleGetGenerationCount();

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");

    const parsed = JSON.parse((result.content[0] as { type: "text"; text: string }).text);
    expect(parsed).toEqual({ count: 0 });
  });
});
