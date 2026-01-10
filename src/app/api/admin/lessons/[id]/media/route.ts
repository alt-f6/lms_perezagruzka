import { NextResponse } from "next/server";
import { pool } from "@/src/server/db/pool";
import { requireRoleApi } from "@/src/server/auth/require-role-api";

export const runtime = "nodejs";

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

async function readLessonId(ctx: Ctx) {
  const p: any = await Promise.resolve((ctx as any).params);
  const id = Number(p?.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function normalize(url: string) {
  const raw = url.trim();

  const yt =
    raw.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
    raw.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (yt) {
    return { provider: "youtube", embed_url: `https://www.youtube.com/embed/${yt[1]}`, url: raw };
  }

  const vimeo = raw.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return { provider: "vimeo", embed_url: `https://player.vimeo.com/video/${vimeo[1]}`, url: raw };
  }

  throw new Error("UNSUPPORTED");
}

export async function GET(_: Request, ctx: Ctx) {
  const user = await requireRoleApi("admin");
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const lessonId = await readLessonId(ctx);
  if (!lessonId) return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });

  const r = await pool.query(
    `SELECT id, lesson_id, kind, title, url, provider, embed_url, "order", is_public, created_at
     FROM lesson_media
     WHERE lesson_id = $1
     ORDER BY "order" ASC, id ASC`,
    [lessonId]
  );

  return NextResponse.json({ ok: true, media: r.rows ?? [] });
}

export async function POST(req: Request, ctx: Ctx) {
  const user = await requireRoleApi("admin");
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const lessonId = await readLessonId(ctx);
  if (!lessonId) return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });

  const body = await req.json().catch(() => ({} as any));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const urlRaw = typeof body.url === "string" ? body.url : "";
  const is_public = body.is_public === undefined ? true : Boolean(body.is_public);

  let norm;
  try {
    norm = normalize(urlRaw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_video_url" }, { status: 400 });
  }

  const maxr = await pool.query(
    `SELECT COALESCE(MAX("order"), 0) AS max_order FROM lesson_media WHERE lesson_id = $1`,
    [lessonId]
  );
  const order = Number(maxr.rows?.[0]?.max_order ?? 0) + 1;

  const ins = await pool.query(
    `INSERT INTO lesson_media (lesson_id, kind, title, url, provider, embed_url, "order", is_public)
     VALUES ($1, 'video', $2, $3, $4, $5, $6, $7)
     RETURNING id, lesson_id, kind, title, url, provider, embed_url, "order", is_public, created_at`,
    [lessonId, title || null, norm.url, norm.provider, norm.embed_url, order, is_public]
  );

  return NextResponse.json({ ok: true, media: ins.rows[0] });
}
