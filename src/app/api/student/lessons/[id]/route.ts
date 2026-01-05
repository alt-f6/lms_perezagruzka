import { NextResponse } from "next/server";
import { requireRole } from "@/src/server/auth/require-role";
import { pool } from "@/src/server/db/pool";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await requireRole("student");
  const { id } = await ctx.params;

  const lessonId = Number(id);
  if (!Number.isFinite(lessonId)) {
    return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });
  }

  const r = await pool.query(
    `
    SELECT l.id, l.title, l.description, l.content, l."order"
    FROM assignments a
    JOIN lessons l ON l.id = a.lesson_id
    WHERE a.student_id = $1
      AND a.lesson_id = $2
      AND l.is_published = true
    LIMIT 1
    `,
    [user.id, lessonId]
  );

  const lesson = r.rows[0];
  if (!lesson) {
    return NextResponse.json({ ok: false, error: "no access" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lesson });
}
