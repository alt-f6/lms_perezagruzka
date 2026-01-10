import { NextResponse } from "next/server";
import { pool } from "@/src/server/db/pool";
import { requireRoleApi } from "@/src/server/auth/require-role-api";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

async function readId(ctx: Ctx) {
  const p: any = await Promise.resolve((ctx as any).params);
  const id = Number(p?.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function validatePassword(pw: string) {
  if (pw.length < 8) return "password_too_short";
  if (pw.length > 200) return "password_too_long";
  return null;
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await requireRoleApi("admin");
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const id = await readId(ctx);
  if (!id) return NextResponse.json({ ok: false, error: "bad_id" }, { status: 400 });

  const body = await req.json().catch(() => ({} as any));
  const newPassword = String((body as any).newPassword || "");
  const confirmPassword = String((body as any).confirmPassword || "");

  if (!newPassword) {
    return NextResponse.json({ ok: false, error: "new_password_required" }, { status: 400 });
  }
  if (confirmPassword && confirmPassword !== newPassword) {
    return NextResponse.json({ ok: false, error: "password_mismatch" }, { status: 400 });
  }

  const v = validatePassword(newPassword);
  if (v) return NextResponse.json({ ok: false, error: v }, { status: 400 });

  const u = await pool.query(`SELECT id, email, role FROM users WHERE id=$1`, [id]);
  if (u.rowCount === 0) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (u.rows[0].role !== "student") return NextResponse.json({ ok: false, error: "not_student" }, { status: 400 });

  const password_hash = await bcrypt.hash(newPassword, 10);

  await pool.query(`UPDATE users SET password_hash=$2 WHERE id=$1`, [id, password_hash]);

  await pool.query(`DELETE FROM sessions WHERE user_id=$1`, [id]);

  return NextResponse.json({
    ok: true,
    student: { id: u.rows[0].id, email: u.rows[0].email },
  });
}
