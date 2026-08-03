/**
 * Client-safe exports from generator-core.
 * These modules contain NO Node.js-specific dependencies (no fs, no archiver, etc.)
 * and are safe to import in browser/client components.
 */

// Templates (pure data, no Node.js deps)
export { TEMPLATES, getTemplateById, DEFAULT_TEMPLATE_ID } from "./templates";
export type { TemplateDefinition, TemplateId } from "./templates";

// Shared helpers (pure logic, no Node.js deps)
export {
  getLanguageFileExtensions,
  getPackageManagerInstallCommand,
  getPackageManagerLockFile,
  getPackageManagerEngine,
  getCreateNextAppBaseCommand,
  getPackageManagerCiSetup,
  getPackageManagerScriptCommand,
} from "./generator/shared";

// Shared types (pure type definitions + simple helpers)
export { getVersionString } from "./types";
export type {
  GeneratorConfig,
  PackageManager,
  Language,
  NextVersion,
  RouterType,
  StylingOption,
  StateManagementOption,
  ApiLayerOption,
  AuthOption,
  DatabaseOption,
  OrmOption,
  TestingOption,
} from "./types";

// Validation (zod schemas - browser compatible)
export {
  GeneratorConfigInputSchema,
  CONFIG_SCHEMA,
  GENERATE_PROJECT_JSON_SCHEMA,
} from "./validation";
export type { ValidatedGeneratorConfig, FieldDescriptor } from "./validation";

// Audit types (type-only, no runtime Node.js deps)
export type { Vulnerability, AuditResult } from "./generator/npmAudit";
