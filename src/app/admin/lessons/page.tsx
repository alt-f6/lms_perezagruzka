import { pool } from "@/src/server/db/pool";

export default async function AdminLessonsPage() {
  const r = await pool.query(
    `SELECT id, title, description, is_published, "order"
     FROM lessons
     ORDER BY "order" ASC, id ASC`
  );

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin: Lessons</h1>
      <ul>
        {r.rows.map((l: any) => (
          <li key={l.id} style={{ marginBottom: 12 }}>
            <div>
              <b>{l.title}</b> (order: {l.order})
            </div>
            <div>{l.description}</div>
            <div>published: {String(l.is_published)}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
