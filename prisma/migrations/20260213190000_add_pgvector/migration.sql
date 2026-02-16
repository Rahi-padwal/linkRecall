-- Enable pgvector extension safely
CREATE EXTENSION IF NOT EXISTS vector;

-- Ensure the embedding column exists and is vector(1536)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Link'
      AND column_name = 'embedding'
  ) THEN
    IF (
      SELECT udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Link'
        AND column_name = 'embedding'
    ) <> 'vector' THEN
      ALTER TABLE "Link"
        ALTER COLUMN "embedding" TYPE vector(1536)
        USING NULL::vector;
    END IF;
  ELSE
    ALTER TABLE "Link"
      ADD COLUMN "embedding" vector(1536);
  END IF;
END $$;

-- Vector index for cosine similarity
CREATE INDEX IF NOT EXISTS "Link_embedding_ivfflat_idx"
  ON "Link"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);
