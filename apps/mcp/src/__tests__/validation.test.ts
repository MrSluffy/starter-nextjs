import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { GeneratorConfigInputSchema, CONFIG_SCHEMA } from "@mrsluffy/generator-core";

describe("GeneratorConfigInputSchema", () => {
  it("valid config passes", () => {
    const input = {
      projectName: "my-app",
      packageManager: "npm",
      language: "typescript",
      nextVersion: "16.x (latest)",
      router: "app",
      styling: "tailwind",
      stateManagement: "zustand",
      apiLayer: "rest",
      auth: "none",
      database: "none",
      orm: "none",
      testing: "jest",
      extras: {
        docker: false,
        githubActions: false,
        openApiClient: false,
        eslintPrettier: true,
        huskyLintStaged: false,
      },
    };

    const result = GeneratorConfigInputSchema.parse(input);
    expect(result.projectName).toBe("my-app");
    expect(result.packageManager).toBe("npm");
  });

  it("invalid projectName rejected with descriptive error", () => {
    const input = { projectName: "My App!" };

    expect(() => GeneratorConfigInputSchema.parse(input)).toThrow(ZodError);
  });

  it("invalid enum rejected with field name and allowed values", () => {
    const input = { projectName: "test", packageManager: "bower" };

    try {
      GeneratorConfigInputSchema.parse(input);
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError);
      const zodErr = err as ZodError;
      const issue = zodErr.issues.find((i) => i.path.includes("packageManager"));
      expect(issue).toBeDefined();
    }
  });

  it("missing projectName rejected", () => {
    expect(() => GeneratorConfigInputSchema.parse({})).toThrow(ZodError);
  });

  it("defaults applied for omitted fields", () => {
    const result = GeneratorConfigInputSchema.parse({ projectName: "test" });

    expect(result.packageManager).toBe("npm");
    expect(result.language).toBe("typescript");
    expect(result.nextVersion).toBe("16.x (latest)");
    expect(result.router).toBe("app");
    expect(result.styling).toBe("tailwind");
    expect(result.stateManagement).toBe("zustand");
    expect(result.apiLayer).toBe("rest");
    expect(result.auth).toBe("none");
    expect(result.database).toBe("none");
    expect(result.orm).toBe("none");
    expect(result.testing).toBe("jest");
    expect(result.extras.eslintPrettier).toBe(true);
    expect(result.extras.docker).toBe(false);
    expect(result.extras.githubActions).toBe(false);
    expect(result.extras.openApiClient).toBe(false);
    expect(result.extras.huskyLintStaged).toBe(false);
  });

  it("unrecognized fields stripped", () => {
    const input = { projectName: "test", unknownField: "value" };
    const result = GeneratorConfigInputSchema.parse(input);

    expect(result.projectName).toBe("test");
    expect("unknownField" in result).toBe(false);
  });
});

describe("CONFIG_SCHEMA", () => {
  it("contains all expected fields", () => {
    const expectedFields = [
      "projectName",
      "packageManager",
      "language",
      "nextVersion",
      "router",
      "styling",
      "stateManagement",
      "apiLayer",
      "auth",
      "database",
      "orm",
      "testing",
      "extras",
    ];

    for (const field of expectedFields) {
      expect(CONFIG_SCHEMA).toHaveProperty(field);
    }
  });

  it("projectName has pattern type with correct regex", () => {
    expect(CONFIG_SCHEMA.projectName.type).toBe("pattern");
    expect(CONFIG_SCHEMA.projectName.pattern).toBe("^[a-z0-9-]+$");
    expect(CONFIG_SCHEMA.projectName.required).toBe(true);
  });

  it("enum fields have correct values", () => {
    expect(CONFIG_SCHEMA.packageManager.type).toBe("enum");
    expect(CONFIG_SCHEMA.packageManager.values).toEqual(["npm", "yarn", "pnpm"]);

    expect(CONFIG_SCHEMA.styling.type).toBe("enum");
    expect(CONFIG_SCHEMA.styling.values).toContain("tailwind");
    expect(CONFIG_SCHEMA.styling.values).toContain("none");
  });

  it("extras has object type with boolean fields", () => {
    expect(CONFIG_SCHEMA.extras.type).toBe("object");
    expect(CONFIG_SCHEMA.extras.fields).toBeDefined();
    expect(CONFIG_SCHEMA.extras.fields!.docker.type).toBe("boolean");
    expect(CONFIG_SCHEMA.extras.fields!.eslintPrettier.type).toBe("boolean");
  });
});
