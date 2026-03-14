import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { createConfig } from "../../../../tests/helpers/configs";
import { unzipTextEntries } from "../../../../tests/helpers/zip";
import { POST, dynamic, runtime } from "./route";

describe("/api/generate", () => {
  it("uses the expected route runtime settings", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(runtime).toBe("nodejs");
  });

  it("rejects invalid project names", async () => {
    const request = new NextRequest("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify(createConfig({ projectName: "Invalid Name" })),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid project name. Use lowercase letters, numbers, and hyphens.",
    });
  });

  it("returns a project zip for valid requests", async () => {
    const request = new NextRequest("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify(createConfig({ projectName: "generated-project" })),
    });

    const response = await POST(request);
    const zipBuffer = Buffer.from(await response.arrayBuffer());
    const entries = unzipTextEntries(zipBuffer);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/zip");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="generated-project.zip"',
    );
    expect(entries["generated-project/package.json"]).toContain('"name": "generated-project"');
  });

  it("returns a 500 response when request parsing fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST({
      json: async () => {
        throw new Error("bad request");
      },
    } as NextRequest);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Failed to generate project.",
    });
    expect(consoleError).toHaveBeenCalled();
  });
});
