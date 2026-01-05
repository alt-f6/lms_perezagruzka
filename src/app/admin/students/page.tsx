import Link from "next/link";
import { requireRole } from "@/src/server/auth/require-role";
import { listStudents } from "@/src/server/repos/assignments.repo";

export default async function AdminStudentsPage() {
  await requireRole("admin");

  const students = await listStudents();

  return (
    <main style={{ padding: 24 }}>
      <h1>Ученики</h1>
      <p>Клик по ученику откроет страницу доступов.</p>

      {students.length === 0 ? (
        <p>Студентов пока нет.</p>
      ) : (
        <ul>
          {students.map((s) => (
            <li key={s.id} style={{ marginBottom: 8 }}>
              <Link href={`/admin/assignments?studentId=${s.id}`}>
                {s.email} (id: {s.id})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
