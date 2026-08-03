// Generator functions
export { buildZip, collectFiles } from "./generator/index";
export {
  buildPackageJson,
  resolveDependencyVersions,
  getDependencySpec,
} from "./generator/packageJson";
export { buildTsConfig, buildNextConfig } from "./generator/tsConfig";
export {
  buildEslintConfig,
  buildPrettierConfig,
  buildLintStagedConfig,
} from "./generator/eslintConfig";
export { buildDockerfile, buildDockerCompose } from "./generator/dockerConfig";
export { buildCiYaml } from "./generator/githubActions";
export {
  buildEnvExample,
  buildAppLayout,
  buildAppPage,
  buildMiddleware,
  buildApiLib,
  buildErrorLib,
  buildLoggerLib,
  buildPrismaLib,
  buildPrismaSchema,
  buildStoreFile,
  buildHook,
  buildAtomButton,
  buildReadme,
} from "./generator/fileTemplates";
export {
  getLanguageFileExtensions,
  getPackageManagerInstallCommand,
  getPackageManagerLockFile,
  getPackageManagerEngine,
  getCreateNextAppBaseCommand,
  getPackageManagerCiSetup,
  getPackageManagerScriptCommand,
} from "./generator/shared";
export { fetchPackageInfo, getLatestVersion, getLatestVersions } from "./generator/npmApi";
export type { NpmPackageInfo } from "./generator/npmApi";
export { runNpmAudit } from "./generator/npmAudit";
export type { Vulnerability, AuditResult } from "./generator/npmAudit";

// Templates
export { TEMPLATES, getTemplateById, DEFAULT_TEMPLATE_ID } from "./templates";
export type { TemplateDefinition, TemplateId } from "./templates";

// Generation store
export { readStore, recordGeneration } from "./generationStore";
export type { GenerationRecord, GenerationStoreData } from "./generationStore";

// Validation
export {
  GeneratorConfigInputSchema,
  CONFIG_SCHEMA,
  GENERATE_PROJECT_JSON_SCHEMA,
} from "./validation";
export type { ValidatedGeneratorConfig, FieldDescriptor } from "./validation";

// Shared types
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
