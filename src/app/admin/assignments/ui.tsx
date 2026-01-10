"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Student = { id: number; email: string; role: string };
type Lesson = { id: number; title: string; is_published: boolean; order: number };

type ApiPayload = {
  ok: boolean;
  students: Student[];
  lessons: Lesson[];
  assignedLessonIds: number[];
  error?: string;
};

export default function AdminAssignmentsClient({
  initialStudentId,
}: {
  initialStudentId: number | null;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [studentId, setStudentId] = useState<number | null>(initialStudentId);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [serverAssigned, setServerAssigned] = useState<Set<number>>(new Set());

  const dirty = useMemo(() => {
    if (!studentId) return false;
    if (selected.size !== serverAssigned.size) return true;
    for (const id of selected) if (!serverAssigned.has(id)) return true;
    return false;
  }, [studentId, selected, serverAssigned]);

  async function load(studentIdToLoad: number | null) {
    setLoading(true);
    setErr(null);

    const url = studentIdToLoad
      ? `/api/admin/assignments?studentId=${studentIdToLoad}`
      : `/api/admin/assignments`;

    const r = await fetch(url, { method: "GET" });
    const j = (await r.json().catch(() => null)) as ApiPayload | null;

    if (!r.ok || !j?.ok) {
      setErr(j?.error || "Не удалось загрузить данные");
      setLoading(false);
      return;
    }

    setStudents(j.students || []);
    setLessons(j.lessons || []);

    const ids = (j.assignedLessonIds || []).filter((x) => Number.isFinite(x) && x > 0);
    const s = new Set<number>(ids);

    setServerAssigned(s);
    setSelected(new Set<number>(ids));

    setLoading(false);
  }

  useEffect(() => {
    load(studentId);
  }, []);

  async function onChangeStudent(nextIdRaw: string) {
    const nextId = Number(nextIdRaw);
    const safe = Number.isFinite(nextId) && nextId > 0 ? nextId : null;

    setStudentId(safe);

    if (safe) router.push(`/admin/assignments?studentId=${safe}`);
    else router.push(`/admin/assignments`);

    await load(safe);
  }

  function toggleLesson(lessonId: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(lessonId)) n.delete(lessonId);
      else n.add(lessonId);
      return n;
    });
  }

  function selectAllPublished() {
    const ids = lessons.filter((l) => l.is_published).map((l) => l.id);
    setSelected(new Set(ids));
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function save() {
    if (!studentId) {
      setErr("Сначала выбери студента");
      return;
    }

    setSaving(true);
    setErr(null);

    const lessonIds = Array.from(selected);

    const r = await fetch(`/api/admin/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set",
        studentId,
        lessonIds,
      }),
    });

    const j = await r.json().catch(() => null);

    if (!r.ok || !j?.ok) {
      setErr(j?.error || "Не удалось сохранить назначения");
      setSaving(false);
      return;
    }

    const s = new Set<number>(lessonIds);
    setServerAssigned(s);
    setSelected(new Set<number>(lessonIds));

    setSaving(false);
  }

  if (loading) {
    return <div style={{ padding: 24, opacity: 0.75 }}>Загрузка...</div>;
  }

  return (
    <main style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.kicker}>Админ панель</div>
          <h1 style={s.h1}>Назначения уроков</h1>
          <div style={s.sub}>
            Выбираешь студента и отмечаешь, какие уроки ему доступны. Сохраняется одной кнопкой.
          </div>
        </div>

        <div style={s.headerRight}>
          <select
            value={studentId ?? ""}
            onChange={(e) => onChangeStudent(e.target.value)}
            style={s.select}
          >
            <option value="">Выбери студента</option>
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.email} (id: {st.id})
              </option>
            ))}
          </select>

          <button style={s.btn} onClick={() => load(studentId)} disabled={saving}>
            Обновить
          </button>

          <button style={s.btn} onClick={selectAllPublished} disabled={!studentId || saving}>
            Выбрать все опубликованные
          </button>

          <button style={s.btn} onClick={clearAll} disabled={!studentId || saving}>
            Снять все
          </button>

          <button style={dirty ? s.btnPrimary : s.btnMuted} onClick={save} disabled={!studentId || saving || !dirty}>
            {saving ? "Сохранение..." : dirty ? "Сохранить" : "Сохранено"}
          </button>
        </div>
      </div>

      {err ? (
        <div style={s.errBox}>
          <b>Ошибка</b>
          <div style={{ opacity: 0.85 }}>{err}</div>
        </div>
      ) : null}

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={{ ...s.th, width: 90 }}>Order</th>
              <th style={s.th}>Урок</th>
              <th style={{ ...s.th, width: 160 }}>Статус</th>
              <th style={{ ...s.th, width: 150 }}>Доступ</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => {
              const checked = selected.has(l.id);
              return (
                <tr key={l.id} style={s.tr}>
                  <td style={s.td}>
                    <span style={s.mono}>{l.order ?? 0}</span>
                  </td>

                  <td style={s.td}>
                    <div style={s.titleRow}>
                      <div style={s.title}>{l.title}</div>
                      <span style={s.idMuted}>ID: {l.id}</span>
                    </div>
                  </td>

                  <td style={s.td}>
                    <span style={l.is_published ? s.badgeGreen : s.badgeGray}>
                      {l.is_published ? "Опубликован" : "Черновик"}
                    </span>
                  </td>

                  <td style={s.td}>
                    <label style={s.checkRow}>
                      <input
                        type="checkbox"
                        disabled={!studentId}
                        checked={checked}
                        onChange={() => toggleLesson(l.id)}
                      />
                      <span style={{ opacity: studentId ? 0.9 : 0.6 }}>
                        {checked ? "Назначен" : "Не назначен"}
                      </span>
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={s.hint}>
          Подсказка: черновики можно назначать, но студент их всё равно не увидит, пока урок не опубликован.
        </div>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 1100, margin: "0 auto" },

  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  kicker: { opacity: 0.75, fontSize: 12, letterSpacing: 0.2 },
  h1: { margin: "6px 0 6px 0", fontSize: 28, lineHeight: 1.15 },
  sub: { opacity: 0.75, maxWidth: 640 },

  headerRight: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" },

  select: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    fontWeight: 800,
    fontSize: 13,
    outline: "none",
    minWidth: 280,
  },

  btn: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    color: "inherit",
  },
  btnPrimary: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.12)",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    color: "inherit",
  },
  btnMuted: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    fontWeight: 900,
    fontSize: 13,
    cursor: "default",
    color: "inherit",
    opacity: 0.75,
  },

  errBox: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(255,120,120,0.25)",
    background: "rgba(255,120,120,0.08)",
  },

  tableWrap: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  th: {
    textAlign: "left",
    fontSize: 12,
    letterSpacing: 0.2,
    opacity: 0.8,
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.08)" },
  td: { padding: "12px 14px", verticalAlign: "top" },

  mono: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 13,
    opacity: 0.9,
  },

  titleRow: { display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" },
  title: { fontWeight: 900, fontSize: 15 },
  idMuted: { opacity: 0.55, fontSize: 12 },

  badgeGreen: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(120,255,180,0.10)",
    color: "rgba(255,255,255,0.86)",
    whiteSpace: "nowrap",
  },
  badgeGray: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.86)",
    whiteSpace: "nowrap",
  },

  checkRow: { display: "flex", alignItems: "center", gap: 10 },
  hint: { padding: "12px 14px", opacity: 0.6, fontSize: 12 },
};
