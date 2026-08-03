import { NextRequest, NextResponse } from "next/server";
import type { GeneratorConfig } from "@mrsluffy/generator-core";
import { resolveDependencyVersions, buildPackageJson, runNpmAudit } from "@mrsluffy/generator-core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST with GeneratorConfig in body. Resolves dependency versions, then runs npm audit
 * on the resulting set. Returns vulnerabilities and summary so the UI can warn the user.
 */
export async function POST(req: NextRequest) {
  try {
    const cfg = (await req.json()) as GeneratorConfig;
    const versions = await resolveDependencyVersions(cfg);
    const pkg = buildPackageJson(cfg, versions) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const { vulnerabilities, summary } = await runNpmAudit(pkg.dependencies, pkg.devDependencies);
    return NextResponse.json({
      versions,
      vulnerabilities,
      summary,
    });
  } catch (err) {
    console.error("[/api/audit] Error:", err);
    return NextResponse.json({ error: "Failed to run vulnerability check." }, { status: 500 });
  }
}
