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
  if coalesce((venue->>'categoryConfirmed')::boolean,false) is not true or not coalesce(venue->>'category'=any(array['Tech','Startups','Business','Career','Design','Music','Parties','Gaming','Fashion','Art','Sports','Faith','Education','Food','Campus','Community','Comedy','Film','Health','Weddings']),false) then raise exception 'Confirm event category';end if;
  r:=r||jsonb_build_object('category',venue->>'category','tags',coalesce(venue->'tags','[]'::jsonb),'categoryNeedsReview',false,'categoryEvidence','Reviewer confirmed');
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
