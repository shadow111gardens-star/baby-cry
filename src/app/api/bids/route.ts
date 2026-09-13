import { NextResponse } from "next/server";
import { getBabyState } from "@/lib/state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getBabyState();

  return NextResponse.json(state, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Contributions must be completed through the payment checkout.",
    },
    { status: 405 }
  );
}