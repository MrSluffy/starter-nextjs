import type { GeneratorConfig } from "@/store/generatorStore";
import { getVersionString } from "@/store/generatorStore";
import { getLatestVersions } from "./npmApi";
import { buildLintStagedConfig } from "./eslintConfig";
import { getLanguageFileExtensions, getPackageManagerEngine } from "./shared";

/**
 * Builds a flat spec of package name -> semver range for all deps used by cfg.
 * These ranges define compatibility (e.g. ^15 for Next 15.x, ^19 for React 19); the npm API
 * returns the latest version satisfying each range, so generated projects stay up to date
 * without hardcoding specific versions.
 */
export function getDependencySpec(cfg: GeneratorConfig): Record<string, string> {
  const { isTypeScript: isTS } = getLanguageFileExtensions(cfg.language);
  const nextVer = getVersionString(cfg.nextVersion);
  const isReact19 = cfg.nextVersion.startsWith("15") || cfg.nextVersion.startsWith("16");
  const reactRange = isReact19 ? "^19.0.0" : "^18.2.0";
  const reactTypesRange = isReact19 ? "^19" : "^18";

  const spec: Record<string, string> = {
    next: nextVer === "latest" ? "latest" : nextVer,
    react: reactRange,
    "react-dom": reactRange,
  };

  if (isTS) {
    spec.typescript = "^5";
    spec["@types/node"] = "^20";
    spec["@types/react"] = reactTypesRange;
    spec["@types/react-dom"] = reactTypesRange;
  }

  if (cfg.styling === "tailwind") {
    spec["tailwindcss"] = "^4";
    spec["postcss"] = "^8";
    spec["autoprefixer"] = "^10";
  }
  if (cfg.styling === "styled-components") spec["styled-components"] = "^6";
  if (cfg.styling === "sass") spec["sass"] = "^1";

  if (cfg.stateManagement === "zustand") spec["zustand"] = "^5";
  if (cfg.stateManagement === "redux-toolkit") {
    spec["@reduxjs/toolkit"] = "^2";
    spec["react-redux"] = "^9";
  }

  if (cfg.apiLayer === "graphql") {
    spec["graphql"] = "^16";
    spec["graphql-request"] = "^7";
  }

  if (cfg.auth === "nextauth") spec["next-auth"] = "^5";
  if (cfg.auth === "jwt") {
    spec["jsonwebtoken"] = "^9";
    spec["bcryptjs"] = "^2";
    if (isTS) {
      spec["@types/jsonwebtoken"] = "^9";
      spec["@types/bcryptjs"] = "^2";
    }
  }

  if (cfg.database === "postgresql") {
    spec["pg"] = "^8";
    if (isTS) spec["@types/pg"] = "^8";
  }
  if (cfg.database === "mongodb") spec["mongoose"] = "^8";

  if (cfg.orm === "prisma") {
    spec["@prisma/client"] = "^5";
    spec["prisma"] = "^5";
  }
  if (cfg.orm === "drizzle") {
    spec["drizzle-orm"] = "^0.36";
    spec["drizzle-kit"] = "^0.27";
  }

  if (cfg.testing === "jest") {
    spec["jest"] = "^29";
    spec["jest-environment-jsdom"] = "^29";
    spec["@testing-library/react"] = isReact19 ? "^16" : "^14";
    spec["@testing-library/jest-dom"] = "^6";
    if (isTS) spec["@types/jest"] = "^29";
  }
  if (cfg.testing === "vitest") {
    spec["vitest"] = "^2";
    spec["@testing-library/react"] = isReact19 ? "^16" : "^14";
    spec["@vitejs/plugin-react"] = "^4";
    spec["jsdom"] = "^25";
  }
  if (cfg.testing === "playwright") spec["@playwright/test"] = "^1";
  if (cfg.testing === "cypress") spec["cypress"] = "^13";

  if (cfg.extras.openApiClient) {
    spec["openapi-fetch"] = "^0.12";
    spec["openapi-typescript"] = "^7";
  }
  if (cfg.extras.eslintPrettier) {
    spec["eslint"] = "^9";
    spec["prettier"] = "^3";
    spec["eslint-config-prettier"] = "^9";
    spec["eslint-config-next"] = nextVer === "latest" ? "latest" : nextVer;
  }
  if (cfg.extras.huskyLintStaged) {
    spec["husky"] = "^9";
    spec["lint-staged"] = "^15";
  }

  return spec;
}

/**
 * Resolves all dependency versions for the given config via the npm registry API.
 * Returns a map of package name -> latest version satisfying the config's ranges.
 */
export async function resolveDependencyVersions(
  cfg: GeneratorConfig,
): Promise<Record<string, string>> {
  const spec = getDependencySpec(cfg);
  return getLatestVersions(spec);
}

/** Format resolved version for package.json (keep caret for patch/minor updates). */
function toRange(version: string): string {
  return `^${version}`;
}

