"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

import { ui } from "@/src/app/ui/adminStyles";

type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string;
  is_published: boolean;
  order: number;
};

type Media = {
  id: number;
  lesson_id: number;
  kind: string;
  title: string | null;
  url: string;
  provider: string;
  embed_url: string;
  order: number;
  is_public: boolean;
  created_at?: string;
};

export default function AdminLessonEditClient({ lessonId }: { lessonId: number }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lesson, setLesson] = useState<Lesson | null>(null);

  const [media, setMedia] = useState<Media[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaErr, setMediaErr] = useState<string | null>(null);

  const [addTitle, setAddTitle] = useState("");
  const [addUrl, setAddUrl] = useState("");

  async function loadLesson() {
    setLoading(true);
    setError(null);

    const r = await fetch(`/api/admin/lessons/${lessonId}`, { method: "GET" });
    const j = await r.json().catch(() => null);

    if (!r.ok || !j?.ok) {
      setError(j?.message || j?.error || "Не удалось загрузить урок");
      setLoading(false);
      setLesson(null);
      return;
    }

    setLesson(j.lesson as Lesson);
    setLoading(false);
  }

  async function loadMedia() {
    setMediaLoading(true);
    setMediaErr(null);

    const r = await fetch(`/api/admin/lessons/${lessonId}/media`, { method: "GET" });
    const j = await r.json().catch(() => null);

    if (!r.ok || !j?.ok) {
      setMediaErr(j?.message || j?.error || "Не удалось загрузить медиа");
      setMediaLoading(false);
      setMedia([]);
      return;
    }

    setMedia((j.media ?? []) as Media[]);
    setMediaLoading(false);
  }

  useEffect(() => {
    if (!Number.isFinite(lessonId) || lessonId <= 0) {
      setError("Некорректный ID урока");
      setLoading(false);
      setLesson(null);
      return;
    }
    loadLesson();
    loadMedia();
  }, [lessonId]);

  async function saveLesson() {
    if (!lesson) return;
    setSaving(true);
    setError(null);

    const r = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        order: lesson.order,
        is_published: lesson.is_published,
      }),
    });

    const j = await r.json().catch(() => null);

    if (!r.ok || !j?.ok) {
      setError(j?.message || j?.error || "Ошибка сохранения урока");
      setSaving(false);
      return;
    }

    setLesson(j.lesson as Lesson);
    setSaving(false);
  }

  async function addMedia() {
    setMediaErr(null);
    const url = addUrl.trim();
    if (!url) {
      setMediaErr("URL обязателен");
      return;
    }

    const r = await fetch(`/api/admin/lessons/${lessonId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: addTitle.trim() || null,
        url,
      }),
    });

    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok) {
      setMediaErr(j?.message || j?.error || "Не удалось добавить видео");
      return;
    }

    setAddTitle("");
    setAddUrl("");
    await loadMedia();
  }

  async function patchMedia(
    mediaId: number,
    patch: Partial<{ title: string | null; url: string; order: number; is_public: boolean }>
  ) {
    setMediaErr(null);

    const r = await fetch(`/api/admin/media/${mediaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    const j = await r.json().catch(() => null);
    if (!r.ok || !j?.ok) {
      setMediaErr(j?.message || j?.error || "Не удалось обновить видео");
      return false;
    }

    await loadMedia();
    return true;
  }

  async function deleteMedia(mediaId: number) {
    setMediaErr(null);

    const r = await fetch(`/api/admin/media/${mediaId}`, { method: "DELETE" });
    const j = await r.json().catch(() => null);

    if (!r.ok || !j?.ok) {
      setMediaErr(j?.message || j?.error || "Не удалось удалить видео");
      return;
    }

    await loadMedia();
  }

  async function moveUp(item: Media) {
    const idx = media.findIndex((m) => m.id === item.id);
    if (idx <= 0) return;
    const prev = media[idx - 1];
    await patchMedia(item.id, { order: prev.order });
  }

  async function moveDown(item: Media) {
    const idx = media.findIndex((m) => m.id === item.id);
    if (idx === -1 || idx >= media.length - 1) return;
    const next = media[idx + 1];
    await patchMedia(item.id, { order: next.order });
  }

  if (loading) {
    return (
      <div style={ui.page}>
        <div style={{ opacity: 0.75 }}>Загрузка...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={ui.page}>
        <Link href="/admin/lessons" style={{ textDecoration: "underline", color: "inherit" }}>
          ← Назад к урокам
        </Link>
        <div style={{ marginTop: 12, fontWeight: 900 }}>Урок не найден</div>
        {error ? <div style={{ opacity: 0.75, marginTop: 6 }}>{error}</div> : null}
      </div>
    );
  }

  return (
    <main style={ui.page}>
      <div style={s.topRow}>
        <Link href="/admin/lessons" style={{ ...ui.btn, textDecoration: "none" }}>
          ← Назад
        </Link>

        <div style={s.pills}>
          <span style={ui.pill}>ID: {lesson.id}</span>
          <span style={ui.pill}>{lesson.is_published ? "Опубликован" : "Черновик"}</span>
        </div>
      </div>

      <div style={ui.card}>
        <h1 style={s.h1}>Редактирование урока</h1>
        <div style={s.sub}>Урок отдельно, видео отдельно (lesson_media). Порядок видео важен.</div>

        <div style={s.grid}>
          <div style={s.field}>
            <div style={s.label}>Название</div>
            <input
              style={s.input}
              value={lesson.title}
              onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
            />
          </div>

          <div style={s.field}>
            <div style={s.label}>Order</div>
            <input
              style={s.input}
              type="number"
              value={Number(lesson.order ?? 0)}
              onChange={(e) => setLesson({ ...lesson, order: Number(e.target.value) })}
            />
          </div>

          <div style={{ ...s.field, gridColumn: "1 / -1" }}>
            <div style={s.label}>Описание</div>
            <textarea
              style={{ ...s.input, minHeight: 90, resize: "vertical", whiteSpace: "pre-wrap" }}
              value={lesson.description}
              onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
            />
          </div>

          <div style={{ ...s.field, gridColumn: "1 / -1" }}>
            <div style={s.label}>Контент</div>
            <textarea
              style={{ ...s.input, minHeight: 240, resize: "vertical", whiteSpace: "pre-wrap" }}
              value={lesson.content}
              onChange={(e) => setLesson({ ...lesson, content: e.target.value })}
            />
          </div>

          <div style={{ ...s.field, gridColumn: "1 / -1" }}>
            <label style={s.checkboxRow}>
              <input
                type="checkbox"
                checked={!!lesson.is_published}
                onChange={(e) => setLesson({ ...lesson, is_published: e.target.checked })}
              />
              <span>Опубликован</span>
            </label>
          </div>
        </div>

        {error ? (
          <div style={s.errBox}>
            <b>Ошибка</b>
            <div style={{ opacity: 0.85 }}>{error}</div>
          </div>
        ) : null}

        <div style={s.actions}>
          <button style={ui.btn} onClick={loadLesson} disabled={saving}>
            Обновить
          </button>
          <button style={ui.btnPrimary} onClick={saveLesson} disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить урок"}
          </button>
        </div>
      </div>

      <div style={{ ...ui.card, marginTop: 14 }}>
        <div style={s.mediaHeader}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Видео урока</h2>
          <button style={ui.btn} onClick={loadMedia} disabled={mediaLoading}>
            Обновить список
          </button>
        </div>

        <div style={s.mediaSub}>Добавляй ссылки YouTube/Vimeo. Превью строится сервером (embed_url).</div>

        <div style={s.addGrid}>
          <input
            style={s.input}
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            placeholder="Название (опционально)"
          />
          <input
            style={s.input}
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
            placeholder="https://youtu.be/... или https://vimeo.com/..."
          />
          <button style={ui.btnPrimary} onClick={addMedia}>
            Добавить
          </button>
        </div>

        {mediaErr ? (
          <div style={{ ...s.errBox, marginTop: 12 }}>
            <b>Ошибка</b>
            <div style={{ opacity: 0.85 }}>{mediaErr}</div>
          </div>
        ) : null}

        <div style={{ marginTop: 12 }}>
          {mediaLoading ? <div style={{ opacity: 0.7 }}>Загрузка видео...</div> : null}
          {!mediaLoading && media.length === 0 ? <div style={{ opacity: 0.7 }}>Видео пока нет</div> : null}

          {media.map((m) => (
            <div key={m.id} style={s.mediaRow}>
              <div style={s.mediaTop}>
                <div style={{ fontWeight: 900 }}>
                  {m.title ? m.title : <span style={{ opacity: 0.7 }}>(без названия)</span>}
                  <span style={{ opacity: 0.6, fontWeight: 600, marginLeft: 8 }}>
                    #{m.order} · {m.provider}
                  </span>
                </div>

                <div style={s.mediaActions}>
                  <button style={ui.btn} onClick={() => moveUp(m)} disabled={mediaLoading}>
                    ↑
                  </button>
                  <button style={ui.btn} onClick={() => moveDown(m)} disabled={mediaLoading}>
                    ↓
                  </button>
                  <button style={ui.btn} onClick={() => patchMedia(m.id, { is_public: !m.is_public })}>
                    {m.is_public ? "Скрыть" : "Показать"}
                  </button>
                  <button style={s.btnDanger} onClick={() => deleteMedia(m.id)}>
                    Удалить
                  </button>
                </div>
              </div>

              <div style={s.urlLine}>{m.url}</div>

              <div style={s.previewWrap}>
                <iframe
                  src={m.embed_url}
                  style={s.iframe}
                  allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const s: Record<string, CSSProperties> = {
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 },
  pills: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },

  h1: { margin: 0, fontSize: 26, lineHeight: 1.15 },
  sub: { marginTop: 6, opacity: 0.75 },

  grid: { display: "grid", gridTemplateColumns: "1fr 180px", gap: 12, marginTop: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, opacity: 0.8 },

  input: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.10)",
    color: "inherit",
    padding: "10px 12px",
    outline: "none",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  checkboxRow: { display: "flex", alignItems: "center", gap: 10, opacity: 0.9 },

  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 },

  errBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(255,120,120,0.25)",
    background: "rgba(255,120,120,0.08)",
  },

  mediaHeader: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" },
  mediaSub: { opacity: 0.75, marginTop: 6 },

  addGrid: { marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 },

  mediaRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.10)",
  },

  mediaTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },

  mediaActions: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },

  btnDanger: {
    ...ui.btn,
    border: "1px solid rgba(255,120,120,0.35)",
    background: "rgba(255,120,120,0.10)",
  },

  urlLine: {
    marginTop: 8,
    opacity: 0.75,
    fontSize: 12,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  },

  previewWrap: {
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    aspectRatio: "16 / 9",
    background: "rgba(0,0,0,0.20)",
  },
  iframe: { width: "100%", height: "100%", border: 0 },
};
