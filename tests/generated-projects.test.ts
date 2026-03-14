import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildZip } from "@/lib/generator";
import { createConfig, representativeConfigs } from "./helpers/configs";
import { cleanupProject, materializeProject } from "./helpers/generated-project";
import { unzipTextEntries } from "./helpers/zip";

const createdProjects: string[] = [];

afterEach(async () => {
  await Promise.all(createdProjects.splice(0).map((projectDir) => cleanupProject(projectDir)));
});

describe("generated project verification", () => {
  it("validates representative zip outputs across multiple stacks", async () => {
    const dashboardZip = unzipTextEntries(await buildZip(representativeConfigs.dashboard));
    const contentZip = unzipTextEntries(await buildZip(representativeConfigs.content));
    const javascriptZip = unzipTextEntries(await buildZip(representativeConfigs.javascript));

    expect(dashboardZip["dashboard-app/playwright.config.ts"]).toContain("defineConfig");
    expect(dashboardZip["dashboard-app/prisma/schema.prisma"]).toContain('provider = "postgresql"');
    expect(dashboardZip["dashboard-app/.github/workflows/ci.yml"]).toContain(
      "run: npm run test:e2e",
    );

    expect(contentZip["content-site/package.json"]).toContain('"name": "content-site"');
    expect(contentZip["content-site/src/app/page.tsx"]).toContain("content-site");
    expect(contentZip["content-site/README.md"]).toContain("Testing");

    expect(javascriptZip["js-starter/src/app/page.jsx"]).toContain("js-starter");
    expect(javascriptZip["js-starter/docker-compose.yml"]).toContain("mongodb:");
    expect(javascriptZip["js-starter/vitest.config.js"]).toContain("defineConfig");
  }, 180000);

  it("materializes a generated TypeScript project to disk", async () => {
    const projectDir = await materializeProject(
      createConfig({
        projectName: "generated-content",
        testing: "none",
        stateManagement: "none",
        apiLayer: "none",
      }),
    );
    createdProjects.push(projectDir);

    await expect(access(path.join(projectDir, "package.json"))).resolves.toBeUndefined();
    await expect(access(path.join(projectDir, "src", "app", "page.tsx"))).resolves.toBeUndefined();
    await expect(readFile(path.join(projectDir, "README.md"), "utf8")).resolves.toContain(
      "# generated-content",
    );
  });

  it("materializes a generated JavaScript project variant to disk", async () => {
    const projectDir = await materializeProject(
      createConfig({
        projectName: "generated-js",
        language: "javascript",
        styling: "sass",
        stateManagement: "react-context",
        auth: "jwt",
        database: "mongodb",
        orm: "drizzle",
        testing: "none",
        extras: {
          docker: true,
          githubActions: true,
          openApiClient: true,
          eslintPrettier: true,
          huskyLintStaged: false,
        },
      }),
    );
    createdProjects.push(projectDir);

    await expect(access(path.join(projectDir, "src", "app", "page.jsx"))).resolves.toBeUndefined();
    await expect(access(path.join(projectDir, "docker-compose.yml"))).resolves.toBeUndefined();
    await expect(readFile(path.join(projectDir, "package.json"), "utf8")).resolves.toContain(
      '"name": "generated-js"',
    );
  });
});
