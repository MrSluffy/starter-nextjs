import { NextRequest, NextResponse } from "next/server";
import type { GeneratorConfig } from "@/store/generatorStore";
import { resolveDependencyVersions } from "@/lib/generator/packageJson";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST with GeneratorConfig in body. Returns resolved latest versions from npm registry
 * for the selected Next.js version and all chosen dependencies (styling, state, API, auth, etc.).
 */
export async function POST(req: NextRequest) {
  try {
    const cfg = (await req.json()) as GeneratorConfig;
    const versions = await resolveDependencyVersions(cfg);
    return NextResponse.json({ versions });
  } catch (err) {
    console.error("[/api/versions] Error:", err);
    return NextResponse.json(
      { error: "Failed to resolve versions from npm registry." },
      { status: 500 },
    );
  }
}
