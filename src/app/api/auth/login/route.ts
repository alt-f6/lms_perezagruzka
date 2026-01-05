import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { pool } from "@/src/server/db/pool";
import { createSession, cookieName, sign } from "@/src/server/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "email and password required" }, { status: 400 });
    }

    const r = await pool.query(
      "SELECT id, password_hash FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    const user = r.rows[0];
    if (!user) {
      return NextResponse.json({ ok: false, error: "invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "invalid credentials" }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id);

    const secure = String(process.env.COOKIE_SECURE || "false") === "true";
    const jar = await cookies();
    jar.set(cookieName(), sign(token), {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "login error" }, { status: 500 });
  }
}
