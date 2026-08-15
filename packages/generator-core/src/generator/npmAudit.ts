/**
 * Vulnerability check for the exact package@version list that will be in the generated project.
 * Uses the OSV (Open Source Vulnerabilities) API — no npm install, no lockfile, no Node required
 * for the check. The generated zip only has package.json; we audit those direct dependencies.
 */

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

const OSV_QUERY_URL = "https://api.osv.dev/v1/query";

interface OsvVuln {
  id?: string;
  summary?: string;
  details?: string;
  references?: { url?: string }[];
  affected?: { ecosystem_specific?: { severity?: string } }[];
}

function severityFromOsv(sev: string | undefined): Vulnerability["severity"] {
  const s = (sev ?? "").toLowerCase();
  if (s === "critical") return "critical";
  if (s === "high") return "high";
  if (s === "moderate" || s === "medium") return "moderate";
  if (s === "low") return "low";
  if (s === "info" || s === "none") return "info";
  return "moderate";
}

async function queryOsv(packageName: string, version: string): Promise<OsvVuln[]> {
  const res = await fetch(OSV_QUERY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      package: { name: packageName, ecosystem: "npm" },
      version,
    }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { vulns?: OsvVuln[] };
  return data.vulns ?? [];
}

/**
 * Runs a vulnerability check for the given package@version map (direct dependencies only).
 * Uses the OSV API — no lockfile, no npm install. Matches what the generated project
 * actually ships: a package.json with no lockfile and no node_modules.
 */
export async function runNpmAudit(
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
): Promise<AuditResult> {
  const allEntries = [...Object.entries(dependencies), ...Object.entries(devDependencies)] as [
    string,
    string,
  ][];

  const versionByPackage = new Map<string, string>();
  for (const [name, rangeOrVersion] of allEntries) {
    const raw = rangeOrVersion.replace(/^[\^~>=<]/, "").trim();
    const version = raw.split("-")[0].split(" ")[0];
    if (version && /^\d+\.\d+/.test(version)) {
      versionByPackage.set(name, version);
    }
  }

  const summary = { info: 0, low: 0, moderate: 0, high: 0, critical: 0 };
  const vulnList: Vulnerability[] = [];
  const seen = new Set<string>();

  const queries = Array.from(versionByPackage.entries()).map(([name, version]) =>
    queryOsv(name, version).then((vulns) => ({ name, version, vulns })),
  );

  const results = await Promise.all(queries);

  for (const { name, version, vulns } of results) {
    for (const v of vulns) {
      const id = v.id ?? "unknown";
      const key = `${name}@${version}:${id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const severity =
        v.affected?.[0]?.ecosystem_specific?.severity != null
          ? severityFromOsv(v.affected[0].ecosystem_specific.severity)
          : "moderate";
      summary[severity] += 1;

      const url =
        v.references?.[0]?.url ??
        (id.startsWith("GHSA-") ? `https://github.com/advisories/${id}` : `https://osv.dev/${id}`);
      vulnList.push({
        package: name,
        severity,
        title: v.summary ?? id,
        url: url.startsWith("http") ? url : `https://osv.dev/${id}`,
        range: version,
      });
    }
  }

  return { vulnerabilities: vulnList, summary };
}
