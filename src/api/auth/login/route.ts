import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { pool } from "@/src/server/db/pool";
import { createSession, cookieName, sign } from "@/src/server/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String((body as any).email || "").trim().toLowerCase();
    const password = String((body as any).password || "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "email and password required" },
        { status: 400 }
      );
    }

    const r = await pool.query(
      "SELECT id, email, role, password_hash FROM users WHERE email=$1 LIMIT 1",
      [email]
    );

    const user = r.rows[0] as
      | { id: number; email: string; role: string; password_hash: string }
      | undefined;

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "invalid credentials" },
        { status: 401 }
      );
    }

    const { token, expiresAt } = await createSession(user.id);

    const secure = String(process.env.COOKIE_SECURE || "false") === "true";

    const res = NextResponse.json({ ok: true });

    res.cookies.set(cookieName(), sign(token), {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "login error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
