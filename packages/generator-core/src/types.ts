export type PackageManager = "npm" | "yarn" | "pnpm";
export type Language = "typescript" | "javascript";
export type NextVersion = "16.x (latest)" | "15.x" | "14.x (LTS)" | "13.x" | "12.x";
export type RouterType = "app" | "pages";
export type StylingOption = "tailwind" | "css-modules" | "styled-components" | "sass" | "none";
export type StateManagementOption = "zustand" | "redux-toolkit" | "react-context" | "none";
export type ApiLayerOption = "rest" | "graphql" | "none";
export type AuthOption = "nextauth" | "jwt" | "none";
export type DatabaseOption = "postgresql" | "mongodb" | "none";
export type OrmOption = "prisma" | "drizzle" | "none";
export type TestingOption = "jest" | "vitest" | "playwright" | "cypress" | "none";

export interface GeneratorConfig {
  // General
  projectName: string;
  packageManager: PackageManager;
  language: Language;
  nextVersion: NextVersion;
  // Architecture
  router: RouterType;
  // Styling
  styling: StylingOption;
  // State
  stateManagement: StateManagementOption;
  // API
  apiLayer: ApiLayerOption;
  // Auth
  auth: AuthOption;
  // Database
  database: DatabaseOption;
  orm: OrmOption;
  // Testing
  testing: TestingOption;
  // Extras
  extras: {
    docker: boolean;
    githubActions: boolean;
    openApiClient: boolean;
    eslintPrettier: boolean;
    huskyLintStaged: boolean;
  };
}

const VERSION_STRING_MAP: Record<NextVersion, string> = {
  "16.x (latest)": "latest",
  "15.x": "^15",
  "14.x (LTS)": "^14",
  "13.x": "^13",
  "12.x": "^12",
};

/** Map a NextVersion display string to a semver range usable in package.json / npm registry queries. */
export function getVersionString(v: NextVersion): string {
  return VERSION_STRING_MAP[v];
}
