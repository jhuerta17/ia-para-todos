ALTER TABLE portal_enrollments DROP CONSTRAINT portal_enrollments_course_id_check;
ALTER TABLE portal_enrollments ADD CHECK (course_id IN ('first-prompt','learn-meta-ai'));
ALTER TABLE portal_lesson_progress DROP CONSTRAINT portal_lesson_progress_lesson_id_check;
ALTER TABLE portal_lesson_progress ADD CHECK (
 (course_id='first-prompt' AND lesson_id IN ('clear-request','refine-response','verify-and-protect')) OR
 (course_id='learn-meta-ai' AND lesson_id IN ('everyday-messages','interview-practice','small-business'))
);
CREATE TABLE whatsapp_events (
 id_hash text PRIMARY KEY,
 state text NOT NULL CHECK (state IN ('claimed','sent','failed')),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days'
);
CREATE INDEX whatsapp_events_expiry ON whatsapp_events(expires_at);
CREATE TABLE whatsapp_selections (
 sender_hash text PRIMARY KEY,
 language text NOT NULL CHECK (language IN ('es','en')),
 session_ids jsonb NOT NULL,
 expires_at timestamptz NOT NULL DEFAULT now()+interval '1 hour'
);
