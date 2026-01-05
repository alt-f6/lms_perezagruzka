"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string | null;
  order: number;
};

export default function StudentLessonPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/student/lessons/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          setErr(data.error || "Нет доступа");
          return;
        }
        setLesson(data.lesson);
      })
      .catch(() => setErr("Ошибка загрузки"));
  }, [id]);

  if (err) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Ошибка</h1>
        <p>{err}</p>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main style={{ padding: 24 }}>
        <p>Загрузка...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{lesson.title}</h1>
      <p>{lesson.description}</p>
      <hr />
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {lesson.content || "Контент пока пуст."}
      </pre>
    </main>
  );
}
