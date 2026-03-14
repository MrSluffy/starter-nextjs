const PACKAGE_MANAGER_INSTALL_COMMANDS = {
  npm: "npm ci",
  yarn: "yarn install --frozen-lockfile",
  pnpm: "pnpm install --frozen-lockfile",
} as const;

const PACKAGE_MANAGER_LOCK_FILES = {
  npm: "package-lock.json",
  yarn: "yarn.lock",
  pnpm: "pnpm-lock.yaml",
} as const;

const PACKAGE_MANAGER_ENGINES = {
  npm: ">=10.0.0",
  yarn: ">=4.0.0",
  pnpm: ">=9.0.0",
} as const;

const CREATE_NEXT_APP_BASE_COMMANDS = {
  npm: "npx create-next-app@",
  yarn: "yarn create next-app",
  pnpm: "pnpm create next-app",
} as const;

const PACKAGE_MANAGER_CI_SETUP = {
  npm: "",
  yarn: `
      - name: Enable Corepack
        run: corepack enable`,
  pnpm: `
      - uses: pnpm/action-setup@v4
        with:
          version: 9`,
} as const;

type PackageManagerName = keyof typeof PACKAGE_MANAGER_INSTALL_COMMANDS;

export function getLanguageFileExtensions(language: string) {
  const isTypeScript = language === "typescript";

  return {
    isTypeScript,
    ext: isTypeScript ? "ts" : "js",
    tsx: isTypeScript ? "tsx" : "jsx",
  };
}

export function getPackageManagerInstallCommand(packageManager: PackageManagerName): string {
  return PACKAGE_MANAGER_INSTALL_COMMANDS[packageManager];
}

export function getPackageManagerScriptCommand(
  packageManager: PackageManagerName,
  script: string,
): string {
  return packageManager === "npm" ? `npm run ${script}` : `${packageManager} ${script}`;
}

export function getPackageManagerLockFile(packageManager: PackageManagerName): string {
  return PACKAGE_MANAGER_LOCK_FILES[packageManager];
}

export function getPackageManagerEngine(packageManager: PackageManagerName): string {
  return PACKAGE_MANAGER_ENGINES[packageManager];
}

export function getCreateNextAppBaseCommand(packageManager: PackageManagerName): string {
  return CREATE_NEXT_APP_BASE_COMMANDS[packageManager];
}

export function getPackageManagerCiSetup(packageManager: PackageManagerName): string {
  return PACKAGE_MANAGER_CI_SETUP[packageManager];
}
