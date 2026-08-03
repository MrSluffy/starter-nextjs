import { create } from "zustand";
import {
  getCreateNextAppBaseCommand,
  getLanguageFileExtensions,
  getVersionString,
  DEFAULT_TEMPLATE_ID,
  getTemplateById,
} from "@mrsluffy/generator-core/client";
import type {
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
  TemplateId,
} from "@mrsluffy/generator-core/client";

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
};

export interface GeneratorState extends GeneratorConfig {
  templateId: TemplateId;
  step: number;
  totalSteps: number;
  setTemplate: (templateId: TemplateId) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  set: <K extends keyof GeneratorConfig>(key: K, value: GeneratorConfig[K]) => void;
  setExtra: (key: keyof GeneratorConfig["extras"], value: boolean) => void;
  reset: () => void;
}

export const NEXT_VERSIONS: NextVersion[] = ["16.x (latest)", "15.x", "14.x (LTS)", "13.x", "12.x"];

const defaultConfig: GeneratorConfig = {
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

function createConfigFromTemplate(
  templateId: TemplateId,
  baseConfig: GeneratorConfig,
): GeneratorConfig {
  const template = getTemplateById(templateId);
  const preset = template.preset;
  const presetExtras = "extras" in preset ? preset.extras : undefined;

  return {
    ...defaultConfig,
    projectName: baseConfig.projectName,
    packageManager: baseConfig.packageManager,
    language: baseConfig.language,
    nextVersion: baseConfig.nextVersion,
    ...preset,
    extras: {
      ...defaultConfig.extras,
      ...(presetExtras ?? {}),
    },
  };
}

export const useGeneratorStore = create<GeneratorState>((set) => ({
  ...defaultConfig,
  templateId: DEFAULT_TEMPLATE_ID,
  step: 0,
  totalSteps: 11,
  setTemplate: (templateId) =>
    set((state) => ({
      templateId,
      ...createConfigFromTemplate(templateId, state),
    })),
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, s.totalSteps - 1) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
  set: (key, value) => set({ [key]: value } as Partial<GeneratorState>),
  setExtra: (key, value) => set((s) => ({ extras: { ...s.extras, [key]: value } })),
  reset: () => set({ ...defaultConfig, templateId: DEFAULT_TEMPLATE_ID, step: 0 }),
}));

// ── Derived helpers ────────────────────────────────────────────────────────────

export { getVersionString };

export interface DepGroup {
  label: string;
  deps: string[];
}

const STYLING_DEPENDENCIES: Record<StylingOption, string[] | undefined> = {
  tailwind: ["tailwindcss", "postcss", "autoprefixer"],
  "css-modules": undefined,
  "styled-components": ["styled-components"],
  sass: ["sass"],
  none: undefined,
};

const STATE_DEPENDENCIES: Record<StateManagementOption, string[] | undefined> = {
  zustand: ["zustand"],
  "redux-toolkit": ["@reduxjs/toolkit", "react-redux"],
  "react-context": undefined,
  none: undefined,
};

const API_DEPENDENCIES: Record<ApiLayerOption, string[] | undefined> = {
  rest: undefined,
  graphql: ["graphql", "graphql-request"],
  none: undefined,
};

const AUTH_DEPENDENCIES: Record<AuthOption, string[] | undefined> = {
  nextauth: ["next-auth"],
  jwt: ["jsonwebtoken", "bcryptjs"],
  none: undefined,
};

const DATABASE_DEPENDENCIES: Record<DatabaseOption, string[] | undefined> = {
  postgresql: ["pg"],
  mongodb: ["mongoose"],
  none: undefined,
};

const ORM_DEPENDENCIES: Record<OrmOption, string[] | undefined> = {
  prisma: ["@prisma/client"],
  drizzle: ["drizzle-orm"],
  none: undefined,
};

const TESTING_DEPENDENCIES: Record<TestingOption, string[] | undefined> = {
  jest: ["jest", "@testing-library/react", "@testing-library/jest-dom"],
  vitest: ["vitest", "@testing-library/react"],
  playwright: ["@playwright/test"],
  cypress: ["cypress"],
  none: undefined,
};

