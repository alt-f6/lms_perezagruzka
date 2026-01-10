CREATE TABLE IF NOT EXISTS lesson_media (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'video',
  title TEXT,
  url TEXT NOT NULL,
  provider TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 1,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, "order")
);

CREATE INDEX IF NOT EXISTS idx_lesson_media_lesson_id ON lesson_media(lesson_id);