create table if not exists public.pc_venue_cache(key text primary key,result jsonb not null,expires_at timestamptz not null);
alter table public.pc_venue_cache enable row level security;
revoke all on public.pc_venue_cache from public,anon,authenticated;
grant all on public.pc_venue_cache to service_role;

insert into public.pc_collector_config(id,token_hash,enabled)
select 'venue-lookup',token_hash,true from public.pc_collector_config where id='push-delivery'
on conflict(id) do nothing;
select cron.schedule('pc-venue-lookup','* * * * *',$job$
select net.http_post(url:='https://aqwnluhpnqsrofmvtngp.supabase.co/functions/v1/pc-venues',headers:=jsonb_build_object('Content-Type','application/json','x-pc-collector-token',(select decrypted_secret from vault.decrypted_secrets where name='pc_collector_token')),body:='{}'::jsonb,timeout_milliseconds:=20000);
$job$);
