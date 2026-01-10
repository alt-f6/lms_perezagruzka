"use client";

import { useEffect, useState } from "react";

type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string;
  order: number;
  is_published: boolean;
};

type Media = {
  id: number;
  title: string | null;
  url: string;
  embed_url: string;
  order: number;
  is_public: boolean;
};

export default function AdminLessonEditClient({ lesson }: { lesson: Lesson }) {
  const [form, setForm] = useState({
    title: lesson.title ?? "",
    description: lesson.description ?? "",
    content: lesson.content ?? "",
    order: lesson.order ?? 0,
    is_published: lesson.is_published ?? false,
  });

  const [saving, setSaving] = useState(false);

  const [media, setMedia] = useState<Media[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loadingMedia, setLoadingMedia] = useState(false);

  async function loadMedia() {
    setLoadingMedia(true);
    try {
      const r = await fetch(`/api/admin/lessons/${lesson.id}/media`, { cache: "no-store" });
      const j = await r.json();
      if (j.ok) setMedia(j.media ?? []);
    } finally {
      setLoadingMedia(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, [lesson.id]);

  async function saveLesson() {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) alert("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function addVideo() {
    const url = videoUrl.trim();
    if (!url) return;

    const r = await fetch(`/api/admin/lessons/${lesson.id}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!r.ok) {
      alert("Ссылка должна быть YouTube или Vimeo");
      return;
    }

    setVideoUrl("");
    loadMedia();
  }

  async function deleteVideo(id: number) {
    const ok = confirm("Удалить видео?");
    if (!ok) return;

    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    loadMedia();
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.kicker}>Админка</div>
          <h1 style={s.h1}>Редактирование урока</h1>
          <div style={s.sub}>ID: {lesson.id}</div>
        </div>

        <button onClick={saveLesson} style={s.primaryBtn} disabled={saving}>
          {saving ? "Сохраняю..." : "Сохранить"}
        </button>
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardTitle}>Данные урока</div>

          <div style={s.field}>
            <div style={s.label}>Название</div>
            <input
              style={s.input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Название урока"
            />
          </div>

          <div style={s.field}>
            <div style={s.label}>Описание</div>
            <textarea
              style={{ ...s.textarea, minHeight: 90 }}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Коротко о том, что будет в уроке"
            />
          </div>

          <div style={s.row2}>
            <div style={s.field}>
              <div style={s.label}>Порядок</div>
              <input
                style={s.input}
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>

            <div style={s.field}>
              <div style={s.label}>Статус</div>
              <label style={s.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                />
                <span>Опубликован</span>
              </label>
            </div>
          </div>

          <div style={s.field}>
            <div style={s.label}>Контент</div>
            <textarea
              style={{ ...s.textarea, minHeight: 280 }}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Текст урока"
            />
            <div style={s.hint}>Длинные строки и слова будут переноситься автоматически.</div>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>Видео</div>

          <div style={s.field}>
            <div style={s.label}>Добавить ссылку</div>
            <div style={s.mediaRow}>
              <input
                style={s.input}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube или Vimeo ссылка"
              />
              <button style={s.secondaryBtn} onClick={addVideo}>
                Добавить
              </button>
            </div>
          </div>

          {loadingMedia ? <div style={s.muted}>Загрузка...</div> : null}

          <div style={s.mediaList}>
            {media.map((m) => (
              <div key={m.id} style={s.mediaCard}>
                <div style={s.mediaTop}>
                  <div style={s.mediaMeta}>
                    <span style={s.pill}>Order {m.order}</span>
                    <span style={s.pill}>ID {m.id}</span>
                  </div>
                  <button style={s.dangerBtn} onClick={() => deleteVideo(m.id)}>
                    Удалить
                  </button>
                </div>

                <div style={s.videoWrap}>
                  <iframe
                    src={m.embed_url}
                    style={s.iframe}
                    allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div style={s.smallUrl} title={m.url}>
                  {m.url}
                </div>
              </div>
            ))}

            {media.length === 0 && !loadingMedia ? (
              <div style={s.muted}>Видео пока нет</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: 20, maxWidth: 1200, margin: "0 auto" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  kicker: { opacity: 0.7, fontSize: 12, marginBottom: 6 },
  h1: { margin: 0, fontSize: 26, lineHeight: 1.15, overflowWrap: "anywhere", wordBreak: "break-word" },
  sub: { marginTop: 8, opacity: 0.7, fontSize: 13 },

  grid: { display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14, alignItems: "start" },

  card: { border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16 },
  cardTitle: { fontWeight: 900, marginBottom: 12 },

  field: { marginBottom: 12 },
  label: { fontSize: 12, opacity: 0.8, marginBottom: 6, fontWeight: 800 },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.18)",
    color: "inherit",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.18)",
    color: "inherit",
    outline: "none",
    resize: "vertical",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },

  hint: { marginTop: 6, fontSize: 12, opacity: 0.65 },

  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  checkboxRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(0,0,0,0.18)",
    padding: "10px 12px",
    borderRadius: 12,
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "inherit",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  dangerBtn: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,100,100,0.35)",
    background: "rgba(255,80,80,0.10)",
    color: "inherit",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  muted: { opacity: 0.7, fontSize: 13 },

  mediaRow: { display: "flex", gap: 10, alignItems: "center" },

  mediaList: { display: "flex", flexDirection: "column", gap: 12, marginTop: 10 },

  mediaCard: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.10)",
    borderRadius: 14,
    padding: 12,
  },

  mediaTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 },
  mediaMeta: { display: "flex", gap: 8, flexWrap: "wrap" },

  pill: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    opacity: 0.9,
    whiteSpace: "nowrap",
  },

  videoWrap: {
    overflow: "hidden",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    aspectRatio: "16 / 9",
    background: "rgba(0,0,0,0.20)",
  },
  iframe: { width: "100%", height: "100%", border: 0 },

  smallUrl: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.75,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },
};
