-- Private collector configuration and audit log. No browser access.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create table public.pc_collector_config(id text primary key,token_hash text not null,enabled boolean not null default true);
create table public.pc_import_runs(id bigint generated always as identity primary key,source text not null,status text not null check(status in ('running','success','failed')),started_at timestamptz not null default now(),finished_at timestamptz,imported integer not null default 0,skipped integer not null default 0,error text);
alter table public.pc_collector_config enable row level security;
alter table public.pc_import_runs enable row level security;
revoke all on public.pc_collector_config,public.pc_import_runs from public,anon,authenticated;
grant all on public.pc_collector_config,public.pc_import_runs to service_role;
grant usage,select on sequence public.pc_import_runs_id_seq to service_role;
do $$ declare collector_secret text; begin
 collector_secret:=encode(extensions.gen_random_bytes(32),'hex');
 perform vault.create_secret(collector_secret,'pc_collector_token');
 insert into public.pc_collector_config(id,token_hash) values('techfeast',encode(extensions.digest(collector_secret,'sha256'),'hex'));
end $$;
select cron.schedule('pc-event-import','17 */6 * * *',$job$
 select net.http_post(url:='https://aqwnluhpnqsrofmvtngp.supabase.co/functions/v1/pc-collect',headers:=jsonb_build_object('Content-Type','application/json','x-pc-collector-token',(select decrypted_secret from vault.decrypted_secrets where name='pc_collector_token')),body:='{}'::jsonb,timeout_milliseconds:=30000);
$job$);
create or replace function public.pc_nearby_events(query_lat double precision,query_lon double precision,radius_m double precision default 15000)
returns setof jsonb language sql stable security invoker set search_path='' as $$
 select e.record from public.pc_events e where e.status='published' and (e.record->>'endDate')::timestamptz>=now()
 and extensions.st_dwithin(e.location,extensions.st_setsrid(extensions.st_makepoint(query_lon,query_lat),4326)::extensions.geography,least(greatest(radius_m,1000),100000))
 order by extensions.st_distance(e.location,extensions.st_setsrid(extensions.st_makepoint(query_lon,query_lat),4326)::extensions.geography) limit 250;
$$;
revoke all on function public.pc_nearby_events(double precision,double precision,double precision) from public;
grant execute on function public.pc_nearby_events(double precision,double precision,double precision) to anon,authenticated,service_role;
