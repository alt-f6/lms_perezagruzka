import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, verify, deleteSession } from "@/src/server/auth/session";

export async function POST() {
  try {
    const jar = await cookies();
    const raw = jar.get(cookieName())?.value;

    if (raw) {
      const token = verify(raw);
      if (token) await deleteSession(token);
    }

    jar.set(cookieName(), "", {
      httpOnly: true,
      secure: String(process.env.COOKIE_SECURE || "false") === "true",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "logout error" }, { status: 500 });
  }
}
