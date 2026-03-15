/**
 * NPM Registry API helpers to resolve latest package versions for generator dependencies.
 * Uses https://registry.npmjs.org/ to keep generated package.json versions up to date.
 */

import semver from "semver";

const REGISTRY = "https://registry.npmjs.org";
const CACHE = new Map<string, { version: string; at: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface NpmPackageInfo {
  "dist-tags"?: Record<string, string>;
  versions?: Record<string, unknown>;
}

/** Registry URL path: for scoped packages (@scope/name), encode / as %2F and leave @ as-is. */
function packageRegistryPath(packageName: string): string {
  return packageName.startsWith("@")
    ? `@${packageName.slice(1).replace(/\//g, "%2F")}`
    : packageName;
}

export async function fetchPackageInfo(packageName: string): Promise<NpmPackageInfo> {
  const path = packageRegistryPath(packageName);
  const url = `${REGISTRY}/${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`npm registry: ${res.status} for ${packageName}`);
  }

  return (await res.json()) as NpmPackageInfo;
}

/**
 * Returns the latest version of a package. If range is "latest" or omitted, uses dist-tags.latest.
 * Otherwise finds the latest version satisfying the semver range.
 */
export async function getLatestVersion(packageName: string, range?: string): Promise<string> {
  const cacheKey = `${packageName}@${range ?? "latest"}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.version;
  }

  const info = await fetchPackageInfo(packageName);
  const versions = info.versions ?? {};
  const distTags = info["dist-tags"] ?? {};
  const versionList = Object.keys(versions);

  let version: string;

  if (!range || range === "latest") {
    version = distTags.latest ?? versionList.sort(semver.rcompare)[0];
  } else {
    let satisfying = versionList.filter((v) => semver.valid(v) && semver.satisfies(v, range));
    if (satisfying.length === 0) {
      satisfying = versionList.filter(
        (v) => semver.valid(v) && semver.satisfies(v, range, { includePrerelease: true }),
      );
    }
    version = satisfying.sort(semver.rcompare)[0];
  }

  if (!version) {
    throw new Error(`No version found for ${packageName}${range ? ` range ${range}` : ""}`);
  }

  CACHE.set(cacheKey, { version, at: Date.now() });
  return version;
}

/**
 * Resolve multiple package versions in parallel. Returns a map of package name -> latest version.
 * Ranges can be "latest" or any valid semver range (e.g. "^15", "^19.0.0").
 * If one package fails (e.g. network, 404), others still get resolved so we don't lose all "latest" data.
 */
export async function getLatestVersions(
  spec: Record<string, string>,
): Promise<Record<string, string>> {
  const results = await Promise.allSettled(
    Object.entries(spec).map(async ([name, range]) => {
      const version = await getLatestVersion(name, range);
      return [name, version] as const;
    }),
  );
  const entries: [string, string][] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      const [name, version] = result.value;
      entries.push([name, version]);
    } else {
      console.warn("[npmApi] Failed to resolve version:", result.reason?.message ?? result.reason);
    }
  }
  return Object.fromEntries(entries);
}
