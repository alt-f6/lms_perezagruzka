CREATE TABLE IF NOT EXISTS lesson_assets (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

  kind TEXT NOT NULL CHECK (kind IN ('photo','pdf','video')),

  title TEXT,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,

  storage_key TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 1,

  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (lesson_id, "order")
);

CREATE INDEX IF NOT EXISTS idx_lesson_assets_lesson_id_order
  ON lesson_assets(lesson_id, "order");

-- optional: registry of applied patches
CREATE TABLE IF NOT EXISTS schema_patches (
  id BIGSERIAL PRIMARY KEY,
  patch_name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO schema_patches (patch_name)
VALUES ('004_lesson_assets.sql')
ON CONFLICT DO NOTHING;
