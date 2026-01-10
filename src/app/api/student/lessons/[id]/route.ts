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
  const user = await requireRoleApi("student");

  const lessonId = await readLessonId(ctx);
  if (!lessonId) {
    return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });
  }

  const access = await pool.query(
    `SELECT 1 FROM assignments WHERE student_id=$1 AND lesson_id=$2 LIMIT 1`,
    [user.id, lessonId]
  );
  if (!access.rows[0]) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const lessonRes = await pool.query(
    `SELECT id, title, description, content
     FROM lessons
     WHERE id=$1 AND is_published=true
     LIMIT 1`,
    [lessonId]
  );

  const lesson = lessonRes.rows[0];
  if (!lesson) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const mediaRes = await pool.query(
    `SELECT id, title, embed_url, "order"
     FROM lesson_media
     WHERE lesson_id=$1 AND is_public=true
     ORDER BY "order" ASC, id ASC`,
    [lessonId]
  );

  return NextResponse.json({
    ok: true,
    lesson,
    media: mediaRes.rows,
  });
}
