import { NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { cookieName, verify, deleteSession } from "@/src/server/auth/session";

export const runtime = "nodejs";

async function requireSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");

  if (!origin || !host) return false;

  try {
    const u = new URL(origin);
    return u.host === host;
  } catch {
    return false;
  }
}

export async function POST() {
  try {
    if (!(await requireSameOrigin())) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const jar = await cookies();
    const raw = jar.get(cookieName())?.value;

    if (raw) {
      const token = verify(raw);
      if (token) await deleteSession(token);
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set(cookieName(), "", {
      httpOnly: true,
      secure: String(process.env.COOKIE_SECURE || "false") === "true",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "logout error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
