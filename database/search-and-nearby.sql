alter table public.pc_events add column search_document tsvector generated always as (to_tsvector('simple',coalesce(record->>'title','')||' '||coalesce(record->>'description','')||' '||coalesce(record->>'area','')||' '||coalesce(record->>'category','')||' '||coalesce(record->>'organizer','')||' '||coalesce(record->>'venueName',''))) stored;
create index pc_events_fulltext on public.pc_events using gin(search_document);
create or replace function public.pc_nearby_events(query_lat double precision,query_lon double precision,radius_m double precision default 15000)
returns setof jsonb language sql stable security invoker set search_path='' as $$
 select e.record from public.pc_events e where e.status='published'
 and extensions.st_dwithin(e.location,extensions.st_setsrid(extensions.st_makepoint(query_lon,query_lat),4326)::extensions.geography,least(greatest(radius_m,1000),100000))
 order by extensions.st_distance(e.location,extensions.st_setsrid(extensions.st_makepoint(query_lon,query_lat),4326)::extensions.geography) limit 250;
$$;
revoke all on function public.pc_nearby_events(double precision,double precision,double precision) from public;
grant execute on function public.pc_nearby_events(double precision,double precision,double precision) to anon,authenticated,service_role;
