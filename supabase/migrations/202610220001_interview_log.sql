-- Interview log replaces "lessons learned" on new posts.
alter table public.experiences add column interview jsonb;
alter table public.experiences alter column lessons_learned set default '';