export function buildPackageJson(
  cfg: GeneratorConfig,
  resolvedVersions?: Record<string, string> | null,
): object {
  const { isTypeScript: isTS } = getLanguageFileExtensions(cfg.language);
  const nextVer = getVersionString(cfg.nextVersion);
  const pm = cfg.packageManager;
  const resolved = resolvedVersions ?? null;

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

  const dep = (name: string, fallback: string) =>
    resolved && resolved[name] ? toRange(resolved[name]) : fallback;

  const dependencies: Record<string, string> = {
    next: dep("next", nextVer),
    react: dep("react", reactVer),
    "react-dom": dep("react-dom", reactVer),
  };

  const devDependencies: Record<string, string> = {
    ...(isTS
      ? {
          typescript: dep("typescript", "^5"),
          "@types/node": dep("@types/node", "^20"),
          "@types/react": dep("@types/react", reactTypesVer),
          "@types/react-dom": dep("@types/react-dom", reactTypesVer),
        }
      : {}),
  };

  // Styling
  if (cfg.styling === "tailwind") {
    devDependencies["tailwindcss"] = dep("tailwindcss", "^4");
    devDependencies["postcss"] = dep("postcss", "^8");
    devDependencies["autoprefixer"] = dep("autoprefixer", "^10");
  }
  if (cfg.styling === "styled-components")
    dependencies["styled-components"] = dep("styled-components", "^6");
  if (cfg.styling === "sass") devDependencies["sass"] = dep("sass", "^1");

  // State
  if (cfg.stateManagement === "zustand") dependencies["zustand"] = dep("zustand", "^5");
  if (cfg.stateManagement === "redux-toolkit") {
    dependencies["@reduxjs/toolkit"] = dep("@reduxjs/toolkit", "^2");
    dependencies["react-redux"] = dep("react-redux", "^9");
  }

  // API
  if (cfg.apiLayer === "graphql") {
    dependencies["graphql"] = dep("graphql", "^16");
    dependencies["graphql-request"] = dep("graphql-request", "^7");
  }

  // Auth
  if (cfg.auth === "nextauth") dependencies["next-auth"] = dep("next-auth", "^5");
  if (cfg.auth === "jwt") {
    dependencies["jsonwebtoken"] = dep("jsonwebtoken", "^9");
    dependencies["bcryptjs"] = dep("bcryptjs", "^2");
    if (isTS) {
      devDependencies["@types/jsonwebtoken"] = dep("@types/jsonwebtoken", "^9");
      devDependencies["@types/bcryptjs"] = dep("@types/bcryptjs", "^2");
    }
  }

  // Database
  if (cfg.database === "postgresql") {
    dependencies["pg"] = dep("pg", "^8");
    if (isTS) devDependencies["@types/pg"] = dep("@types/pg", "^8");
  }
  if (cfg.database === "mongodb") dependencies["mongoose"] = dep("mongoose", "^8");

  // ORM
  if (cfg.orm === "prisma") {
    dependencies["@prisma/client"] = dep("@prisma/client", "^5");
    devDependencies["prisma"] = dep("prisma", "^5");
  }
  if (cfg.orm === "drizzle") {
    dependencies["drizzle-orm"] = dep("drizzle-orm", "^0.36");
    devDependencies["drizzle-kit"] = dep("drizzle-kit", "^0.27");
  }

  // Testing
  if (cfg.testing === "jest") {
    devDependencies["jest"] = dep("jest", "^29");
    devDependencies["jest-environment-jsdom"] = dep("jest-environment-jsdom", "^29");
    devDependencies["@testing-library/react"] = dep(
      "@testing-library/react",
      isReact19 ? "^16" : "^14",
    );
    devDependencies["@testing-library/jest-dom"] = dep("@testing-library/jest-dom", "^6");
    if (isTS) devDependencies["@types/jest"] = dep("@types/jest", "^29");
  }
  if (cfg.testing === "vitest") {
    devDependencies["vitest"] = dep("vitest", "^2");
    devDependencies["@testing-library/react"] = dep(
      "@testing-library/react",
      isReact19 ? "^16" : "^14",
    );
    devDependencies["@vitejs/plugin-react"] = dep("@vitejs/plugin-react", "^4");
    devDependencies["jsdom"] = dep("jsdom", "^25");
  }
  if (cfg.testing === "playwright")
    devDependencies["@playwright/test"] = dep("@playwright/test", "^1");
  if (cfg.testing === "cypress") devDependencies["cypress"] = dep("cypress", "^13");

  // Extras
  if (cfg.extras.openApiClient) {
    dependencies["openapi-fetch"] = dep("openapi-fetch", "^0.12");
    devDependencies["openapi-typescript"] = dep("openapi-typescript", "^7");
  }
  if (cfg.extras.eslintPrettier) {
    devDependencies["eslint"] = dep("eslint", "^9");
    devDependencies["prettier"] = dep("prettier", "^3");
    devDependencies["eslint-config-prettier"] = dep("eslint-config-prettier", "^9");
    devDependencies["eslint-config-next"] = dep("eslint-config-next", nextVer);
  }
  if (cfg.extras.huskyLintStaged) {
    devDependencies["husky"] = dep("husky", "^9");
    devDependencies["lint-staged"] = dep("lint-staged", "^15");
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
