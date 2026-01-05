"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lesson = { id: number; title: string; description: string; order: number };

export default function StudentLessonsListPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/lessons")
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) return setErr(data.error || "Ошибка");
        setLessons(data.lessons || []);
      })
      .catch(() => setErr("Ошибка загрузки"));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Student: Уроки</h1>

      {err ? <p style={{ color: "red" }}>{err}</p> : null}

      {lessons.length === 0 ? (
        <p>Пока нет назначенных уроков.</p>
      ) : (
        <ul>
          {lessons.map((l) => (
            <li key={l.id} style={{ marginBottom: 10 }}>
              <div>
                <b>{l.title}</b> (order: {l.order})
              </div>
              <div>{l.description}</div>
              <Link href={`/student/lessons/${l.id}`}>Открыть</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
