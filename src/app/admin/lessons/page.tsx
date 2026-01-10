import Link from "next/link";
import type { CSSProperties } from "react";

import { pool } from "@/src/server/db/pool";
import { requireRolePage } from "@/src/server/auth/require-role-page";
import { ui } from "@/src/app/ui/adminStyles";

import CreateLessonButton from "./CreateLessonButton";

type LessonRow = {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
  order: number;
};

function Badge({ children, tone }: { children: React.ReactNode; tone?: "green" | "gray" }) {
  const isGreen = tone === "green";
  return (
    <span
      style={{
        ...ui.pill,
        border: "1px solid rgba(255,255,255,0.14)",
        background: isGreen ? "rgba(120,255,180,0.10)" : "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.86)",
        opacity: 1,
      }}
    >
      {children}
    </span>
  );
}

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ ...ui.btn, display: "inline-block", textDecoration: "none" }}>
      {children}
    </Link>
  );
}

export default async function AdminLessonsPage() {
  await requireRolePage("admin");

  const r = await pool.query(
    `SELECT id, title, description, is_published, "order"
     FROM lessons
     ORDER BY "order" ASC, id ASC`
  );

  const lessons = (r.rows || []) as LessonRow[];
  const publishedCount = lessons.filter((x) => x.is_published).length;

  return (
    <main style={ui.page}>
      <div style={s.header}>
        <div>
          <div style={s.kicker}>Админ панель</div>
          <h1 style={s.h1}>Уроки</h1>
          <div style={s.sub}>Список всех уроков, их порядок и опубликованность.</div>
        </div>

        <div style={s.headerRight}>
          <CreateLessonButton />
          <div style={ui.pill}>{lessons.length} всего</div>
          <div style={ui.pill}>{publishedCount} опубликовано</div>
          <ButtonLink href="/admin/assignments">Назначения</ButtonLink>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div style={ui.card}>
          <div style={s.emptyTitle}>Уроков пока нет</div>
          <div style={s.emptyText}>
            Добавь уроки через seed или сделаем форму создания на следующем шаге.
          </div>
        </div>
      ) : (
        <div style={ui.tableWrap}>
          <table style={{ ...ui.table }}>
            <thead>
              <tr>
                <th style={{ ...ui.th, width: 80 }}>Order</th>
                <th style={ui.th}>Урок</th>
                <th style={{ ...ui.th, width: 160 }}>Статус</th>
                <th style={{ ...ui.th, width: 260 }}>Действия</th>
              </tr>
            </thead>

            <tbody>
              {lessons.map((l) => (
                <tr key={l.id} style={s.tr}>
                  <td style={ui.td}>
                    <span style={s.mono}>{l.order ?? 0}</span>
                  </td>

                  <td style={ui.td}>
                    <div style={s.titleRow}>
                      <div style={{ ...s.title, ...s.clamp1 }}>{l.title}</div>
                      <span style={s.idMuted}>ID: {l.id}</span>
                    </div>

                    <div style={{ ...s.desc, ...s.clamp2 }}>
                      {l.description ? l.description : <span style={s.muted}>Описание не заполнено</span>}
                    </div>
                  </td>

                  <td style={ui.td}>
                    {l.is_published ? <Badge tone="green">Опубликован</Badge> : <Badge tone="gray">Черновик</Badge>}
                  </td>
                  <td style={ui.td}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "nowrap", alignItems: "center", justifyContent: "flex-end" }}>
                      <Link href={`/admin/lessons/${l.id}`} style={{ ...ui.btn, textDecoration: "none" } }>
                        Редактировать
                      </Link>

                      <Link
                        href={`/admin/assignments?lessonId=${l.id}`}
                        style={{ ...ui.btn, textDecoration: "none" }}
                        title="Назначить этот урок ученикам"
                      >
                        Назначить
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={s.hint}>
            Следующий шаг: добавим страницу редактирования урока (title, description, content, published, order) и
            загрузку видео.
          </div>
        </div>
      )}
    </main>
  );
}

const s: Record<string, CSSProperties> = {
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

  headerRight: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },

  clamp2: {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  clamp1: {
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  emptyTitle: { fontWeight: 900, marginBottom: 6 },
  emptyText: { opacity: 0.75, maxWidth: 760 },

  tr: { borderBottom: "1px solid rgba(255,255,255,0.08)" },

  mono: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 13,
    opacity: 0.9,
  },

  titleRow: { display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" },
  title: { fontWeight: 900, fontSize: 15, minWidth: 0 },
  idMuted: { opacity: 0.55, fontSize: 12 },

  desc: {
    marginTop: 6,
    opacity: 0.78,
    fontSize: 13,
    lineHeight: 1.35,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    whiteSpace: "normal",
    minWidth: 0,
  },

  muted: { opacity: 0.65 },

  hint: {
    padding: "12px 14px",
    opacity: 0.6,
    fontSize: 12,
  },
};
