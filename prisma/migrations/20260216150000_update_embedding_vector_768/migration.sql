-- Drop existing vector index before altering column type
DROP INDEX IF EXISTS "Link_embedding_ivfflat_idx";

-- Ensure embedding column uses vector(768)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Link'
      AND column_name = 'embedding'
  ) THEN
    ALTER TABLE "Link"
      ALTER COLUMN "embedding" TYPE vector(768)
      USING NULL::vector;
  ELSE
    ALTER TABLE "Link"
      ADD COLUMN "embedding" vector(768);
  END IF;
END $$;

-- Recreate vector index for cosine similarity
CREATE INDEX IF NOT EXISTS "Link_embedding_ivfflat_idx"
  ON "Link"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);