const EXTRA_DEPENDENCIES: {
  [K in keyof GeneratorConfig["extras"]]: DepGroup | undefined;
} = {
  docker: undefined,
  githubActions: undefined,
  openApiClient: { label: "OpenAPI", deps: ["openapi-fetch", "openapi-typescript"] },
  eslintPrettier: {
    label: "Code Quality (dev)",
    deps: ["eslint", "prettier", "eslint-config-prettier"],
  },
  huskyLintStaged: { label: "Git Hooks (dev)", deps: ["husky", "lint-staged"] },
};

function pushDependencyGroup(groups: DepGroup[], label: string, deps?: string[]) {
  if (!deps?.length) return;
  groups.push({ label, deps });
}

/** Format a single dep for display: "pkg" or "pkg@range" -> "pkg@version" when resolved has it. */
function formatDepForDisplay(dep: string, resolved?: Record<string, string> | null): string {
  const pkg = dep.includes("@") ? dep.slice(0, dep.indexOf("@")) : dep;
  const version = resolved?.[pkg];
  return version ? `${pkg}@${version}` : dep;
}

export function getDependencies(
  cfg: GeneratorConfig,
  resolvedVersions?: Record<string, string> | null,
): DepGroup[] {
  const groups: DepGroup[] = [];
  const fmt = (d: string) => formatDepForDisplay(d, resolvedVersions);

  // Core: show resolved next/react versions when available
  const core = ["react", "react-dom", `next@${getVersionString(cfg.nextVersion)}`];
  groups.push({ label: "Core", deps: core.map(fmt) });

  pushDependencyGroup(
    groups,
    "Styling",
    STYLING_DEPENDENCIES[cfg.styling]?.map((d) => fmt(d)),
  );
  pushDependencyGroup(
    groups,
    "State",
    STATE_DEPENDENCIES[cfg.stateManagement]?.map((d) => fmt(d)),
  );
  pushDependencyGroup(
    groups,
    "API",
    API_DEPENDENCIES[cfg.apiLayer]?.map((d) => fmt(d)),
  );
  pushDependencyGroup(
    groups,
    "Auth",
    AUTH_DEPENDENCIES[cfg.auth]?.map((d) => fmt(d)),
  );
  pushDependencyGroup(
    groups,
    "Database",
    DATABASE_DEPENDENCIES[cfg.database]?.map((d) => fmt(d)),
  );
  pushDependencyGroup(
    groups,
    "ORM",
    ORM_DEPENDENCIES[cfg.orm]?.map((d) => fmt(d)),
  );
  pushDependencyGroup(
    groups,
    "Testing (dev)",
    TESTING_DEPENDENCIES[cfg.testing]?.map((d) => fmt(d)),
  );

  for (const [key, group] of Object.entries(EXTRA_DEPENDENCIES) as [
    keyof GeneratorConfig["extras"],
    DepGroup | undefined,
  ][]) {
    if (cfg.extras[key] && group) {
      groups.push({
        label: group.label,
        deps: group.deps.map((d) => fmt(d)),
      });
    }
  }

  return groups;
}

export interface FolderNode {
  name: string;
  children?: FolderNode[];
}

