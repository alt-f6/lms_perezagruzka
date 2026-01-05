"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Student = { id: number; email: string; role: string };
type Lesson = { id: number; title: string; is_published: boolean; order: number };

export default function AdminAssignmentsClient({
  initialStudentId,
}: {
  initialStudentId: number | null;
}) {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [studentId, setStudentId] = useState<number | "">(initialStudentId ?? "");
  const [assigned, setAssigned] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const assignedSet = useMemo(() => new Set(assigned), [assigned]);

  async function load(studentIdParam?: number | "") {
    const qs = studentIdParam ? `?studentId=${studentIdParam}` : "";
    const r = await fetch(`/api/admin/assignments${qs}`, { cache: "no-store" });
    const data = await r.json();

    setStudents(data.students || []);
    setLessons(data.lessons || []);
    setAssigned(data.assignedLessonIds || []);
  }

  useEffect(() => {
    load(studentId);
  }, []);

  useEffect(() => {
    load(studentId);

    if (studentId) {
      router.replace(`/admin/assignments?studentId=${studentId}`);
    } else {
      router.replace(`/admin/assignments`);
    }
  }, [studentId]);

  async function toggle(lessonId: number) {
    if (!studentId) return;

    setLoading(true);
    setMsg(null);

    const has = assignedSet.has(lessonId);
    const action = has ? "revoke" : "grant";

    const r = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, lessonId, action }),
    });

    const data = await r.json();
    if (!r.ok || !data.ok) {
      setMsg(data.error || "Ошибка");
      setLoading(false);
      return;
    }

    await load(studentId);
    setLoading(false);
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin: Assignments</h1>

      <div style={{ margin: "12px 0" }}>
        <label>
          Студент:{" "}
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Выбери студента</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.email} (id: {s.id})
              </option>
            ))}
          </select>
        </label>
      </div>

      {!studentId ? (
        <p>Выбери студента, чтобы назначать уроки.</p>
      ) : (
        <div>
          <p>Уроки:</p>
          <ul>
            {lessons.map((l) => {
              const checked = assignedSet.has(l.id);
              return (
                <li key={l.id} style={{ marginBottom: 8 }}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(l.id)}
                      disabled={loading}
                    />
                    <span>
                      {l.title} (id: {l.id}, order: {l.order}, published: {String(l.is_published)})
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {msg ? <p style={{ color: "red" }}>{msg}</p> : null}
    </main>
  );
}
