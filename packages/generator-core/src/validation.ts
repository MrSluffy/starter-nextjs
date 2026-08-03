import { z, toJSONSchema } from "zod";

/**
 * Extras sub-schema: boolean flags for optional project features.
 * All default to false except eslintPrettier which defaults to true.
 */
const ExtrasSchema = z.object({
  docker: z.boolean().default(false),
  githubActions: z.boolean().default(false),
  openApiClient: z.boolean().default(false),
  eslintPrettier: z.boolean().default(true),
  huskyLintStaged: z.boolean().default(false),
});

/**
 * Input validation schema for the generate_project tool.
 * projectName is required; all other fields are optional with defaults
 * matching Requirement 8.
 */
export const GeneratorConfigInputSchema = z
  .object({
    projectName: z
      .string()
      .min(1)
      .max(128)
      .regex(/^[a-z0-9-]+$/),
    packageManager: z.enum(["npm", "yarn", "pnpm"]).default("npm"),
    language: z.enum(["typescript", "javascript"]).default("typescript"),
    nextVersion: z
      .enum(["16.x (latest)", "15.x", "14.x (LTS)", "13.x", "12.x"])
      .default("16.x (latest)"),
    router: z.enum(["app", "pages"]).default("app"),
    styling: z
      .enum(["tailwind", "css-modules", "styled-components", "sass", "none"])
      .default("tailwind"),
    stateManagement: z
      .enum(["zustand", "redux-toolkit", "react-context", "none"])
      .default("zustand"),
    apiLayer: z.enum(["rest", "graphql", "none"]).default("rest"),
    auth: z.enum(["nextauth", "jwt", "none"]).default("none"),
    database: z.enum(["postgresql", "mongodb", "none"]).default("none"),
    orm: z.enum(["prisma", "drizzle", "none"]).default("none"),
    testing: z.enum(["jest", "vitest", "playwright", "cypress", "none"]).default("jest"),
    extras: ExtrasSchema.default(() => ({
      docker: false,
      githubActions: false,
      openApiClient: false,
      eslintPrettier: true,
      huskyLintStaged: false,
    })),
  })
  .strip();

/** Inferred type after parsing and applying defaults */
export type ValidatedGeneratorConfig = z.infer<typeof GeneratorConfigInputSchema>;

/**
 * Descriptor for a single field in the config schema.
 */
export interface FieldDescriptor {
  type: "pattern" | "enum" | "object" | "boolean";
  pattern?: string;
  values?: string[];
  fields?: Record<string, FieldDescriptor>;
  required?: boolean;
  maxLength?: number;
}

/**
 * Static descriptor object returned by the get_config_schema tool.
 * Describes the shape and constraints of the GeneratorConfig input
 * so MCP clients can build UIs or validate inputs without parsing Zod schemas.
 */
export const CONFIG_SCHEMA: Record<string, FieldDescriptor> = {
  projectName: {
    type: "pattern",
    pattern: "^[a-z0-9-]+$",
    required: true,
    maxLength: 128,
  },
  packageManager: {
    type: "enum",
    values: ["npm", "yarn", "pnpm"],
  },
  language: {
    type: "enum",
    values: ["typescript", "javascript"],
  },
  nextVersion: {
    type: "enum",
    values: ["16.x (latest)", "15.x", "14.x (LTS)", "13.x", "12.x"],
  },
  router: {
    type: "enum",
    values: ["app", "pages"],
  },
  styling: {
    type: "enum",
    values: ["tailwind", "css-modules", "styled-components", "sass", "none"],
  },
  stateManagement: {
    type: "enum",
    values: ["zustand", "redux-toolkit", "react-context", "none"],
  },
  apiLayer: {
    type: "enum",
    values: ["rest", "graphql", "none"],
  },
  auth: {
    type: "enum",
    values: ["nextauth", "jwt", "none"],
  },
  database: {
    type: "enum",
    values: ["postgresql", "mongodb", "none"],
  },
  orm: {
    type: "enum",
    values: ["prisma", "drizzle", "none"],
  },
  testing: {
    type: "enum",
    values: ["jest", "vitest", "playwright", "cypress", "none"],
  },
  extras: {
    type: "object",
    fields: {
      docker: { type: "boolean" },
      githubActions: { type: "boolean" },
      openApiClient: { type: "boolean" },
      eslintPrettier: { type: "boolean" },
      huskyLintStaged: { type: "boolean" },
    },
  },
};

/**
 * JSON Schema representation of the GeneratorConfigInputSchema.
 * Used in server.ts when registering the generate_project tool with the MCP SDK.
 */
export const GENERATE_PROJECT_JSON_SCHEMA = toJSONSchema(GeneratorConfigInputSchema);
