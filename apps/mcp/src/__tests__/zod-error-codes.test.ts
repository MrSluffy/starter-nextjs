import { describe, it, expect } from "vitest";
import { GeneratorConfigInputSchema } from "@mrsluffy/generator-core";

describe("Zod 4 error code exploration", () => {
  it("shows error code for invalid enum value", () => {
    const result = GeneratorConfigInputSchema.safeParse({
      projectName: "my-app",
      packageManager: "invalid",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      console.log("Invalid enum issues:", JSON.stringify(result.error.issues, null, 2));
      // Check what code is used
      const issue = result.error.issues[0];
      console.log("Issue code:", issue.code);
      console.log("Issue keys:", Object.keys(issue));
    }
  });

  it("shows error code for invalid regex pattern (projectName)", () => {
    const result = GeneratorConfigInputSchema.safeParse({
      projectName: "MyApp!!",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      console.log("Invalid regex issues:", JSON.stringify(result.error.issues, null, 2));
      const issue = result.error.issues[0];
      console.log("Issue code:", issue.code);
      console.log("Issue keys:", Object.keys(issue));
    }
  });

  it("shows error code for missing projectName", () => {
    const result = GeneratorConfigInputSchema.safeParse({
      packageManager: "npm",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      console.log("Missing field issues:", JSON.stringify(result.error.issues, null, 2));
      const issue = result.error.issues[0];
      console.log("Issue code:", issue.code);
      console.log("Issue keys:", Object.keys(issue));
    }
  });

  it("shows error code for empty projectName", () => {
    const result = GeneratorConfigInputSchema.safeParse({
      projectName: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      console.log("Empty string issues:", JSON.stringify(result.error.issues, null, 2));
      const issue = result.error.issues[0];
      console.log("Issue code:", issue.code);
      console.log("Issue keys:", Object.keys(issue));
    }
  });
});
