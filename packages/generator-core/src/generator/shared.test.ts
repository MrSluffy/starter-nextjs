import { describe, expect, it } from "vitest";
import {
  getCreateNextAppBaseCommand,
  getLanguageFileExtensions,
  getPackageManagerCiSetup,
  getPackageManagerEngine,
  getPackageManagerInstallCommand,
  getPackageManagerLockFile,
  getPackageManagerScriptCommand,
} from "./shared";

describe("generator shared helpers", () => {
  it("returns expected language extensions", () => {
    expect(getLanguageFileExtensions("typescript")).toEqual({
      isTypeScript: true,
      ext: "ts",
      tsx: "tsx",
    });

    expect(getLanguageFileExtensions("javascript")).toEqual({
      isTypeScript: false,
      ext: "js",
      tsx: "jsx",
    });
  });

  it("maps package manager helpers", () => {
    expect(getPackageManagerInstallCommand("npm")).toBe("npm ci");
    expect(getPackageManagerLockFile("pnpm")).toBe("pnpm-lock.yaml");
    expect(getPackageManagerEngine("yarn")).toBe(">=4.0.0");
    expect(getCreateNextAppBaseCommand("npm")).toBe("npx create-next-app@");
    expect(getPackageManagerScriptCommand("npm", "build")).toBe("npm run build");
    expect(getPackageManagerScriptCommand("pnpm", "build")).toBe("pnpm build");
    expect(getPackageManagerCiSetup("npm")).toBe("");
    expect(getPackageManagerCiSetup("pnpm")).toContain("pnpm/action-setup");
  });
});
