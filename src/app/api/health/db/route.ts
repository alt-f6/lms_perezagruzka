import { NextResponse } from "next/server";
import { pool } from "@/src/server/db/pool";

export const runtime = "nodejs";

export async function GET() {
  try {
    const r = await pool.query("SELECT 1 as ok");
    return NextResponse.json({ ok: r.rows?.[0]?.ok === 1 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "db error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
