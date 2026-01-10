import { pool } from "@/src/server/db/pool";

export async function listStudents() {
  const r = await pool.query(
    `SELECT id, email, role
     FROM users
     WHERE role = 'student'
     ORDER BY id ASC`
  );
  return r.rows;
}

export async function listLessons() {
  const r = await pool.query(
    `SELECT id, title, is_published, "order"
     FROM lessons
     ORDER BY "order" ASC, id ASC`
  );
  return r.rows;
}

export async function listAssignmentsForStudent(studentId: number) {
  const r = await pool.query(
    `SELECT lesson_id
     FROM assignments
     WHERE student_id = $1`,
    [studentId]
  );
  return r.rows.map((x: any) => Number(x.lesson_id));
}

export async function grantLesson(studentId: number, lessonId: number) {
  await pool.query(
    `INSERT INTO assignments (student_id, lesson_id)
     VALUES ($1, $2)
     ON CONFLICT (student_id, lesson_id) DO NOTHING`,
    [studentId, lessonId]
  );
}

export async function revokeLesson(studentId: number, lessonId: number) {
  await pool.query(
    `DELETE FROM assignments
     WHERE student_id = $1 AND lesson_id = $2`,
    [studentId, lessonId]
  );
}

export async function setAssignmentsForStudent(studentId: number, lessonIds: number[]) {
  await pool.query("BEGIN");
  try {
    await pool.query(`DELETE FROM assignments WHERE student_id = $1`, [studentId]);

    const ids = Array.from(new Set(lessonIds))
      .map((x) => Number(x))
      .filter((x) => Number.isFinite(x) && x > 0);

    if (ids.length > 0) {
      const values: any[] = [];
      const placeholders = ids
        .map((lessonId, i) => {
          values.push(studentId, lessonId);
          const p1 = i * 2 + 1;
          const p2 = i * 2 + 2;
          return `($${p1}, $${p2})`;
        })
        .join(", ");

      await pool.query(
        `INSERT INTO assignments (student_id, lesson_id)
         VALUES ${placeholders}
         ON CONFLICT (student_id, lesson_id) DO NOTHING`,
        values
      );
    }

    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  }
}
