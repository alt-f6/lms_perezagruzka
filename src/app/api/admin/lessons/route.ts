import { NextResponse } from "next/server";
import { pool } from "@/src/server/db/pool";
import { requireRoleApi } from "@/src/server/auth/require-role-api";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireRoleApi("admin");
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const r = await pool.query(
    `SELECT id, title, description, content, is_published, "order"
     FROM lessons
     ORDER BY "order" ASC, id ASC`
  );

  return NextResponse.json({ ok: true, lessons: r.rows });
}

export async function POST() {
  const user = await requireRoleApi("admin");
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const r = await pool.query(
    `
    INSERT INTO lessons (title, description, content, is_published, "order")
    VALUES (
      $1,
      $2,
      $3,
      false,
      COALESCE((SELECT MAX("order") FROM lessons), 0) + 1
    )
    RETURNING id, title, description, content, is_published, "order"
    `,
    ["Новый урок", "", ""]
  );

  return NextResponse.json({ ok: true, lesson: r.rows[0] });
}


