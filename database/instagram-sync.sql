alter table public.pc_social_posts drop constraint if exists pc_social_posts_platform_check;
alter table public.pc_social_posts add constraint pc_social_posts_platform_check check(platform in ('x','instagram'));
create table if not exists public.pc_instagram_status(id text primary key check(id='main'),status text not null,username text,last_attempt_at timestamptz,last_success_at timestamptz,posts_read integer,error text);
alter table public.pc_instagram_status enable row level security;
revoke all on public.pc_instagram_status from public,anon,authenticated;
grant all on public.pc_instagram_status to service_role;
insert into public.pc_collector_config(id,token_hash,enabled)
select 'instagram-sync',token_hash,true from public.pc_collector_config where id='push-delivery'
on conflict(id) do nothing;
select cron.schedule('pc-instagram-sync','9 */6 * * *',$job$
select net.http_post(url:='https://aqwnluhpnqsrofmvtngp.supabase.co/functions/v1/pc-instagram',headers:=jsonb_build_object('Content-Type','application/json','x-pc-collector-token',(select decrypted_secret from vault.decrypted_secrets where name='pc_collector_token')),body:='{}'::jsonb,timeout_milliseconds:=40000);
$job$);
