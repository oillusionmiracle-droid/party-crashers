create table public.pc_sources(id text primary key,name text not null,url text not null,enabled boolean not null default true,last_attempt_at timestamptz,last_success_at timestamptz,last_error text,consecutive_failures integer not null default 0);
create table public.pc_import_candidates(id text primary key,source_id text not null references public.pc_sources(id),record jsonb not null,reason text not null,status text not null default 'pending' check(status in ('pending','approved','rejected')),reviewed_by text,updated_at timestamptz not null default now());
create index pc_import_candidates_pending on public.pc_import_candidates(status,updated_at);
create table public.pc_event_sources(source_id text not null references public.pc_sources(id),external_id text not null,event_id text not null references public.pc_events(id),status text not null default 'active' check(status in ('active','cancelled','missing')),last_seen_at timestamptz not null default now(),missing_count integer not null default 0,primary key(source_id,external_id));
create index pc_event_sources_event on public.pc_event_sources(event_id);
create table public.pc_admins(clerk_user_id text primary key,created_at timestamptz not null default now());
alter table public.pc_sources enable row level security;
alter table public.pc_import_candidates enable row level security;
alter table public.pc_event_sources enable row level security;
alter table public.pc_admins enable row level security;
revoke all on public.pc_sources,public.pc_import_candidates,public.pc_event_sources,public.pc_admins from public,anon,authenticated;
grant all on public.pc_sources,public.pc_import_candidates,public.pc_event_sources,public.pc_admins to service_role;
insert into public.pc_sources(id,name,url) values ('techfeast','TECHFEAST','https://thetechfeast.com/wp-json/tribe/events/v1/events?per_page=50'),('lagos-fringe','Lagos Fringe','https://lagosfringe.com/2026-programme/'),('lagos-ai-summit','Lagos AI Summit','https://lagosaisummit.com/');
-- Atomic expiring lease prevents overlapping cron jobs without privileged functions.
alter table public.pc_collector_config add column lease_until timestamptz not null default '1970-01-01',add column lease_owner text;
-- Review decisions run in one transaction and lock the candidate row.
create or replace function public.pc_review_import(candidate_id text,reviewer text,decision text,venue jsonb default '{}'::jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare c public.pc_import_candidates%rowtype;r jsonb;lat double precision;lon double precision;n integer;
begin
 if not exists(select 1 from public.pc_admins where clerk_user_id=reviewer) then raise exception 'Administrator access required';end if;
 select * into c from public.pc_import_candidates where id=candidate_id and status='pending' for update;
 if not found then raise exception 'Listing already reviewed or unavailable';end if;
 if decision not in ('approve','reject','archive') then raise exception 'Invalid decision';end if;
 r:=c.record;
 if decision='approve' then
  if c.id like 'missing-%' then raise exception 'Use keep or archive for a missing listing';end if;
  lat:=(venue->>'latitude')::double precision;lon:=(venue->>'longitude')::double precision;
  if lat is null or lon is null or not(lat between 6.2 and 6.9) or not(lon between 2.7 and 4.2) then raise exception 'Confirm Lagos venue coordinates';end if;
  if coalesce(length(trim(venue->>'venueName')),0) not between 1 and 160 or coalesce(length(trim(venue->>'address')),0) not between 1 and 240 or coalesce(length(trim(venue->>'area')),0) not between 1 and 100 then raise exception 'Confirm venue name, area and address';end if;
  if coalesce(length(r->>'title'),0) not between 1 and 120 or coalesce(length(r->>'description'),0)=0 or coalesce((r->>'endDate')::timestamptz<now(),true) or coalesce((r->>'endDate')::timestamptz<(r->>'startDate')::timestamptz,true) or coalesce(r->>'imageUrl','') not like 'https://%' or coalesce(r->>'registrationUrl','') not like 'https://%' or coalesce(r->>'sourceUrl','') not like 'https://%' then raise exception 'Incomplete or expired listing';end if;
  r:=r||jsonb_build_object('venueName',trim(venue->>'venueName'),'address',trim(venue->>'address'),'area',trim(venue->>'area'),'latitude',lat,'longitude',lon,'venueApproximate',true,'lastVerifiedAt',now(),'status','published');
  insert into public.pc_events(id,status,start_date,location,record) values(r->>'id','published',(r->>'startDate')::timestamptz,extensions.st_setsrid(extensions.st_makepoint(lon,lat),4326)::extensions.geography,r)
  on conflict(id) do update set status='published',start_date=excluded.start_date,location=excluded.location,record=excluded.record where pc_events.owner_id is null;
  get diagnostics n=row_count;if n=0 then raise exception 'Cannot replace a community event';end if;
  insert into public.pc_event_sources(source_id,external_id,event_id) values(c.source_id,c.id,r->>'id') on conflict(source_id,external_id) do update set status='active',last_seen_at=now(),missing_count=0;
 end if;
 if decision='archive' then
  if c.id not like 'missing-%' then raise exception 'Only missing listings can be archived here';end if;
  update public.pc_events set status='archived' where id=r->>'id' and owner_id is null;
  update public.pc_event_sources set status='cancelled' where event_id=r->>'id';
 end if;
 update public.pc_import_candidates set record=r,status=case when decision='reject' then 'rejected' else 'approved' end,reviewed_by=reviewer,updated_at=now() where id=c.id;
 return true;
end $$;
revoke all on function public.pc_review_import(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.pc_review_import(text,text,text,jsonb) to service_role;
select cron.alter_job((select jobid from cron.job where jobname='pc-event-import'),command:=$job$select net.http_post(url:='https://aqwnluhpnqsrofmvtngp.supabase.co/functions/v1/pc-collect',headers:=jsonb_build_object('Content-Type','application/json','x-pc-collector-token',(select decrypted_secret from vault.decrypted_secrets where name='pc_collector_token')),body:='{}'::jsonb,timeout_milliseconds:=120000);$job$);
