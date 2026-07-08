-- ═══════════════════════════════════════════════════════════════════════════
-- CHALKBOARD OS — Migration 0003: Class session notes
-- Captured on "Finish Class": topic, homework, teacher notes.
-- Feeds future weekly reports and AI-generated summaries. Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- topic_covered already exists from 0001; add the other two.
alter table public.class_sessions add column if not exists homework_assigned text;
alter table public.class_sessions add column if not exists teacher_notes text;

comment on column public.class_sessions.topic_covered     is 'Today''s topic, e.g. "Force and Motion" — shown in weekly reports';
comment on column public.class_sessions.homework_assigned is 'Homework given at end of session, e.g. "Exercise 5"';
comment on column public.class_sessions.teacher_notes     is 'Free-form teacher remarks, e.g. "Excellent participation today." — input for AI summaries';
