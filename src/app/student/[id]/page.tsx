import { pool } from "@/src/server/db/pool";
import { requireRolePage } from "@/src/server/auth/require-role-page";

export default async function StudentLessonPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRolePage("student");
  const lessonId = Number(params.id);

  if (!Number.isFinite(lessonId)) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Ошибка</h1>
        <p>Неверный id урока</p>
      </main>
    );
  }

  const r = await pool.query(
    `SELECT l.id, l.title, l.description, l.content
     FROM assignments a
     JOIN lessons l ON l.id = a.lesson_id
     WHERE a.student_id = $1
       AND l.is_published = true
       AND l.id = $2
     LIMIT 1`,
    [user.id, lessonId]
  );

  const lesson = r.rows[0];

  if (!lesson) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Нет доступа</h1>
        <p>Урок не назначен или не опубликован.</p>
        <p>
          <a href="/student">Назад</a>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{lesson.title}</h1>
      <p>{lesson.description}</p>
      <hr />
      <pre style={{ whiteSpace: "pre-wrap" }}>{lesson.content}</pre>
      <p>
        <a href="/student">Назад к списку</a>
      </p>
    </main>
  );
}
