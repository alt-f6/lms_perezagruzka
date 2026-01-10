"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lesson = {
  id: number;
  title: string;
  description: string;
  order: number;
};

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const r = await fetch("/api/student/lessons", { cache: "no-store" });
        const data = await r.json().catch(() => null);

        if (!alive) return;

        if (!data?.ok) {
          setErr(data?.error || "Ошибка загрузки");
          setLessons([]);
          return;
        }

        setLessons(Array.isArray(data.lessons) ? data.lessons : []);
      } catch {
        if (!alive) return;
        setErr("Ошибка загрузки");
        setLessons([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main style={s.page}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.kicker}>Личный кабинет</div>
          <h1 style={s.h1}>Уроки</h1>
          <div style={s.sub}>Здесь только те уроки, которые тебе назначил админ.</div>
        </div>

        <div style={s.badges}>
          <span style={s.badge}>Доступны</span>
          <span style={s.badge}>{lessons.length} урок(ов)</span>
        </div>
      </div>

      {loading ? <div style={s.muted}>Загрузка…</div> : null}
      {err ? <div style={s.empty}>{err}</div> : null}

      <div style={s.grid}>
        {lessons.map((l) => (
          <div key={l.id} style={s.card}>
            <div style={s.cardTop}>
              <span style={s.pill}>Урок {l.order}</span>
              <span style={s.pill}>Доступен</span>
            </div>

            <div style={s.title} title={l.title}>
              {l.title}
            </div>

            {l.description ? (
              <div style={s.desc} title={l.description}>
                {l.description}
              </div>
            ) : (
              <div style={{ ...s.desc, opacity: 0.5 }}>Без описания</div>
            )}

            <div style={s.bottomRow}>
              <div style={s.meta}>ID: {l.id}</div>
              <Link href={`/student/lessons/${l.id}`} style={s.openBtn}>
                Открыть
              </Link>
            </div>
          </div>
        ))}

        {!loading && lessons.length === 0 ? (
          <div style={{ ...s.empty, gridColumn: "1 / -1" }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Пока нет уроков</div>
            <div style={{ opacity: 0.75 }}>Админ ещё не выдал тебе доступ.</div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

const clamp = (lines: number): React.CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
});

const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 1100, margin: "0 auto" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 18,
  },

  headerLeft: { minWidth: 0 },

  kicker: { opacity: 0.7, fontSize: 12, marginBottom: 6 },

  h1: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.15,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  sub: { marginTop: 8, opacity: 0.75, fontSize: 14, lineHeight: 1.35 },

  badges: { display: "flex", gap: 8, flexWrap: "wrap" },

  badge: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    padding: "7px 10px",
    borderRadius: 999,
    fontSize: 12,
    opacity: 0.9,
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 14,
  },

  card: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    minHeight: 170,
    display: "flex",
    flexDirection: "column",
    minWidth: 0, 
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },

  pill: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  title: {
    fontWeight: 900,
    fontSize: 18,
    lineHeight: 1.2,
    opacity: 0.9,
    marginBottom: 8,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    minWidth: 0,
    ...clamp(2),
  },

  desc: {
    opacity: 0.78,
    fontSize: 14,
    lineHeight: 1.4,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    minWidth: 0,
    ...clamp(3),
  },

  bottomRow: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
  },

  meta: { fontSize: 12, opacity: 0.7 },

  openBtn: {
    display: "inline-block",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 13,
    color: "inherit",
    whiteSpace: "nowrap",
  },

  empty: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 18,
  },

  muted: { opacity: 0.7, fontSize: 13 },
};
