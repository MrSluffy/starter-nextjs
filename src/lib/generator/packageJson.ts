import type { GeneratorConfig } from "@/store/generatorStore";
import { getVersionString } from "@/store/generatorStore";
import { buildLintStagedConfig } from "./eslintConfig";
import { getLanguageFileExtensions, getPackageManagerEngine } from "./shared";

export function buildPackageJson(cfg: GeneratorConfig): object {
  const { isTypeScript: isTS } = getLanguageFileExtensions(cfg.language);
  const nextVer = getVersionString(cfg.nextVersion);
  const pm = cfg.packageManager;

  const scripts: Record<string, string> = {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "next lint",
  };

  if (cfg.testing === "jest") scripts.test = "jest";
  if (cfg.testing === "vitest") scripts.test = "vitest";
  if (cfg.testing === "playwright") scripts["test:e2e"] = "playwright test";
  if (cfg.testing === "cypress") scripts["test:e2e"] = "cypress run";
  if (cfg.extras.eslintPrettier)
    scripts.format = `prettier --write "src/**/*.{${isTS ? "ts,tsx" : "js,jsx"},css}"`;
  if (cfg.orm === "prisma") scripts["db:generate"] = "prisma generate";

  const isReact19 = cfg.nextVersion.startsWith("15") || cfg.nextVersion.startsWith("16");
  const reactVer = isReact19 ? "^19.0.0" : "^18.2.0";
  const reactTypesVer = isReact19 ? "^19" : "^18";

  const dependencies: Record<string, string> = {
    next: nextVer,
    react: reactVer,
    "react-dom": reactVer,
  };

  const devDependencies: Record<string, string> = {
    ...(isTS
      ? {
          typescript: "^5",
          "@types/node": "^20",
          "@types/react": reactTypesVer,
          "@types/react-dom": reactTypesVer,
        }
      : {}),
  };

  // Styling
  if (cfg.styling === "tailwind") {
    devDependencies["tailwindcss"] = "^4";
    devDependencies["postcss"] = "^8";
    devDependencies["autoprefixer"] = "^10";
  }
  if (cfg.styling === "styled-components") dependencies["styled-components"] = "^6";
  if (cfg.styling === "sass") devDependencies["sass"] = "^1";

  // State
  if (cfg.stateManagement === "zustand") dependencies["zustand"] = "^5";
  if (cfg.stateManagement === "redux-toolkit") {
    dependencies["@reduxjs/toolkit"] = "^2";
    dependencies["react-redux"] = "^9";
  }

  // API
  if (cfg.apiLayer === "graphql") {
    dependencies["graphql"] = "^16";
    dependencies["graphql-request"] = "^7";
  }

  // Auth
  if (cfg.auth === "nextauth") dependencies["next-auth"] = "^5";
  if (cfg.auth === "jwt") {
    dependencies["jsonwebtoken"] = "^9";
    dependencies["bcryptjs"] = "^2";
    if (isTS) {
      devDependencies["@types/jsonwebtoken"] = "^9";
      devDependencies["@types/bcryptjs"] = "^2";
    }
  }

  // Database
  if (cfg.database === "postgresql") {
    dependencies["pg"] = "^8";
    if (isTS) devDependencies["@types/pg"] = "^8";
  }
  if (cfg.database === "mongodb") dependencies["mongoose"] = "^8";

  // ORM
  if (cfg.orm === "prisma") {
    dependencies["@prisma/client"] = "^5";
    devDependencies["prisma"] = "^5";
  }
  if (cfg.orm === "drizzle") {
    dependencies["drizzle-orm"] = "^0.36";
    devDependencies["drizzle-kit"] = "^0.27";
  }

  // Testing
  if (cfg.testing === "jest") {
    devDependencies["jest"] = "^29";
    devDependencies["jest-environment-jsdom"] = "^29";
    devDependencies["@testing-library/react"] = isReact19 ? "^16" : "^14";
    devDependencies["@testing-library/jest-dom"] = "^6";
    if (isTS) devDependencies["@types/jest"] = "^29";
  }
  if (cfg.testing === "vitest") {
    devDependencies["vitest"] = "^2";
    devDependencies["@testing-library/react"] = isReact19 ? "^16" : "^14";
    devDependencies["@vitejs/plugin-react"] = "^4";
    devDependencies["jsdom"] = "^25";
  }
  if (cfg.testing === "playwright") devDependencies["@playwright/test"] = "^1";
  if (cfg.testing === "cypress") devDependencies["cypress"] = "^13";

  // Extras
  if (cfg.extras.openApiClient) {
    dependencies["openapi-fetch"] = "^0.12";
    devDependencies["openapi-typescript"] = "^7";
  }
  if (cfg.extras.eslintPrettier) {
    devDependencies["eslint"] = "^9";
    devDependencies["prettier"] = "^3";
    devDependencies["eslint-config-prettier"] = "^9";
    devDependencies["eslint-config-next"] = nextVer;
  }
  if (cfg.extras.huskyLintStaged) {
    devDependencies["husky"] = "^9";
    devDependencies["lint-staged"] = "^15";
    if (cfg.extras.huskyLintStaged) scripts.prepare = "husky";
  }

  const pkg: Record<string, unknown> = {
    name: cfg.projectName,
    version: "0.1.0",
    private: true,
    scripts,
    dependencies,
    devDependencies,
  };

  if (cfg.extras.huskyLintStaged) {
    pkg["lint-staged"] = buildLintStagedConfig(cfg);
  }

  // Engines
  pkg["engines"] = { [pm]: getPackageManagerEngine(pm) };

  return pkg;
}
