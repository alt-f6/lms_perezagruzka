import Link from "next/link";
import { requireRolePage } from "@/src/server/auth/require-role-page";
import { pool } from "@/src/server/db/pool";

type Params = { id: string };
type Props = { params: Params | Promise<Params> };

type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string;
  order: number;
};

type Media = {
  id: number;
  title: string | null;
  embed_url: string;
  order: number;
};

export default async function StudentLessonPage(props: Props) {
  await requireRolePage("student");

  const p = await Promise.resolve(props.params);
  const lessonId = Number(p?.id);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return (
      <main style={s.page}>
        <Link href="/student/lessons" style={s.back}>← Назад к урокам</Link>
        <div style={s.card}><b>Некорректный ID урока</b></div>
      </main>
    );
  }

  const lr = await pool.query(
    `SELECT id, title, description, content, "order"
    FROM lessons
    WHERE id = $1 AND is_published = true`,
    [lessonId]
  );

  if (lr.rowCount === 0) {
    return (
      <main style={s.page}>
        <Link href="/student/lessons" style={s.back}>← Назад к урокам</Link>
        <div style={s.card}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Урок недоступен</div>
          <div style={{ opacity: 0.7 }}>Доступ не назначен или урок не опубликован.</div>
        </div>
      </main>
    );
  }

  const lesson = lr.rows[0] as Lesson;

  const mr = await pool.query(
    `SELECT id, title, embed_url, "order"
    FROM lesson_media
    WHERE lesson_id = $1 AND is_public = true
    ORDER BY "order" ASC, id ASC`,
    [lessonId]
  );

  const media = (mr.rows ?? []) as Media[];

  return (
    <main style={s.page}>
      <div style={s.topRow}>
        <Link href="/student/lessons" style={s.back}>← Назад к урокам</Link>
        <div style={s.pills}>
          <span style={s.pill}>Урок {lesson.order}</span>
          <span style={s.pill}>ID: {lesson.id}</span>
        </div>
      </div>

      <div style={s.card}>
        <h1 style={s.h1}>{lesson.title}</h1>
        {lesson.description ? <div style={s.desc}>{lesson.description}</div> : null}

        {media.length > 0 && (
          <div style={{ marginTop: 14 }}>
            {media.map((v) => (
              <div key={v.id} style={{ marginBottom: 16 }}>
                {v.title ? <div style={s.mediaTitle}>{v.title}</div> : null}
                <div style={s.videoWrap}>
                  <iframe
                    src={v.embed_url}
                    style={s.iframe}
                    allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={s.sectionTitle}>Материал</div>

        <div style={s.contentBox}>
          <pre style={s.pre}>{lesson.content ?? ""}</pre>
        </div>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 24, maxWidth: 1100, margin: "0 auto" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 },
  back: {
    display: "inline-block",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 13,
    color: "inherit",
  },
  pills: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  pill: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    opacity: 0.85,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  card: { border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 18 },
  h1: { margin: 0, fontSize: 28, lineHeight: 1.15 },
  desc: { marginTop: 8, opacity: 0.78, fontSize: 14, lineHeight: 1.4 },

  mediaTitle: { fontWeight: 900, marginBottom: 8, opacity: 0.9 },

  videoWrap: {
    overflow: "hidden",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    aspectRatio: "16 / 9",
    background: "rgba(0,0,0,0.20)",
  },
  iframe: { width: "100%", height: "100%", border: 0 },

  sectionTitle: { marginTop: 10, fontWeight: 900, fontSize: 16 },
  contentBox: { marginTop: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.12)", borderRadius: 14, padding: 14 },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 13,
    opacity: 0.9,
  },
};
