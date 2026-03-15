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

export async function fetchPackageInfo(packageName: string): Promise<NpmPackageInfo> {
  const encoded = encodeURIComponent(packageName);
  const url = `${REGISTRY}/${encoded}`;
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
    const satisfying = versionList.filter((v) => semver.valid(v) && semver.satisfies(v, range));
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
 */
export async function getLatestVersions(
  spec: Record<string, string>,
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.entries(spec).map(async ([name, range]) => {
      const version = await getLatestVersion(name, range);
      return [name, version] as const;
    }),
  );
  return Object.fromEntries(entries);
}
