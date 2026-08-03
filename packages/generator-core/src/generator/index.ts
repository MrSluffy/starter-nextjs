import { ZipArchive } from "archiver";
import { Writable, PassThrough } from "stream";
import type { GeneratorConfig } from "../types";
import { buildPackageJson, resolveDependencyVersions } from "./packageJson";
import { buildTsConfig, buildNextConfig } from "./tsConfig";
import { buildEslintConfig, buildPrettierConfig } from "./eslintConfig";
import { buildDockerfile, buildDockerCompose } from "./dockerConfig";
import { buildCiYaml } from "./githubActions";
import {
  buildEnvExample,
  buildAppLayout,
  buildAppPage,
  buildMiddleware,
  buildApiLib,
  buildErrorLib,
  buildLoggerLib,
  buildPrismaLib,
  buildPrismaSchema,
  buildStoreFile,
  buildHook,
  buildAtomButton,
  buildReadme,
} from "./fileTemplates";
import { getLanguageFileExtensions } from "./shared";

type FileEntry = { path: string; content: string };

function addFile(files: FileEntry[], path: string, content: string) {
  files.push({ path, content });
}

function j(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

export function collectFiles(
  cfg: GeneratorConfig,
  resolvedVersions?: Record<string, string> | null,
): FileEntry[] {
  const files: FileEntry[] = [];
  const { isTypeScript: isTS, ext, tsx } = getLanguageFileExtensions(cfg.language);
  const src = "src";

  // ── Root config files ────────────────────────────────────────────────────
  addFile(files, "package.json", j(buildPackageJson(cfg, resolvedVersions)));
  if (isTS) addFile(files, "tsconfig.json", j(buildTsConfig()));
  addFile(files, `next.config.${ext}`, buildNextConfig(cfg));
  addFile(files, ".env.example", buildEnvExample(cfg));
  addFile(files, ".gitignore", gitignore());
  addFile(files, "README.md", buildReadme(cfg));

  if (cfg.extras.eslintPrettier) {
    addFile(files, ".eslintrc.json", j(buildEslintConfig(cfg)));
    addFile(files, ".prettierrc", j(buildPrettierConfig()));
    addFile(files, ".prettierignore", "node_modules\n.next\ndist\nbuild\n");
  }

  if (cfg.extras.huskyLintStaged) {
    addFile(files, ".husky/pre-commit", "#!/usr/bin/env sh\nnpx lint-staged\n");
    addFile(files, ".husky/.gitignore", "*\n");
  }

  if (cfg.extras.docker) {
    addFile(files, "Dockerfile", buildDockerfile(cfg));
    addFile(files, "docker-compose.yml", buildDockerCompose(cfg));
    addFile(files, ".dockerignore", "node_modules\n.next\n.env*\n");
  }

  if (cfg.extras.githubActions) {
    addFile(files, ".github/workflows/ci.yml", buildCiYaml(cfg));
  }

  // ── App directory ────────────────────────────────────────────────────────
  addFile(files, `${src}/app/layout.${tsx}`, buildAppLayout(cfg));
  addFile(files, `${src}/app/page.${tsx}`, buildAppPage(cfg));
  addFile(files, `${src}/app/globals.css`, globalsCss(cfg));
  addFile(files, `${src}/app/not-found.${tsx}`, notFound());
  addFile(files, `${src}/app/error.${tsx}`, errorBoundary(isTS));
  addFile(files, `${src}/app/loading.${tsx}`, loadingPage());
  addFile(files, `${src}/app/api/health/route.${ext}`, healthRoute());

  if (cfg.auth === "nextauth") {
    addFile(files, `${src}/app/api/auth/[...nextauth]/route.${ext}`, nextAuthRoute());
  }

  if (cfg.router === "app") {
    addFile(
      files,
      `${src}/app/(routes)/home/page.${tsx}`,
      `export default function HomePage() {\n  return <div>Home</div>;\n}\n`,
    );
  }

  // Middleware
  addFile(files, `${src}/middleware.${ext}`, buildMiddleware(cfg));

  // ── Components (Atomic Design) ────────────────────────────────────────────
  addFile(files, `${src}/components/atoms/Button.${tsx}`, buildAtomButton(cfg));
  addFile(files, `${src}/components/atoms/Input.${tsx}`, atomInput(isTS));
  addFile(files, `${src}/components/molecules/FormField.${tsx}`, formField(isTS));
  addFile(files, `${src}/components/organisms/Header.${tsx}`, header());
  addFile(files, `${src}/components/organisms/Footer.${tsx}`, footer());
  addFile(files, `${src}/components/templates/PageTemplate.${tsx}`, pageTemplate(isTS));

  // ── Features ────────────────────────────────────────────────────────────
  if (cfg.auth !== "none") {
    addFile(files, `${src}/features/auth/types/index.${ext}`, authTypes(isTS));
    addFile(
      files,
      `${src}/features/auth/services/authService.${ext}`,
      `// Auth service placeholder\n`,
    );
    addFile(files, `${src}/features/auth/hooks/useAuth.${ext}`, `// useAuth hook placeholder\n`);
  }

  // ── Lib ─────────────────────────────────────────────────────────────────
  addFile(files, `${src}/lib/api.${ext}`, buildApiLib(cfg));
  addFile(files, `${src}/lib/errors.${ext}`, buildErrorLib(cfg));
  addFile(files, `${src}/lib/logger.${ext}`, buildLoggerLib(cfg));
  if (cfg.orm === "prisma") {
    addFile(files, `${src}/lib/prisma.${ext}`, buildPrismaLib(cfg));
    addFile(files, `prisma/schema.prisma`, buildPrismaSchema(cfg));
  }

  // ── Hooks ───────────────────────────────────────────────────────────────
  addFile(files, `${src}/hooks/useLocalStorage.${ext}`, buildHook(cfg));

  // ── Store ────────────────────────────────────────────────────────────────
  if (cfg.stateManagement !== "none") {
    addFile(files, `${src}/store/index.${ext}`, buildStoreFile(cfg));
  }

  // ── Types ────────────────────────────────────────────────────────────────
  if (isTS) {
    addFile(files, `${src}/types/index.ts`, `// Shared TypeScript types\nexport {};\n`);
  }

  // ── Utils ────────────────────────────────────────────────────────────────
  addFile(files, `${src}/utils/cn.${ext}`, cnUtil(isTS));
  addFile(files, `${src}/utils/format.${ext}`, formatUtil(isTS));

  // ── Testing ─────────────────────────────────────────────────────────────
  if (cfg.testing === "jest") {
    addFile(files, `jest.config.${ext}`, jestConfig(isTS));
    addFile(files, `jest.setup.${ext}`, `import "@testing-library/jest-dom";\n`);
  }
  if (cfg.testing === "vitest") {
    addFile(files, `vitest.config.${ext}`, vitestConfig());
  }
  if (cfg.testing === "playwright") {
    addFile(files, `playwright.config.${ext}`, playwrightConfig());
  }
  if (cfg.testing === "cypress") {
    addFile(files, `cypress.config.${ext}`, cypressConfig());
  }

  return files;
}

export async function buildZip(cfg: GeneratorConfig): Promise<Buffer> {
  const resolvedVersions = await resolveDependencyVersions(cfg);
  const files = collectFiles(cfg, resolvedVersions);

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const passThrough = new PassThrough();

    passThrough.on("data", (chunk: Buffer) => chunks.push(chunk));
    passThrough.on("end", () => resolve(Buffer.concat(chunks)));
    passThrough.on("error", reject);

    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on("error", reject);
    archive.pipe(passThrough as unknown as Writable);

    const rootDir = cfg.projectName + "/";
    for (const file of files) {
      archive.append(file.content, { name: rootDir + file.path });
    }

    archive.finalize();
  });
}

