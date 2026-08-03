import { NextRequest, NextResponse } from "next/server";
import type { GeneratorConfig } from "@mrsluffy/generator-core";
import { resolveDependencyVersions } from "@mrsluffy/generator-core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 15; // max requests per window per IP

const cache = new Map<string, { versions: Record<string, string>; at: number }>();
const rateLimit = new Map<string, number[]>();

function getClientId(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const cut = now - RATE_LIMIT_WINDOW_MS;
  let times = rateLimit.get(clientId) ?? [];
  times = times.filter((t) => t > cut);
  if (times.length >= RATE_LIMIT_MAX) return true;
  times.push(now);
  rateLimit.set(clientId, times);
  return false;
}

function configKey(cfg: GeneratorConfig): string {
  return JSON.stringify({
    nextVersion: cfg.nextVersion,
    language: cfg.language,
    styling: cfg.styling,
    stateManagement: cfg.stateManagement,
    apiLayer: cfg.apiLayer,
    auth: cfg.auth,
    database: cfg.database,
    orm: cfg.orm,
    testing: cfg.testing,
    extras: cfg.extras,
  });
}

function pruneStale(): void {
  const now = Date.now();
  for (const [k, v] of cache.entries()) {
    if (now - v.at > CACHE_TTL_MS) cache.delete(k);
  }
  const cut = now - RATE_LIMIT_WINDOW_MS;
  for (const [clientId, times] of rateLimit.entries()) {
    const kept = times.filter((t) => t > cut);
    if (kept.length === 0) rateLimit.delete(clientId);
    else rateLimit.set(clientId, kept);
  }
}

/**
 * POST with GeneratorConfig in body. Returns resolved latest versions from npm registry.
 * Cached per config for 3 minutes. Rate limited to 15 requests per minute per IP.
 */
export async function POST(req: NextRequest) {
  pruneStale();
  const clientId = getClientId(req);
  if (isRateLimited(clientId)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  try {
    const cfg = (await req.json()) as GeneratorConfig;
    const key = configKey(cfg);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return NextResponse.json({ versions: cached.versions });
    }

    const versions = await resolveDependencyVersions(cfg);
    cache.set(key, { versions, at: Date.now() });
    return NextResponse.json({ versions });
  } catch (err) {
    console.error("[/api/versions] Error:", err);
    return NextResponse.json(
      { error: "Failed to resolve versions from npm registry." },
      { status: 500 },
    );
  }
}
