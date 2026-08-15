import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_TEMPLATE_ID } from "@mrsluffy/generator-core/client";
import {
  getCliCommand,
  getDependencies,
  getFolderTree,
  getVersionString,
  useGeneratorStore,
} from "./generatorStore";

describe("generator store helpers", () => {
  beforeEach(() => {
    useGeneratorStore.getState().reset();
  });

  it("maps displayed versions to package versions", () => {
    expect(getVersionString("16.x (latest)")).toBe("latest");
    expect(getVersionString("14.x (LTS)")).toBe("^14");
  });

  it("derives dependency groups, folder tree, and CLI command", () => {
    useGeneratorStore.setState({
      projectName: "starter-lab",
      packageManager: "pnpm",
      language: "javascript",
      router: "app",
      styling: "sass",
      stateManagement: "redux-toolkit",
      apiLayer: "graphql",
      auth: "jwt",
      database: "mongodb",
      orm: "drizzle",
      testing: "cypress",
      extras: {
        docker: true,
        githubActions: true,
        openApiClient: true,
        eslintPrettier: true,
        huskyLintStaged: true,
      },
    });

    const state = useGeneratorStore.getState();
    const dependencies = getDependencies(state);
    const folderTree = getFolderTree(state);
    const cliCommand = getCliCommand(state);

    expect(dependencies.find((group) => group.label === "API")?.deps).toEqual([
      "graphql",
      "graphql-request",
    ]);
    expect(dependencies.find((group) => group.label === "Git Hooks (dev)")?.deps).toEqual([
      "husky",
      "lint-staged",
    ]);
    expect(folderTree.children?.some((node) => node.name === ".github")).toBe(true);
    expect(folderTree.children?.some((node) => node.name === "Dockerfile")).toBe(true);
    expect(cliCommand).toBe(
      'pnpm create next-app@latest starter-lab --javascript --no-tailwind --app --src-dir --import-alias "@/*"',
    );
  });

  it("applies templates, updates steps, and resets to defaults", () => {
    const store = useGeneratorStore.getState();

    store.set("projectName", "custom-name");
    store.set("packageManager", "pnpm");
    store.setTemplate("dashboard");

    let state = useGeneratorStore.getState();
    expect(state.projectName).toBe("custom-name");
    expect(state.packageManager).toBe("pnpm");
    expect(state.auth).toBe("nextauth");
    expect(state.testing).toBe("playwright");

    store.nextStep();
    store.nextStep();
    store.prevStep();
    state = useGeneratorStore.getState();
    expect(state.step).toBe(1);

    store.reset();
    state = useGeneratorStore.getState();
    expect(state.templateId).toBe(DEFAULT_TEMPLATE_ID);
    expect(state.projectName).toBe("my-next-app");
    expect(state.step).toBe(0);
  });
});
