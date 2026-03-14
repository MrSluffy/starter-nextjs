import type { GeneratorConfig } from "@/store/generatorStore";
import {
  getPackageManagerCiSetup,
  getPackageManagerInstallCommand,
  getPackageManagerScriptCommand,
} from "./shared";

export function buildCiYaml(cfg: GeneratorConfig): string {
  const pm = cfg.packageManager;
  const installCmd = getPackageManagerInstallCommand(pm);
  const testCmd =
    cfg.testing === "jest" || cfg.testing === "vitest"
      ? getPackageManagerScriptCommand(pm, "test")
      : getPackageManagerScriptCommand(pm, "test:e2e");
  const lintCmd = getPackageManagerScriptCommand(pm, "lint");
  const buildCmd = getPackageManagerScriptCommand(pm, "build");
  const pmSetup = getPackageManagerCiSetup(pm);

  return `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: "${pm}"
${pmSetup}

      - name: Install dependencies
        run: ${installCmd}

      - name: Lint
        run: ${lintCmd}

      - name: Build
        run: ${buildCmd}

      - name: Test
        run: ${testCmd}
`;
}
