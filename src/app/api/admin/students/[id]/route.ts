import { NextResponse } from "next/server";
import { pool } from "@/src/server/db/pool";
import { requireRoleApi } from "@/src/server/auth/require-role-api";

export const runtime = "nodejs";

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

async function readId(ctx: Ctx) {
  const p: any = await Promise.resolve((ctx as any).params);
  const id = Number(p?.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function DELETE(_: Request, ctx: Ctx) {
  const user = await requireRoleApi("admin");
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const id = await readId(ctx);
  if (!id) return NextResponse.json({ ok: false, error: "bad_id" }, { status: 400 });

  try {
    const r = await pool.query(
      `DELETE FROM users
       WHERE id=$1 AND role='student'
       RETURNING id`,
      [id]
    );

    if (r.rowCount === 0) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 409 });
  }
}
