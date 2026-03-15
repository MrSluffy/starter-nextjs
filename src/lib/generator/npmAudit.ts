/**
 * Runs npm audit on a set of dependencies and returns a normalized list of vulnerabilities.
 * Uses a temporary directory and npm audit --json so results match what users would see
 * after installing the generated project.
 */

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export interface Vulnerability {
  package: string;
  severity: "info" | "low" | "moderate" | "high" | "critical";
  title: string;
  url: string;
  range?: string;
}

export interface AuditResult {
  vulnerabilities: Vulnerability[];
  summary: { info: number; low: number; moderate: number; high: number; critical: number };
}

interface NpmAuditJson {
  vulnerabilities?: Record<
    string,
    {
      severity: string;
      via?: (string | { id: string; title?: string; url?: string })[];
      range?: string;
    }
  >;
  metadata?: {
    vulnerabilities?: {
      info?: number;
      low?: number;
      moderate?: number;
      high?: number;
      critical?: number;
    };
  };
}

function parseAuditOutput(stdout: string): AuditResult {
  const empty: AuditResult = {
    vulnerabilities: [],
    summary: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 },
  };

  let data: NpmAuditJson;
  try {
    data = JSON.parse(stdout) as NpmAuditJson;
  } catch {
    return empty;
  }

  const vulnList: Vulnerability[] = [];
  const vulns = data.vulnerabilities ?? {};
  const severityOrder = ["info", "low", "moderate", "high", "critical"] as const;

  for (const [pkgPath, entry] of Object.entries(vulns)) {
    const pkgName = pkgPath.startsWith("node_modules/")
      ? pkgPath
          .replace(/^node_modules\//, "")
          .split("/")
          .slice(0, 2)
          .join("/")
      : pkgPath;
    const severity = severityOrder.includes(entry.severity as (typeof severityOrder)[number])
      ? (entry.severity as (typeof severityOrder)[number])
      : "moderate";
    const via = entry.via;
    const first = Array.isArray(via) ? via[0] : via;
    const title =
      typeof first === "object" && first?.title
        ? first.title
        : typeof first === "string"
          ? first
          : "Vulnerability";
    const url =
      typeof first === "object" && first?.url
        ? first.url
        : `https://github.com/advisories/${typeof first === "object" && first?.id ? first.id : (first ?? "unknown")}`;

    vulnList.push({
      package: pkgName,
      severity,
      title,
      url: url.startsWith("http") ? url : `https://github.com/advisories/${url}`,
      range: entry.range,
    });
  }

  const meta = data.metadata?.vulnerabilities ?? {};
  const summary = {
    info: meta.info ?? 0,
    low: meta.low ?? 0,
    moderate: meta.moderate ?? 0,
    high: meta.high ?? 0,
    critical: meta.critical ?? 0,
  };

  return { vulnerabilities: vulnList, summary };
}

/**
 * Runs npm audit on the given dependencies in a temporary directory.
 * Returns vulnerabilities and counts by severity. If npm audit fails for reasons
 * other than found vulnerabilities (e.g. no npm), returns empty result.
 */
export function runNpmAudit(
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
): AuditResult {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "starter-nextjs-audit-"));
  try {
    const pkg = {
      name: "audit-check",
      version: "0.0.0",
      private: true,
      dependencies,
      devDependencies,
    };
    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify(pkg, null, 2));

    spawnSync("npm", ["install", "--package-lock-only", "--no-audit"], {
      cwd: tmpDir,
      encoding: "utf-8",
      timeout: 60_000,
    });

    const result = spawnSync("npm", ["audit", "--json"], {
      cwd: tmpDir,
      encoding: "utf-8",
      maxBuffer: 4 * 1024 * 1024,
    });
    const stdout = typeof result.stdout === "string" ? result.stdout : "";
    if (stdout.trim()) return parseAuditOutput(stdout);
    return {
      vulnerabilities: [],
      summary: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 },
    };
  } catch {
    return {
      vulnerabilities: [],
      summary: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 },
    };
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
