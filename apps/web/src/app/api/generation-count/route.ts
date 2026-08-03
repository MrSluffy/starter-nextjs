import { NextResponse } from "next/server";
import { readStore } from "@mrsluffy/generator-core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({ count: store.count }, { headers: { "Cache-Control": "no-cache" } });
  } catch {
    return NextResponse.json({ count: 0 }, { headers: { "Cache-Control": "no-cache" } });
  }
}
