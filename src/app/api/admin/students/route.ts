import { NextResponse } from "next/server";
import { pool } from "@/src/server/db/pool";
import { requireRoleApi } from "@/src/server/auth/require-role-api";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export async function GET() {
  await requireRoleApi("admin");

  const r = await pool.query(
    `SELECT id, email, role, first_name, last_name
     FROM users
     WHERE role = 'student'
     ORDER BY id DESC`
  );

  return NextResponse.json({ ok: true, students: r.rows ?? [] });
}

export async function POST(req: Request) {
  await requireRoleApi("admin");

  const body = await req.json().catch(() => ({} as any));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const first_name = String(body.first_name ?? "").trim();
  const last_name = String(body.last_name ?? "").trim();

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "bad_email" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "weak_password" }, { status: 400 });
  }
  if (!first_name || !last_name) {
    return NextResponse.json({ ok: false, error: "bad_name" }, { status: 400 });
  }

  const existing = await pool.query(`SELECT 1 FROM users WHERE email=$1 LIMIT 1`, [email]);
  if (existing.rows?.[0]) {
    return NextResponse.json({ ok: false, error: "email_exists" }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const ins = await pool.query(
    `INSERT INTO users (email, password_hash, role, first_name, last_name)
     VALUES ($1, $2, 'student', $3, $4)
     RETURNING id, email, role, first_name, last_name`,
    [email, password_hash, first_name, last_name]
  );

  return NextResponse.json({ ok: true, student: ins.rows[0] });
}
