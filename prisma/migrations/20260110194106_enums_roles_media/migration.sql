DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('admin', 'student');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediaKind') THEN
    CREATE TYPE "MediaKind" AS ENUM ('photo', 'pdf', 'video');
  END IF;
END$$;

UPDATE public.users
SET role = lower(btrim(role))
WHERE role IS NOT NULL;

UPDATE public.lesson_media
SET kind = lower(btrim(kind))
WHERE kind IS NOT NULL;

UPDATE public.lesson_assets
SET kind = lower(btrim(kind))
WHERE kind IS NOT NULL;

ALTER TABLE public.lesson_media
  ALTER COLUMN kind DROP DEFAULT;

ALTER TABLE public.lesson_assets
  ALTER COLUMN kind DROP DEFAULT;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.lesson_assets
  DROP CONSTRAINT IF EXISTS lesson_assets_kind_check;

ALTER TABLE public.users
  ALTER COLUMN role TYPE "UserRole"
  USING role::"UserRole";

ALTER TABLE public.lesson_media
  ALTER COLUMN kind TYPE "MediaKind"
  USING kind::"MediaKind";

ALTER TABLE public.lesson_assets
  ALTER COLUMN kind TYPE "MediaKind"
  USING kind::"MediaKind";

ALTER TABLE public.lesson_media
  ALTER COLUMN kind SET DEFAULT 'video'::"MediaKind";

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['admin'::"UserRole", 'student'::"UserRole"]));

ALTER TABLE public.lesson_assets
  ADD CONSTRAINT lesson_assets_kind_check
  CHECK (kind = ANY (ARRAY['photo'::"MediaKind", 'pdf'::"MediaKind", 'video'::"MediaKind"]));