export function getFolderTree(cfg: GeneratorConfig): FolderNode {
  const { isTypeScript: isTS, ext, tsx } = getLanguageFileExtensions(cfg.language);

  const appChildren: FolderNode[] = [
    { name: "globals.css" },
    { name: `layout.${tsx}` },
    { name: `page.${tsx}` },
    {
      name: "api",
      children: [
        { name: "health", children: [{ name: `route.${ext}` }] },
        ...(cfg.auth === "nextauth"
          ? [
              {
                name: "auth",
                children: [{ name: "[...nextauth]", children: [{ name: `route.${ext}` }] }],
              },
            ]
          : []),
      ],
    },
    ...(cfg.router === "app"
      ? [{ name: "(routes)", children: [{ name: "home", children: [{ name: `page.${tsx}` }] }] }]
      : []),
  ];

  const componentsChildren: FolderNode[] = [
    { name: "atoms", children: [{ name: `Button.${tsx}` }, { name: `Input.${tsx}` }] },
    { name: "molecules", children: [{ name: `FormField.${tsx}` }] },
    { name: "organisms", children: [{ name: `Header.${tsx}` }, { name: `Footer.${tsx}` }] },
    { name: "templates", children: [{ name: `PageTemplate.${tsx}` }] },
  ];

  const featuresChildren: FolderNode[] = [];
  if (cfg.auth !== "none") {
    featuresChildren.push({
      name: "auth",
      children: [
        { name: "components" },
        { name: "hooks" },
        { name: "services" },
        { name: "types" },
      ],
    });
  }
  if (cfg.database !== "none") {
    featuresChildren.push({
      name: "products",
      children: [{ name: "components" }, { name: "hooks" }, { name: "services" }],
    });
  }

  const libChildren: FolderNode[] = [
    { name: `api.${ext}` },
    { name: `errors.${ext}` },
    { name: `logger.${ext}` },
    ...(cfg.orm === "prisma" ? [{ name: `prisma.${ext}` }] : []),
  ];

  const storeChildren: FolderNode[] = [{ name: `index.${ext}` }];

  const srcChildren: FolderNode[] = [
    { name: "app", children: appChildren },
    { name: "components", children: componentsChildren },
    ...(featuresChildren.length > 0 ? [{ name: "features", children: featuresChildren }] : []),
    { name: "hooks", children: [{ name: `useLocalStorage.${ext}` }] },
    { name: "lib", children: libChildren },
    ...(cfg.stateManagement !== "none" && cfg.stateManagement !== "react-context"
      ? [{ name: "store", children: storeChildren }]
      : []),
    { name: "types", children: [{ name: `index.${ext}` }] },
    { name: "utils", children: [{ name: `cn.${ext}` }] },
  ];

  const rootChildren: FolderNode[] = [
    { name: "src", children: srcChildren },
    ...(cfg.orm === "prisma" ? [{ name: "prisma", children: [{ name: "schema.prisma" }] }] : []),
    ...(cfg.extras.docker ? [{ name: "Dockerfile" }, { name: "docker-compose.yml" }] : []),
    ...(cfg.extras.githubActions
      ? [{ name: ".github", children: [{ name: "workflows", children: [{ name: "ci.yml" }] }] }]
      : []),
    { name: ".env.example" },
    { name: `next.config.${ext}` },
    { name: "package.json" },
    ...(isTS ? [{ name: "tsconfig.json" }] : []),
    ...(cfg.extras.eslintPrettier ? [{ name: ".eslintrc.json" }, { name: ".prettierrc" }] : []),
    { name: "README.md" },
  ];

  return { name: cfg.projectName, children: rootChildren };
}

export function getCliCommand(cfg: GeneratorConfig): string {
  const pm = cfg.packageManager;
  const create = getCreateNextAppBaseCommand(pm);
  const version = cfg.nextVersion.split(".")[0] + ".x";
  const versionTag = version === "16.x" ? "latest" : version;
  const versionedCreate = pm === "npm" ? `${create}${versionTag}` : `${create}@${versionTag}`;
  const { isTypeScript } = getLanguageFileExtensions(cfg.language);
  const ts = isTypeScript ? " --typescript" : " --javascript";
  const tailwind = cfg.styling === "tailwind" ? " --tailwind" : " --no-tailwind";
  const router = cfg.router === "app" ? " --app" : " --no-app";
  return `${versionedCreate} ${cfg.projectName}${ts}${tailwind}${router} --src-dir --import-alias "@/*"`;
}

export function getGeneratorConfig(state: GeneratorConfig | GeneratorState): GeneratorConfig {
  return {
    projectName: state.projectName,
    packageManager: state.packageManager,
    language: state.language,
    nextVersion: state.nextVersion,
    router: state.router,
    styling: state.styling,
    stateManagement: state.stateManagement,
    apiLayer: state.apiLayer,
    auth: state.auth,
    database: state.database,
    orm: state.orm,
    testing: state.testing,
    extras: state.extras,
  };
}
