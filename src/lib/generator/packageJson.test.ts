import { describe, expect, it } from "vitest";
import { createConfig } from "../../../tests/helpers/configs";
import { buildPackageJson } from "./packageJson";

type GeneratedPackageJson = {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  engines: Record<string, string>;
  "lint-staged"?: unknown;
};

describe("buildPackageJson", () => {
  it("builds a TypeScript package.json with unit testing and extras", () => {
    const pkg = buildPackageJson(
      createConfig({
        projectName: "saas-app",
        auth: "nextauth",
        database: "postgresql",
        orm: "prisma",
        testing: "vitest",
        extras: {
          githubActions: true,
          openApiClient: true,
          huskyLintStaged: true,
        },
      }),
    ) as GeneratedPackageJson;

    expect(pkg.name).toBe("saas-app");
    expect(pkg.scripts.test).toBe("vitest");
    expect(pkg.scripts.prepare).toBe("husky");
    expect(pkg.scripts["db:generate"]).toBe("prisma generate");
    expect(pkg.dependencies["next-auth"]).toBe("^5");
    expect(pkg.dependencies.pg).toBe("^8");
    expect(pkg.dependencies["@prisma/client"]).toBe("^5");
    expect(pkg.devDependencies.vitest).toBe("^2");
    expect(pkg.devDependencies["openapi-typescript"]).toBe("^7");
    expect(pkg["lint-staged"]).toBeDefined();
    expect(pkg.engines).toEqual({ npm: ">=10.0.0" });
  });

  it("builds a JavaScript package.json with e2e testing", () => {
    const pkg = buildPackageJson(
      createConfig({
        language: "javascript",
        packageManager: "pnpm",
        styling: "sass",
        stateManagement: "redux-toolkit",
        apiLayer: "graphql",
        auth: "jwt",
        database: "mongodb",
        orm: "drizzle",
        testing: "playwright",
        extras: {
          eslintPrettier: false,
        },
      }),
    ) as GeneratedPackageJson;

    expect(pkg.scripts["test:e2e"]).toBe("playwright test");
    expect(pkg.scripts.format).toBeUndefined();
    expect(pkg.dependencies.graphql).toBe("^16");
    expect(pkg.dependencies["graphql-request"]).toBe("^7");
    expect(pkg.dependencies.jsonwebtoken).toBe("^9");
    expect(pkg.dependencies.mongoose).toBe("^8");
    expect(pkg.dependencies["drizzle-orm"]).toBe("^0.36");
    expect(pkg.devDependencies["@playwright/test"]).toBe("^1");
    expect(pkg.devDependencies.typescript).toBeUndefined();
    expect(pkg.engines).toEqual({ pnpm: ">=9.0.0" });
  });

  it("adds the correct test script for every supported testing choice", () => {
    expect(
      (buildPackageJson(createConfig({ testing: "jest" })) as GeneratedPackageJson).scripts.test,
    ).toBe("jest");
    expect(
      (buildPackageJson(createConfig({ testing: "vitest" })) as GeneratedPackageJson).scripts.test,
    ).toBe("vitest");
    expect(
      (buildPackageJson(createConfig({ testing: "playwright" })) as GeneratedPackageJson).scripts[
        "test:e2e"
      ],
    ).toBe("playwright test");
    expect(
      (buildPackageJson(createConfig({ testing: "cypress" })) as GeneratedPackageJson).scripts[
        "test:e2e"
      ],
    ).toBe("cypress run");
  });
});
