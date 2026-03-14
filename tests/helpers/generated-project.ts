import { once } from "node:events";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "node:net";
import { spawn, type ChildProcess } from "node:child_process";
import { chromium } from "@playwright/test";
import type { GeneratorConfig } from "@/store/generatorStore";
import { collectFiles } from "@/lib/generator";

const NPM_BIN = process.platform === "win32" ? "npm.cmd" : "npm";

export async function materializeProject(cfg: GeneratorConfig): Promise<string> {
  const rootDir = await mkdtemp(path.join(tmpdir(), "starter-nextjs-generated-"));
  const files = collectFiles(cfg);

  for (const file of files) {
    const outputPath = path.join(rootDir, file.path);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, file.content, "utf8");
  }

  return rootDir;
}

export async function cleanupProject(projectDir: string) {
  await rm(projectDir, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 500,
  });
}

export async function runNpmCommand(
  cwd: string,
  args: string[],
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string }> {
  const child = spawn(NPM_BIN, args, {
    cwd,
    env: { ...process.env, CI: "1" },
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";

  child.stdout?.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr?.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const timer = setTimeout(() => {
    child.kill();
  }, timeoutMs);

  const [code] = (await once(child, "exit")) as [number | null];
  clearTimeout(timer);

  if (code !== 0) {
    throw new Error(`Command npm ${args.join(" ")} failed.\n${stdout}\n${stderr}`);
  }

  return { stdout, stderr };
}

export async function getAvailablePort(): Promise<number> {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Failed to allocate a port.");
  }
  const port = address.port;
  server.close();
  await once(server, "close");
  return port;
}

export async function startDevServer(
  cwd: string,
  port: number,
): Promise<{ child: ChildProcess; url: string }> {
  const child = spawn(
    NPM_BIN,
    ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd,
      env: { ...process.env, CI: "1" },
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let stdout = "";
  let stderr = "";

  child.stdout?.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr?.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForUrl(url, 120000);
  } catch (error) {
    await stopProcess(child);
    throw new Error(`Timed out waiting for ${url}\n${stdout}\n${stderr}`, { cause: error });
  }

  return { child, url };
}

export async function stopProcess(child: ChildProcess) {
  if (child.exitCode !== null) return;

  if (process.platform === "win32" && child.pid) {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      shell: true,
    });
    await once(killer, "exit");
    return;
  }

  if (child.killed) return;
  child.kill();
  await once(child, "exit");
}

export async function waitForUrl(url: string, timeoutMs: number) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

export async function assertPageContains(url: string, expectedText: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.getByText(expectedText, { exact: false }).waitFor();
  } finally {
    await browser.close();
  }
}
