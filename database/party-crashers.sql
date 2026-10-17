create extension if not exists postgis with schema extensions;
create table public.pc_profiles (
 clerk_user_id text primary key check(length(clerk_user_id)<200),
 display_name text not null default '', preferences jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.pc_events (
 id text primary key check(length(id)<200),owner_id text,
 status text not null default 'published' check(status in ('draft','published','archived')),
 start_date timestamptz not null, location extensions.geography(point,4326),
 record jsonb not null check(jsonb_typeof(record)='object' and length(record->>'title') between 1 and 120),
 created_at timestamptz not null default now()
);
create index pc_events_upcoming on public.pc_events(start_date) where status='published';
create index pc_events_owner on public.pc_events(owner_id);
create index pc_events_location on public.pc_events using gist(location);
create index pc_events_search on public.pc_events using gin(to_tsvector('simple',coalesce(record->>'title','')||' '||coalesce(record->>'description','')||' '||coalesce(record->>'area','')||' '||coalesce(record->>'category','')));
create table public.pc_saved_events (clerk_user_id text not null,event_id text not null references public.pc_events(id) on delete cascade,created_at timestamptz not null default now(),primary key(clerk_user_id,event_id));
create index pc_saved_event_fk on public.pc_saved_events(event_id);
create table public.pc_follows (clerk_user_id text not null,organizer_id text not null,created_at timestamptz not null default now(),primary key(clerk_user_id,organizer_id));
create table public.pc_reports (id uuid primary key default gen_random_uuid(),clerk_user_id text not null,event_id text not null references public.pc_events(id) on delete cascade,reason text not null check(length(reason) between 1 and 1000),created_at timestamptz not null default now());
create index pc_reports_event_fk on public.pc_reports(event_id);
create index pc_reports_user_fk on public.pc_reports(clerk_user_id);
create table public.pc_activity (id bigint generated always as identity primary key,clerk_user_id text not null,event_id text not null references public.pc_events(id) on delete cascade,kind text not null check(kind in ('registration_click')),created_at timestamptz not null default now());
create index pc_activity_event_fk on public.pc_activity(event_id);
create index pc_activity_user_fk on public.pc_activity(clerk_user_id);
alter table public.pc_profiles enable row level security;
alter table public.pc_events enable row level security;
alter table public.pc_saved_events enable row level security;
alter table public.pc_follows enable row level security;
alter table public.pc_reports enable row level security;
alter table public.pc_activity enable row level security;
revoke all on public.pc_profiles,public.pc_events,public.pc_saved_events,public.pc_follows,public.pc_reports,public.pc_activity from anon,authenticated;
grant select on public.pc_events to anon,authenticated;
create policy "Published events can be discovered" on public.pc_events for select to anon,authenticated using(status='published');
-- Clerk JWTs are checked at the Edge API before service-role writes. The API
-- derives all private ownership from the verified subject, never request input.
grant all on public.pc_profiles,public.pc_events,public.pc_saved_events,public.pc_follows,public.pc_reports,public.pc_activity to service_role;
grant usage,select on sequence public.pc_activity_id_seq to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('pc-posters','pc-posters',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
