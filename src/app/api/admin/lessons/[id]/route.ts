import { NextResponse } from "next/server";
import { pool } from "@/src/server/db/pool";
import { requireRoleApi } from "@/src/server/auth/require-role-api";

export const runtime = "nodejs";

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

async function readLessonId(ctx: Ctx) {
  const p: any = await Promise.resolve((ctx as any).params);
  const id = Number(p?.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function GET(_: Request, ctx: Ctx) {
  const user = await requireRoleApi("admin");
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const lessonId = await readLessonId(ctx);
  if (!lessonId) return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });

  const r = await pool.query(
    `SELECT id, title, description, content, "order", is_published
     FROM lessons
     WHERE id = $1`,
    [lessonId]
  );

  if (r.rowCount === 0) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lesson: r.rows[0] });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await requireRoleApi("admin");
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const lessonId = await readLessonId(ctx);
  if (!lessonId) return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });

  const body = await req.json().catch(() => ({} as any));

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "");
  const content = String(body.content ?? "");
  const order = Number(body.order ?? 0);
  const is_published = Boolean(body.is_published);

  if (!title) return NextResponse.json({ ok: false, error: "title_required" }, { status: 400 });

  const r = await pool.query(
    `UPDATE lessons
     SET title=$2, description=$3, content=$4, "order"=$5, is_published=$6
     WHERE id=$1
     RETURNING id, title, description, content, "order", is_published`,
    [lessonId, title, description, content, order, is_published]
  );

  if (r.rowCount === 0) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lesson: r.rows[0] });
}
