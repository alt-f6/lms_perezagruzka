"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lesson = {
  id: number;
  title: string;
  description: string;
  order: number;
};

export default function StudentLessonsClient() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  async function load() {
    const r = await fetch("/api/student/lessons", { cache: "no-store" });
    const j = await r.json();
    if (j.ok) setLessons(j.lessons ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.kicker}>Личный кабинет</div>
          <h1 style={s.h1}>Уроки</h1>
          <div style={s.sub}>Здесь только те уроки, которые тебе назначил админ.</div>
        </div>

        <div style={s.badges}>
          <span style={s.badge}>Доступны</span>
          <span style={s.badge}>{lessons.length} урок(ов)</span>
        </div>
      </div>

      <div style={s.grid}>
        {lessons.map((l) => (
          <div key={l.id} style={s.card}>
            <div style={s.cardTop}>
              <span style={s.pill}>Урок {l.order}</span>
              <span style={{ ...s.pill, opacity: 0.9 }}>Доступен</span>
            </div>

            <div style={s.title} title={l.title}>
              {l.title}
            </div>

            {l.description ? (
              <div style={s.desc} title={l.description}>
                {l.description}
              </div>
            ) : (
              <div style={{ ...s.desc, opacity: 0.55 }}>Без описания</div>
            )}

            <div style={s.bottomRow}>
              <div style={s.meta}>ID: {l.id}</div>
              <Link href={`/student/lessons/${l.id}`} style={s.openBtn}>
                Открыть
              </Link>
            </div>
          </div>
        ))}

        {lessons.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Пока нет уроков</div>
            <div style={{ opacity: 0.75 }}>Админ ещё не выдал тебе доступы.</div>
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
  kicker: { opacity: 0.7, fontSize: 12, marginBottom: 6 },
  h1: { margin: 0, fontSize: 30, lineHeight: 1.15 },
  sub: { marginTop: 8, opacity: 0.75, fontSize: 14, lineHeight: 1.35 },

  badges: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
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
    alignItems: "stretch",
  },

  card: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    minHeight: 170,
    display: "flex",
    flexDirection: "column",
  },

  cardTop: { display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 10 },
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
    marginBottom: 8,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    ...clamp(2),
  },

  desc: {
    fontSize: 13,
    lineHeight: 1.35,
    opacity: 0.8,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
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
    gridColumn: "1 / -1",
  },
};
