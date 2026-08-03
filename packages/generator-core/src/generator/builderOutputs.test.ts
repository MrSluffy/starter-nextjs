import { describe, expect, it } from "vitest";
import { createConfig } from "./__tests__/helpers/configs";
import { buildDockerCompose, buildDockerfile } from "./dockerConfig";
import { buildEslintConfig, buildLintStagedConfig, buildPrettierConfig } from "./eslintConfig";
import {
  buildApiLib,
  buildAppLayout,
  buildEnvExample,
  buildPrismaSchema,
  buildReadme,
  buildStoreFile,
} from "./fileTemplates";
import { buildCiYaml } from "./githubActions";
import { buildNextConfig, buildTsConfig } from "./tsConfig";

describe("generator builder outputs", () => {
  it("generates docker assets with package-manager-specific commands", () => {
    const cfg = createConfig({
      packageManager: "pnpm",
      database: "postgresql",
    });

    expect(buildDockerfile(cfg)).toContain("COPY package.json pnpm-lock.yaml ./");
    expect(buildDockerfile(cfg)).toContain("RUN pnpm build");
    expect(buildDockerCompose(cfg)).toContain("postgres:");
    expect(buildDockerCompose(cfg)).toContain("POSTGRES_DB: my_next_app");
  });

  it("generates CI config with the right install, build, and test commands", () => {
    const cfg = createConfig({
      packageManager: "yarn",
      testing: "playwright",
    });

    const ci = buildCiYaml(cfg);
    expect(ci).toContain('cache: "yarn"');
    expect(ci).toContain("corepack enable");
    expect(ci).toContain("run: yarn build");
    expect(ci).toContain("run: yarn test:e2e");
  });

  it("generates linting and formatting config", () => {
    const eslintConfig = buildEslintConfig(createConfig());
    expect(eslintConfig).toEqual({
      extends: ["next/core-web-vitals", "prettier"],
      rules: {
        "@next/next/no-html-link-for-pages": "error",
        "react/no-unescaped-entities": "off",
      },
    });

    expect(buildPrettierConfig()).toMatchObject({
      semi: true,
      trailingComma: "all",
      singleQuote: false,
    });

    expect(buildLintStagedConfig(createConfig({ language: "javascript" }))).toEqual({
      "*.{js,jsx}": ["eslint --fix", "prettier --write"],
      "*.{css,md,json}": ["prettier --write"],
    });
  });

  it("generates TypeScript config and Next config with strict build checks", () => {
    expect(buildTsConfig()).toMatchObject({
      compilerOptions: expect.objectContaining({
        strict: true,
        noEmit: true,
        paths: { "@/*": ["./src/*"] },
      }),
    });

    expect(buildNextConfig(createConfig())).toContain("typescript: { ignoreBuildErrors: false }");
    expect(buildNextConfig(createConfig())).toContain("reactCompiler: false");
    expect(buildNextConfig(createConfig({ language: "javascript" }))).toContain(
      '/** @type {import("next").NextConfig} */',
    );
  });

  it("generates file templates for configured integrations", () => {
    const cfg = createConfig({
      projectName: "starter-lab",
      auth: "jwt",
      database: "mongodb",
      orm: "prisma",
      stateManagement: "redux-toolkit",
      apiLayer: "graphql",
    });

    expect(buildEnvExample(cfg)).toContain("JWT_SECRET");
    expect(buildEnvExample(cfg)).toContain("MONGODB_URI");
    expect(buildEnvExample(cfg)).toContain("NEXT_PUBLIC_GRAPHQL_URL");
    expect(buildAppLayout(cfg)).toContain('title: {\n    default: "starter-lab"');
    expect(buildApiLib(cfg)).toContain("NEXT_PUBLIC_APP_URL");
    expect(buildPrismaSchema(cfg)).toContain('provider = "mongodb"');
    expect(buildStoreFile(cfg)).toContain("configureStore");
    expect(buildReadme(cfg)).toContain("# starter-lab");
    expect(buildReadme(cfg)).toContain("Run tests");
  });
});
