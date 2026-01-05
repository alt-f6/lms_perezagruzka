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
