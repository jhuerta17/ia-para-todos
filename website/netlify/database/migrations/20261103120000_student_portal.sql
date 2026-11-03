-- Additive portal schema. No Identity credentials, email addresses, or raw prompts in logs.
CREATE TABLE portal_profiles (
  user_id text PRIMARY KEY,
  adult_attested_at timestamptz,
  privacy_version text,
  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','deleting','deleted')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE portal_admissions (
  email_hash text PRIMARY KEY,
  user_id text UNIQUE,
  expires_at timestamptz,
  confirmed boolean NOT NULL DEFAULT false
);
CREATE TABLE portal_enrollments (
  user_id text NOT NULL REFERENCES portal_profiles(user_id) ON DELETE CASCADE,
  course_id text NOT NULL CHECK (course_id = 'first-prompt'),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);
CREATE TABLE portal_lesson_progress (
  user_id text NOT NULL,
  course_id text NOT NULL,
  lesson_id text NOT NULL CHECK (lesson_id IN ('clear-request','refine-response','verify-and-protect')),
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id, lesson_id),
  FOREIGN KEY (user_id, course_id) REFERENCES portal_enrollments(user_id, course_id) ON DELETE CASCADE
);
CREATE TABLE portal_chats (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES portal_profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  UNIQUE(id, user_id)
);
CREATE INDEX portal_chats_owner ON portal_chats(user_id, created_at DESC);
CREATE INDEX portal_chats_expiry ON portal_chats(expires_at);
CREATE TABLE portal_requests (
  id uuid NOT NULL,
  user_id text NOT NULL,
  chat_id uuid NOT NULL,
  input_hash text NOT NULL,
  state text NOT NULL CHECK (state IN ('pending','done')),
  demo boolean NOT NULL DEFAULT true,
  reason text NOT NULL,
  reserved_micro bigint NOT NULL DEFAULT 0 CHECK (reserved_micro >= 0),
  day date NOT NULL,
  month date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, id),
  FOREIGN KEY(chat_id, user_id) REFERENCES portal_chats(id, user_id) ON DELETE CASCADE
);
CREATE INDEX portal_requests_day ON portal_requests(user_id, day);
CREATE TABLE portal_messages (
  sequence bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL,
  chat_id uuid NOT NULL,
  request_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  demo boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, request_id, role),
  FOREIGN KEY(chat_id, user_id) REFERENCES portal_chats(id, user_id) ON DELETE CASCADE,
  FOREIGN KEY(user_id, request_id) REFERENCES portal_requests(user_id, id) ON DELETE CASCADE
);
CREATE INDEX portal_messages_chat ON portal_messages(chat_id, sequence);
-- Usage survives chat deletion: deleting history must never replenish quotas.
CREATE TABLE portal_daily_usage (
  user_id text NOT NULL,
  day date NOT NULL,
  requests integer NOT NULL DEFAULT 0 CHECK (requests >= 0),
  PRIMARY KEY(user_id, day)
);
CREATE TABLE portal_monthly_usage (
  month date PRIMARY KEY,
  amount_micro bigint NOT NULL DEFAULT 0 CHECK (amount_micro >= 0)
);
CREATE TABLE portal_deletion_jobs (
  user_id text PRIMARY KEY,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0
);
