"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateLessonButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createLesson() {
    if (loading) return;
    setLoading(true);

    const r = await fetch("/api/admin/lessons", { method: "POST" });
    const j = await r.json().catch(() => null);

    if (!r.ok || !j?.ok || !j?.lesson?.id) {
      setLoading(false);
      alert(j?.error || "Не удалось создать урок");
      return;
    }

    router.push(`/admin/lessons/${j.lesson.id}`);
  }

  return (
    <button
      onClick={createLesson}
      disabled={loading}
      style={{
        padding: "9px 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.12)",
        fontWeight: 900,
        fontSize: 13,
        cursor: loading ? "default" : "pointer",
        color: "inherit",
      }}
    >
      {loading ? "Создаю..." : "Создать урок"}
    </button>
  );
}