// ── Inline small templates ────────────────────────────────────────────────────

function gitignore(): string {
  return `# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# production
.next/
out/
dist/
build/

# env files
.env
.env.local
.env.*.local

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;
}

function globalsCss(cfg: GeneratorConfig): string {
  if (cfg.styling === "tailwind") {
    return `@import "tailwindcss";\n`;
  }
  return `:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
`;
}

function notFound(): string {
  return `export default function NotFound() {
  return (
    <div>
      <h2>404 — Not Found</h2>
      <p>Could not find the requested resource.</p>
    </div>
  );
}
`;
}

function errorBoundary(isTS: boolean): string {
  return `"use client";

${isTS ? "interface ErrorProps {\n  error: Error & { digest?: string };\n  reset: () => void;\n}\n\n" : ""}export default function Error({ error, reset }${isTS ? ": ErrorProps" : ""}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
`;
}

function loadingPage(): string {
  return `export default function Loading() {
  return <div>Loading...</div>;
}
`;
}

function healthRoute(): string {
  return `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
`;
}

function nextAuthRoute(): string {
  return `import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
`;
}

function atomInput(isTS: boolean): string {
  return `import React from "react";
${isTS ? "\ninterface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {\n  label?: string;\n  error?: string;\n}\n" : ""}
export function Input({ label, error, id, ...props }${isTS ? ": InputProps" : ""}) {
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...props} />
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
`;
}

function formField(isTS: boolean): string {
  return `import React from "react";
import { Input } from "@/components/atoms/Input";

${
  isTS
    ? `interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  error?: string;
  placeholder?: string;
}

`
    : ""
}export function FormField({ name, label, type = "text", error, placeholder }${isTS ? ": FormFieldProps" : ""}) {
  return (
    <Input
      id={name}
      name={name}
      type={type}
      label={label}
      error={error}
      placeholder={placeholder}
    />
  );
}
`;
}

function header(): string {
  return `import Link from "next/link";

export function Header() {
  return (
    <header>
      <nav>
        <Link href="/">Home</Link>
      </nav>
    </header>
  );
}
`;
}

function footer(): string {
  return `export function Footer() {
  return (
    <footer>
      <p>© {new Date().getFullYear()} All rights reserved.</p>
    </footer>
  );
}
`;
}

function pageTemplate(isTS: boolean): string {
  return `import React from "react";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
${isTS ? `\ninterface PageTemplateProps {\n  children: React.ReactNode;\n}\n` : ""}
export function PageTemplate({ children }${isTS ? ": PageTemplateProps" : ""}) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
`;
}

function authTypes(isTS: boolean): string {
  return isTS
    ? `export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
`
    : `// Auth types placeholder\n`;
}

function cnUtil(isTS: boolean): string {
  return `export function cn(...classes${isTS ? ": (string | undefined | null | false)[]" : ""})${isTS ? ": string" : ""} {
  return classes.filter(Boolean).join(" ");
}
`;
}

function formatUtil(isTS: boolean): string {
  return `export function formatDate(date${isTS ? ": Date | string" : ""})${isTS ? ": string" : ""} {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function capitalize(str${isTS ? ": string" : ""})${isTS ? ": string" : ""} {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`;
}

function jestConfig(isTS: boolean): string {
  return `import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config${isTS ? ": Config" : ""} = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterFramework: ["<rootDir>/jest.setup.${isTS ? "ts" : "js"}"],
};

export default createJestConfig(config);
`;
}

function vitestConfig(): string {
  return `import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: [],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
`;
}

function playwrightConfig(): string {
  return `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
`;
}

function cypressConfig(): string {
  return `import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {},
  },
});
`;
}
