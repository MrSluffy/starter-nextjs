import type { GeneratorConfig } from "@mrsluffy/generator-core";

export const baseConfig: GeneratorConfig = {
  projectName: "my-next-app",
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

export function createConfig(overrides: Partial<GeneratorConfig> = {}): GeneratorConfig {
  return {
    ...baseConfig,
    ...overrides,
    extras: {
      ...baseConfig.extras,
      ...overrides.extras,
    },
  };
}

export const representativeConfigs = {
  content: createConfig({
    projectName: "content-site",
    stateManagement: "none",
    apiLayer: "none",
    testing: "none",
  }),
  javascript: createConfig({
    projectName: "js-starter",
    language: "javascript",
    styling: "sass",
    stateManagement: "react-context",
    auth: "jwt",
    database: "mongodb",
    orm: "drizzle",
    testing: "vitest",
    extras: {
      docker: true,
      githubActions: true,
      openApiClient: true,
      eslintPrettier: true,
      huskyLintStaged: true,
    },
  }),
  dashboard: createConfig({
    projectName: "dashboard-app",
    stateManagement: "redux-toolkit",
    auth: "nextauth",
    database: "postgresql",
    orm: "prisma",
    testing: "playwright",
    extras: {
      docker: true,
      githubActions: true,
      openApiClient: false,
      eslintPrettier: true,
      huskyLintStaged: false,
    },
  }),
};
