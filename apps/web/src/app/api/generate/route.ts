import { NextRequest, NextResponse } from "next/server";
import type { GeneratorConfig } from "@mrsluffy/generator-core";
import { buildZip, recordGeneration } from "@mrsluffy/generator-core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const cfg = (await req.json()) as GeneratorConfig;

    if (!cfg.projectName || !/^[a-z0-9-]+$/.test(cfg.projectName)) {
      return NextResponse.json(
        { error: "Invalid project name. Use lowercase letters, numbers, and hyphens." },
        { status: 400 },
      );
    }

    const zipBuffer = await buildZip(cfg);

    // Record generation before returning response to ensure count is updated
    // when the client refetches
    await recordGeneration(cfg.projectName).catch(() => {});

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${cfg.projectName}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("[/api/generate] Error:", err);
    return NextResponse.json({ error: "Failed to generate project." }, { status: 500 });
  }
}
