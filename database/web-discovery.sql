alter table public.pc_sources add column adapter text not null default 'custom' check(adapter in ('custom','jsonld')),add column autopublish boolean not null default false,add column allow_ai boolean not null default false;
create table public.pc_discovery_links(id uuid primary key default gen_random_uuid(),url text not null unique,title text not null default '',snippet text not null default '',provider text not null,status text not null default 'pending' check(status in ('pending','approved','rejected','imported')),source_id text references public.pc_sources(id),first_seen_at timestamptz not null default now(),last_seen_at timestamptz not null default now(),last_crawled_at timestamptz,attempts integer not null default 0,last_error text);
create index pc_discovery_links_work on public.pc_discovery_links(status,last_crawled_at);
create index pc_discovery_links_source on public.pc_discovery_links(source_id);
create table public.pc_discovery_runs(id bigint generated always as identity primary key,status text not null check(status in ('running','success','partial','failed','blocked')),provider text not null default 'organizer-monitor',started_at timestamptz not null default now(),finished_at timestamptz,discovered integer not null default 0,reviewed integer not null default 0,published integer not null default 0,error text);
create table public.pc_discovery_settings(id text primary key check(id='main'),enabled boolean not null default true,search_enabled boolean not null default true,allow_ai boolean not null default false);
insert into public.pc_discovery_settings(id) values('main');
alter table public.pc_discovery_links enable row level security;
alter table public.pc_discovery_runs enable row level security;
alter table public.pc_discovery_settings enable row level security;
revoke all on public.pc_discovery_links,public.pc_discovery_runs,public.pc_discovery_settings from public,anon,authenticated;
grant all on public.pc_discovery_links,public.pc_discovery_runs,public.pc_discovery_settings to service_role;
grant usage,select on sequence public.pc_discovery_runs_id_seq to service_role;
insert into public.pc_collector_config(id,token_hash) select 'web-discovery',token_hash from public.pc_collector_config where id='techfeast';
insert into public.pc_sources(id,name,url,adapter,autopublish) values
 ('web-afriff','AFRIFF','https://afriff.com/','jsonld',false),
 ('web-ake','Aké Arts and Book Festival','https://akefestival.org/','jsonld',false),
 ('web-artx','ART X Lagos','https://www.artxlagos.com/tickets','jsonld',false),
 ('web-lagos-fashion','Lagos Fashion Week','https://lagosfashionweek.ng/','jsonld',false);
insert into public.pc_discovery_links(url,title,provider,status,source_id) select url,name,'approved-organizer','approved',id from public.pc_sources where adapter='jsonld';
select cron.schedule('pc-web-discovery','43 */6 * * *',$job$
select net.http_post(url:='https://aqwnluhpnqsrofmvtngp.supabase.co/functions/v1/pc-discover',headers:=jsonb_build_object('Content-Type','application/json','x-pc-collector-token',(select decrypted_secret from vault.decrypted_secrets where name='pc_collector_token')),body:='{}'::jsonb,timeout_milliseconds:=120000);
$job$);
alter table public.pc_sources add column permission_note text not null default '',add column approved_by text;
alter table public.pc_discovery_links add column submitted_by text;
create index pc_discovery_links_submitter on public.pc_discovery_links(submitted_by,first_seen_at);
create table public.pc_api_quota(bucket text not null,window_start bigint not null,hits integer not null default 1,primary key(bucket,window_start));
alter table public.pc_api_quota enable row level security;
revoke all on public.pc_api_quota from public,anon,authenticated;
grant all on public.pc_api_quota to service_role;
create or replace function public.pc_take_quota(bucket_name text,max_hits integer,window_seconds integer default 86400)
returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;w bigint;
begin
 if max_hits<1 or max_hits>1000 or window_seconds<60 then return false;end if;
 w:=floor(extract(epoch from now())/window_seconds);
 insert into public.pc_api_quota(bucket,window_start,hits) values(bucket_name,w,1) on conflict(bucket,window_start) do update set hits=pc_api_quota.hits+1 returning hits into n;
 return n<=max_hits;
end $$;
revoke all on function public.pc_take_quota(text,integer,integer) from public,anon,authenticated;
grant execute on function public.pc_take_quota(text,integer,integer) to service_role;

-- Allow reviewers to correct extracted facts as well as coordinates.
create or replace function public.pc_review_import(candidate_id text,reviewer text,decision text,venue jsonb default '{}'::jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare c public.pc_import_candidates%rowtype;r jsonb;lat double precision;lon double precision;n integer;
begin
 if not exists(select 1 from public.pc_admins where clerk_user_id=reviewer) then raise exception 'Administrator access required';end if;
 select * into c from public.pc_import_candidates where id=candidate_id and status='pending' for update;
 if not found then raise exception 'Listing already reviewed or unavailable';end if;
 if decision not in ('approve','reject','archive') then raise exception 'Invalid decision';end if;
 r:=c.record||jsonb_strip_nulls(jsonb_build_object('title',nullif(venue->>'title',''),'description',nullif(venue->>'description',''),'startDate',nullif(venue->>'startDate',''),'endDate',nullif(venue->>'endDate',''),'imageUrl',nullif(venue->>'imageUrl',''),'registrationUrl',nullif(venue->>'registrationUrl','')));
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

-- Keep review candidates distinct by provider while retaining canonical event IDs.
update public.pc_import_candidates set id=source_id||'-'||id where source_id like 'web-%' and id=record->>'id' and status='pending';
