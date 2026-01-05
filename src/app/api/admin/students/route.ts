import { NextResponse } from "next/server";
import { requireRole } from "@/src/server/auth/require-role";
import { pool } from "@/src/server/db/pool";

export async function GET() {
  await requireRole("admin");

  const result = await pool.query(`
    SELECT id, email
    FROM users
    WHERE role = 'student'
    ORDER BY id
  `);

  return NextResponse.json({
    ok: true,
    students: result.rows,
  });
}
