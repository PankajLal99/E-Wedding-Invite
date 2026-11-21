CREATE TABLE IF NOT EXISTS blessings (
  id text PRIMARY KEY,
  name text NOT NULL,
  message text NOT NULL,
  token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  CONSTRAINT blessings_name_len CHECK (char_length(name) BETWEEN 1 AND 60),
  CONSTRAINT blessings_message_len CHECK (char_length(message) BETWEEN 1 AND 400),
  CONSTRAINT blessings_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE blessings ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE blessings ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

UPDATE blessings SET status = 'approved' WHERE status IS NULL;

DO $$
BEGIN
  ALTER TABLE blessings ALTER COLUMN status SET DEFAULT 'pending';
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  UPDATE blessings SET status = 'pending' WHERE status IS NULL;
  ALTER TABLE blessings ALTER COLUMN status SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS blessings_created_at_idx ON blessings (created_at DESC);
CREATE INDEX IF NOT EXISTS blessings_status_created_at_idx ON blessings (status, created_at DESC);
