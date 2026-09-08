import { NextResponse } from "next/server";
import { getBabyState } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getBabyState();
  return NextResponse.json(state, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
