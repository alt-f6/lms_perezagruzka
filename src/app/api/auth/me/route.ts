import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, verify, getUserBySession } from "@/src/server/auth/session";

export async function GET() {
  try {
    const jar = await cookies();
    const raw = jar.get(cookieName())?.value;
    if (!raw) return NextResponse.json({ ok: true, user: null });

    const token = verify(raw);
    if (!token) return NextResponse.json({ ok: true, user: null });

    const user = await getUserBySession(token);
    return NextResponse.json({ ok: true, user: user ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "me error" }, { status: 500 });
  }
}
