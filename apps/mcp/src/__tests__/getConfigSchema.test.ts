import { describe, it, expect } from "vitest";
import { handleGetConfigSchema } from "../tools/getConfigSchema";

describe("handleGetConfigSchema", () => {
  describe("schema includes all enum fields with correct values", () => {
    it("packageManager has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.packageManager.type).toBe("enum");
      expect(schema.packageManager.values).toEqual(["npm", "yarn", "pnpm"]);
    });

    it("language has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.language.type).toBe("enum");
      expect(schema.language.values).toEqual(["typescript", "javascript"]);
    });

    it("nextVersion has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.nextVersion.type).toBe("enum");
      expect(schema.nextVersion.values).toEqual([
        "16.x (latest)",
        "15.x",
        "14.x (LTS)",
        "13.x",
        "12.x",
      ]);
    });

    it("router has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.router.type).toBe("enum");
      expect(schema.router.values).toEqual(["app", "pages"]);
    });

    it("styling has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.styling.type).toBe("enum");
      expect(schema.styling.values).toEqual([
        "tailwind",
        "css-modules",
        "styled-components",
        "sass",
        "none",
      ]);
    });

    it("stateManagement has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.stateManagement.type).toBe("enum");
      expect(schema.stateManagement.values).toEqual([
        "zustand",
        "redux-toolkit",
        "react-context",
        "none",
      ]);
    });

    it("apiLayer has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.apiLayer.type).toBe("enum");
      expect(schema.apiLayer.values).toEqual(["rest", "graphql", "none"]);
    });

    it("auth has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.auth.type).toBe("enum");
      expect(schema.auth.values).toEqual(["nextauth", "jwt", "none"]);
    });

    it("database has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.database.type).toBe("enum");
      expect(schema.database.values).toEqual(["postgresql", "mongodb", "none"]);
    });

    it("orm has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.orm.type).toBe("enum");
      expect(schema.orm.values).toEqual(["prisma", "drizzle", "none"]);
    });

    it("testing has type enum with correct values", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.testing.type).toBe("enum");
      expect(schema.testing.values).toEqual(["jest", "vitest", "playwright", "cypress", "none"]);
    });
  });

  describe("includes projectName pattern", () => {
    it("projectName has type pattern with correct constraints", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.projectName.type).toBe("pattern");
      expect(schema.projectName.pattern).toBe("^[a-z0-9-]+$");
      expect(schema.projectName.required).toBe(true);
      expect(schema.projectName.maxLength).toBe(128);
    });
  });

  describe("includes extras object with boolean fields", () => {
    it("extras has type object with boolean fields", async () => {
      const result = await handleGetConfigSchema();
      const schema = JSON.parse((result.content[0] as { type: "text"; text: string }).text);

      expect(schema.extras.type).toBe("object");
      expect(schema.extras.fields).toBeDefined();
      expect(schema.extras.fields.docker.type).toBe("boolean");
      expect(schema.extras.fields.githubActions.type).toBe("boolean");
      expect(schema.extras.fields.openApiClient.type).toBe("boolean");
      expect(schema.extras.fields.eslintPrettier.type).toBe("boolean");
      expect(schema.extras.fields.huskyLintStaged.type).toBe("boolean");
    });
  });
});
