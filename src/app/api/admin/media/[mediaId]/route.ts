import { NextResponse } from "next/server";
import { pool } from "@/src/server/db/pool";
import { requireRoleApi } from "@/src/server/auth/require-role-api";

export const runtime = "nodejs";

type Ctx = { params: { mediaId: string } } | { params: Promise<{ mediaId: string }> };

async function readMediaId(ctx: Ctx) {
  const p: any = await Promise.resolve((ctx as any).params);
  const id = Number(p?.mediaId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function normalize(url: string) {
  const raw = url.trim();

  const yt =
    raw.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/) ||
    raw.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);

  if (yt) {
    return {
      url: raw,
      provider: "youtube",
      embed_url: `https://www.youtube.com/embed/${yt[1]}`,
    };
  }

  const vimeo = raw.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return {
      url: raw,
      provider: "vimeo",
      embed_url: `https://player.vimeo.com/video/${vimeo[1]}`,
    };
  }

  throw new Error("unsupported");
}

export async function PATCH(req: Request, ctx: Ctx) {
  await requireRoleApi("admin");

  const id = await readMediaId(ctx);
  if (!id) return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });

  const body = await req.json();

  const cur = await pool.query(
    `SELECT * FROM lesson_media WHERE id=$1 LIMIT 1`,
    [id]
  );
  const row = cur.rows[0];
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const title =
    body.title === undefined
      ? row.title
      : typeof body.title === "string"
      ? body.title.trim()
      : null;

  const is_public =
    body.is_public === undefined ? row.is_public : Boolean(body.is_public);

  let order = body.order === undefined ? row.order : Number(body.order);
  if (!Number.isInteger(order) || order <= 0) {
    return NextResponse.json({ ok: false, error: "bad order" }, { status: 400 });
  }

  let norm = { url: row.url, provider: row.provider, embed_url: row.embed_url };
  if (body.url !== undefined) {
    try {
      norm = normalize(String(body.url));
    } catch {
      return NextResponse.json({ ok: false, error: "bad video url" }, { status: 400 });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (order !== row.order) {
      const other = await client.query(
        `SELECT id FROM lesson_media WHERE lesson_id=$1 AND "order"=$2 LIMIT 1`,
        [row.lesson_id, order]
      );

      if (other.rows[0]) {
        await client.query(`UPDATE lesson_media SET "order"=-1 WHERE id=$1`, [id]);
        await client.query(`UPDATE lesson_media SET "order"=$1 WHERE id=$2`, [row.order, other.rows[0].id]);
        await client.query(`UPDATE lesson_media SET "order"=$1 WHERE id=$2`, [order, id]);
      } else {
        await client.query(`UPDATE lesson_media SET "order"=$1 WHERE id=$2`, [order, id]);
      }
    }

    const upd = await client.query(
      `UPDATE lesson_media
       SET title=$1, url=$2, provider=$3, embed_url=$4, is_public=$5
       WHERE id=$6
       RETURNING *`,
      [title, norm.url, norm.provider, norm.embed_url, is_public, id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ ok: true, media: upd.rows[0] });
  } catch {
    await client.query("ROLLBACK");
    return NextResponse.json({ ok: false }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(_: Request, ctx: Ctx) {
  await requireRoleApi("admin");

  const id = await readMediaId(ctx);
  if (!id) return NextResponse.json({ ok: false, error: "bad id" }, { status: 400 });

  await pool.query(`DELETE FROM lesson_media WHERE id=$1`, [id]);
  return NextResponse.json({ ok: true });
}
