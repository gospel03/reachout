-- OPTIONAL: the app creates these tables automatically on first run.
-- If you prefer, paste this into Supabase → SQL Editor → Run.

CREATE TABLE IF NOT EXISTS qa_questions (
  id serial PRIMARY KEY,
  text text NOT NULL,
  status text NOT NULL DEFAULT 'new',      -- new | starred | answered | hidden
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qa_display_state (
  id integer PRIMARY KEY,
  mode text NOT NULL DEFAULT 'welcome',    -- welcome | question | socials | blank
  text text,
  asked_count integer NOT NULL DEFAULT 0,
  accepting boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO qa_display_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Lock tables away from Supabase's public REST API (the app connects directly, so this is safe):
ALTER TABLE qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_display_state ENABLE ROW LEVEL SECURITY;
