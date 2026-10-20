create extension if not exists pgcrypto;

create table public.experiences (
 id uuid primary key default gen_random_uuid(),
 experience_type text not null check (experience_type in ('Internship','Consulting Project','Full-Time','Other')),
 role_title text not null check (length(role_title) between 3 and 120),
 company text not null check (length(company) between 3 and 120),
 industry text not null, role_category text not null,
 year integer not null check (year between 2000 and 2100),
 duration text not null, work_arrangement text,
 responsibilities text not null, projects text not null, typical_day text not null,
 tools text not null, challenges text not null, solutions text not null,
 valuable_skills text not null, lessons_learned text not null, advice text not null,
 contributor_display_name text not null default '',
 anonymity_preference text not null check (anonymity_preference in ('Anonymous','First name only','Display name')),
 consent_to_publish boolean not null check (consent_to_publish = true),
 status text not null default 'pending' check (status in ('pending','published','rejected')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$begin new.updated_at=now(); return new; end;$$;
create trigger experiences_updated before update on public.experiences for each row execute function public.set_updated_at();
create index experiences_discovery_idx on public.experiences(status,industry,role_category,year desc);
create index experiences_company_idx on public.experiences(company);
alter table public.experiences enable row level security;
revoke all on public.experiences from anon, authenticated;
grant select on public.experiences to anon, authenticated;
create policy "Only consented published experiences are visible" on public.experiences for select to anon, authenticated using (status='published' and consent_to_publish);

create table public.ai_insights (
 id uuid primary key default gen_random_uuid(), experience_id uuid not null unique references public.experiences(id) on delete cascade,
 extracted_skills jsonb not null default '[]', technical_skills jsonb not null,
 business_skills jsonb not null, tools jsonb not null,
 main_responsibilities jsonb not null, key_challenges jsonb not null,
 key_lessons jsonb not null, preparation_recommendations jsonb not null,
 generated_at timestamptz not null default now(), model_version text not null
);
alter table public.ai_insights enable row level security;
revoke all on public.ai_insights from anon, authenticated;
grant select on public.ai_insights to anon, authenticated;
create policy "Insights follow parent visibility" on public.ai_insights for select to anon, authenticated using (exists(select 1 from public.experiences e where e.id=experience_id and e.status='published' and e.consent_to_publish));

-- Reserved for a future authenticated workflow. Anonymous roadmaps stay client-owned.
create table public.roadmaps (
 id uuid primary key default gen_random_uuid(), target_role text not null,
 target_industry text not null, existing_skills jsonb not null default '[]', target_skills jsonb not null default '[]',
 preparation_duration integer not null check (preparation_duration between 1 and 12),
 roadmap_content jsonb not null, source_experience_ids uuid[] not null default '{}', created_at timestamptz not null default now()
);
create table public.roadmap_tasks (
 id uuid primary key default gen_random_uuid(), roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
 title text not null, description text not null, week_number integer not null check (week_number between 1 and 12),
 completed boolean not null default false, created_at timestamptz not null default now()
);
create index roadmap_tasks_parent_idx on public.roadmap_tasks(roadmap_id,week_number);
alter table public.roadmaps enable row level security;
alter table public.roadmap_tasks enable row level security;
revoke all on public.roadmaps,public.roadmap_tasks from anon, authenticated;

create table public.feedback (
 id uuid primary key, usefulness integer not null check (usefulness between 1 and 5),
 findability integer not null check (findability between 1 and 5),
 confusing text not null default '' check (length(confusing)<=3000), improve text not null default '' check (length(improve)<=3000),
 created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
revoke all on public.feedback from anon, authenticated;

-- Atomic, backend-only abuse controls. Only salted IP hashes are stored, never raw addresses.
create table public.request_limits (bucket text primary key, hits integer not null, expires_at timestamptz not null);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from anon, authenticated;
create function public.consume_request(bucket_key text, max_hits integer) returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
 delete from public.request_limits where expires_at < now();
 insert into public.request_limits(bucket,hits,expires_at) values(bucket_key,1,now()+interval '1 hour')
 on conflict (bucket) do update set hits=public.request_limits.hits+1 returning hits into n;
 return n<=max_hits;
end;$$;
revoke all on function public.consume_request(text,integer) from public, anon, authenticated;
grant execute on function public.consume_request(text,integer) to service_role;
grant all on public.experiences, public.ai_insights, public.roadmaps, public.roadmap_tasks, public.feedback, public.request_limits to service_role;
