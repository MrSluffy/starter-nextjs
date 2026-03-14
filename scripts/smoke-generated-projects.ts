import { createConfig } from "../tests/helpers/configs";
import {
  assertPageContains,
  cleanupProject,
  getAvailablePort,
  materializeProject,
  runNpmCommand,
  startDevServer,
  stopProcess,
} from "../tests/helpers/generated-project";

async function run() {
  const smokeCases = [
    {
      label: "generated TypeScript content app",
      config: createConfig({
        projectName: "generated-content",
        testing: "none",
        stateManagement: "none",
        apiLayer: "none",
      }),
      build: true,
    },
    {
      label: "generated JavaScript variant",
      config: createConfig({
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
      build: false,
    },
  ];

  for (const smokeCase of smokeCases) {
    let projectDir = "";
    let server: Awaited<ReturnType<typeof startDevServer>> | undefined;

    try {
      console.log(`\n[smoke] Preparing ${smokeCase.label}`);
      projectDir = await materializeProject(smokeCase.config);

      console.log(`[smoke] Installing dependencies for ${smokeCase.config.projectName}`);
      await runNpmCommand(projectDir, ["install"], 300000);

      if (smokeCase.build) {
        console.log(`[smoke] Building ${smokeCase.config.projectName}`);
        await runNpmCommand(projectDir, ["run", "build"], 300000);
      }

      const port = await getAvailablePort();
      console.log(`[smoke] Starting ${smokeCase.config.projectName} on port ${port}`);
      server = await startDevServer(projectDir, port);

      console.log(`[smoke] Checking rendered output for ${smokeCase.config.projectName}`);
      await assertPageContains(server.url, smokeCase.config.projectName);
      await assertPageContains(server.url, "Welcome to your new Next.js app.");
    } finally {
      if (server) {
        await stopProcess(server.child);
      }

      if (projectDir) {
        await cleanupProject(projectDir);
      }
    }
  }

  console.log("\n[smoke] Generated project smoke checks passed.");
}

run().catch((error) => {
  console.error("\n[smoke] Generated project smoke checks failed.");
  console.error(error);
  process.exit(1);
});
