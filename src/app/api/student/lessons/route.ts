import { NextResponse  } from "next/server";
import { requireRoleApi} from "@/src/server/auth/require-role-api";
import { pool } from "@/src/server/db/pool";

export async function GET() {
  const user = await requireRoleApi("student");

  const r = await pool.query(
    `
    SELECT l.id, l.title, l.description, l."order"
    FROM assignments a
    JOIN lessons l ON l.id = a.lesson_id
    WHERE a.student_id = $1
      AND l.is_published = true
    ORDER BY l."order" ASC, l.id ASC
    `,
    [user.id]
  );

  return NextResponse.json({ ok: true, lessons: r.rows });
}