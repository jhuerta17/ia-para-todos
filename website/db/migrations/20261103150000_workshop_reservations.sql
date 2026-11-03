-- Real sessions start empty. Private reservation contacts never belong in Git.
CREATE TABLE workshop_sessions (
  id uuid PRIMARY KEY,
  topic text NOT NULL CHECK(topic IN ('introduccion-ia','vida-diaria','trabajo-negocios','padres-familias')),
  title_es text NOT NULL, title_en text NOT NULL,
  language text NOT NULL CHECK(language IN ('es','en')),
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  time_zone text NOT NULL, venue text NOT NULL, address text NOT NULL,
  accessibility_es text NOT NULL, accessibility_en text NOT NULL,
  bring_es text NOT NULL, bring_en text NOT NULL,
  capacity integer NOT NULL CHECK(capacity BETWEEN 1 AND 500),
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','cancelled')),
  cancelled_at timestamptz,
  total_reservations integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(ends_at > starts_at)
);
CREATE INDEX workshop_sessions_upcoming ON workshop_sessions(starts_at) WHERE status='published';
CREATE TABLE workshop_reservations (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES workshop_sessions(id),
  user_id text REFERENCES portal_profiles(user_id),
  token_hash text UNIQUE,
  request_hash text,
  name text, contact text,
  contact_type text CHECK(contact_type IN ('email','phone')),
  status text NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','cancelled')),
  follow_up_needed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  adult_attested_at timestamptz NOT NULL DEFAULT now(),
  privacy_version text NOT NULL DEFAULT '2026-11-03-workshops-v1'
);
CREATE INDEX workshop_reservations_capacity ON workshop_reservations(session_id) WHERE status='confirmed';
CREATE INDEX workshop_reservations_owner ON workshop_reservations(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX workshop_reservations_one_account ON workshop_reservations(session_id,user_id) WHERE status='confirmed' AND user_id IS NOT NULL;
CREATE TABLE workshop_preparation (
  user_id text PRIMARY KEY REFERENCES portal_profiles(user_id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now()
);
-- Covers both student-requested and Identity-event account deletion, in the
-- same transaction as the existing deletion marker. Keep anonymous totals only.
CREATE FUNCTION workshop_account_deletion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.state <> 'active' THEN
    DELETE FROM workshop_reservations WHERE user_id=NEW.user_id;
    DELETE FROM workshop_preparation WHERE user_id=NEW.user_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER workshop_account_deletion AFTER INSERT OR UPDATE OF state ON portal_profiles
  FOR EACH ROW EXECUTE FUNCTION workshop_account_deletion();
